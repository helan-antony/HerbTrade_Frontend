import React, { useState, useEffect } from 'react';
import { 
  FaCommentDots, FaPlus, FaSearch, FaFilter, FaEye, FaReply, 
  FaThumbsUp, FaThumbsDown, FaClock, FaUser, FaTag, FaTimes,
  FaHeart, FaShare, FaBookmark, FaFlag, FaEdit, FaTrash,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

function Discussion() {
  const [discussions, setDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showDiscussionDetail, setShowDiscussionDetail] = useState(false);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [replyError, setReplyError] = useState('');

  // Form states
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    content: '',
    tags: '',
    reply: ''
  });

  const categories = [
    { value: 'all', label: 'All Topics', icon: '🌿' },
    { value: 'general', label: 'General Discussion', icon: '💬' },
    { value: 'herbs', label: 'Herbs & Medicine', icon: '🌱' },
    { value: 'health', label: 'Health & Wellness', icon: '💚' },
    { value: 'recipes', label: 'Recipes & Remedies', icon: '🍵' },
    { value: 'experiences', label: 'Personal Experiences', icon: '📖' },
    { value: 'questions', label: 'Questions & Help', icon: '❓' },
    { value: 'research', label: 'Research & Studies', icon: '🔬' }
  ];

  useEffect(() => {
    fetchDiscussions();
  }, []);

  useEffect(() => {
    filterDiscussions();
  }, [discussions, searchTerm, selectedCategory]);

  // Validation functions
  const validateTitle = (title) => {
    if (!title.trim()) return "Title is required";
    if (title.trim().length < 5) return "Title must be at least 5 characters";
    if (title.trim().length > 200) return "Title must be less than 200 characters";
    return "";
  };

  const validateContent = (content) => {
    if (!content.trim()) return "Content is required";
    if (content.trim().length < 10) return "Content must be at least 10 characters";
    if (content.trim().length > 5000) return "Content must be less than 5000 characters";
    return "";
  };

  const validateTags = (tags) => {
    if (tags && tags.trim()) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 10) return "You can add up to 10 tags";
      for (const tag of tagArray) {
        if (tag.length > 30) return "Each tag must be less than 30 characters";
        if (!/^[a-zA-Z0-9\-_ ]+$/.test(tag)) return "Tags can only contain letters, numbers, spaces, hyphens, and underscores";
      }
    }
    return "";
  };

  const validateReply = (reply) => {
    if (!reply.trim()) return "Reply content is required";
    if (reply.trim().length < 5) return "Reply must be at least 5 characters";
    if (reply.trim().length > 1000) return "Reply must be less than 1000 characters";
    return "";
  };

  const fetchDiscussions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        category: selectedCategory,
        search: searchTerm,
        limit: 20
      });

      const response = await fetch(`http://localhost:5000/api/discussions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }

      const data = await response.json();
      setDiscussions(data.discussions || []);

      if (data.discussions && data.discussions.length > 0) {
        toast.success(`Loaded ${data.discussions.length} discussions`);
      } else {
        toast.info('No discussions found. Be the first to start a conversation!');
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions. Please check your connection.');

      // Fallback to empty array
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDiscussions = () => {
    let filtered = discussions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(discussion => discussion.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredDiscussions(filtered);
  };

  const handleCreateDiscussion = async () => {
    // Validate all fields
    const titleError = validateTitle(newDiscussion.title);
    const contentError = validateContent(newDiscussion.content);
    const tagsError = validateTags(newDiscussion.tags);
    
    setValidationErrors({
      title: titleError,
      content: contentError,
      tags: tagsError
    });
    
    if (titleError || contentError || tagsError) {
      toast.error('Please fix the validation errors before creating the discussion.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to create discussions');
        return;
      }

      const response = await fetch('http://localhost:5000/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newDiscussion.title.trim(),
          content: newDiscussion.content.trim(),
          category: newDiscussion.category,
          tags: newDiscussion.tags
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create discussion');
      }

      const createdDiscussion = await response.json();

      // Add the new discussion to the top of the list
      setDiscussions(prev => [{ ...createdDiscussion, replyCount: 0 }, ...prev]);
      setNewDiscussion({ title: '', content: '', category: 'general', tags: '' });
      setShowCreateForm(false);
      toast.success('Discussion created successfully!');
    } catch (error) {
      console.error('Error creating discussion:', error);
      if (error.message.includes('login')) {
        toast.error('Please login again to create discussions');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        toast.error(error.message || 'Failed to create discussion');
      }
    }
  };

  const openDiscussionDetail = (discussion) => {
    handleViewDiscussion(discussion);
  };

  const closeDiscussionDetail = () => {
    setShowDiscussionDetail(false);
    setSelectedDiscussion(null);
    setReplies([]);
    setNewReply('');
    setReplyError('');
    setValidationErrors(prev => ({ ...prev, reply: '' }));
  };

  const handleAddReply = async () => {
    const replyError = validateReply(newReply);
    setReplyError(replyError);
    setValidationErrors(prev => ({ ...prev, reply: replyError }));
    
    if (replyError) {
      toast.error('Please fix the validation errors before posting your reply.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to reply');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/discussions/${selectedDiscussion._id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newReply.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add reply');
      }

      const newReplyData = await response.json();
      setReplies(prev => [...prev, newReplyData]);
      setNewReply('');
      setReplyError('');
      setValidationErrors(prev => ({ ...prev, reply: '' }));
      toast.success('Reply added successfully!');
    } catch (error) {
      console.error('Error adding reply:', error);
      if (error.message.includes('login')) {
        toast.error('Please login again to reply');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        toast.error(error.message || 'Failed to add reply');
      }
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to like discussions');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to like discussion');
      }

      const data = await response.json();

      // Update the discussion in the list
      setDiscussions(prev => prev.map(discussion =>
        discussion._id === discussionId
          ? { ...discussion, likes: { length: data.likes } }
          : discussion
      ));

      toast.success(data.message);
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast.error(error.message || 'Failed to like discussion');
    }
  };

  const handleViewDiscussion = async (discussion) => {
    try {
      const response = await fetch(`http://localhost:5000/api/discussions/${discussion._id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch discussion details');
      }

      const discussionData = await response.json();
      setSelectedDiscussion(discussionData);
      setReplies(discussionData.replies || []);
      setShowDiscussionDetail(true);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      toast.error('Failed to load discussion details');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Handle input changes with real-time validation
  const handleDiscussionInputChange = (field, value) => {
    setNewDiscussion(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    let error = "";
    switch (field) {
      case 'title':
        error = validateTitle(value);
        break;
      case 'content':
        error = validateContent(value);
        break;
      case 'tags':
        error = validateTags(value);
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleReplyChange = (value) => {
    setNewReply(value);
    
    // Real-time validation for reply
    const error = validateReply(value);
    setReplyError(error);
    setValidationErrors(prev => ({ ...prev, reply: error }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 pb-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 tracking-tight">
              Community Discussions
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              💬 Connect, share knowledge, and learn from the community
            </p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1">
                <FaCommentDots className="text-emerald-500" />
                <span>{discussions.length} active discussions</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaUser className="text-blue-500" />
                <span>Join the conversation</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Start Discussion</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-slate-700">Loading discussions...</p>
                <p className="text-slate-500">Fetching the latest community conversations</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map(discussion => (
              <div
                key={discussion._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => openDiscussionDetail(discussion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{discussion.author?.name || 'Anonymous'}</p>
                        <p className="text-sm text-slate-500">{formatTimeAgo(discussion.createdAt)}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {categories.find(cat => cat.value === discussion.category)?.icon} {categories.find(cat => cat.value === discussion.category)?.label}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {discussion.title}
                    </h3>
                    
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {discussion.content}
                    </p>
                    
                    {discussion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs flex items-center space-x-1">
                            <FaTag className="text-xs" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <span className="flex items-center space-x-1">
                          <FaReply />
                          <span>{discussion.replyCount || 0} replies</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaEye />
                          <span>{discussion.views || 0} views</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaThumbsUp />
                          <span>{discussion.likes?.length || 0} likes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaClock />
                          <span>Last activity {formatTimeAgo(discussion.lastActivity)}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeDiscussion(discussion._id);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
                          title="Like this discussion"
                        >
                          <FaHeart className="text-xs" />
                          <span>Like</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDiscussionDetail(discussion);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
                          title="Join the discussion"
                        >
                          <FaCommentDots className="text-xs" />
                          <span>Discuss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDiscussions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaCommentDots className="text-4xl text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">No discussions found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start First Discussion
            </button>
          </div>
        )}

        {/* Create Discussion Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-emerald-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Start New Discussion</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discussion Title *
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => handleDiscussionInputChange('title', e.target.value)}
                    placeholder="What would you like to discuss?"
                    maxLength={200}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${
                      validationErrors.title 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 focus:ring-emerald-500/20'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-red-500 flex items-center">
                      {validationErrors.title && (
                        <>
                          <FaExclamationTriangle className="mr-1" />
                          <span>{validationErrors.title}</span>
                        </>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {newDiscussion.title.length}/200 characters
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newDiscussion.category}
                    onChange={(e) => handleDiscussionInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {categories.filter(cat => cat.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) => handleDiscussionInputChange('content', e.target.value)}
                    placeholder="Share your thoughts, questions, or experiences..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${
                      validationErrors.content 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 focus:ring-emerald-500/20'
                    }`}
                  />
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    {validationErrors.content && (
                      <>
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.content}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.tags}
                    onChange={(e) => handleDiscussionInputChange('tags', e.target.value)}
                    placeholder="e.g., stress, anxiety, natural-remedies"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${
                      validationErrors.tags 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 focus:ring-emerald-500/20'
                    }`}
                  />
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    {validationErrors.tags && (
                      <>
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.tags}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDiscussion}
                    disabled={!!validationErrors.title || !!validationErrors.content}
                    className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      validationErrors.title || validationErrors.content
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:scale-105'
                    } text-white`}
                  >
                    <FaPlus />
                    <span>Create Discussion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discussion Detail Modal */}
        {showDiscussionDetail && selectedDiscussion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-emerald-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedDiscussion.title}</h2>
                <button
                  onClick={closeDiscussionDetail}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Original Post */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">
                      {selectedDiscussion.author?.profilePic ? (
                        <img src={selectedDiscussion.author.profilePic} alt={selectedDiscussion.author?.name || 'User'} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <FaUser className="text-gray-400" />
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedDiscussion.author?.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{formatTimeAgo(selectedDiscussion.createdAt)}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {categories.find(cat => cat.value === selectedDiscussion.category)?.icon} {categories.find(cat => cat.value === selectedDiscussion.category)?.label}
                    </span>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
                  </div>

                  {selectedDiscussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedDiscussion.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs flex items-center space-x-1">
                          <FaTag className="text-xs" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-emerald-600 transition-colors">
                      <FaThumbsUp />
                      <span>{selectedDiscussion.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                      <FaHeart />
                      <span>Save</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Add Reply Form */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Reply</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newReply}
                      onChange={(e) => handleReplyChange(e.target.value)}
                      placeholder="Share your thoughts or experiences..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${
                        replyError 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-gray-300 focus:ring-emerald-500/20'
                      }`}
                    />
                    <div className="text-sm text-red-500 flex items-center">
                      {replyError && (
                        <>
                          <FaExclamationTriangle className="mr-1" />
                          <span>{replyError}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleAddReply}
                      disabled={!!replyError || !newReply.trim()}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        replyError || !newReply.trim()
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      <FaReply />
                      <span>Post Reply</span>
                    </button>
                  </div>
                </div>

                {/* Replies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Replies ({replies.length})
                  </h3>

                  {replies.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No replies yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {replies.map(reply => (
                        <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xl">
                              {reply.author?.profilePic ? (
                                <img src={reply.author.profilePic} alt={reply.author?.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <FaUser className="text-gray-400" />
                              )}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{reply.author?.name || 'Anonymous'}</p>
                              <p className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</p>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-emerald-600 transition-colors">
                              <FaThumbsUp />
                              <span>{reply.likes}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                              <FaReply />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Discussion;