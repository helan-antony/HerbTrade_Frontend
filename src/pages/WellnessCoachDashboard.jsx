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
  FaLeaf,
  FaExclamationTriangle,
  FaBullseye,
  FaTasks,
  FaCheckCircle
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
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [unassignedPrograms, setUnassignedPrograms] = useState([]);
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
    title: '',
    description: '',
    category: '',
    duration: '',
    difficulty: '',
    targetAudience: [],
    prerequisites: [],
    benefits: [],
    status: 'published',
    startDate: '',
    endDate: '',
    goals: '',
    assignedUserId: '',
    dailyTasks: [],
    weeklyMilestones: [{ week: 1, goal: '', description: '' }],
    newTargetAudience: '',
    newPrerequisite: '',
    newBenefit: ''
  });
  const [programDialogOpen, setProgramDialogOpen] = useState(false);


  // Helper functions for Program Form
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...newProgram.dailyTasks];
    updatedTasks[index][field] = value;
    setNewProgram({ ...newProgram, dailyTasks: updatedTasks });
  };

  const handleAddTask = () => {
    setNewProgram(prev => ({
      ...prev,
      dailyTasks: [...prev.dailyTasks, { title: '', description: '', category: 'exercise', youtubeVideoUrl: '', id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, date: new Date() }]
    }));
  };

  const handleRemoveTask = (index) => {
    setNewProgram(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((_, i) => i !== index)
    }));
  };

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...newProgram.weeklyMilestones];
    updatedMilestones[index][field] = value;
    setNewProgram({ ...newProgram, weeklyMilestones: updatedMilestones });
  };

  const handleAddMilestone = () => {
    setNewProgram(prev => ({
      ...prev,
      weeklyMilestones: [...prev.weeklyMilestones, { week: prev.weeklyMilestones.length + 1, goal: '', description: '', achieved: false }]
    }));
  };

  const handleRemoveMilestone = (index) => {
    setNewProgram(prev => ({
      ...prev,
      weeklyMilestones: prev.weeklyMilestones.filter((_, i) => i !== index)
    }));
  };

  const handleProgramDialogOpen = () => {
    setProgramDialogOpen(true);
  };

  // Add function to handle program assignment
  const handleAssignProgram = (programId) => {
    // For now, show an alert with instructions
    // In a real implementation, this would open a dialog to select a client
    alert('In a real implementation, this would open a dialog to assign the program to a client. For now, please edit the program and set the assigned user.');
  };

  // Make sure this function is defined before any other functions that might use it
  useEffect(() => {
    fetchCoachProfile();
    fetchPrograms();
  }, []);

  // Check authentication before making API calls
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  const fetchCoachProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.PROFILE, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Handle the response data properly - check if it's wrapped in a coach property
      const coachData = response.data.coach || response.data;
      setCoach(coachData);
      setClients(coachData.clients || []);

      // Set form data
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
      if (err.response && err.response.status === 404) {
        // If no coach profile exists, allow creating one
        setEditMode(true);
        setError('');
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
      // Use the endpoint for getting ALL programs for the coach
      const response = await axios.get(`${API_ENDPOINTS.WELLNESS_COACH.GET_ALL_PROGRAMS}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Separate assigned and unassigned programs
      const allPrograms = response.data.programs || [];
      const assignedPrograms = allPrograms.filter(program => program.clientId);
      const unassignedPrograms = allPrograms.filter(program => !program.clientId);
      
      setPrograms(allPrograms);
      setAssignedPrograms(assignedPrograms);
      setUnassignedPrograms(unassignedPrograms);
    } catch (err) {
      console.error('Error fetching programs:', err);
      // Don't set global error here to avoid blocking other UI, just log it
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

      let response;
      if (!coach) {
        // Create new coach profile
        response = await axios.post(API_ENDPOINTS.WELLNESS_COACH.CREATE_PROFILE, profileData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        setSuccess('Profile created successfully');
      } else {
        // Update existing coach profile
        response = await axios.put(API_ENDPOINTS.WELLNESS_COACH.UPDATE_PROFILE, profileData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        setSuccess('Profile updated successfully');
      }
      
      setCoach(response.data.coach || response.data);
      setEditMode(false);
    } catch (err) {
      setError('Failed to save profile: ' + (err.response?.data?.message || err.message));
      console.error('Error saving profile:', err);
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

      // Basic validation
      if (!newProgram.name) return setError('Program name is required');
      if (!newProgram.startDate || !newProgram.endDate) return setError('Start and end dates are required');
      if (!coach || (!coach._id && !coach.id)) return setError('Coach profile is required to create programs');

      const validTasks = newProgram.dailyTasks.filter(t => t.title && t.description && t.category);
      if (validTasks.length === 0) return setError('At least one daily task with title, description, and category is required');

      // Validate weekly milestones
      const validMilestones = newProgram.weeklyMilestones.filter(m => m.goal && m.description && m.week !== undefined);
      if (validMilestones.length === 0) return setError('At least one weekly milestone with goal, description, and week is required');

      const programData = {
        ...newProgram,
        name: newProgram.name || newProgram.title,
        goals: newProgram.goals.split(',').map(goal => goal.trim()).filter(goal => goal),
        clientId: newProgram.assignedUserId || undefined,
        assignedUserId: newProgram.assignedUserId || undefined,
        // Add coach ID to associate the program with the coach who created it
        coachId: coach._id || coach.id || undefined,
        dailyTasks: validTasks.map(task => ({
          ...task,
          id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: task.date || new Date()
        })),
        weeklyMilestones: newProgram.weeklyMilestones.map((milestone, index) => ({
          ...milestone,
          week: milestone.week || index + 1
        }))
      };

      await axios.post(API_ENDPOINTS.WELLNESS_COACH.CREATE_PROGRAM, programData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Wellness program created successfully');
      setProgramDialogOpen(false);
      setNewProgram({
        name: '',
        title: '',
        description: '',
        category: '',
        duration: '',
        difficulty: '',
        targetAudience: [],
        prerequisites: [],
        benefits: [],
        status: 'published',
        startDate: '',
        endDate: '',
        goals: '',
        assignedUserId: '',
        dailyTasks: [],
        weeklyMilestones: [{ week: 1, goal: '', description: '' }],
        newTargetAudience: '',
        newPrerequisite: '',
        newBenefit: ''
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
                <Grid size={{ xs: 12, md: 8 }}>
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
                          <Grid size={{ xs: 12 }}>
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
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              label="Years of Experience"
                              type="number"
                              value={profileForm.experience}
                              onChange={(e) => handleInputChange('experience', e.target.value)}
                              sx={textFieldSx}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
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
                            <Grid size={{ xs: 12 }} key={field}>
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


                          <Grid size={{ xs: 12 }}>
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
                            <Grid size={{ xs: 12 }} display="flex" alignItems="center" gap={3}>
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

                            <Grid size={{ xs: 12 }}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: '12px', borderLeft: '4px solid #2E7D32' }}>
                                <Typography variant="body1" sx={{ color: '#334d2b', fontStyle: 'italic' }}>
                                  "{profileForm.bio || 'No bio added yet. Click edit to add your professional summary.'}"
                                </Typography>
                              </Paper>
                            </Grid>


                            <Grid size={{ xs: 6, md: 3 }}>
                              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>{profileForm.experience || 0}</Typography>
                                <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Years Exp</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6, md: 3 }}>
                              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>₹{profileForm.consultationFee || 0}</Typography>
                                <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Per Session</Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
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

                <Grid size={{ xs: 12, md: 4 }}>
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
                      {clients.map((client, index) => {
                        // Find active program for this client
                        const clientProgram = programs.find(p => p.clientId?._id === client.userId?._id || p.clientId === client.userId?._id);

                        return (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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

                                {clientProgram && (
                                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f9fbe7', borderRadius: '8px' }}>
                                    <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 600 }}>Current Program Progress</Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={clientProgram.progress?.overall || 0}
                                        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#e0e0e0' }}
                                      />
                                      <Typography variant="caption" fontWeight="bold">{clientProgram.progress?.overall || 0}%</Typography>
                                    </Box>
                                  </Box>
                                )}

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
                        );
                      })}
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
                    onClick={handleProgramDialogOpen}
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
                      {unassignedPrograms.map((program, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={index}>
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
                      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={day}>
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
        </Fade >
      </Container >

      {/* Dialogs */}
      <Dialog
        open={programDialogOpen}
        onClose={() => setProgramDialogOpen(false)}
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
            <FaClipboardList color="#2E7D32" size={24} />
          </Box>
          Create Wellness Program
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={4} sx={{ mt: 1 }}>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Program Name"
                placeholder="e.g., 30-Day Holistic Rejuvenation"
                value={newProgram.name}
                onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Program Title"
                placeholder="e.g., Sleep Hygiene & Relaxation"
                value={newProgram.title}
                onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Program Description"
                multiline
                rows={3}
                placeholder="Describe the focus and expected outcomes of this wellness journey..."
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                select
                label="Category"
                value={newProgram.category}
                onChange={(e) => setNewProgram({ ...newProgram, category: e.target.value })}
                sx={textFieldSx}
              >
                <MenuItem value="stress-management">Stress Management</MenuItem>
                <MenuItem value="sleep-hygiene">Sleep Hygiene</MenuItem>
                <MenuItem value="weight-loss">Weight Loss</MenuItem>
                <MenuItem value="fitness">Fitness</MenuItem>
                <MenuItem value="nutrition">Nutrition</MenuItem>
                <MenuItem value="mindfulness">Mindfulness</MenuItem>
                <MenuItem value="detox">Detox</MenuItem>
                <MenuItem value="general-wellness">General Wellness</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Duration (Days)"
                type="number"
                value={newProgram.duration}
                onChange={(e) => setNewProgram({ ...newProgram, duration: parseInt(e.target.value) || '' })}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                select
                label="Difficulty Level"
                value={newProgram.difficulty}
                onChange={(e) => setNewProgram({ ...newProgram, difficulty: e.target.value })}
                sx={textFieldSx}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={newProgram.status}
                onChange={(e) => setNewProgram({ ...newProgram, status: e.target.value })}
                sx={textFieldSx}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProgram.startDate}
                onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProgram.endDate}
                onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Primary Goals"
                placeholder="Weight loss, Stress management, Improved sleep (comma separated)"
                value={newProgram.goals}
                onChange={(e) => setNewProgram({ ...newProgram, goals: e.target.value })}
                sx={textFieldSx}
              />
            </Grid>
            
            {/* Target Audience Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.75, bgcolor: '#e3f2fd', borderRadius: '8px', color: '#1976d2' }}>
                  <FaUsers size={20} />
                </Box>
                <Typography variant="h6" sx={{ color: '#1a330a', fontWeight: 700 }}>Target Audience</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Target Audience"
                  placeholder="e.g., Adults over 40, Athletes, Beginners"
                  value={newProgram.newTargetAudience}
                  onChange={(e) => setNewProgram({ ...newProgram, newTargetAudience: e.target.value })}
                  sx={textFieldSx}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newProgram.newTargetAudience.trim()) {
                      setNewProgram({
                        ...newProgram,
                        targetAudience: [...newProgram.targetAudience, newProgram.newTargetAudience.trim()],
                        newTargetAudience: ''
                      });
                    }
                  }}
                  sx={{
                    mt: 'auto',
                    alignSelf: 'flex-end',
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' },
                    height: '56px'
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {newProgram.targetAudience.map((audience, index) => (
                  <Chip
                    key={index}
                    label={audience}
                    onDelete={() => {
                      setNewProgram({
                        ...newProgram,
                        targetAudience: newProgram.targetAudience.filter((_, i) => i !== index)
                      });
                    }}
                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2', borderRadius: '8px' }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Prerequisites Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.75, bgcolor: '#fff3e0', borderRadius: '8px', color: '#f57c00' }}>
                  <FaExclamationTriangle size={20} />
                </Box>
                <Typography variant="h6" sx={{ color: '#1a330a', fontWeight: 700 }}>Prerequisites</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Prerequisite"
                  placeholder="e.g., Basic fitness level, Doctor's clearance"
                  value={newProgram.newPrerequisite}
                  onChange={(e) => setNewProgram({ ...newProgram, newPrerequisite: e.target.value })}
                  sx={textFieldSx}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newProgram.newPrerequisite.trim()) {
                      setNewProgram({
                        ...newProgram,
                        prerequisites: [...newProgram.prerequisites, newProgram.newPrerequisite.trim()],
                        newPrerequisite: ''
                      });
                    }
                  }}
                  sx={{
                    mt: 'auto',
                    alignSelf: 'flex-end',
                    bgcolor: '#f57c00',
                    '&:hover': { bgcolor: '#ef6c00' },
                    height: '56px'
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {newProgram.prerequisites.map((prereq, index) => (
                  <Chip
                    key={index}
                    label={prereq}
                    onDelete={() => {
                      setNewProgram({
                        ...newProgram,
                        prerequisites: newProgram.prerequisites.filter((_, i) => i !== index)
                      });
                    }}
                    sx={{ bgcolor: '#fff3e0', color: '#f57c00', borderRadius: '8px' }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Benefits Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.75, bgcolor: '#e8f5e9', borderRadius: '8px', color: '#388e3c' }}>
                  <FaCheckCircle size={20} />
                </Box>
                <Typography variant="h6" sx={{ color: '#1a330a', fontWeight: 700 }}>Benefits</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Benefit"
                  placeholder="e.g., Improved sleep, Reduced stress"
                  value={newProgram.newBenefit}
                  onChange={(e) => setNewProgram({ ...newProgram, newBenefit: e.target.value })}
                  sx={textFieldSx}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newProgram.newBenefit.trim()) {
                      setNewProgram({
                        ...newProgram,
                        benefits: [...newProgram.benefits, newProgram.newBenefit.trim()],
                        newBenefit: ''
                      });
                    }
                  }}
                  sx={{
                    mt: 'auto',
                    alignSelf: 'flex-end',
                    bgcolor: '#388e3c',
                    '&:hover': { bgcolor: '#2e7d32' },
                    height: '56px'
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {newProgram.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    onDelete={() => {
                      setNewProgram({
                        ...newProgram,
                        benefits: newProgram.benefits.filter((_, i) => i !== index)
                      });
                    }}
                    sx={{ bgcolor: '#e8f5e9', color: '#388e3c', borderRadius: '8px' }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Assign to Client"
                value={newProgram.assignedUserId}
                onChange={(e) => setNewProgram({ ...newProgram, assignedUserId: e.target.value })}
                sx={textFieldSx}
                helperText="Select a client to assign this program to"
              >
                <MenuItem value="">Select a client (optional)</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id || client.id} value={client._id || client.id}>
                    {client.userId?.name || client.name || 'Unnamed Client'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.75, bgcolor: '#f1f8e9', borderRadius: '8px', color: '#2E7D32' }}>
                  <FaLeaf size={20} />
                </Box>
                <Typography variant="h6" sx={{ color: '#1a330a', fontWeight: 700 }}>Daily Tasks</Typography>
              </Box>

              {newProgram.dailyTasks.map((task, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.5)',
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid rgba(46, 125, 50, 0.1)',
                    position: 'relative',
                    transition: 'all 0.3s',
                    '&:hover': { border: '1px solid rgba(46, 125, 50, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveTask(index)}
                    sx={{ position: 'absolute', top: 12, right: 12, color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Task Title"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Category"
                        select
                        value={task.category}
                        onChange={(e) => handleTaskChange(index, 'category', e.target.value)}
                        sx={textFieldSx}
                      >
                        <MenuItem value="exercise">Exercise</MenuItem>
                        <MenuItem value="diet">Diet</MenuItem>
                        <MenuItem value="lifestyle">Lifestyle</MenuItem>
                        <MenuItem value="meditation">Meditation</MenuItem>
                        <MenuItem value="herbs">Herbs</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description"
                        placeholder="What should the client do?"
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="YouTube Video URL"
                        placeholder="Provide a video guide (Optional)"
                        value={task.youtubeVideoUrl}
                        onChange={(e) => handleTaskChange(index, 'youtubeVideoUrl', e.target.value)}
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                startIcon={<FaPlus />}
                onClick={handleAddTask}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  borderColor: '#2E7D32',
                  color: '#2E7D32',
                  '&:hover': { bgcolor: '#f1f8e9', borderColor: '#1b5e20' }
                }}
              >
                Add Daily Task
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.75, bgcolor: '#fff3e0', borderRadius: '8px', color: '#f57c00' }}>
                  <FaStar size={20} />
                </Box>
                <Typography variant="h6" sx={{ color: '#1a330a', fontWeight: 700 }}>Weekly Milestones</Typography>
              </Box>

              {newProgram.weeklyMilestones.map((milestone, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.5)',
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 124, 0, 0.1)',
                    position: 'relative',
                    transition: 'all 0.3s',
                    '&:hover': { border: '1px solid rgba(245, 124, 0, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveMilestone(index)}
                    sx={{ position: 'absolute', top: 12, right: 12, color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  <Typography variant="subtitle2" sx={{ color: '#f57c00', mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Week {index + 1}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Weekly Goal"
                        placeholder="Describe the main focus for this week"
                        value={milestone.goal}
                        onChange={(e) => handleMilestoneChange(index, 'goal', e.target.value)}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Requirements/Milestone description"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                startIcon={<FaPlus />}
                onClick={handleAddMilestone}
                variant="outlined"
                color="warning"
                sx={{ borderRadius: '12px' }}
              >
                Add Next Week
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(0,0,0,0.05)', gap: 2 }}>
          <Button
            onClick={() => setProgramDialogOpen(false)}
            sx={{ px: 4, borderRadius: '12px', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProgram}
            sx={{
              px: 6,
              borderRadius: '12px',
              bgcolor: '#2E7D32',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
              '&:hover': { bgcolor: '#1b5e20', boxShadow: '0 6px 166px rgba(46, 125, 50, 0.3)' }
            }}
          >
            Launch Program
          </Button>
        </DialogActions>
      </Dialog>

    </Box >
  );
};

export default WellnessCoachDashboard;