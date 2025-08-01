import { useState, useEffect } from "react";
import {
  FaPenFancy, FaCommentDots, FaHeart, FaReply,
  FaTimes, FaChevronDown, FaChevronUp, FaPlus, FaSearch,
  FaCalendar, FaUser, FaEye, FaShare, FaChevronRight
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Blog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [viewCounts, setViewCounts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [postComments, setPostComments] = useState({}); // Store comments for each post

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchCommentCounts();
      fetchPostStats();
      fetchAllPostComments();
    }
  }, [posts]);

  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [posts, searchTerm]);

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
    console.log('Submitting blog post:', { title, content });
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!title || !content) {
      setError("Title and content are required");
      toast.error("Please fill in both title and content");
      setIsSubmitting(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const author = user?.name || "Anonymous";

    try {
      console.log('Sending request to backend...');
      const res = await fetch("http://localhost:5000/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author })
      });

      const data = await res.json();
      console.log('Backend response:', data);

      if (data._id) {
        setPosts([data, ...posts]);
        setFilteredPosts([data, ...filteredPosts]);
        setTitle("");
        setContent("");
        setShowCreateForm(false);
        setSuccess("Blog post submitted!");
        toast.success("Blog post published successfully!");
      } else {
        setError(data.error || "Failed to submit post");
        toast.error(data.error || "Failed to submit post");
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setError("Failed to submit post");
      toast.error("Failed to submit post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login to comment");
        return;
      }

      setIsSubmitting(true);

      const response = await axios.post(
        `http://localhost:5000/api/comments/blog/${selectedPost._id}`,
        {
          content: newComment.trim(),
          parentComment: replyTo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh comments and counts
      await fetchComments(selectedPost._id);
      await fetchCommentCounts();
      await fetchAllPostComments(); // Refresh comment previews

      setNewComment("");
      setReplyTo(null);

      toast.success(replyTo ? "Reply added successfully!" : "Comment added successfully!");
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.status === 401) {
        toast.error("Please login again to comment");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add comment');
      }
    } finally {
      setIsSubmitting(false);
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

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: window.location.href
        });
        toast.success('Post shared successfully!');
      } else {
        // Fallback: copy to clipboard
        const shareText = `Check out this blog post: "${post.title}" - ${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        const shareText = `Check out this blog post: "${post.title}" - ${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Unable to share. Please copy the URL manually.');
      }
    }
  };

  const handleViewPost = async (post) => {
    try {
      // Increment view count on server
      const response = await fetch(`http://localhost:5000/api/blog/${post._id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update local view count
        setViewCounts(prev => ({
          ...prev,
          [post._id]: data.views
        }));
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }

    // Navigate to full post view or expand post
    setSelectedPost(post);
    setCommentsDialog(true);
    fetchComments(post._id);
    toast.info(`Viewing: ${post.title}`);
  };

  const fetchCommentCounts = async () => {
    try {
      const counts = {};
      for (const post of posts) {
        try {
          const response = await fetch(`http://localhost:5000/api/comments/blog/${post._id}`);
          if (response.ok) {
            const comments = await response.json();
            counts[post._id] = comments.length;
          } else {
            counts[post._id] = 0;
          }
        } catch (error) {
          counts[post._id] = 0;
        }
      }
      setCommentCounts(counts);
    } catch (error) {
      console.error('Error fetching comment counts:', error);
    }
  };

  // Fetch comments for all posts to display in cards
  const fetchAllPostComments = async () => {
    try {
      const allComments = {};
      for (const post of posts) {
        try {
          const response = await fetch(`http://localhost:5000/api/comments/blog/${post._id}`);

          if (response.ok) {
            const comments = await response.json();
            // Store only the first 2 comments for preview
            allComments[post._id] = comments.slice(0, 2);
          } else {
            allComments[post._id] = [];
          }
        } catch (error) {
          allComments[post._id] = [];
        }
      }
      setPostComments(allComments);
    } catch (error) {
      console.error('Error fetching post comments:', error);
    }
  };

  const fetchPostStats = async () => {
    try {
      const views = {};
      const likes = {};
      const userLikes = new Set();

      for (const post of posts) {
        try {
          const response = await fetch(`http://localhost:5000/api/blog/${post._id}/stats`);
          if (response.ok) {
            const stats = await response.json();
            views[post._id] = stats.views;
            likes[post._id] = stats.likes;

            // Check if current user liked this post
            const token = localStorage.getItem('token');
            if (token) {
              const userResponse = await fetch('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (userResponse.ok) {
                const userData = await userResponse.json();
                if (stats.likedBy && stats.likedBy.includes(userData._id)) {
                  userLikes.add(post._id);
                }
              }
            }
          } else {
            views[post._id] = 0;
            likes[post._id] = 0;
          }
        } catch (error) {
          views[post._id] = 0;
          likes[post._id] = 0;
        }
      }

      setViewCounts(views);
      setLikeCounts(likes);
      setLikedPosts(userLikes);
    } catch (error) {
      console.error('Error fetching post stats:', error);
    }
  };

  const generateViewCounts = () => {
    const counts = {};
    const likes = {};
    posts.forEach(post => {
      // Generate a consistent view count based on post ID
      const hash = post._id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      counts[post._id] = Math.abs(hash % 200) + 50; // 50-250 views
      likes[post._id] = Math.abs(hash % 50) + 5; // 5-55 likes
    });
    setViewCounts(counts);
    setLikeCounts(likes);
  };

  const handleLikePost = async (post) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to like posts');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/blog/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state
        if (data.liked) {
          setLikedPosts(prev => new Set([...prev, post._id]));
          toast.success('Post liked!');
        } else {
          setLikedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(post._id);
            return newSet;
          });
          toast.info('Removed like');
        }

        setLikeCounts(prev => ({
          ...prev,
          [post._id]: data.likes
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
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
    <div className={`${isReply ? 'ml-8' : ''} mb-4`}>
      <div className={`p-4 rounded-lg border ${isReply ? 'bg-gray-50' : 'bg-white'} border-gray-200`}>
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
            {comment.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {comment.user?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">
          {comment.content}
        </p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLikeComment(comment._id)}
            className={`flex items-center gap-1 transition-all duration-300 hover:scale-110 ${
              comment.likes?.includes(JSON.parse(localStorage.getItem('user') || '{}')._id) 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <FaHeart className={`text-sm transition-all duration-300 ${
              comment.likes?.includes(JSON.parse(localStorage.getItem('user') || '{}')._id) 
                ? 'animate-pulse' 
                : ''
            }`} />
            <span className="text-sm font-medium">{comment.likes?.length || 0}</span>
          </button>
          
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment._id)}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <FaReply className="text-sm" />
              <span className="text-sm">Reply</span>
            </button>
          )}
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => toggleCommentExpansion(comment._id)}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors text-sm"
            >
              {expandedComments[comment._id] ? <FaChevronUp /> : <FaChevronDown />}
              {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
            </button>
            
            {expandedComments[comment._id] && (
              <div className="mt-3">
                {comment.replies.map(reply => (
                  <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 relative pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-teal-100/20 to-cyan-100/20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4 shadow-lg">
              <FaPenFancy className="text-white text-2xl" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Herbal Knowledge Hub
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover, share, and learn about the power of herbal remedies from our community of experts and enthusiasts.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 text-lg" />
              <input
                type="text"
                placeholder="Search articles, authors, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 outline-none text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              />
            </div>
            
            <button
              onClick={() => {
                console.log('Write Article button clicked');
                setShowCreateForm(!showCreateForm);
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <FaPenFancy className="text-lg" />
              Write Article
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Create Post Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FaPenFancy className="text-emerald-600 text-lg" />
                </div>
                Share Your Knowledge
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Article Title</label>
                <input
                  type="text"
                  placeholder="Article title..."
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setTitle(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg font-medium placeholder-gray-400 transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  placeholder="Share your herbal knowledge, experiences, or recipes..."
                  value={content}
                  onChange={(e) => {
                    if (e.target.value.length <= 5000) {
                      setContent(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault();
                      if (title.trim() && content.trim() && !isSubmitting) {
                        handleSubmit();
                      }
                    }
                  }}
                  rows={8}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none placeholder-gray-400 transition-all duration-200 hover:border-gray-400"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || isSubmitting}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <FaPenFancy className="text-lg" />
                      <span>Publish Article</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setShowCreateForm(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-md"
                >
                  <FaTimes className="text-lg" />
                  <span>Cancel</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">💡</span>
                  <span><strong>Tip:</strong> Press Ctrl+Enter to publish quickly</span>
                </div>
                <div className="text-sm text-gray-400">
                  {title.length}/100 title • {content.length}/5000 content
                </div>
              </div>

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading articles...</h3>
              <p className="text-gray-500">Discovering amazing herbal knowledge for you</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <article
                key={post._id || i}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 border border-emerald-100/50 overflow-hidden group"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {post.author?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{post.author}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <FaCalendar className="text-emerald-500" />
                          {formatDate(post.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-medium shadow-sm">
                        🌿 Herbal
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-lg">
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </p>

                  {/* Comments Preview */}
                  {postComments[post._id] && postComments[post._id].length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-xl p-4 border border-emerald-100/50">
                      <h4 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                        <FaCommentDots className="text-emerald-500" />
                        Recent Comments
                      </h4>
                      <div className="space-y-3">
                        {postComments[post._id].map((comment, index) => (
                          <div key={comment._id || index} className="bg-white/80 rounded-lg p-3 border border-emerald-100/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {comment.user?.name?.charAt(0) || 'U'}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {comment.user?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                        {commentCounts[post._id] > 2 && (
                          <button
                            onClick={() => openCommentsDialog(post)}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            View {commentCounts[post._id] - 2} more comments
                            <FaChevronRight className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openCommentsDialog(post)}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 font-medium px-3 py-1.5 rounded-full border border-emerald-200 hover:border-emerald-300 active:scale-95"
                      title="Join the discussion"
                    >
                      <FaCommentDots className="text-sm" />
                      <span>Discuss</span>
                      {commentCounts[post._id] !== undefined && commentCounts[post._id] > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full ml-1 animate-pulse">
                          {commentCounts[post._id]}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-3 text-gray-500">
                      <button
                        onClick={() => handleViewPost(post)}
                        className="flex items-center gap-1 text-sm hover:text-emerald-600 transition-all duration-200 cursor-pointer hover:bg-emerald-50 px-2 py-1 rounded-full"
                        title="View full post"
                      >
                        <FaEye className="text-xs" />
                        <span className="font-medium">
                          {viewCounts[post._id] || 0}
                        </span>
                      </button>

                      <button
                        onClick={() => handleLikePost(post)}
                        className={`flex items-center gap-1 text-sm transition-all duration-200 cursor-pointer px-2 py-1 rounded-full ${
                          likedPosts.has(post._id)
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'hover:text-red-500 hover:bg-red-50'
                        }`}
                        title={likedPosts.has(post._id) ? "Unlike this post" : "Like this post"}
                      >
                        <FaHeart className={`text-xs ${likedPosts.has(post._id) ? 'animate-pulse' : ''}`} />
                        <span className="font-medium">
                          {likeCounts[post._id] || 0}
                        </span>
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="hover:text-emerald-600 transition-all duration-200 p-1 rounded-full hover:bg-emerald-50"
                        title="Share this post"
                      >
                        <FaShare className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <FaPenFancy className="text-emerald-500 text-4xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✨</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No articles found</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm ? 'Try adjusting your search terms or explore different topics' : 'Be the first to share your herbal knowledge with our community!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  console.log('Write First Article button clicked');
                  setShowCreateForm(true);
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-4 mx-auto shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                <FaPenFancy className="text-xl" />
                Write First Article
              </button>
            )}
          </div>
        )}

        {/* Comments Dialog */}
        {commentsDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Dialog Header */}
              <div className="bg-emerald-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedPost?.title}</h2>
                <button
                  onClick={closeCommentsDialog}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Post Content */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-800 mb-3">{selectedPost?.content}</p>
                  <p className="text-sm text-gray-600">
                    by {selectedPost?.author} • {formatDate(selectedPost?.createdAt || new Date())}
                  </p>
                </div>

                {/* Add Comment Section */}
                <div className="mb-6">
                  {!localStorage.getItem('token') ? (
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 text-center border border-emerald-200">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-emerald-600 text-xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Discussion</h3>
                      <p className="text-gray-600 mb-4">Please login to share your thoughts and engage with the community.</p>
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Login to Comment
                      </button>
                    </div>
                  ) : (
                    <>
                      {replyTo && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                          <p className="text-sm text-blue-800">Replying to comment...</p>
                          <button
                            onClick={() => setReplyTo(null)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}

                      <textarea
                        placeholder={replyTo ? "Write your reply..." : "Share your thoughts..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none mb-4"
                      />

                  <button
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      isSubmitting || !newComment.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:scale-105'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {replyTo ? 'Posting Reply...' : 'Posting Comment...'}
                      </>
                    ) : (
                      <>
                        {replyTo ? <FaReply /> : <FaCommentDots />}
                        {replyTo ? 'Post Reply' : 'Post Comment'}
                      </>
                    )}
                  </button>
                    </>
                  )}
                </div>

                <hr className="mb-6" />

                {/* Comments List */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comments ({comments.length})
                </h3>

                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <CommentItem key={comment._id} comment={comment} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Blog;
