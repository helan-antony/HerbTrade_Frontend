import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextareaAutosize
} from '@mui/material';
import {
  FaPlus,
  FaVideo,
  FaBook,
  FaLink,
  FaDumbbell,
  FaUtensils,
  FaLightbulb,
  FaFileAlt
} from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const CoachPostEnrollment = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedNewsletter, setSelectedNewsletter] = useState('');
  const [postData, setPostData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'tip',
    title: '',
    content: '',
    url: '',
    duration: '',
    difficulty: 'beginner',
    tags: ''
  });

  const postTypes = [
    { id: 'tip', label: 'Wellness Tip', icon: <FaLightbulb />, color: '#FFD54F' },
    { id: 'video', label: 'Video', icon: <FaVideo />, color: '#F44336' },
    { id: 'article', label: 'Article', icon: <FaFileAlt />, color: '#2196F3' },
    { id: 'resource', label: 'Resource', icon: <FaLink />, color: '#9C27B0' },
    { id: 'exercise', label: 'Exercise', icon: <FaDumbbell />, color: '#4CAF50' },
    { id: 'recipe', label: 'Recipe', icon: <FaUtensils />, color: '#FF9800' }
  ];

  useEffect(() => {
    fetchCoachNewsletters();
  }, []);

  const fetchCoachNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_ENDPOINTS.NEWSLETTER.GET_ALL}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Filter newsletters - show all newsletters for coaches to add post-enrollment content
      // In future, we can filter by programCoachId if needed
      const coachNewsletters = response.data.newsletters.filter(n => 
        n.programType === 'newsletter'
      );
      
      setNewsletters(coachNewsletters);
      
      // If there's only one newsletter, select it by default
      if (coachNewsletters.length === 1) {
        setSelectedNewsletter(coachNewsletters[0]._id);
        fetchPostData(coachNewsletters[0]._id);
      }
    } catch (err) {
      console.error('Error fetching newsletters:', err);
      setError('Failed to fetch newsletters: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchPostData = async (newsletterId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.WELLNESS_COACH.GET_POST_ENROLLMENT_DATA(newsletterId),
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setPostData(response.data.postEnrollmentData || []);
    } catch (err) {
      console.error('Error fetching post data:', err);
      setError('Failed to fetch post-enrollment data: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleNewsletterChange = (newsletterId) => {
    setSelectedNewsletter(newsletterId);
    if (newsletterId) {
      fetchPostData(newsletterId);
    } else {
      setPostData([]);
    }
  };

  const handleAddPost = async () => {
    try {
      setError('');
      setSuccess('');

      // Validate required fields
      if (!newPost.title) return setError('Title is required');
      if (!newPost.content) return setError('Content is required');

      const postData = {
        type: newPost.type,
        title: newPost.title,
        content: newPost.content,
        url: newPost.url,
        duration: newPost.duration,
        difficulty: newPost.difficulty,
        tags: newPost.tags
      };

      const response = await axios.post(
        API_ENDPOINTS.WELLNESS_COACH.ADD_POST_ENROLLMENT_DATA(selectedNewsletter),
        postData,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setSuccess('Post-enrollment data added successfully!');
      setDialogOpen(false);
      
      // Reset form
      setNewPost({
        type: 'tip',
        title: '',
        content: '',
        url: '',
        duration: '',
        difficulty: 'beginner',
        tags: ''
      });

      // Refresh post data
      fetchPostData(selectedNewsletter);
    } catch (err) {
      console.error('Error adding post:', err);
      setError('Failed to add post: ' + (err.response?.data?.message || err.message));
    }
  };

  const getTypeConfig = (typeId) => {
    return postTypes.find(t => t.id === typeId) || postTypes[0];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)', py: 6 }}>
      <Container maxWidth="lg">
        <Box mb={6}>
          <Typography variant="h3" component="h1" gutterBottom sx={{
            color: '#1a330a',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1
          }}>
            <FaPlus color="#4caf50" />
            Post-Enrollment Content
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#558b2f', fontWeight: 500 }}>
            Add follow-up content for users who enroll in your newsletters
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>{success}</Alert>}

        <Card sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(45, 80, 22, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, mb: 3 }}>
              Select Newsletter
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Newsletter</InputLabel>
              <Select
                value={selectedNewsletter}
                onChange={(e) => handleNewsletterChange(e.target.value)}
                label="Select Newsletter"
              >
                {newsletters.map((newsletter) => (
                  <MenuItem key={newsletter._id} value={newsletter._id}>
                    {newsletter.title} ({new Date(newsletter.publishedDate).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedNewsletter && (
              <Button
                variant="contained"
                startIcon={<FaPlus />}
                onClick={() => setDialogOpen(true)}
                sx={{ 
                  bgcolor: '#2E7D32', 
                  '&:hover': { bgcolor: '#1b5e20' }, 
                  borderRadius: '8px',
                  mb: 3
                }}
              >
                Add New Content
              </Button>
            )}
          </CardContent>
        </Card>

        {selectedNewsletter && postData.length > 0 && (
          <Card sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(45, 80, 22, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, mb: 3 }}>
                Post-Enrollment Content ({postData.length} items)
              </Typography>
              
              <Grid container spacing={3}>
                {postData.map((post, index) => {
                  const typeConfig = getTypeConfig(post.type);
                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={index}>
                      <Card elevation={0} sx={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '12px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Chip 
                              icon={typeConfig.icon}
                              label={typeConfig.label}
                              size="small"
                              sx={{ 
                                bgcolor: typeConfig.color,
                                color: 'white',
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="h6" gutterBottom sx={{ color: '#1a330a', fontWeight: 600 }}>
                            {post.title}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                            {post.content.substring(0, 150)}...
                          </Typography>
                          
                          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                            {post.tags && post.tags.map((tag, i) => (
                              <Chip key={i} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                          
                          {post.url && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                              URL: {post.url}
                            </Typography>
                          )}
                          
                          {(post.duration || post.difficulty) && (
                            <Box display="flex" gap={2} color="text.secondary" fontSize="0.875rem">
                              {post.duration && <span>Duration: {post.duration}</span>}
                              {post.difficulty && <span>Level: {post.difficulty}</span>}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {selectedNewsletter && postData.length === 0 && (
          <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
            <FaLightbulb size={48} color="#a5d6a7" />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No post-enrollment content yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add your first piece of follow-up content for enrolled users
            </Typography>
          </Box>
        )}
      </Container>

      {/* Add Post Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#fbfdf9',
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(46, 125, 50, 0.05) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(139, 195, 74, 0.05) 0, transparent 50%)',
          }
        }}
      >
        <DialogTitle sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: '#1a330a',
          fontFamily: 'Playfair Display, serif',
          fontWeight: 800,
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: '12px', display: 'flex' }}>
            <FaPlus color="#2E7D32" size={24} />
          </Box>
          Add Post-Enrollment Content
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  label="Content Type"
                >
                  {postTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title"
                placeholder="Enter a descriptive title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={4}
                placeholder="Detailed content for enrolled users..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="URL (optional)"
                placeholder="https://example.com"
                value={newPost.url}
                onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
              />
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Duration (optional)"
                placeholder="e.g., 10 mins, 30 mins"
                value={newPost.duration}
                onChange={(e) => setNewPost({ ...newPost, duration: e.target.value })}
              />
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={newPost.difficulty}
                  onChange={(e) => setNewPost({ ...newPost, difficulty: e.target.value })}
                  label="Difficulty Level"
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                placeholder="health, wellness, tips"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(0,0,0,0.05)', gap: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ px: 4, borderRadius: '12px', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPost}
            sx={{
              px: 6,
              borderRadius: '12px',
              bgcolor: '#2E7D32',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
              '&:hover': { bgcolor: '#1b5e20', boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)' }
            }}
          >
            Add Content
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoachPostEnrollment;