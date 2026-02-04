import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Paper,
  Fade,
  useTheme,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  FaUserMd,
  FaEdit,
  FaCheck,
  FaPlus,
  FaStar,
  FaUsers,
  FaCertificate,
  FaCalendarAlt,
  FaRupeeSign,
  FaLeaf,
  FaNewspaper,
  FaTags,
  FaToggleOn,
  FaToggleOff,
  FaLightbulb
} from 'react-icons/fa';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const WellnessCoachDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [coach, setCoach] = useState(null);
  const [clients, setClients] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    qualifications: [],
    specializations: [],
    experience: '',
    certifications: [],
    consultationMethods: [],
    consultationFee: '',
    bio: '',
    languages: []
  });
  
  // Availability state
  const [availability, setAvailability] = useState({
    monday: { start: '', end: '' },
    tuesday: { start: '', end: '' },
    wednesday: { start: '', end: '' },
    thursday: { start: '', end: '' },
    friday: { start: '', end: '' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' }
  });
  
  const [editMode, setEditMode] = useState(false);
  
  // Newsletter creation state
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    author: '',
    isActive: true
  });
  const [newsletterDialogOpen, setNewsletterDialogOpen] = useState(false);
  
  // Client management state
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Newsletter creation functions
  const handleNewsletterDialogOpen = () => {
    setNewsletterDialogOpen(true);
  };

  const handleCreateNewsletter = async () => {
    try {
      setError('');
      setSuccess('');

      // Validate required fields
      if (!newNewsletter.title) return setError('Newsletter title is required');
      if (!newNewsletter.content) return setError('Newsletter content is required');

      const newsletterData = {
        title: newNewsletter.title,
        content: newNewsletter.content,
        category: newNewsletter.category,
        author: newNewsletter.author || 'Wellness Coach',
        tags: newNewsletter.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isActive: newNewsletter.isActive,
        programType: 'newsletter'
      };

      console.log('Creating newsletter with data:', newsletterData);
      console.log('API endpoint:', API_ENDPOINTS.NEWSLETTER.CREATE);
      console.log('Token:', localStorage.getItem('token'));

      const response = await axios.post(API_ENDPOINTS.NEWSLETTER.CREATE, newsletterData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      console.log('Newsletter creation response:', response.data);

      setSuccess('Newsletter created successfully');
      setNewsletterDialogOpen(false);
      
      // Reset form
      setNewNewsletter({
        title: '',
        content: '',
        category: 'general',
        tags: '',
        author: '',
        isActive: true
      });

      // Refresh newsletters list
      fetchNewsletters();
    } catch (err) {
      console.error('Error creating newsletter:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to create newsletter: ' + (err.response?.data?.message || err.message));
    }
  };

  // Client management functions
  const handleOpenClientDialog = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.USERS, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableUsers(response.data);
      setClientDialogOpen(true);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch available users');
    }
  };

  const handleAddClient = async () => {
    if (!selectedUser) {
      setError('Please select a user to add as client');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // In a real implementation, this would call an API to assign the user as a client
      // For now, we'll just simulate the addition
      const selectedUserData = availableUsers.find(user => user._id === selectedUser);
      if (selectedUserData) {
        const newClient = {
          userId: selectedUserData,
          status: 'active',
          joinedDate: new Date()
        };
        
        setClients([...clients, newClient]);
        setSuccess('Client added successfully');
        setClientDialogOpen(false);
        setSelectedUser('');
      }
    } catch (err) {
      setError('Failed to add client');
      console.error('Error adding client:', err);
    }
  };

  const handleRemoveClient = (clientId) => {
    setClients(clients.filter(client => client.userId._id !== clientId));
    setSuccess('Client removed successfully');
  };

  const handleUpdateClientStatusLocal = (clientId, newStatus) => {
    setClients(clients.map(client => 
      client.userId._id === clientId 
        ? { ...client, status: newStatus }
        : client
    ));
    setSuccess(`Client status updated to ${newStatus}`);
  };

  const handleViewClientDetails = (clientId) => {
    const client = clients.find(c => c.userId._id === clientId);
    if (client) {
      alert(`Client Details:\nName: ${client.userId.name}\nEmail: ${client.userId.email}\nStatus: ${client.status}`);
    }
  };

  // Fetch functions
  const fetchCoachProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching coach profile...');
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token);
      
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.PROFILE, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Profile response:', response.data);
      
      const coachData = response.data.coach || response.data;
      setCoach(coachData);
      setClients(coachData.clients || []);

      setProfileForm({
        qualifications: coachData.qualifications || [],
        specializations: coachData.specializations || [],
        experience: coachData.experience || '',
        certifications: coachData.certifications || [],
        consultationMethods: coachData.consultationMethods || [],
        languages: coachData.languages || [],
        consultationFee: coachData.consultationFee || '',
        bio: coachData.bio || ''
      });

      setAvailability(coachData.availability || availability);
    } catch (err) {
      console.error('Error fetching coach profile:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response && err.response.status === 404) {
        console.log('Coach profile not found, enabling edit mode');
        setEditMode(true);
        setError('');
      } else {
        setError('Failed to fetch coach profile: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.NEWSLETTER.GET_ALL}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Filter newsletters created by this coach
      const coachNewsletters = response.data.newsletters || [];
      setNewsletters(coachNewsletters);
    } catch (err) {
      console.error('Error fetching newsletters:', err);
    }
  };

  useEffect(() => {
    console.log('WellnessCoachDashboard mounted');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('User role:', user?.role);
    
    if (!user || user.role !== 'wellness_coach') {
      console.error('User is not a wellness coach');
      setError('Access denied. Wellness coach role required.');
      return;
    }
    
    fetchCoachProfile();
    fetchNewsletters();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  const glassCardSx = {
    bgcolor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(45, 80, 22, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px 0 rgba(45, 80, 22, 0.15)'
    }
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&.Mui-focused fieldset': {
        borderColor: '#2E7D32',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#2E7D32',
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
      py: 6
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
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
            <FaLeaf color="#4caf50" />
            Wellness Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#558b2f', fontWeight: 500 }}>
            Manage your practice and create wellness newsletters
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>{success}</Alert>}

        <Paper
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '100px',
            p: 1,
            mb: 4,
            width: 'fit-content'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 600,
                color: '#558b2f',
                '&.Mui-selected': {
                  color: '#2E7D32'
                }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#2E7D32',
                height: 3
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Clients" />
            <Tab label="Newsletters" />
            <Tab label="Availability" />
          </Tabs>
        </Paper>

        <Fade in={true}>
          <Box>
            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card sx={glassCardSx}>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fbfdf9' }}>
                      <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                        Profile Overview
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Name</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                            {coach?.userId?.name || 'Not set'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Email</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                            {coach?.userId?.email || 'Not set'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Specialization</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                            {coach?.specializations?.join(', ') || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Experience</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                            {coach?.experience || 'Not specified'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={glassCardSx}>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fbfdf9' }}>
                      <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 700 }}>Performance</Typography>
                    </Box>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <FaStar color="#FFD700" size={24} />
                          <Typography variant="h4" sx={{ ml: 2, fontWeight: 700, color: '#333' }}>{coach?.rating || 0}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mt: 1 }}>/ 5.0 Rating</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#e8f5e9', color: '#2E7D32' }}>
                          <FaUsers size={24} />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>{clients.length}</Typography>
                          <Typography variant="body2" color="text.secondary">Active Clients</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#fff3e0', color: '#ed6c02' }}>
                          <FaCertificate size={24} />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>{profileForm.certifications.length}</Typography>
                          <Typography variant="body2" color="text.secondary">Certifications</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Card sx={glassCardSx}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Client Management</Typography>
                  <Button
                    variant="contained"
                    startIcon={<FaPlus />}
                    onClick={handleOpenClientDialog}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: '8px' }}
                  >
                    New Client
                  </Button>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {clients.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
                      <FaLeaf size={48} color="#a5d6a7" />
                      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        Your client list is empty
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start by adding a new client to your practice
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {clients.map((client, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', transition: 'all 0.3s', '&:hover': { borderColor: '#2E7D32', transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                  {client.userId?.name?.[0]}
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={600} noWrap>{client.userId?.name || 'Client'}</Typography>
                                  <Chip
                                    label={client.status}
                                    size="small"
                                    sx={{
                                      height: 24,
                                      bgcolor: client.status === 'active' ? '#e8f5e9' : '#fafafa',
                                      color: client.status === 'active' ? '#2E7D32' : '#666'
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {client.userId?.email}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleViewClientDetails(client.userId._id)}
                                  sx={{ borderRadius: '8px', color: '#2E7D32', borderColor: '#2E7D32', flex: 1 }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleUpdateClientStatusLocal(client.userId._id, client.status === 'active' ? 'inactive' : 'active')}
                                  sx={{ borderRadius: '8px', color: '#ff9800', borderColor: '#ff9800', flex: 1 }}
                                >
                                  {client.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleRemoveClient(client.userId._id)}
                                  sx={{ borderRadius: '8px', color: '#f44336', borderColor: '#f44336', flex: 1 }}
                                >
                                  Remove
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 2 && (
              <Card sx={glassCardSx}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Your Newsletters</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FaLightbulb />}
                      onClick={() => navigate('/coach-post-enrollment')}
                      sx={{ 
                        borderColor: '#2E7D32', 
                        color: '#2E7D32', 
                        '&:hover': { bgcolor: '#e8f5e9', borderColor: '#1b5e20' }, 
                        borderRadius: '8px' 
                      }}
                    >
                      Post-Enrollment Content
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<FaPlus />}
                      onClick={handleNewsletterDialogOpen}
                      sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: '8px' }}
                    >
                      Create Newsletter
                    </Button>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {newsletters.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
                      <FaNewspaper size={48} color="#a5d6a7" />
                      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        No newsletters created yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create your first wellness newsletter to share with clients
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {newsletters.map((newsletter, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={index}>
                          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', '&:hover': { borderColor: '#2E7D32' } }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#1a330a' }}>{newsletter.title}</Typography>
                                <Chip 
                                  label={newsletter.isActive ? 'Published' : 'Draft'} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: newsletter.isActive ? '#e8f5e9' : '#fafafa',
                                    color: newsletter.isActive ? '#2E7D32' : '#666'
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {newsletter.content?.substring(0, 100) || 'No content'}...
                              </Typography>
                              <Box display="flex" gap={1} mb={2}>
                                {newsletter.category && (
                                  <Chip label={newsletter.category.replace('_', ' ')} size="small" sx={{ bgcolor: '#f1f8e9', color: '#33691e' }} />
                                )}
                                {newsletter.tags && newsletter.tags.map((tag, i) => (
                                  <Chip key={i} label={tag} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }} />
                                ))}
                              </Box>
                              <Box display="flex" alignItems="center" justifyContent="space-between" color="text.secondary" fontSize="0.875rem">
                                <Box display="flex" alignItems="center">
                                  <FaCalendarAlt style={{ marginRight: 8 }} />
                                  {newsletter.publishedDate ? new Date(newsletter.publishedDate).toLocaleDateString() : 'Not published'}
                                </Box>
                                <Typography variant="caption">{newsletter.author || 'Unknown Author'}</Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 3 && (
              <Card sx={glassCardSx}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Availability Schedule</Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {Object.keys(availability).map((day) => (
                      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={day}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9fbe7', borderRadius: '12px' }}>
                          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 1, fontWeight: 600, color: '#33691e' }}>{day}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {availability[day].start && availability[day].end
                              ? `${availability[day].start} - ${availability[day].end}`
                              : 'Unavailable'}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>

        {/* Newsletter Dialog */}
        <Dialog
          open={newsletterDialogOpen}
          onClose={() => setNewsletterDialogOpen(false)}
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
              <FaNewspaper color="#2E7D32" size={24} />
            </Box>
            Create Newsletter
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Newsletter Title"
                  placeholder="Enter a catchy title for your newsletter"
                  value={newNewsletter.title}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, title: e.target.value })}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={6}
                  placeholder="Write your newsletter content here..."
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth sx={textFieldSx}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newNewsletter.category}
                    onChange={(e) => setNewNewsletter({ ...newNewsletter, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="seasonal">Seasonal</MenuItem>
                    <MenuItem value="specific_condition">Specific Condition</MenuItem>
                    <MenuItem value="wellness_tips">Wellness Tips</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Author"
                  placeholder="Your name or title"
                  value={newNewsletter.author}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, author: e.target.value })}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  placeholder="health, wellness, tips, seasonal"
                  value={newNewsletter.tags}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, tags: e.target.value })}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newNewsletter.isActive}
                      onChange={(e) => setNewNewsletter({ ...newNewsletter, isActive: e.target.checked })}
                      color="success"
                    />
                  }
                  label="Publish Immediately"
                  sx={{ color: '#558b2f', fontWeight: 500 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(0,0,0,0.05)', gap: 2 }}>
            <Button
              onClick={() => setNewsletterDialogOpen(false)}
              sx={{ px: 4, borderRadius: '12px', color: '#666' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateNewsletter}
              sx={{
                px: 6,
                borderRadius: '12px',
                bgcolor: '#2E7D32',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                '&:hover': { bgcolor: '#1b5e20', boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)' }
              }}
            >
              Publish Newsletter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Dialog */}
        <Dialog
          open={clientDialogOpen}
          onClose={() => setClientDialogOpen(false)}
          maxWidth="sm"
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
              <FaUsers color="#2E7D32" size={24} />
            </Box>
            Add New Client
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <FormControl fullWidth sx={textFieldSx}>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(0,0,0,0.05)', gap: 2 }}>
            <Button
              onClick={() => setClientDialogOpen(false)}
              sx={{ px: 4, borderRadius: '12px', color: '#666' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddClient}
              sx={{
                px: 6,
                borderRadius: '12px',
                bgcolor: '#2E7D32',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                '&:hover': { bgcolor: '#1b5e20', boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)' }
              }}
            >
              Add Client
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default WellnessCoachDashboard;