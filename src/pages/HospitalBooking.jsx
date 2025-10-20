import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Button, TextField, Alert,
  CircularProgress, Stepper, Step, StepLabel, FormControl,
  InputLabel, Select, MenuItem, Chip, Divider
} from '@mui/material';
import {
  FaHospital, FaUserMd, FaCalendarAlt, FaCreditCard,
  FaCheckCircle, FaArrowRight, FaArrowLeft, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaDirections,
  FaMap, FaPhoneAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const steps = ['Patient Details', 'Appointment Details', 'Medical Information', 'Payment'];

function HospitalBooking() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [showMap, setShowMap] = useState(false);
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
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    patientDetails: {},
    appointmentDetails: {},
    medicalInfo: {},
    emergencyContact: {}
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
      console.log(`Fetching hospital details for ID: ${hospitalId}`);

      // Try to fetch from API first
      const response = await fetch(`http://localhost:5000/api/hospitals/${hospitalId}`);
      console.log('Hospital fetch response status:', response.status);

      if (response.ok) {
        const hospitalData = await response.json();
        console.log('Hospital data received:', hospitalData);

        // Add departments if not present - derive from doctor specialties or use default
        if (!hospitalData.departments) {
          const doctorSpecialties = hospitalData.doctors?.map(doc => doc.specialty) || [];
          const uniqueSpecialties = [...new Set(doctorSpecialties)];
          hospitalData.departments = uniqueSpecialties.length > 0
            ? uniqueSpecialties
            : ['General Medicine', 'Ayurvedic Medicine', 'Consultation'];
        }

        setHospital(hospitalData);
        toast.success(`Hospital details loaded: ${hospitalData.name}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Hospital not found:', errorData);
        throw new Error(errorData.error || 'Hospital not found');
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);

      // Show more detailed error message
      if (error.message.includes('Hospital not found')) {
        toast.error(`Hospital with ID ${hospitalId} not found. This might mean:
        1. The hospital ID is invalid
        2. The hospital was deleted
        3. The database needs to be seeded with sample hospitals`);
      } else {
        toast.error(`Failed to load hospital details: ${error.message}`);
      }

      // Redirect after showing error
      setTimeout(() => {
        navigate('/hospital-discovery');
      }, 3000);
    }
  };

  // Validation functions
  const validatePatientName = (name) => {
    if (!name.trim()) return "Patient name is required";
    if (name.trim().length < 2) return "Patient name must be at least 2 characters";
    if (name.trim().length > 50) return "Patient name must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Patient name can only contain letters and spaces";
    return "";
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum)) return "Please enter a valid age";
    if (ageNum < 1 || ageNum > 120) return "Please enter a valid age between 1 and 120";
    return "";
  };

  const validateGender = (gender) => {
    if (!gender) return "Gender is required";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return "Phone number is required";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit Indian phone number";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email address is too long";
    return "";
  };

  const validateAddress = (address) => {
    if (!address.trim()) return "Address is required";
    if (address.trim().length < 10) return "Address must be at least 10 characters";
    if (address.trim().length > 200) return "Address must be less than 200 characters";
    return "";
  };

  const validateDepartment = (department) => {
    if (!department) return "Department is required";
    return "";
  };

  const validateDoctor = (doctor) => {
    if (!doctor) return "Doctor is required";
    return "";
  };

  const validateAppointmentDate = (date) => {
    if (!date) return "Appointment date is required";
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return "Appointment date cannot be in the past";
    return "";
  };

  const validateAppointmentTime = (time) => {
    if (!time) return "Appointment time is required";
    return "";
  };

  const validateSymptoms = (symptoms) => {
    if (!symptoms.trim()) return "Symptoms description is required";
    if (symptoms.trim().length < 10) return "Symptoms description must be at least 10 characters";
    return "";
  };

  const validateEmergencyContactName = (name) => {
    if (name && name.trim().length > 0) {
      if (name.trim().length < 2) return "Emergency contact name must be at least 2 characters";
      if (name.trim().length > 50) return "Emergency contact name must be less than 50 characters";
      if (!/^[a-zA-Z\s]+$/.test(name)) return "Emergency contact name can only contain letters and spaces";
    }
    return "";
  };

  const validateEmergencyContactPhone = (phone) => {
    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit Indian phone number";
    }
    return "";
  };

  const validateEmergencyContactRelation = (relation) => {
    if (relation && relation.trim().length > 0) {
      if (relation.trim().length < 2) return "Relation must be at least 2 characters";
      if (relation.trim().length > 30) return "Relation must be less than 30 characters";
    }
    return "";
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
    let isValid = true;
    let errors = {};

    switch (step) {
      case 0: // Patient Details
        errors.name = validatePatientName(bookingData.patientDetails.name);
        errors.age = validateAge(bookingData.patientDetails.age);
        errors.gender = validateGender(bookingData.patientDetails.gender);
        errors.phone = validatePhone(bookingData.patientDetails.phone);
        errors.email = validateEmail(bookingData.patientDetails.email);
        errors.address = validateAddress(bookingData.patientDetails.address);
        
        setValidationErrors(prev => ({
          ...prev,
          patientDetails: errors
        }));
        
        isValid = !Object.values(errors).some(error => error !== "");
        if (!isValid) {
          toast.error('Please fix the validation errors before proceeding.');
        }
        return isValid;
        
      case 1: // Appointment Details
        errors.department = validateDepartment(bookingData.appointmentDetails.department);
        errors.doctorName = validateDoctor(bookingData.appointmentDetails.doctorName);
        errors.appointmentDate = validateAppointmentDate(bookingData.appointmentDetails.appointmentDate);
        errors.appointmentTime = validateAppointmentTime(bookingData.appointmentDetails.appointmentTime);
        
        setValidationErrors(prev => ({
          ...prev,
          appointmentDetails: errors
        }));
        
        isValid = !Object.values(errors).some(error => error !== "");
        if (!isValid) {
          toast.error('Please fix the validation errors before proceeding.');
        }
        return isValid;
        
      case 2: // Medical Information
        errors.symptoms = validateSymptoms(bookingData.medicalInfo.symptoms);
        
        // Validate emergency contact if any field is filled
        const hasEmergencyContactData = 
          bookingData.medicalInfo.emergencyContact.name.trim() ||
          bookingData.medicalInfo.emergencyContact.phone.trim() ||
          bookingData.medicalInfo.emergencyContact.relation.trim();
          
        if (hasEmergencyContactData) {
          errors.emergencyContact = {
            name: validateEmergencyContactName(bookingData.medicalInfo.emergencyContact.name),
            phone: validateEmergencyContactPhone(bookingData.medicalInfo.emergencyContact.phone),
            relation: validateEmergencyContactRelation(bookingData.medicalInfo.emergencyContact.relation)
          };
          
          // If any emergency contact field has data, all are required
          if (bookingData.medicalInfo.emergencyContact.name.trim() || 
              bookingData.medicalInfo.emergencyContact.phone.trim() || 
              bookingData.medicalInfo.emergencyContact.relation.trim()) {
            if (!bookingData.medicalInfo.emergencyContact.name.trim()) {
              errors.emergencyContact.name = "Emergency contact name is required when providing emergency contact details";
            }
            if (!bookingData.medicalInfo.emergencyContact.phone.trim()) {
              errors.emergencyContact.phone = "Emergency contact phone is required when providing emergency contact details";
            }
            if (!bookingData.medicalInfo.emergencyContact.relation.trim()) {
              errors.emergencyContact.relation = "Relation is required when providing emergency contact details";
            }
          }
        }
        
        setValidationErrors(prev => ({
          ...prev,
          medicalInfo: { symptoms: errors.symptoms },
          emergencyContact: errors.emergencyContact || {}
        }));
        
        isValid = !errors.symptoms && 
                  (!errors.emergencyContact || !Object.values(errors.emergencyContact).some(error => error !== ""));
        if (!isValid) {
          toast.error('Please fix the validation errors before proceeding.');
        }
        return isValid;
        
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
    
    // Real-time validation for the field being changed
    let error = "";
    switch (section) {
      case 'patientDetails':
        switch (field) {
          case 'name':
            error = validatePatientName(value);
            break;
          case 'age':
            error = validateAge(value);
            break;
          case 'gender':
            error = validateGender(value);
            break;
          case 'phone':
            error = validatePhone(value);
            break;
          case 'email':
            error = validateEmail(value);
            break;
          case 'address':
            error = validateAddress(value);
            break;
          default:
            break;
        }
        setValidationErrors(prev => ({
          ...prev,
          patientDetails: {
            ...prev.patientDetails,
            [field]: error
          }
        }));
        break;
        
      case 'appointmentDetails':
        switch (field) {
          case 'department':
            error = validateDepartment(value);
            break;
          case 'doctorName':
            error = validateDoctor(value);
            break;
          case 'appointmentDate':
            error = validateAppointmentDate(value);
            break;
          case 'appointmentTime':
            error = validateAppointmentTime(value);
            break;
          default:
            break;
        }
        setValidationErrors(prev => ({
          ...prev,
          appointmentDetails: {
            ...prev.appointmentDetails,
            [field]: error
          }
        }));
        break;
        
      case 'medicalInfo':
        if (field === 'symptoms') {
          error = validateSymptoms(value);
          setValidationErrors(prev => ({
            ...prev,
            medicalInfo: {
              ...prev.medicalInfo,
              symptoms: error
            }
          }));
        }
        break;
        
      default:
        break;
    }
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
    
    // Real-time validation for emergency contact fields
    if (section === 'medicalInfo' && nestedSection === 'emergencyContact') {
      let error = "";
      switch (field) {
        case 'name':
          error = validateEmergencyContactName(value);
          break;
        case 'phone':
          error = validateEmergencyContactPhone(value);
          break;
        case 'relation':
          error = validateEmergencyContactRelation(value);
          break;
        default:
          break;
      }
      
      setValidationErrors(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: error
        }
      }));
    }
  };

  // Helper functions for call, directions, and map
  const handleCallHospital = () => {
    if (hospital?.phone) {
      window.open(`tel:${hospital.phone}`, '_self');
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleGetDirections = () => {
    if (hospital?.address) {
      const encodedAddress = encodeURIComponent(hospital.address);
      // Try to open in Google Maps app first, fallback to web
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      toast.error('Address not available');
    }
  };

  const handleViewOnMap = () => {
    if (hospital?.address) {
      setShowMap(!showMap);
    } else {
      toast.error('Address not available');
    }
  };

  const handleOpenInGoogleMaps = () => {
    if (hospital?.address) {
      const encodedAddress = encodeURIComponent(hospital.address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
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

      // Final validation
      if (!validateStep(3)) {
        setLoading(false);
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
        toast.success(result.message || '🎉 Booking confirmed successfully!');

        // Show additional note if provided
        if (result.note) {
          setTimeout(() => {
            toast.info(result.note);
          }, 1000);
        }

        // Dispatch event for admin notification
        window.dispatchEvent(new CustomEvent('newAppointmentBooked', {
          detail: {
            patientName: bookingData.patientDetails.name,
            doctorName: bookingData.appointmentDetails.doctorName,
            hospitalName: hospital?.name || 'Hospital',
            date: bookingData.appointmentDetails.appointmentDate,
            time: bookingData.appointmentDetails.appointmentTime
          }
        }));

        // Redirect to bookings page
        setTimeout(() => {
          navigate('/view-bookings');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again or contact support.');

      // Still dispatch event for admin notification
      window.dispatchEvent(new CustomEvent('newAppointmentBooked', {
        detail: {
          patientName: bookingData.patientDetails.name,
          doctorName: bookingData.appointmentDetails.doctorName,
          hospitalName: hospital?.name || 'Unknown Hospital',
          date: bookingData.appointmentDetails.appointmentDate,
          time: bookingData.appointmentDetails.appointmentTime,
          status: 'failed'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Typography variant="h5" className="font-semibold text-slate-800 mb-2">
                Patient Information
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Please provide your personal details for the appointment
              </Typography>
            </div>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={bookingData.patientDetails.name}
                  onChange={(e) => handleInputChange('patientDetails', 'name', e.target.value)}
                  required
                  error={!!validationErrors.patientDetails.name}
                  helperText={validationErrors.patientDetails.name && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.patientDetails.name}
                    </span>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.patientDetails.name ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.patientDetails.name ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
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
                  error={!!validationErrors.patientDetails.age}
                  helperText={validationErrors.patientDetails.age && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.patientDetails.age}
                    </span>
                  )}
                  slotProps={{
                    htmlInput: { min: 1, max: 120 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.patientDetails.age ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.patientDetails.age ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.patientDetails.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={bookingData.patientDetails.gender}
                    onChange={(e) => handleInputChange('patientDetails', 'gender', e.target.value)}
                    label="Gender"
                    error={!!validationErrors.patientDetails.gender}
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: validationErrors.patientDetails.gender ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: validationErrors.patientDetails.gender ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ef4444',
                      },
                    }}
                  >
                    <MenuItem value="Male">👨 Male</MenuItem>
                    <MenuItem value="Female">👩 Female</MenuItem>
                    <MenuItem value="Other">🧑 Other</MenuItem>
                  </Select>
                  {validationErrors.patientDetails.gender && (
                    <span className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.patientDetails.gender}
                    </span>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={bookingData.patientDetails.phone}
                  onChange={(e) => handleInputChange('patientDetails', 'phone', e.target.value)}
                  required
                  error={!!validationErrors.patientDetails.phone}
                  helperText={validationErrors.patientDetails.phone && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.patientDetails.phone}
                    </span>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.patientDetails.phone ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.patientDetails.phone ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
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
                  error={!!validationErrors.patientDetails.email}
                  helperText={validationErrors.patientDetails.email && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.patientDetails.email}
                    </span>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.patientDetails.email ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.patientDetails.email ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
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
                  error={!!validationErrors.patientDetails.address}
                  helperText={validationErrors.patientDetails.address && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.patientDetails.address}
                    </span>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.patientDetails.address ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.patientDetails.address ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Typography variant="h5" className="font-semibold text-slate-800 mb-2">
                Appointment Details
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Choose your preferred doctor, date and time for consultation
              </Typography>
            </div>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.appointmentDetails.department}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={bookingData.appointmentDetails.department}
                    onChange={(e) => handleInputChange('appointmentDetails', 'department', e.target.value)}
                    label="Department"
                    error={!!validationErrors.appointmentDetails.department}
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: validationErrors.appointmentDetails.department ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: validationErrors.appointmentDetails.department ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ef4444',
                      },
                    }}
                  >
                    {!hospital ? (
                      <MenuItem disabled>
                        Loading departments...
                      </MenuItem>
                    ) : hospital?.departments?.length > 0 ? (
                      hospital.departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          🏥 {dept}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No departments available
                      </MenuItem>
                    )}
                  </Select>
                  {validationErrors.appointmentDetails.department && (
                    <span className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.appointmentDetails.department}
                    </span>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.appointmentDetails.doctorName}>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={bookingData.appointmentDetails.doctorName}
                    onChange={(e) => handleInputChange('appointmentDetails', 'doctorName', e.target.value)}
                    label="Doctor"
                    error={!!validationErrors.appointmentDetails.doctorName}
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: validationErrors.appointmentDetails.doctorName ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: validationErrors.appointmentDetails.doctorName ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ef4444',
                      },
                    }}
                  >
                    {!hospital ? (
                      <MenuItem disabled>
                        Loading doctors...
                      </MenuItem>
                    ) : hospital?.doctors?.length > 0 ? (
                      hospital.doctors.map((doctor) => (
                        <MenuItem
                          key={doctor.name || doctor}
                          value={doctor.name || doctor}
                        >
                          👨‍⚕️ {doctor.name ? `${doctor.name} - ${doctor.specialty}` : doctor}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No doctors available
                      </MenuItem>
                    )}
                  </Select>
                  {validationErrors.appointmentDetails.doctorName && (
                    <span className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.appointmentDetails.doctorName}
                    </span>
                  )}
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
                  error={!!validationErrors.appointmentDetails.appointmentDate}
                  helperText={validationErrors.appointmentDetails.appointmentDate && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.appointmentDetails.appointmentDate}
                    </span>
                  )}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: new Date().toISOString().split('T')[0] }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.appointmentDetails.appointmentDate ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.appointmentDetails.appointmentDate ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
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
                  error={!!validationErrors.appointmentDetails.appointmentTime}
                  helperText={validationErrors.appointmentDetails.appointmentTime && (
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.appointmentDetails.appointmentTime}
                    </span>
                  )}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: validationErrors.appointmentDetails.appointmentTime ? '#ef4444' : '#059669',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: validationErrors.appointmentDetails.appointmentTime ? '#ef4444' : '#2d5016',
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#ef4444',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Consultation Type</InputLabel>
                  <Select
                    value={bookingData.appointmentDetails.consultationType}
                    onChange={(e) => handleInputChange('appointmentDetails', 'consultationType', e.target.value)}
                    label="Consultation Type"
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#059669',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2d5016',
                      },
                    }}
                  >
                    <MenuItem value="In-Person">🏥 In-Person Consultation</MenuItem>
                    <MenuItem value="Online">💻 Online Video Call</MenuItem>
                    <MenuItem value="Phone">📞 Phone Consultation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Typography variant="h5" className="font-semibold text-slate-800 mb-2">
                Medical Information
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Help us understand your health condition for better consultation
              </Typography>
            </div>

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200">
                  <Typography variant="h6" className="text-red-800 mb-3 flex items-center">
                    🩺 Current Symptoms
                  </Typography>
                  <TextField
                    fullWidth
                    label="Describe your symptoms"
                    multiline
                    rows={4}
                    value={bookingData.medicalInfo.symptoms}
                    onChange={(e) => handleInputChange('medicalInfo', 'symptoms', e.target.value)}
                    required
                    error={!!validationErrors.medicalInfo.symptoms}
                    helperText={validationErrors.medicalInfo.symptoms && (
                      <span className="flex items-center">
                        <FaExclamationTriangle className="mr-1" />
                        {validationErrors.medicalInfo.symptoms}
                      </span>
                    )}
                    placeholder="Please describe your current symptoms in detail..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover fieldset': {
                          borderColor: validationErrors.medicalInfo.symptoms ? '#ef4444' : '#059669',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: validationErrors.medicalInfo.symptoms ? '#ef4444' : '#2d5016',
                        },
                        '&.Mui-error fieldset': {
                          borderColor: '#ef4444',
                        },
                      },
                    }}
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <Typography variant="h6" className="text-blue-800 mb-3 flex items-center">
                    📋 Medical History
                  </Typography>
                  <TextField
                    fullWidth
                    label="Previous conditions"
                    multiline
                    rows={3}
                    value={bookingData.medicalInfo.medicalHistory}
                    onChange={(e) => handleInputChange('medicalInfo', 'medicalHistory', e.target.value)}
                    placeholder="Any previous medical conditions, surgeries, or treatments..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover fieldset': {
                          borderColor: '#059669',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2d5016',
                        },
                      },
                    }}
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <Typography variant="h6" className="text-purple-800 mb-3 flex items-center">
                    💊 Current Medications
                  </Typography>
                  <TextField
                    fullWidth
                    label="Medications you're taking"
                    multiline
                    rows={3}
                    value={bookingData.medicalInfo.currentMedications}
                    onChange={(e) => handleInputChange('medicalInfo', 'currentMedications', e.target.value)}
                    placeholder="List any medications you are currently taking..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover fieldset': {
                          borderColor: '#059669',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2d5016',
                        },
                      },
                    }}
                  />
                </div>
              </Grid>

              <Grid item xs={12}>
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200">
                  <Typography variant="h6" className="text-yellow-800 mb-3 flex items-center">
                    ⚠️ Allergies
                  </Typography>
                  <TextField
                    fullWidth
                    label="Known allergies"
                    value={bookingData.medicalInfo.allergies}
                    onChange={(e) => handleInputChange('medicalInfo', 'allergies', e.target.value)}
                    placeholder="Any known allergies to medications, foods, etc..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover fieldset': {
                          borderColor: '#059669',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2d5016',
                        },
                      },
                    }}
                  />
                </div>
              </Grid>

              <Grid item xs={12}>
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <Typography variant="h6" className="text-green-800 mb-4 flex items-center">
                    🚨 Emergency Contact
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Contact Name"
                        value={bookingData.medicalInfo.emergencyContact.name}
                        onChange={(e) => handleNestedInputChange('medicalInfo', 'emergencyContact', 'name', e.target.value)}
                        error={!!validationErrors.emergencyContact?.name}
                        helperText={validationErrors.emergencyContact?.name && (
                          <span className="flex items-center">
                            <FaExclamationTriangle className="mr-1" />
                            {validationErrors.emergencyContact.name}
                          </span>
                        )}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover fieldset': {
                              borderColor: validationErrors.emergencyContact?.name ? '#ef4444' : '#059669',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: validationErrors.emergencyContact?.name ? '#ef4444' : '#2d5016',
                            },
                            '&.Mui-error fieldset': {
                              borderColor: '#ef4444',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        value={bookingData.medicalInfo.emergencyContact.phone}
                        onChange={(e) => handleNestedInputChange('medicalInfo', 'emergencyContact', 'phone', e.target.value)}
                        error={!!validationErrors.emergencyContact?.phone}
                        helperText={validationErrors.emergencyContact?.phone && (
                          <span className="flex items-center">
                            <FaExclamationTriangle className="mr-1" />
                            {validationErrors.emergencyContact.phone}
                          </span>
                        )}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover fieldset': {
                              borderColor: validationErrors.emergencyContact?.phone ? '#ef4444' : '#059669',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: validationErrors.emergencyContact?.phone ? '#ef4444' : '#2d5016',
                            },
                            '&.Mui-error fieldset': {
                              borderColor: '#ef4444',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Relation"
                        value={bookingData.medicalInfo.emergencyContact.relation}
                        onChange={(e) => handleNestedInputChange('medicalInfo', 'emergencyContact', 'relation', e.target.value)}
                        error={!!validationErrors.emergencyContact?.relation}
                        helperText={validationErrors.emergencyContact?.relation && (
                          <span className="flex items-center">
                            <FaExclamationTriangle className="mr-1" />
                            {validationErrors.emergencyContact.relation}
                          </span>
                        )}
                        placeholder="e.g., Spouse, Parent, Sibling"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover fieldset': {
                              borderColor: validationErrors.emergencyContact?.relation ? '#ef4444' : '#059669',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: validationErrors.emergencyContact?.relation ? '#ef4444' : '#2d5016',
                            },
                            '&.Mui-error fieldset': {
                              borderColor: '#ef4444',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            </Grid>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Typography variant="h5" className="font-semibold text-slate-800 mb-2">
                Review & Payment
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Please review your booking details and complete the payment
              </Typography>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-6">
              <Alert
                severity="info"
                sx={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  '& .MuiAlert-icon': {
                    color: '#3b82f6'
                  }
                }}
              >
                <Typography variant="body1" className="font-medium">
                  🔒 <strong>Secure Payment:</strong> Your payment information is encrypted and secure. Consultation fees will be processed upon confirmation.
                </Typography>
              </Alert>
            </div>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <Typography variant="h5" className="font-playfair font-bold text-slate-900 mb-6 flex items-center">
                    📋 Booking Summary
                  </Typography>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div>
                        <Typography variant="body2" className="text-slate-600">Hospital</Typography>
                        <Typography variant="h6" className="font-semibold text-slate-900">{hospital?.name}</Typography>
                      </div>
                      <FaHospital className="text-2xl text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div>
                        <Typography variant="body2" className="text-slate-600">Doctor</Typography>
                        <Typography variant="h6" className="font-semibold text-slate-900">{bookingData.appointmentDetails.doctorName}</Typography>
                      </div>
                      <FaUserMd className="text-2xl text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div>
                        <Typography variant="body2" className="text-slate-600">Department</Typography>
                        <Typography variant="h6" className="font-semibold text-slate-900">{bookingData.appointmentDetails.department}</Typography>
                      </div>
                      <FaHospital className="text-2xl text-purple-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                      <div>
                        <Typography variant="body2" className="text-slate-600">Date & Time</Typography>
                        <Typography variant="h6" className="font-semibold text-slate-900">
                          {bookingData.appointmentDetails.appointmentDate} at {bookingData.appointmentDetails.appointmentTime}
                        </Typography>
                      </div>
                      <FaCalendarAlt className="text-2xl text-orange-600" />
                    </div>

                    <div className="p-3 bg-gradient-to-r from-teal-50 to-green-50 rounded-xl">
                      <Typography variant="body2" className="text-slate-600 mb-2">Consultation Type</Typography>
                      <Chip
                        label={bookingData.appointmentDetails.consultationType}
                        size="medium"
                        sx={{
                          background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <Typography variant="h5" className="font-playfair font-bold text-slate-900 mb-6 flex items-center">
                    💳 Payment Details
                  </Typography>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <Typography className="font-medium">Consultation Fee</Typography>
                      <Typography className="font-bold text-lg">₹{bookingData.paymentDetails.consultationFee}</Typography>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                      <Typography className="font-medium text-green-700">Platform Fee</Typography>
                      <Typography className="font-bold text-lg text-green-700">₹0</Typography>
                    </div>
                    <Divider sx={{ my: 2 }} />
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                      <Typography variant="h5" className="font-bold text-green-800">Total Amount</Typography>
                      <Typography variant="h4" className="font-bold text-green-800">
                        ₹{bookingData.paymentDetails.consultationFee}
                      </Typography>
                    </div>
                  </div>

                  <Typography variant="h6" className="font-semibold mb-4">Choose Payment Method:</Typography>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={bookingData.paymentDetails.paymentMethod === 'Cash' ? 'contained' : 'outlined'}
                      onClick={() => handleInputChange('paymentDetails', 'paymentMethod', 'Cash')}
                      className="p-4 flex flex-col items-center space-y-2"
                      sx={{
                        borderRadius: '12px',
                        ...(bookingData.paymentDetails.paymentMethod === 'Cash' && {
                          background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                        })
                      }}
                    >
                      <span className="text-2xl">💵</span>
                      <span className="font-semibold">Cash</span>
                    </Button>
                    <Button
                      variant={bookingData.paymentDetails.paymentMethod === 'Card' ? 'contained' : 'outlined'}
                      onClick={() => handleInputChange('paymentDetails', 'paymentMethod', 'Card')}
                      className="p-4 flex flex-col items-center space-y-2"
                      sx={{
                        borderRadius: '12px',
                        ...(bookingData.paymentDetails.paymentMethod === 'Card' && {
                          background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                        })
                      }}
                    >
                      <span className="text-2xl">💳</span>
                      <span className="font-semibold">Card</span>
                    </Button>
                    <Button
                      variant={bookingData.paymentDetails.paymentMethod === 'UPI' ? 'contained' : 'outlined'}
                      onClick={() => handleInputChange('paymentDetails', 'paymentMethod', 'UPI')}
                      className="p-4 flex flex-col items-center space-y-2"
                      sx={{
                        borderRadius: '12px',
                        ...(bookingData.paymentDetails.paymentMethod === 'UPI' && {
                          background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                        })
                      }}
                    >
                      <span className="text-2xl">📱</span>
                      <span className="font-semibold">UPI</span>
                    </Button>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-24 pb-12">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <div className="text-center mb-8">
            <Typography
              variant="h3"
              className="font-playfair font-bold text-slate-900 mb-4"
              sx={{
                background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              <FaHospital style={{ marginRight: 16, color: '#2d5016' }} />
              Book Hospital Appointment
            </Typography>
            <Typography variant="h6" className="text-slate-600 font-medium mb-4">
              🏥 Schedule your consultation with trusted Ayurvedic specialists
            </Typography>

            {/* Quick Booking Options */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                <Typography variant="body1" className="text-slate-700 font-semibold mb-2 text-center">
                  📞 Prefer to book over phone?
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleCallHospital}
                  startIcon={<FaPhoneAlt />}
                  sx={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    borderRadius: '25px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                    }
                  }}
                >
                  Call for Quick Booking
                </Button>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                <Typography variant="body1" className="text-slate-700 font-semibold mb-2 text-center">
                  🗺️ Need directions first?
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGetDirections}
                  startIcon={<FaDirections />}
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    borderRadius: '25px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    }
                  }}
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          {hospital && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <div className="flex items-start space-x-4">
                    <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                      <FaHospital className="text-3xl text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Typography
                        variant="h4"
                        className="font-playfair font-bold text-slate-900 mb-3"
                      >
                        {hospital.name}
                      </Typography>

                      {hospital.rating && (
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaCheckCircle
                                key={i}
                                className={`text-lg ${i < hospital.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-600 font-medium">
                            ({hospital.rating}/5)
                          </span>
                          {hospital.isVerified && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FaMapMarkerAlt className="text-green-600" />
                          <Typography className="text-slate-600">{hospital.address}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FaPhone className="text-green-600" />
                          <Typography className="text-slate-600">{hospital.phone}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FaEnvelope className="text-green-600" />
                          <Typography className="text-slate-600">{hospital.email}</Typography>
                        </Box>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleCallHospital}
                          startIcon={<FaPhoneAlt />}
                          sx={{
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                            }
                          }}
                        >
                          Call Now
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleGetDirections}
                          startIcon={<FaDirections />}
                          sx={{
                            borderColor: '#059669',
                            color: '#059669',
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#047857',
                              backgroundColor: '#f0fdf4',
                              color: '#047857'
                            }
                          }}
                        >
                          Get Directions
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleViewOnMap}
                          startIcon={<FaMap />}
                          sx={{
                            borderColor: '#059669',
                            color: '#059669',
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#047857',
                              backgroundColor: '#f0fdf4',
                              color: '#047857'
                            }
                          }}
                        >
                          {showMap ? 'Hide Map' : 'View on Map'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12} md={4}>
                  <div className="text-center md:text-right">
                    <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl border border-green-200">
                      <Typography variant="body1" className="text-green-700 font-semibold mb-2">
                        Consultation Fee
                      </Typography>
                      <Typography
                        variant="h3"
                        className="font-bold text-green-800"
                      >
                        ₹{bookingData.paymentDetails.consultationFee}
                      </Typography>
                      <Typography variant="body2" className="text-green-600 mt-1">
                        Per Session
                      </Typography>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Embedded Map */}
          {showMap && hospital?.address && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" className="font-playfair font-bold text-slate-900 flex items-center">
                  <FaMap className="mr-3 text-green-600" />
                  Hospital Location
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenInGoogleMaps}
                  startIcon={<FaDirections />}
                  sx={{
                    borderColor: '#059669',
                    color: '#059669',
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Open in Google Maps
                </Button>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-y-2b8s&q=${encodeURIComponent(hospital.address)}`}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hospital Location"
                />
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <Typography variant="body1" className="text-slate-700 font-medium mb-2">
                  📍 {hospital.name}
                </Typography>
                <Typography variant="body2" className="text-slate-600">
                  {hospital.address}
                </Typography>
              </div>
            </div>
          )}
        </Box>

        {/* Stepper */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#059669',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#2d5016',
              },
              '& .MuiStepConnector-line': {
                borderColor: '#e5e7eb',
              },
              '& .Mui-completed .MuiStepConnector-line': {
                borderColor: '#059669',
              },
              '& .Mui-active .MuiStepConnector-line': {
                borderColor: '#2d5016',
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 600,
                      fontSize: '1rem'
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
              {activeStep === 0 && <FaUserMd className="text-2xl text-green-600" />}
              {activeStep === 1 && <FaCalendarAlt className="text-2xl text-green-600" />}
              {activeStep === 2 && <FaHospital className="text-2xl text-green-600" />}
              {activeStep === 3 && <FaCreditCard className="text-2xl text-green-600" />}
            </div>
            <Typography
              variant="h4"
              className="font-playfair font-bold text-slate-900"
            >
              {steps[activeStep]}
            </Typography>
          </div>
          {renderStepContent(activeStep)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size="large"
            className="px-8 py-3 font-semibold"
            startIcon={<FaArrowLeft />}
            sx={{
              borderColor: '#059669',
              color: '#059669',
              '&:hover': {
                borderColor: '#2d5016',
                backgroundColor: '#f0fdf4'
              }
            }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleBookingSubmit}
              disabled={loading}
              size="large"
              className="px-8 py-3 font-semibold"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaCheckCircle />}
              sx={{
                background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1f3a0f 0%, #047857 100%)',
                }
              }}
            >
              {loading ? 'Confirming...' : 'Complete Booking 🎉'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              size="large"
              className="px-8 py-3 font-semibold"
              endIcon={<FaArrowRight />}
              sx={{
                background: 'linear-gradient(135deg, #2d5016 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1f3a0f 0%, #047857 100%)',
                }
              }}
            >
              Next
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
}

export default HospitalBooking;