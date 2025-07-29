import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Avatar, 
  Chip, 
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Container
} from "@mui/material";
import { 
  FaShoppingCart, 
  FaSeedling, 
  FaHospital, 
  FaCalendarAlt, 
  FaUserMd,
  FaHeart,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaStethoscope
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u || {});
    fetchAppointments();
    
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #2d5016 0%, #3a4d2d 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar 
            src={user.profilePic} 
            sx={{ 
              width: 100, 
              height: 100, 
              border: '4px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <FaUser size={40} />
          </Avatar>
          
          <Box sx={{ flex: 1, color: 'white' }}>
            <Typography variant="h4" fontWeight={700} mb={1}>
              {user.name || 'User Profile'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Welcome to your HerbTrade Profile
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaEnvelope />
                <Typography>{user.email}</Typography>
              </Box>
              {user.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaPhone />
                  <Typography>{user.phone}</Typography>
                </Box>
              )}
              <Chip 
                label={user.role || 'User'} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => navigate('/edit-profile')}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              borderRadius: 2,
              px: 3
            }}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>



      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={700} color="#2d5016" mb={3}>
            <FaSeedling style={{ marginRight: 8 }} />
            Quick Actions
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 25px rgba(45,80,22,0.15)' 
                  },
                  borderRadius: 3
                }} 
                onClick={() => navigate('/herbs')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaSeedling size={40} color="#2d5016" />
                  <Typography variant="h6" fontWeight={600} mt={2} color="#2d5016">
                    Browse Herbs
                  </Typography>
                  <Typography color="text.secondary" mt={1}>
                    Explore our premium herb collection
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 25px rgba(45,80,22,0.15)' 
                  },
                  borderRadius: 3
                }} 
                onClick={() => navigate('/cart')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaShoppingCart size={40} color="#2d5016" />
                  <Typography variant="h6" fontWeight={600} mt={2} color="#2d5016">
                    My Cart
                  </Typography>
                  <Typography color="text.secondary" mt={1}>
                    View and manage cart items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 25px rgba(233,30,99,0.15)' 
                  },
                  borderRadius: 3
                }} 
                onClick={() => navigate('/wishlist')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaHeart size={40} color="#e91e63" />
                  <Typography variant="h6" fontWeight={600} mt={2} color="#e91e63">
                    My Wishlist
                  </Typography>
                  <Typography color="text.secondary" mt={1}>
                    View saved favorite items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 25px rgba(45,80,22,0.15)' 
                  },
                  borderRadius: 3
                }} 
                onClick={() => navigate('/hospitals')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaHospital size={40} color="#2d5016" />
                  <Typography variant="h6" fontWeight={600} mt={2} color="#2d5016">
                    Find Hospitals
                  </Typography>
                  <Typography color="text.secondary" mt={1}>
                    Book appointments with doctors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* My Appointments Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} color="#2d5016">
                <FaCalendarAlt style={{ marginRight: 8 }} />
                My Appointments
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/hospitals')}
                sx={{ 
                  color: '#2d5016', 
                  borderColor: '#2d5016',
                  '&:hover': { bgcolor: '#2d5016', color: 'white' }
                }}
              >
                Book New Appointment
              </Button>
            </Box>
            
            {appointmentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : appointments.length === 0 ? (
              <Card sx={{ bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <FaUserMd size={60} color="#ccc" />
                  <Typography variant="h6" color="text.secondary" mt={2} mb={1}>
                    No appointments booked yet
                  </Typography>
                  <Typography color="text.secondary" mb={3}>
                    Book your first appointment with our expert doctors
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/hospitals')}
                    sx={{ 
                      bgcolor: '#2d5016', 
                      '&:hover': { bgcolor: '#3a4d2d' },
                      borderRadius: 2,
                      px: 4
                    }}
                  >
                    Find Doctors
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {appointments.map((appointment, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card 
                      sx={{ 
                        border: '1px solid #e0e0e0',
                        borderRadius: 3,
                        transition: 'all 0.3s',
                        '&:hover': { 
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaStethoscope color="#2d5016" />
                            <Typography variant="h6" fontWeight={600} color="#2d5016">
                              Dr. {appointment.doctor.name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={appointment.status || 'Pending'} 
                            size="small"
                            color={getStatusColor(appointment.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        
                        <List dense sx={{ py: 0 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <FaUserMd size={16} color="#666" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={appointment.doctor.specialty}
                              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                          </ListItem>
                          
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <FaHospital size={16} color="#666" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={appointment.hospital.name}
                              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                          </ListItem>
                          
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <FaCalendarAlt size={16} color="#666" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={formatDate(appointment.appointmentDate)}
                              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                          </ListItem>
                          
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <FaClock size={16} color="#666" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={appointment.appointmentTime}
                              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                          </ListItem>
                          
                          {appointment.reason && (
                            <ListItem sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <FaUser size={16} color="#666" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={appointment.reason}
                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                              />
                            </ListItem>
                          )}
                        </List>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              color: '#2d5016', 
                              borderColor: '#2d5016',
                              '&:hover': { bgcolor: '#2d5016', color: 'white' }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;