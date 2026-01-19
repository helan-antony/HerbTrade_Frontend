import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Paper,
  Divider,
  Fade,
  useTheme,
  LinearProgress
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
  FaVideo,
  FaPhone,
  FaComments,
  FaChalkboardTeacher,
  FaClipboardList,
  FaYoutube,
  FaRunning,
  FaAppleAlt,
  FaSpa,
  FaLeaf
} from 'react-icons/fa';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const WellnessCoachDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [coach, setCoach] = useState(null);
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingBody: '',
    date: '',
    validUntil: ''
  });
  const [certificationDialogOpen, setCertificationDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    clientId: '',
    startDate: '',
    endDate: '',
    goals: '',
    dailyTasks: [{ title: '', description: '', category: 'exercise', youtubeVideoUrl: '' }],
    weeklyMilestones: [{ week: 1, goal: '', description: '' }]
  });
  const [programDialogOpen, setProgramDialogOpen] = useState(false);

  useEffect(() => {
    fetchCoachProfile();
    fetchPrograms();
  }, []);

  const fetchCoachProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.PROFILE, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCoach(response.data);
      setClients(response.data.clients || []);

      // Set form data
      setProfileForm({
        qualifications: response.data.qualifications || [],
        specializations: response.data.specializations || [],
        experience: response.data.experience || '',
        certifications: response.data.certifications || [],
        consultationMethods: response.data.consultationMethods || [],
        languages: response.data.languages || [],
        consultationFee: response.data.consultationFee || '',
        bio: response.data.bio || ''
      });

      setAvailability(response.data.availability || availability);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setEditMode(true); // Enable edit mode for new coaches to create profile
        setError(''); // Clear error strictly
      } else {
        setError('Failed to fetch coach profile');
        console.error('Error fetching coach profile:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.CREATE_PROGRAM, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPrograms(response.data.programs || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleAddItem = (field, value) => {
    if (value && !profileForm[field].includes(value)) {
      setProfileForm(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const handleRemoveItem = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuingBody) {
      setProfileForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }]
      }));
      setNewCertification({
        name: '',
        issuingBody: '',
        date: '',
        validUntil: ''
      });
      setCertificationDialogOpen(false);
    }
  };

  const handleRemoveCertification = (index) => {
    setProfileForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');

      const profileData = {
        ...profileForm,
        availability
      };

      const response = await axios.put(API_ENDPOINTS.WELLNESS_COACH.UPDATE_PROFILE, profileData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Profile updated successfully');
      setCoach(response.data.coach);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleUpdateClientStatus = async (clientId, status) => {
    try {
      setError('');
      setSuccess('');

      await axios.put(
        API_ENDPOINTS.WELLNESS_COACH.UPDATE_CLIENT_STATUS(clientId),
        { status },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Client status updated successfully');
      fetchCoachProfile();
    } catch (err) {
      setError('Failed to update client status');
      console.error('Error updating client status:', err);
    }
  };

  const handleCreateProgram = async () => {
    try {
      setError('');
      setSuccess('');

      const programData = {
        ...newProgram,
        goals: newProgram.goals.split(',').map(goal => goal.trim()).filter(goal => goal),
        dailyTasks: newProgram.dailyTasks.map(task => ({
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date()
        })),
        weeklyMilestones: newProgram.weeklyMilestones
      };

      await axios.post(API_ENDPOINTS.WELLNESS_COACH.CREATE_PROGRAM, programData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Wellness program created successfully');
      setProgramDialogOpen(false);
      setNewProgram({
        name: '',
        description: '',
        clientId: '',
        startDate: '',
        endDate: '',
        goals: '',
        dailyTasks: [{ title: '', description: '', category: 'exercise', youtubeVideoUrl: '' }],
        weeklyMilestones: [{ week: 1, goal: '', description: '' }]
      });
      fetchPrograms();
    } catch (err) {
      setError('Failed to create wellness program');
      console.error('Error creating program:', err);
    }
  };

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
            Manage your practice, clients, and programs efficiently
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
              '& .MuiTabs-indicator': {
                bgcolor: '#2E7D32',
                height: 3,
                borderRadius: '3px'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                color: '#555',
                fontSize: '1rem',
                minHeight: '48px',
                borderRadius: '50px',
                px: 4,
                '&.Mui-selected': {
                  color: '#2E7D32',
                  bgcolor: '#E8F5E9'
                }
              }
            }}
          >
            <Tab label="Profile" icon={<FaUserMd />} iconPosition="start" />
            <Tab label="Clients" icon={<FaUsers />} iconPosition="start" />
            <Tab label="Programs" icon={<FaClipboardList />} iconPosition="start" />
            <Tab label="Schedule" icon={<FaCalendarAlt />} iconPosition="start" />
          </Tabs>
        </Paper>

        <Fade in={true} timeout={500}>
          <Box>
            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Card sx={glassCardSx}>
                    <Box sx={{
                      p: 3,
                      bgcolor: 'rgba(46, 125, 50, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                        {editMode ? "Edit Profile" : "Professional Profile"}
                      </Typography>
                      <IconButton
                        onClick={() => setEditMode(!editMode)}
                        sx={{
                          bgcolor: editMode ? '#2E7D32' : 'white',
                          color: editMode ? 'white' : '#2E7D32',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '&:hover': {
                            bgcolor: editMode ? '#1b5e20' : '#f1f8e9',
                          }
                        }}
                      >
                        {editMode ? <FaCheck /> : <FaEdit />}
                      </IconButton>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      {editMode ? (
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Professional Bio</Typography>
                            <TextField
                              fullWidth
                              label="Tell clients about your expertise..."
                              value={profileForm.bio}
                              onChange={(e) => handleInputChange('bio', e.target.value)}
                              multiline
                              rows={4}
                              sx={textFieldSx}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Years of Experience"
                              type="number"
                              value={profileForm.experience}
                              onChange={(e) => handleInputChange('experience', e.target.value)}
                              sx={textFieldSx}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Consultation Fee (₹)"
                              type="number"
                              value={profileForm.consultationFee}
                              onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                              InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#666' }}>₹</Typography> }}
                              sx={textFieldSx}
                            />
                          </Grid>

                          {['qualifications', 'specializations', 'languages', 'consultationMethods'].map((field) => (
                            <Grid item xs={12} key={field}>
                              <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                              </Typography>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9fbe7', borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                  {profileForm[field].map((item, index) => (
                                    <Chip
                                      key={index}
                                      label={item}
                                      onDelete={() => handleRemoveItem(field, item)}
                                      sx={{ bgcolor: 'white', borderColor: '#2E7D32', color: '#2E7D32' }}
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder={`Add ${field} and press Enter`}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddItem(field, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  sx={textFieldSx}
                                />
                              </Paper>
                            </Grid>
                          ))}

                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                              <Button
                                variant="outlined"
                                onClick={() => setEditMode(false)}
                                sx={{ borderRadius: '8px', color: '#666', borderColor: '#999' }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                onClick={handleSaveProfile}
                                startIcon={<FaCheck />}
                                sx={{
                                  bgcolor: '#2E7D32',
                                  '&:hover': { bgcolor: '#1b5e20' },
                                  borderRadius: '8px',
                                  px: 4
                                }}
                              >
                                Save Profile
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Box>
                          <Grid container spacing={3}>
                            <Grid item xs={12} display="flex" alignItems="center" gap={3}>
                              <Avatar sx={{ width: 80, height: 80, bgcolor: '#2E7D32', fontSize: '2rem' }}>
                                {coach?.userId?.name?.charAt(0) || <FaUserMd />}
                              </Avatar>
                              <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a330a' }}>
                                  {coach?.userId?.name || 'New Coach'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  Wellness Expert
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: '12px', borderLeft: '4px solid #2E7D32' }}>
                                <Typography variant="body1" sx={{ color: '#334d2b', fontStyle: 'italic' }}>
                                  "{profileForm.bio || 'No bio added yet. Click edit to add your professional summary.'}"
                                </Typography>
                              </Paper>
                            </Grid>

                            <Grid item xs={6} md={3}>
                              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>{profileForm.experience || 0}</Typography>
                                <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Years Exp</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>₹{profileForm.consultationFee || 0}</Typography>
                                <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Per Session</Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600 }}>Expertise</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {profileForm.specializations.map((spec, i) => (
                                  <Chip key={i} label={spec} sx={{ bgcolor: '#e8f5e9', color: '#2E7D32', fontWeight: 500 }} />
                                ))}
                                {profileForm.qualifications.map((qual, i) => (
                                  <Chip key={i} label={qual} variant="outlined" sx={{ borderColor: '#2E7D32', color: '#2E7D32' }} />
                                ))}
                                {profileForm.specializations.length === 0 && profileForm.qualifications.length === 0 && (
                                  <Typography color="text.secondary">No expertise listed.</Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={glassCardSx}>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fbfdf9' }}>
                      <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 700 }}>Performance Highlights</Typography>
                    </Box>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <FaStar color="#FFD700" size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                          <Typography variant="h4" sx={{ ml: 2, fontWeight: 700, color: '#333' }}>{coach?.rating || 0}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mt: 1 }}>/ 5.0 Rating</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(coach?.rating || 0) * 20} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f8e9', '& .MuiLinearProgress-bar': { bgcolor: '#FFD700' } }} />
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
                        Start by assigning a new client to your practice
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {clients.map((client, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', transition: 'all 0.3s', '&:hover': { borderColor: '#2E7D32', transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Avatar sx={{ bgcolor: '#2E7D32' }}>{client.userId?.name?.[0]}</Avatar>
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
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => console.log('View client', client.userId._id)}
                                sx={{ borderRadius: '8px', color: '#2E7D32', borderColor: '#2E7D32' }}
                              >
                                View Details
                              </Button>
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
                  <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Wellness Programs</Typography>
                  <Button
                    variant="contained"
                    startIcon={<FaPlus />}
                    onClick={() => setProgramDialogOpen(true)}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: '8px' }}
                  >
                    Create Program
                  </Button>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {programs.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
                      <FaClipboardList size={48} color="#a5d6a7" />
                      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        No programs active
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create customized wellness plans for your clients
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {programs.map((program, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', '&:hover': { borderColor: '#2E7D32' } }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom sx={{ color: '#1a330a' }}>{program.name}</Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>{program.description}</Typography>
                              <Box display="flex" gap={1} mb={2}>
                                {program.goals?.slice(0, 3).map((goal, i) => (
                                  <Chip key={i} label={goal} size="small" sx={{ bgcolor: '#f1f8e9', color: '#33691e' }} />
                                ))}
                              </Box>
                              <Box display="flex" alignItems="center" color="text.secondary" fontSize="0.875rem">
                                <FaCalendarAlt style={{ marginRight: 8 }} />
                                {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
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
                      <Grid item xs={12} sm={6} md={3} key={day}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9fbe7', borderRadius: '12px' }}>
                          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 1, fontWeight: 600, color: '#33691e' }}>{day}</Typography>
                          {editMode ? (
                            <Box>
                              <TextField
                                type="time"
                                size="small"
                                fullWidth
                                value={availability[day].start}
                                onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                                sx={{ mb: 1, bgcolor: 'white' }}
                              />
                              <TextField
                                type="time"
                                size="small"
                                fullWidth
                                value={availability[day].end}
                                onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                                sx={{ bgcolor: 'white' }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {availability[day].start && availability[day].end
                                ? `${availability[day].start} - ${availability[day].end}`
                                : 'Unavailable'}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      </Container>

      {/* Dialogs remain similar but with updated styling if needed - Keeping minimal for now to not exceed line limits if handled differently */}
      <Dialog open={programDialogOpen} onClose={() => setProgramDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#2E7D32', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Critique Wellness Program</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Name"
                value={newProgram.name}
                onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgramDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreateProgram} sx={{ bgcolor: '#2E7D32' }}>Create</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default WellnessCoachDashboard;