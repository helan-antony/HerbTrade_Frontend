import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Card, CardContent, CardHeader, Grid, IconButton, Alert, CircularProgress, Chip, TextareaAutosize } from '@mui/material';
import { FaNewspaper, FaSave, FaTrash, FaEnvelope, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AdminNewsletter = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [editId, setEditId] = useState(null);
  const [sending, setSending] = useState({});

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINTS.NEWSLETTER.GET_ALL);
      setNewsletters(response.data.newsletters);
    } catch (err) {
      setError('Failed to fetch newsletters');
      console.error('Error fetching newsletters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');

      const tags = form.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      if (editId) {
        // Update existing newsletter
        await axios.put(API_ENDPOINTS.NEWSLETTER.UPDATE(editId), {
          ...form,
          tags
        });
        setSuccess('Newsletter updated successfully');
      } else {
        // Create new newsletter
        await axios.post(API_ENDPOINTS.NEWSLETTER.CREATE, {
          ...form,
          tags
        });
        setSuccess('Newsletter created successfully');
      }

      setForm({
        title: '',
        content: '',
        category: 'general',
        tags: ''
      });
      setEditId(null);
      fetchNewsletters();
    } catch (err) {
      setError('Failed to save newsletter');
      console.error('Error saving newsletter:', err);
    }
  };

  const handleSendNewsletter = async (newsletterId) => {
    try {
      setSending(prev => ({ ...prev, [newsletterId]: true }));
      setError('');
      setSuccess('');
      
      const response = await axios.post(API_ENDPOINTS.NEWSLETTER.SEND(newsletterId));
      setSuccess(`Newsletter sent successfully to ${response.data.recipients} users (${response.data.successCount} successful, ${response.data.failureCount} failed)`);
      fetchNewsletters();
    } catch (err) {
      setError('Failed to send newsletter');
      console.error('Error sending newsletter:', err);
    } finally {
      setSending(prev => ({ ...prev, [newsletterId]: false }));
    }
  };

  const handleEdit = (newsletter) => {
    setForm({
      title: newsletter.title,
      content: newsletter.content,
      category: newsletter.category,
      tags: newsletter.tags.join(', ')
    });
    setEditId(newsletter._id);
  };

  const handleDelete = async (newsletterId) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await axios.delete(API_ENDPOINTS.NEWSLETTER.DELETE(newsletterId));
      setSuccess('Newsletter deleted successfully');
      fetchNewsletters();
    } catch (err) {
      setError('Failed to delete newsletter');
      console.error('Error deleting newsletter:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        color: '#2d5016',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        mb: 3
      }}>
        <FaNewspaper style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        Newsletter Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Newsletter Creation Form */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader 
          title={editId ? "Edit Newsletter" : "Create New Newsletter"}
          sx={{ bgcolor: 'rgba(45, 80, 22, 0.1)' }}
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="seasonal">Seasonal</MenuItem>
                    <MenuItem value="specific_condition">Specific Condition</MenuItem>
                    <MenuItem value="wellness_tips">Wellness Tips</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Content"
                  name="content"
                  value={form.content}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={6}
                  variant="outlined"
                  margin="normal"
                  placeholder="Enter newsletter content in HTML format..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={form.tags}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  placeholder="e.g., ayurveda, health, wellness"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<FaSave />}
                  sx={{ 
                    bgcolor: '#2d5016', 
                    '&:hover': { bgcolor: '#3a4d2d' },
                    px: 3,
                    py: 1.5
                  }}
                >
                  {editId ? 'Update Newsletter' : 'Create Newsletter'}
                </Button>
                {editId && (
                  <Button
                    onClick={() => {
                      setForm({
                        title: '',
                        content: '',
                        category: 'general',
                        tags: ''
                      });
                      setEditId(null);
                    }}
                    variant="outlined"
                    sx={{ ml: 2, px: 3, py: 1.5 }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Newsletter List */}
      <Typography variant="h5" gutterBottom sx={{ color: '#2d5016', mt: 4 }}>
        Existing Newsletters
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {newsletters.map((newsletter) => (
            <Grid item xs={12} key={newsletter._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d5016' }}>
                        {newsletter.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Published: {new Date(newsletter.publishedDate).toLocaleDateString()} | 
                        Category: {newsletter.category.replace('_', ' ')}
                      </Typography>
                      {newsletter.tags && newsletter.tags.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {newsletter.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <Button
                        onClick={() => handleEdit(newsletter)}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(newsletter._id)}
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => handleSendNewsletter(newsletter._id)}
                        variant="contained"
                        startIcon={<FaEnvelope />}
                        size="small"
                        disabled={sending[newsletter._id]}
                        sx={{ bgcolor: '#a67c52', '&:hover': { bgcolor: '#b88c62' } }}
                      >
                        {sending[newsletter._id] ? 'Sending...' : 'Send'}
                      </Button>
                    </Box>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mt: 1,
                      maxHeight: 100,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {newsletter.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                    {newsletter.content.replace(/<[^>]*>/g, '').length > 200 && '...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminNewsletter;