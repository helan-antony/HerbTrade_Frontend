import { useState, useEffect } from "react";
import { 
  FaPenFancy, FaCommentDots, FaHeart, FaReply, 
  FaTimes, FaChevronDown, FaChevronUp, FaPlus, FaSearch,
  FaCalendar, FaUser, FaEye, FaShare
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

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchCommentCounts();
      fetchPostStats();
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
    <div className="min-h-screen bg-gray-50 relative pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Herbal Knowledge Hub
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover, share, and learn about the power of herbal remedies from our community of experts and enthusiasts.
            </p>
          </div>
          
          {/* Action Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, authors, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            
            <button
              onClick={() => {
                console.log('Write Article button clicked');
                setShowCreateForm(!showCreateForm);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaPlus />
              Write Article
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading articles...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
              <article
                key={post._id || i}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                        {post.author?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.author}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <FaCalendar className="text-xs" />
                          {formatDate(post.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">Herbal</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </p>

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
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPenFancy className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share your herbal knowledge!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  console.log('Write First Article button clicked');
                  setShowCreateForm(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <FaPenFancy />
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
