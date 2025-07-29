import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, 
  Button, TextField, Paper, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Stepper,
  Step, StepLabel, FormControl, InputLabel, Select, MenuItem,
  Chip, Divider
} from '@mui/material';
import { 
  FaHospital, FaUserMd, FaCalendarAlt, FaCreditCard,
  FaCheckCircle, FaArrowRight, FaArrowLeft, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const steps = ['Patient Details', 'Appointment Details', 'Medical Information', 'Payment'];

function HospitalBooking() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [bookingData, setBookingData] = useState({
    patientDetails: {
      name: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      address: ''
    },
    appointmentDetails: {
      doctorName: '',
      department: '',
      appointmentDate: '',
      appointmentTime: '',
      consultationType: 'In-Person'
    },
    medicalInfo: {
      symptoms: '',
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    },
    paymentDetails: {
      consultationFee: 500,
      paymentMethod: 'Cash'
    }
  });
  
  const navigate = useNavigate();
  const { hospitalId } = useParams();

  useEffect(() => {
    if (hospitalId) {
      fetchHospitalDetails();
    }
  }, [hospitalId]);

  const fetchHospitalDetails = async () => {
    try {
      // For demo purposes, we'll use sample data
      const sampleHospital = {
        _id: hospitalId,
        name: 'Ayurvedic Wellness Center',
        address: '123 Health Street, Wellness City',
        phone: '+91 98765 43210',
        email: 'info@ayurvedicwellness.com',
        departments: ['General Medicine', 'Panchakarma', 'Dermatology', 'Orthopedics'],
        doctors: [
          'Dr. Rajesh Kumar - General Medicine',
          'Dr. Priya Sharma - Panchakarma',
          'Dr. Amit Patel - Dermatology',
          'Dr. Sunita Rao - Orthopedics'
        ]
      };
      setHospital(sampleHospital);
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast.error('Failed to load hospital details');
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Patient Details
        const { name, age, gender, phone, email, address } = bookingData.patientDetails;
        if (!name || !age || !gender || !phone || !email || !address) {
          toast.error('Please fill all patient details');
          return false;
        }
        if (age < 1 || age > 120) {
          toast.error('Please enter a valid age');
          return false;
        }
        return true;
        
      case 1: // Appointment Details
        const { doctorName, department, appointmentDate, appointmentTime } = bookingData.appointmentDetails;
        if (!doctorName || !department || !appointmentDate || !appointmentTime) {
          toast.error('Please fill all appointment details');
          return false;
        }
        return true;
        
      case 2: // Medical Information
        const { symptoms } = bookingData.medicalInfo;
        if (!symptoms) {
          toast.error('Please describe your symptoms');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleInputChange = (section, field, value) => {
    setBookingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, nestedSection, field, value) => {
    setBookingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to proceed');
        navigate('/login');
        return;
      }

      const bookingPayload = {
        hospitalId: hospitalId,
        ...bookingData
      };

      const response = await fetch('http://localhost:5000/api/hospital-bookings/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('🎉 Booking confirmed successfully!');
        
        // Redirect to bookings page
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      // Demo success for now
      toast.success('🎉 Demo booking confirmed! This is a demonstration.');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={bookingData.patientDetails.name}
                onChange={(e) => handleInputChange('patientDetails', 'name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={bookingData.patientDetails.age}
                onChange={(e) => handleInputChange('patientDetails', 'age', e.target.value)}
                required
                inputProps={{ min: 1, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={bookingData.patientDetails.gender}
                  onChange={(e) => handleInputChange('patientDetails', 'gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={bookingData.patientDetails.phone}
                onChange={(e) => handleInputChange('patientDetails', 'phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={bookingData.patientDetails.email}
                onChange={(e) => handleInputChange('patientDetails', 'email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={bookingData.patientDetails.address}
                onChange={(e) => handleInputChange('patientDetails', 'address', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={bookingData.appointmentDetails.department}
                  onChange={(e) => handleInputChange('appointmentDetails', 'department', e.target.value)}
                  label="Department"
                >
                  {hospital?.departments?.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={bookingData.appointmentDetails.doctorName}
                  onChange={(e) => handleInputChange('appointmentDetails', 'doctorName', e.target.value)}
                  label="Doctor"
                >
                  {hospital?.doctors?.map((doctor) => (
                    <MenuItem key={doctor} value={doctor}>{doctor}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Appointment Date"
                type="date"
                value={bookingData.appointmentDetails.appointmentDate}
                onChange={(e) => handleInputChange('appointmentDetails', 'appointmentDate', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Appointment Time"
                type="time"
                value={bookingData.appointmentDetails.appointmentTime}
                onChange={(e) => handleInputChange('appointmentDetails', 'appointmentTime', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Consultation Type</InputLabel>
                <Select
                  value={bookingData.appointmentDetails.consultationType}
                  onChange={(e) => handleInputChange('appointmentDetails', 'consultationType', e.target.value)}
                  label="Consultation Type"
                >
                  <MenuItem value="In-Person">In-Person</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Symptoms"
                multiline
                rows={4}
                value={bookingData.medicalInfo.symptoms}
                onChange={(e) => handleInputChange('medicalInfo', 'symptoms', e.target.value)}
                required
                placeholder="Please describe your current symptoms in detail..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical History"
                multiline
                rows={3}
                value={bookingData.medicalInfo.medicalHistory}
                onChange={(e) => handleInputChange('medicalInfo', 'medicalHistory', e.target.value)}
                placeholder="Any previous medical conditions, surgeries, or treatments..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Medications"
                multiline
                rows={2}
                value={bookingData.medicalInfo.currentMedications}
                onChange={(e) => handleInputChange('medicalInfo', 'currentMedications', e.target.value)}
                placeholder="List any medications you are currently taking..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                value={bookingData.medicalInfo.allergies}
                onChange={(e) => handleInputChange('medicalInfo', 'allergies', e.target.value)}
                placeholder="Any known allergies to medications, foods, etc..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" mb={2}>Emergency Contact</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={bookingData.medicalInfo.emergencyContact.name}
                onChange={(e) => handleNestedInputChange('medicalInfo', 'emergencyContact', 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={bookingData.medicalInfo.emergencyContact.phone}
                onChange={(e) => handleNestedInputChange('medicalInfo', 'emergencyContact', 'phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relation"
                value={bookingData.medicalInfo.emergencyContact.relation}
                onChange={(e) => handleNestedInputChange('medicalInfo', 'emergencyContact', 'relation', e.target.value)}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Demo Payment System:</strong> This is a demonstration. No real money will be charged.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Booking Summary</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Hospital</Typography>
                  <Typography variant="body1" fontWeight={600}>{hospital?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Doctor</Typography>
                  <Typography variant="body1">{bookingData.appointmentDetails.doctorName}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{bookingData.appointmentDetails.department}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1">
                    {bookingData.appointmentDetails.appointmentDate} at {bookingData.appointmentDetails.appointmentTime}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Consultation Type</Typography>
                  <Chip 
                    label={bookingData.appointmentDetails.consultationType} 
                    size="small" 
                    color="primary" 
                  />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Payment Details</Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Consultation Fee</Typography>
                    <Typography>₹{bookingData.paymentDetails.consultationFee}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Platform Fee</Typography>
                    <Typography>₹0</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={600}>Total</Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      ₹{bookingData.paymentDetails.consultationFee}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body1" mb={2}>Payment Method:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant={bookingData.paymentDetails.paymentMethod === 'Cash' ? 'contained' : 'outlined'}
                    onClick={() => handleInputChange('paymentDetails', 'paymentMethod', 'Cash')}
                    size="small"
                  >
                    Cash
                  </Button>
                  <Button
                    variant={bookingData.paymentDetails.paymentMethod === 'Card' ? 'contained' : 'outlined'}
                    onClick={() => handleInputChange('paymentDetails', 'paymentMethod', 'Card')}
                    size="small"
                  >
                    Card
                  </Button>
                  <Button
                    variant={bookingData.paymentDetails.paymentMethod === 'UPI' ? 'contained' : 'outlined'}
                    onClick={() => handleInputChange('paymentDetails', 'paymentMethod', 'UPI')}
                    size="small"
                  >
                    UPI
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} color="#2d5016" gutterBottom>
          <FaHospital style={{ marginRight: 16, color: '#2d5016' }} />
          Book Hospital Appointment
        </Typography>
        {hospital && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight={600} color="#2d5016" mb={1}>
                  {hospital.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <FaMapMarkerAlt color="#666" />
                  <Typography color="text.secondary">{hospital.address}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <FaPhone color="#666" />
                  <Typography color="text.secondary">{hospital.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FaEnvelope color="#666" />
                  <Typography color="text.secondary">{hospital.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="h6" color="primary" mb={1}>
                    Consultation Fee
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#2d5016">
                    ₹{bookingData.paymentDetails.consultationFee}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          {steps[activeStep]}
        </Typography>
        {renderStepContent(activeStep)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<FaArrowLeft />}
          sx={{ color: '#2d5016' }}
        >
          Back
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaCheckCircle />}
            sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<FaArrowRight />}
            sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default HospitalBooking;