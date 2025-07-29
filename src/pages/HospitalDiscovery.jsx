import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Rating, List, ListItem, ListItemText, Divider, Tab, Tabs,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import { 
  FaMapMarkerAlt, FaUserMd, FaPhone, FaEnvelope, FaGlobe, 
  FaClock, FaStar, FaDirections, FaSearch, FaTimes, FaHospital,
  FaStethoscope, FaLeaf, FaFilter
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function HospitalDiscovery() {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDialog, setHospitalDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [aiInsights, setAiInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [appointmentDialog, setAppointmentDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    reason: '',
    patientName: '',
    patientPhone: '',
    patientEmail: ''
  });

  useEffect(() => {
    fetchHospitals();
    fetchSpecialties();
    getUserLocation();
    

  }, []);

  useEffect(() => {
    filterHospitals();
  }, [hospitals, searchQuery, selectedSpecialty, selectedCity, pincode]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/hospitals');
      setHospitals(response.data);
      
      // Extract unique cities
      const uniqueCities = [...new Set(response.data.map(h => h.city))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/hospitals/specialties/list');
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const filterHospitals = () => {
    let filtered = hospitals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.specialties.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        hospital.doctors.some(doc => 
          doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialty (focus on Ayurvedic)
    if (selectedSpecialty) {
      filtered = filtered.filter(hospital =>
        hospital.specialties.includes(selectedSpecialty)
      );
    } else {
      // Default to showing Ayurvedic hospitals first
      filtered = filtered.sort((a, b) => {
        const aIsAyurvedic = a.specialties.some(spec => 
          spec.toLowerCase().includes('ayurvedic') || 
          spec.toLowerCase().includes('ayurveda') ||
          spec.toLowerCase().includes('herbal')
        );
        const bIsAyurvedic = b.specialties.some(spec => 
          spec.toLowerCase().includes('ayurvedic') || 
          spec.toLowerCase().includes('ayurveda') ||
          spec.toLowerCase().includes('herbal')
        );
        return bIsAyurvedic - aIsAyurvedic;
      });
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(hospital =>
        hospital.city === selectedCity
      );
    }

    // Filter by pincode
    if (pincode) {
      filtered = filtered.filter(hospital =>
        hospital.pincode && hospital.pincode.toString().includes(pincode)
      );
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        const distanceA = calculateDistance(userLocation, a.location);
        const distanceB = calculateDistance(userLocation, b.location);
        return distanceA - distanceB;
      });
    }

    setFilteredHospitals(filtered);
  };

  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 0;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateAIInsights = async (hospital) => {
    setLoadingInsights(true);
    try {
      // Simulate AI-generated insights about the hospital
      const insights = `
🏥 **${hospital.name} - AI Analysis**

**Specialization Focus**: This hospital specializes in ${hospital.specialties.join(', ')}, making it an excellent choice for patients seeking ${hospital.specialties[0]} treatments.

**Location Advantage**: Located in ${hospital.city}, ${hospital.state}, this facility serves the local community with easy accessibility.

**Medical Team**: With ${hospital.doctors.length} specialized doctors, the hospital maintains a good doctor-to-patient ratio for quality care.

**Facilities & Services**: 
${hospital.facilities.map(facility => `• ${facility}`).join('\n')}

**Rating Analysis**: With a ${hospital.rating}/5 rating, this hospital demonstrates ${hospital.rating >= 4.5 ? 'exceptional' : hospital.rating >= 4 ? 'very good' : 'good'} patient satisfaction.

**Best For**: Patients seeking ${hospital.specialties[0]} treatments, especially those requiring ${hospital.facilities.includes('Emergency Care') ? 'emergency services' : 'specialized consultations'}.

**Recommendation**: ${hospital.rating >= 4.5 ? 'Highly recommended' : hospital.rating >= 4 ? 'Recommended' : 'Consider for specific needs'} based on specialization match and patient reviews.
      `;
      
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setAiInsights('Unable to generate AI insights at this time.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const openHospitalDialog = (hospital) => {
    setSelectedHospital(hospital);
    setHospitalDialog(true);
    setTabValue(0);
    generateAIInsights(hospital);
  };

  const closeHospitalDialog = () => {
    setHospitalDialog(false);
    setSelectedHospital(null);
    setAiInsights("");
  };

  const getDirections = (hospital) => {
    const destination = `${hospital.address}, ${hospital.city}, ${hospital.state}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const callHospital = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openAppointmentDialog = (doctor, hospital) => {
    setSelectedDoctor({ ...doctor, hospital });
    setAppointmentDialog(true);
    setAppointmentData({
      date: '',
      time: '',
      reason: '',
      patientName: '',
      patientPhone: '',
      patientEmail: ''
    });
  };

  const closeAppointmentDialog = () => {
    setAppointmentDialog(false);
    setSelectedDoctor(null);
  };

  const handleAppointmentSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        toast.error('Please login to book appointments');
        navigate('/login');
        return;
      }

      if (!appointmentData.date || !appointmentData.time || !appointmentData.patientName || !appointmentData.patientPhone) {
        toast.error('Please fill all required fields');
        return;
      }

      const appointmentPayload = {
        doctorId: selectedDoctor._id,
        hospitalId: selectedDoctor.hospital._id,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason,
        patientName: appointmentData.patientName,
        patientPhone: appointmentData.patientPhone,
        patientEmail: appointmentData.patientEmail
      };

      const response = await axios.post('http://localhost:5000/api/hospitals/appointments', appointmentPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Appointment request submitted! Note: This is a demo system - no real booking is made.');
      
      // Trigger a custom event to refresh appointments in dashboard
      window.dispatchEvent(new CustomEvent('appointmentBooked'));
      
      closeAppointmentDialog();
    } catch (error) {
      console.error('Error booking appointment:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  const getAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return 'Hours not available';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => ({
      day: dayNames[index],
      hours: workingHours[day] || 'Closed'
    }));
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f6f0", p: 3 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" fontFamily="serif">
          Hospital Discovery 🏥
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/profile')}
          sx={{ 
            color: '#3a4d2d', 
            borderColor: '#3a4d2d',
            '&:hover': { bgcolor: '#3a4d2d', color: 'white' }
          }}
        >
          View My Appointments
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#3a4d2d', fontWeight: 600 }}>
          🔍 Find Ayurvedic Hospitals Near You
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search hospitals, doctors, or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <FaSearch style={{ marginRight: 8, color: '#3a4d2d' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#3a4d2d' },
                  '&.Mui-focused fieldset': { borderColor: '#3a4d2d' }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              InputProps={{
                startAdornment: <FaMapMarkerAlt style={{ marginRight: 8, color: '#3a4d2d' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#3a4d2d' },
                  '&.Mui-focused fieldset': { borderColor: '#3a4d2d' }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <MenuItem value="">All Specialties</MenuItem>
                <MenuItem value="Ayurvedic Medicine">🌿 Ayurvedic Medicine</MenuItem>
                <MenuItem value="Herbal Medicine">🌱 Herbal Medicine</MenuItem>
                <MenuItem value="Panchakarma">🧘 Panchakarma</MenuItem>
                {specialties.map(specialty => (
                  <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>City</InputLabel>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <MenuItem value="">All Cities</MenuItem>
                {cities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FaFilter />}
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("");
                setSelectedCity("");
              }}
              sx={{ 
                color: '#3a4d2d', 
                borderColor: '#3a4d2d',
                '&:hover': { bgcolor: '#3a4d2d', color: 'white' }
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="#3a4d2d">
          Found {filteredHospitals.length} hospitals
        </Typography>
        {userLocation && (
          <Chip 
            icon={<FaMapMarkerAlt />} 
            label="Location enabled" 
            color="success" 
            variant="outlined" 
          />
        )}
      </Box>

      {/* Hospitals Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#3a4d2d' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredHospitals.map(hospital => (
            <Grid item xs={12} md={6} lg={4} key={hospital._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: "white", 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Hospital Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <FaHospital size={24} color="#3a4d2d" style={{ marginRight: 8, marginTop: 4 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#3a4d2d' }}>
                        {hospital.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={hospital.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({hospital.rating}/5)
                        </Typography>
                        {hospital.isVerified && (
                          <Chip label="Verified" size="small" color="success" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FaMapMarkerAlt color="#666" style={{ marginRight: 8 }} />
                    <Typography variant="body2" color="text.secondary">
                      {hospital.address}, {hospital.city}
                    </Typography>
                  </Box>

                  {/* Specialties */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Specialties:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {hospital.specialties.slice(0, 3).map(specialty => (
                        <Chip 
                          key={specialty} 
                          label={specialty} 
                          size="small" 
                          variant="outlined"
                          icon={<FaLeaf />}
                        />
                      ))}
                      {hospital.specialties.length > 3 && (
                        <Chip 
                          label={`+${hospital.specialties.length - 3} more`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Doctors */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Doctors:
                    </Typography>
                    {hospital.doctors.slice(0, 2).map(doctor => (
                      <Box key={doctor.name} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <FaUserMd color="#3a4d2d" style={{ marginRight: 8 }} />
                        <Typography variant="body2">
                          {doctor.name} - {doctor.specialty}
                        </Typography>
                      </Box>
                    ))}
                    {hospital.doctors.length > 2 && (
                      <Typography variant="body2" color="text.secondary">
                        +{hospital.doctors.length - 2} more doctors
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => openHospitalDialog(hospital)}
                      sx={{ 
                        bgcolor: '#3a4d2d',
                        '&:hover': { bgcolor: '#2d3d22' }
                      }}
                    >
                      View Details
                    </Button>
                    
                    {hospital.doctors && hospital.doctors.length > 0 && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<FaStethoscope />}
                        onClick={() => openAppointmentDialog(hospital.doctors[0], hospital)}
                        sx={{ 
                          bgcolor: '#2e7d32',
                          '&:hover': { bgcolor: '#1b5e20' }
                        }}
                      >
                        Book Appointment
                      </Button>
                    )}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FaDirections />}
                      onClick={() => getDirections(hospital)}
                      sx={{ 
                        color: '#3a4d2d', 
                        borderColor: '#3a4d2d',
                        '&:hover': { bgcolor: '#3a4d2d', color: 'white' }
                      }}
                    >
                      Directions
                    </Button>
                    
                    {hospital.phone && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FaPhone />}
                        onClick={() => callHospital(hospital.phone)}
                        sx={{ 
                          color: '#2e7d32', 
                          borderColor: '#2e7d32',
                          '&:hover': { bgcolor: '#2e7d32', color: 'white' }
                        }}
                      >
                        Call
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Hospital Details Dialog */}
      <Dialog 
        open={hospitalDialog} 
        onClose={closeHospitalDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' }
        }}
      >
        {selectedHospital && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: '#3a4d2d',
              color: 'white'
            }}>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {selectedHospital.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={selectedHospital.rating} readOnly size="small" />
                  <Typography sx={{ ml: 1 }}>
                    ({selectedHospital.rating}/5)
                  </Typography>
                  {selectedHospital.isVerified && (
                    <Chip label="Verified" size="small" sx={{ ml: 1, bgcolor: 'white', color: '#3a4d2d' }} />
                  )}
                </Box>
              </Box>
              <IconButton onClick={closeHospitalDialog} sx={{ color: 'white' }}>
                <FaTimes />
              </IconButton>
            </DialogTitle>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ px: 3 }}
              >
                <Tab label="Overview" />
                <Tab label="Doctors" />
                <Tab label="Facilities" />
                <Tab label="AI Insights" />
              </Tabs>
            </Box>

            <DialogContent sx={{ p: 0 }}>
              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#3a4d2d' }}>
                      Contact Information
                    </Typography>
                    
                    <List>
                      <ListItem>
                        <FaMapMarkerAlt style={{ marginRight: 12, color: '#3a4d2d' }} />
                        <ListItemText 
                          primary="Address"
                          secondary={`${selectedHospital.address}, ${selectedHospital.city}, ${selectedHospital.state} ${selectedHospital.zipCode}`}
                        />
                      </ListItem>
                      
                      {selectedHospital.phone && (
                        <ListItem>
                          <FaPhone style={{ marginRight: 12, color: '#3a4d2d' }} />
                          <ListItemText 
                            primary="Phone"
                            secondary={selectedHospital.phone}
                          />
                        </ListItem>
                      )}
                      
                      {selectedHospital.email && (
                        <ListItem>
                          <FaEnvelope style={{ marginRight: 12, color: '#3a4d2d' }} />
                          <ListItemText 
                            primary="Email"
                            secondary={selectedHospital.email}
                          />
                        </ListItem>
                      )}
                      
                      {selectedHospital.website && (
                        <ListItem>
                          <FaGlobe style={{ marginRight: 12, color: '#3a4d2d' }} />
                          <ListItemText 
                            primary="Website"
                            secondary={selectedHospital.website}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#3a4d2d' }}>
                      Working Hours
                    </Typography>
                    
                    <List>
                      {formatWorkingHours(selectedHospital.workingHours).map(({ day, hours }) => (
                        <ListItem key={day} sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={day}
                            secondary={hours}
                            sx={{ 
                              '& .MuiListItemText-primary': { fontWeight: 600 },
                              '& .MuiListItemText-secondary': { 
                                color: hours === 'Closed' ? 'error.main' : 'text.secondary' 
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, color: '#3a4d2d' }}>
                  Specialties
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedHospital.specialties.map(specialty => (
                    <Chip 
                      key={specialty} 
                      label={specialty} 
                      color="primary" 
                      variant="outlined"
                      icon={<FaStethoscope />}
                    />
                  ))}
                </Box>
              </TabPanel>

              {/* Doctors Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ mb: 3, color: '#3a4d2d' }}>
                  Medical Team ({selectedHospital.doctors.length} doctors)
                </Typography>
                
                <Grid container spacing={2}>
                  {selectedHospital.doctors.map((doctor, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FaUserMd size={20} color="#3a4d2d" style={{ marginRight: 8 }} />
                          <Typography variant="h6" fontWeight={600}>
                            {doctor.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {doctor.specialty}
                        </Typography>
                        
                        {doctor.phone && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            📞 {doctor.phone}
                          </Typography>
                        )}
                        
                        {doctor.email && (
                          <Typography variant="body2">
                            ✉️ {doctor.email}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Facilities Tab */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ mb: 3, color: '#3a4d2d' }}>
                  Available Facilities
                </Typography>
                
                <Grid container spacing={2}>
                  {selectedHospital.facilities.map((facility, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ p: 2, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                        <FaHospital size={24} color="#3a4d2d" style={{ marginBottom: 8 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {facility}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* AI Insights Tab */}
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" sx={{ mb: 3, color: '#3a4d2d' }}>
                  AI-Powered Hospital Analysis
                </Typography>
                
                {loadingInsights ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#3a4d2d' }} />
                  </Box>
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-line',
                        lineHeight: 1.6
                      }}
                    >
                      {aiInsights}
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              <Button
                variant="outlined"
                startIcon={<FaDirections />}
                onClick={() => getDirections(selectedHospital)}
                sx={{ 
                  color: '#3a4d2d', 
                  borderColor: '#3a4d2d',
                  '&:hover': { bgcolor: '#3a4d2d', color: 'white' }
                }}
              >
                Get Directions
              </Button>
              
              {selectedHospital.phone && (
                <Button
                  variant="contained"
                  startIcon={<FaPhone />}
                  onClick={() => callHospital(selectedHospital.phone)}
                  sx={{ 
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' }
                  }}
                >
                  Call Hospital
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Appointment Booking Dialog */}
      <Dialog 
        open={appointmentDialog} 
        onClose={closeAppointmentDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#3a4d2d', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FaStethoscope style={{ marginRight: 8 }} />
            Book Appointment
          </Box>
          <IconButton onClick={closeAppointmentDialog} sx={{ color: 'white' }}>
            <FaTimes />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedDoctor && (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#3a4d2d' }}>
                  Dr. {selectedDoctor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedDoctor.specialty} • {selectedDoctor.hospital?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Experience: {selectedDoctor.experience} years
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Patient Name *"
                    value={appointmentData.patientName}
                    onChange={(e) => setAppointmentData({...appointmentData, patientName: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={appointmentData.patientPhone}
                    onChange={(e) => setAppointmentData({...appointmentData, patientPhone: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={appointmentData.patientEmail}
                    onChange={(e) => setAppointmentData({...appointmentData, patientEmail: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Date *"
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Preferred Time *</InputLabel>
                    <Select
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                    >
                      {getAvailableTimeSlots().map(time => (
                        <MenuItem key={time} value={time}>{time}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Visit"
                    multiline
                    rows={3}
                    value={appointmentData.reason}
                    onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                    placeholder="Please describe your symptoms or reason for consultation..."
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#856404' }}>
                  ⚠️ Demo System Notice:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 2 }}>
                  This is a demonstration system. No real appointment will be booked with the hospital. 
                  In a real implementation, the hospital would be notified automatically.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#2e7d32' }}>
                  📋 For Real Implementation:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  • Hospital would receive automatic notification<br/>
                  • Patient would get SMS/Email confirmation<br/>
                  • Integration with hospital management system<br/>
                  • Consultation fee: ₹{selectedDoctor.consultationFee || 500}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            variant="outlined"
            onClick={closeAppointmentDialog}
            sx={{ 
              color: '#666', 
              borderColor: '#666',
              '&:hover': { bgcolor: '#f0f0f0' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAppointmentSubmit}
            sx={{ 
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HospitalDiscovery;