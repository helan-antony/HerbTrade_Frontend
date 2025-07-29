import { 
  Box, Typography, Grid, Card, CardContent, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Avatar, Divider, Collapse, Chip
} from "@mui/material";
import { 
  FaPenFancy, FaCommentDots, FaHeart, FaReply, FaEdit, FaTrash, 
  FaTimes, FaChevronDown, FaChevronUp 
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Blog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsDialog, setCommentsDialog] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/blog");
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      setError("Failed to load blog posts");
      setLoading(false);
    }
  };

  const fetchComments = async (blogId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/blog/${blogId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    const author = user?.name || "Anonymous";
    try {
      const res = await fetch("http://localhost:5000/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author })
      });
      const data = await res.json();
      if (data._id) {
        setPosts([data, ...posts]);
        setTitle("");
        setContent("");
        setSuccess("Blog post submitted!");
        toast.success("Blog post published successfully!");
      } else {
        setError(data.error || "Failed to submit post");
      }
    } catch {
      setError("Failed to submit post");
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login to comment");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/comments/blog/${selectedPost._id}`,
        {
          content: newComment,
          parentComment: replyTo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh comments
      await fetchComments(selectedPost._id);
      setNewComment("");
      setReplyTo(null);
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to like comments");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh comments to show updated likes
      await fetchComments(selectedPost._id);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const openCommentsDialog = (post) => {
    setSelectedPost(post);
    setCommentsDialog(true);
    fetchComments(post._id);
  };

  const closeCommentsDialog = () => {
    setCommentsDialog(false);
    setSelectedPost(null);
    setComments([]);
    setNewComment("");
    setReplyTo(null);
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <Box sx={{ ml: isReply ? 4 : 0, mb: 2 }}>
      <Card sx={{ bgcolor: isReply ? '#f8f9fa' : 'white', border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#3a4d2d' }}>
              {comment.user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {comment.user?.name || 'Anonymous'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            {comment.content}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              size="small"
              startIcon={<FaHeart />}
              onClick={() => handleLikeComment(comment._id)}
              sx={{ color: '#e91e63', minWidth: 'auto' }}
            >
              {comment.likes?.length || 0}
            </Button>
            
            <Button
              size="small"
              startIcon={<FaReply />}
              onClick={() => setReplyTo(comment._id)}
              sx={{ color: '#3a4d2d', minWidth: 'auto' }}
            >
              Reply
            </Button>
          </Box>
          
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                onClick={() => toggleCommentExpansion(comment._id)}
                startIcon={expandedComments[comment._id] ? <FaChevronUp /> : <FaChevronDown />}
                sx={{ color: '#3a4d2d' }}
              >
                {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
              </Button>
              
              <Collapse in={expandedComments[comment._id]}>
                <Box sx={{ mt: 2 }}>
                  {comment.replies.map(reply => (
                    <CommentItem key={reply._id} comment={reply} isReply={true} />
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f6f0", p: 3 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Typography variant="h4" fontWeight={700} color="#3a4d2d" mb={3} fontFamily="serif" textAlign="center">
        Herbal Blog ✍️
      </Typography>

      {/* Create Post Section */}
      <Box sx={{ mb: 4, p: 3, bgcolor: "white", borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" fontWeight={600} mb={2} fontFamily="serif" sx={{ display: 'flex', alignItems: 'center' }}>
          <FaPenFancy style={{ marginRight: 8 }} /> Share Your Herbal Knowledge
        </Typography>
        
        <TextField 
          fullWidth 
          label="Post Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          sx={{ mb: 2 }}
          placeholder="e.g., Amazing Benefits of Turmeric for Joint Health"
        />
        
        <TextField 
          fullWidth 
          label="Content" 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          multiline 
          rows={4} 
          sx={{ mb: 2 }}
          placeholder="Share your experience, recipe, or knowledge about herbal remedies..."
        />
        
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ 
            bgcolor: "#3a4d2d", 
            color: "#f3e7d4", 
            fontFamily: "serif",
            '&:hover': { bgcolor: "#2d3d22" }
          }}
          startIcon={<FaPenFancy />}
        >
          Publish Post
        </Button>
        
        {success && <Typography sx={{ color: 'green', fontSize: 14, mt: 1 }}>{success}</Typography>}
        {error && <Typography sx={{ color: 'red', fontSize: 14, mt: 1 }}>{error}</Typography>}
      </Box>

      {/* Posts Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography sx={{ color: '#3a4d2d', fontFamily: 'serif' }}>Loading posts...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {posts.map((post, i) => (
            <Grid item xs={12} md={6} lg={4} key={post._id || i}>
              <Card sx={{ 
                bgcolor: "white", 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#3a4d2d' }}>
                    {post.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#3a4d2d' }}>
                      {post.author?.charAt(0) || 'A'}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      by {post.author}
                    </Typography>
                    <Chip 
                      label={formatDate(post.createdAt || new Date())} 
                      size="small" 
                      sx={{ ml: 'auto', bgcolor: '#f0f0f0' }}
                    />
                  </Box>
                  
                  <Typography sx={{ mb: 2, flexGrow: 1, color: '#555' }}>
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => openCommentsDialog(post)}
                      startIcon={<FaCommentDots />}
                      sx={{ 
                        color: "#3a4d2d", 
                        borderColor: "#3a4d2d",
                        '&:hover': { 
                          bgcolor: "#3a4d2d", 
                          color: 'white' 
                        }
                      }}
                    >
                      Comments
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label="Herbal" size="small" color="primary" variant="outlined" />
                      <Chip label="Health" size="small" color="secondary" variant="outlined" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Comments Dialog */}
      <Dialog 
        open={commentsDialog} 
        onClose={closeCommentsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#3a4d2d',
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {selectedPost?.title}
          </Typography>
          <IconButton onClick={closeCommentsDialog} sx={{ color: 'white' }}>
            <FaTimes />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Post Content */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedPost?.content}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {selectedPost?.author} • {formatDate(selectedPost?.createdAt || new Date())}
            </Typography>
          </Box>

          {/* Add Comment Section */}
          <Box sx={{ mb: 3 }}>
            {replyTo && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  Replying to comment...
                </Typography>
                <IconButton size="small" onClick={() => setReplyTo(null)}>
                  <FaTimes />
                </IconButton>
              </Box>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={replyTo ? "Write your reply..." : "Share your thoughts..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              onClick={handleCommentSubmit}
              startIcon={replyTo ? <FaReply /> : <FaCommentDots />}
              sx={{ 
                bgcolor: '#3a4d2d',
                '&:hover': { bgcolor: '#2d3d22' }
              }}
            >
              {replyTo ? 'Post Reply' : 'Post Comment'}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Comments List */}
          <Typography variant="h6" sx={{ mb: 2, color: '#3a4d2d' }}>
            Comments ({comments.length})
          </Typography>
          
          {comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No comments yet. Be the first to share your thoughts!
            </Typography>
          ) : (
            <Box>
              {comments.map(comment => (
                <CommentItem key={comment._id} comment={comment} />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Blog;