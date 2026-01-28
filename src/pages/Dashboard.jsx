import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Chip, Divider, Alert, LinearProgress, CircularProgress } from "@mui/material";
import { FaShoppingCart, FaSeedling, FaHospital, FaUserShield, FaChartBar, FaCalendarAlt, FaUserMd, FaPlus, FaHeart, FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { addSampleDataToStorage, clearSampleData } from "../utils/sampleData";
import { API_ENDPOINTS } from "../config/api";

function Dashboard() {
  const [user, setUser] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u || {});
    fetchAppointments();
    if (u?.role === 'user') {
      fetchAssignedPrograms();
    }
    
    // Listen for appointment booking events
    const handleAppointmentBooked = () => {
      fetchAppointments();
    };
    
    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    
    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('http://localhost:5000/api/hospitals/appointments/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Add state for unassigned programs
  const [unassignedPrograms, setUnassignedPrograms] = useState([]);

  const fetchAssignedPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Fetch all available wellness programs for the current user
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.GET_AVAILABLE_PROGRAMS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Set both assigned and unassigned programs
      setPrograms(response.data.assignedPrograms || []);
      setUnassignedPrograms(response.data.unassignedPrograms || []);
    } catch (error) {
      console.error('Error fetching available programs:', error);
      // Handle 404 specifically (no programs found) by setting empty arrays
      if (error.response?.status === 404) {
        setPrograms([]);
        setUnassignedPrograms([]);
      } else {
        // Don't set an error message here as it might interfere with the dashboard
        setPrograms([]);
        setUnassignedPrograms([]);
      }
    } finally {
      setProgramsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#e8f5e9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', m: 0, p: 0, overflow: 'hidden' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={user.profilePic} sx={{ width: 64, height: 64, mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} color="#3a4d2d">
              {user.name || 'User'}
            </Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/edit-profile')}>
              Edit Profile
            </Button>
            <Button 
              variant="contained" 
              startIcon={<FaPlus />}
              onClick={addSampleDataToStorage}
              sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
            >
              Add Sample Items
            </Button>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🎯 <strong>Demo Features:</strong> Click "Add Sample Items" to test Cart and Wishlist functionality with sample herbs.
          </Typography>
        </Alert>
        <Grid container spacing={4}>
          {user.role === 'user' && (
            <>
              <Grid item xs={12} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s' } }} onClick={() => navigate('/cart')}>
                  <CardContent>
                    <FaShoppingCart size={32} color="#2d5016" />
                    <Typography variant="h6" fontWeight={600} mt={2}>My Cart</Typography>
                    <Typography>View and manage your cart items.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s' } }} onClick={() => navigate('/wishlist')}>
                  <CardContent>
                    <FaHeart size={32} color="#e91e63" />
                    <Typography variant="h6" fontWeight={600} mt={2}>My Wishlist</Typography>
                    <Typography>View your saved favorite items.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <FaSeedling size={32} />
                    <Typography variant="h6" fontWeight={600} mt={2}>Upload Herbs</Typography>
                    <Typography>For sellers: manage stock and grading.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <FaHospital size={32} />
                    <Typography variant="h6" fontWeight={600} mt={2}>Hospitals</Typography>
                    <Typography>Register and manage hospital info.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          
          {/* Wellness Programs Section for Users */}
          {user.role === 'user' && (
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} color="#3a4d2d" mb={3}>
                  <FaUserMd style={{ marginRight: 8 }} />
                  My Wellness Programs
                </Typography>
                <Grid container spacing={3}>
                  {programsLoading ? (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                      </Box>
                    </Grid>
                  ) : programs.length > 0 ? (
                    programs.map((program) => (
                      <Grid item xs={12} md={6} lg={4} key={program.id || 'default-key'}>
                        <Card
                          sx={
                            {
                              cursor: 'pointer',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '24px',
                              border: '1px solid rgba(255, 255, 255, 0.5)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                                background: 'rgba(255, 255, 255, 0.95)',
                              },
                            }
                          }
                          onClick={() => navigate('/wellness-program')}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" fontWeight={700} color="#2d5016" mb={1}>
                                  {program.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {program.description?.substring(0, 100)}...
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaLeaf color="#4caf50" />
                                </Box>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Progress
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={program.progress?.overall || 0} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4, 
                                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: '#4caf50',
                                      borderRadius: 4,
                                    }
                                  }} 
                                />
                                <Typography variant="caption" color="#4caf50" fontWeight={600}>
                                  {program.progress?.overall || 0}%
                                </Typography>
                              </Box>
                              <Button 
                                variant="contained" 
                                size="small"
                                sx={{ 
                                  bgcolor: '#4caf50',
                                  '&:hover': { bgcolor: '#43a047' },
                                  borderRadius: '20px',
                                  px: 2,
                                  py: 1,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                }}
                              >
                                Continue
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaLeaf color="#4caf50" size={32} />
                          </Box>
                        </Box>
                        <Typography variant="h6" color="#2d5016" mb={2}>
                          No Active Wellness Programs
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                          {unassignedPrograms.length > 0 
                            ? 'You have unassigned programs available. Contact your coach to get started!'
                            : 'Your wellness coach hasn\'t assigned any programs yet. Please check back later.'
                          }
                        </Typography>
                        {unassignedPrograms.length > 0 && (
                          <Button 
                            variant="contained" 
                            onClick={() => navigate('/wellness-coaches')}
                            sx={{ 
                              bgcolor: '#4caf50',
                              '&:hover': { bgcolor: '#43a047' },
                              borderRadius: '24px',
                              px: 4,
                              py: 1.5,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Contact Your Coach
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          )}
          
          {/* Unassigned Wellness Programs Section for Users */}
          {user.role === 'user' && unassignedPrograms && unassignedPrograms.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} color="#3a4d2d" mb={3}>
                  <FaUserMd style={{ marginRight: 8 }} />
                  Available Wellness Programs
                </Typography>
                <Grid container spacing={3}>
                  {unassignedPrograms.map((program) => (
                    <Grid item xs={12} md={6} lg={4} key={program._id || 'unassigned-default-key'}>
                      <Card
                        sx={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '24px',
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                            background: 'rgba(255, 255, 255, 0.95)',
                          },
                        }}
                        onClick={() => navigate('/wellness-coaches')}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" fontWeight={700} color="#2d5016" mb={1}>
                                {program.name || program.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {program.description?.substring(0, 100)}...
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaLeaf color="#4caf50" />
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Status: {program.status || 'Published'}
                              </Typography>
                              <Typography variant="caption" color="#f57c00" fontWeight={600}>
                                Unassigned
                              </Typography>
                            </Box>
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/wellness-coaches');
                              }}
                              sx={{ 
                                bgcolor: '#f57c00',
                                '&:hover': { bgcolor: '#ef6c00' },
                                borderRadius: '20px',
                                px: 2,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Contact Coach
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          )}
          
          {user.role === 'admin' && (
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    transition: 'all 0.3s',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onClick={() => navigate('/admin-dashboard')}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #059669, #0d9488)',
                    borderRadius: '16px',
                    display: 'inline-block',
                    mb: 2
                  }}>
                    <FaUserShield size={32} color="white" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} mt={2} sx={{ fontFamily: 'Playfair Display' }}>
                    Admin Panel
                  </Typography>
                  <Typography color="text.secondary">
                    Manage users, content, and analytics.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {user.role === 'wellness_coach' && (
            <>
              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      transition: 'all 0.3s',
                      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                  onClick={() => navigate('/yoga-videos')}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #2d5016, #3a4d2d)',
                      borderRadius: '16px',
                      display: 'inline-block',
                      mb: 2
                    }}>
                      <FaUserMd size={32} color="white" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} mt={2} sx={{ fontFamily: 'Playfair Display' }}>
                      Yoga Videos
                    </Typography>
                    <Typography color="text.secondary">
                      Watch yoga tutorials and practices.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      transition: 'all 0.3s',
                      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                  onClick={() => navigate('/exercise-videos')}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #a67c52, #c8a075)',
                      borderRadius: '16px',
                      display: 'inline-block',
                      mb: 2
                    }}>
                      <FaUserMd size={32} color="white" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} mt={2} sx={{ fontFamily: 'Playfair Display' }}>
                      Exercise Videos
                    </Typography>
                    <Typography color="text.secondary">
                      Watch exercise tutorials (non-gym).
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      transition: 'all 0.3s',
                      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                  onClick={() => navigate('/health-tips')}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                      borderRadius: '16px',
                      display: 'inline-block',
                      mb: 2
                    }}>
                      <FaLeaf size={32} color="white" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} mt={2} sx={{ fontFamily: 'Playfair Display' }}>
                      Health Tips
                    </Typography>
                    <Typography color="text.secondary">
                      Read health and wellness tips.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
        {user.role === 'admin' && (
          <Box sx={{ mt: 4 }}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'all 0.3s',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  borderRadius: '16px',
                  display: 'inline-block',
                  mb: 2
                }}>
                  <FaChartBar size={32} color="white" />
                </Box>
                <Typography variant="h6" fontWeight={700} mt={2} sx={{ fontFamily: 'Playfair Display' }}>
                  Analytics
                </Typography>
                <Typography color="text.secondary">
                  View sales, user activity, and more.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
        
        {/* My Appointments Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight={700} color="#3a4d2d" mb={3}>
            <FaCalendarAlt style={{ marginRight: 8 }} />
            My Appointments
          </Typography>
          
          {appointmentsLoading ? (
            <Typography>Loading appointments...</Typography>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <FaUserMd size={48} color="#ccc" />
                <Typography variant="h6" color="text.secondary" mt={2}>
                  No appointments booked yet
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  Book your first appointment with our expert doctors
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/hospital-discovery')}
                  sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
                >
                  Find Doctors
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {appointments.map((appointment, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600} color="#2d5016">
                          Dr. {appointment.doctor.name}
                        </Typography>
                        <Chip 
                          label={appointment.status || 'Pending'} 
                          size="small"
                          color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>Specialty:</strong> {appointment.doctor.specialty}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>Hospital:</strong> {appointment.hospital.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>Time:</strong> {appointment.appointmentTime}
                      </Typography>
                      
                      {appointment.reason && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          <strong>Reason:</strong> {appointment.reason}
                        </Typography>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Booked on: {new Date(appointment.createdAt).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          label="Demo Booking" 
                          size="small" 
                          variant="outlined"
                          sx={{ color: '#ff9800', borderColor: '#ff9800' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard; 