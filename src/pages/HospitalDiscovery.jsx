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
import { useNavigate } from 'react-router-dom';

function HospitalDiscovery() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [hospitalDialog, setHospitalDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
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
    getUserLocation();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/hospitals');
      setHospitals(response.data);
      setFilteredHospitals(response.data);
      
      // Extract unique specialties and cities
      const uniqueSpecialties = [...new Set(response.data.flatMap(h => h.specialties))];
      const uniqueCities = [...new Set(response.data.map(h => h.city))];
      setSpecialties(uniqueSpecialties);
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  // Filter hospitals based on search criteria
  useEffect(() => {
    let filtered = hospitals;

    // Search query filter
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

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(hospital =>
        hospital.specialties.includes(selectedSpecialty)
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(hospital =>
        hospital.city === selectedCity
      );
    }

    // Pincode filter
    if (pincode) {
      filtered = filtered.filter(hospital =>
        hospital.pincode && hospital.pincode.toString().includes(pincode)
      );
    }

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedSpecialty, selectedCity, pincode]);

  const openHospitalDialog = (hospital) => {
    setSelectedHospital(hospital);
    setHospitalDialog(true);
    setTabValue(0);
  };

  const closeHospitalDialog = () => {
    setHospitalDialog(false);
    setSelectedHospital(null);
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

  const getAvailableTimeSlots = () => {
    return [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
      '05:00 PM', '05:30 PM'
    ];
  };

  const handleAppointmentSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to book appointments');
        return;
      }

      // Validate required fields
      if (!appointmentData.date || !appointmentData.time || !appointmentData.reason || 
          !appointmentData.patientName || !appointmentData.patientPhone || !appointmentData.patientEmail) {
        toast.error('Please fill in all required fields');
        return;
      }

      const appointmentPayload = {
        hospitalId: selectedDoctor.hospital._id,
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        hospitalName: selectedDoctor.hospital.name,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason,
        patientName: appointmentData.patientName,
        patientPhone: appointmentData.patientPhone,
        patientEmail: appointmentData.patientEmail,
        status: 'pending'
      };

      const response = await axios.post('http://localhost:5000/api/appointments', appointmentPayload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 201) {
        toast.success('Appointment booked successfully!');
        closeAppointmentDialog();
        
        // Reset form
        setAppointmentData({
          date: '',
          time: '',
          reason: '',
          patientName: '',
          patientPhone: '',
          patientEmail: ''
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 tracking-tight">
              Hospital Discovery
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              🏥 Find trusted Ayurvedic hospitals near you
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary text-sm px-6 py-3 hover:scale-105 transition-transform duration-300"
          >
            View My Appointments
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <div className="mb-6">
            <h2 className="text-xl font-playfair font-bold text-slate-900 mb-2">
              🔍 Find Ayurvedic Hospitals Near You
            </h2>
            <p className="text-slate-600">Search by location, specialty, or doctor name</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Hospitals
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600" />
                <input
                  type="text"
                  placeholder="Search hospitals, doctors, or specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Pincode
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600" />
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300 text-slate-900"
              >
                <option value="">All Specialties</option>
                <option value="Ayurvedic Medicine">🌿 Ayurvedic Medicine</option>
                <option value="Herbal Medicine">🌱 Herbal Medicine</option>
                <option value="Panchakarma">🧘 Panchakarma</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300 text-slate-900"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialty("");
                  setSelectedCity("");
                  setPincode("");
                }}
                className="w-full px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 mt-7"
              >
                <FaFilter className="text-sm" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg text-slate-600 font-medium">Finding hospitals...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-playfair font-bold text-slate-900">
                Found {filteredHospitals.length} hospitals
              </h2>
              {userLocation && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full border border-green-200">
                  <FaMapMarkerAlt className="text-sm" />
                  <span className="text-sm font-medium">Location enabled</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map(hospital => (
                <div key={hospital._id} className="card-hospital group">
                  <div className="p-6 flex flex-col h-full">
                    {/* Hospital Header */}
                    <div className="flex items-start mb-4">
                      <div className="p-3 bg-blue-100 rounded-2xl mr-4">
                        <FaHospital className="text-2xl text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-playfair font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {hospital.name}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${i < (hospital.rating || 0) ? 'text-yellow-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-600">
                            ({hospital.rating}/5)
                          </span>
                          {hospital.isVerified && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center mb-4 text-slate-600">
                      <FaMapMarkerAlt className="text-blue-500 mr-3" />
                      <span className="text-sm">
                        {hospital.address}, {hospital.city}
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Specialties:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.slice(0, 3).map(specialty => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200 flex items-center space-x-1"
                          >
                            <FaLeaf className="text-xs" />
                            <span>{specialty}</span>
                          </span>
                        ))}
                        {hospital.specialties.length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                            +{hospital.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Doctors */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Doctors:
                      </h4>
                      <div className="space-y-2">
                        {hospital.doctors.slice(0, 2).map(doctor => (
                          <div key={doctor.name} className="flex items-center text-sm text-slate-600">
                            <FaUserMd className="text-blue-600 mr-3" />
                            <span>{doctor.name} - {doctor.specialty}</span>
                          </div>
                        ))}
                        {hospital.doctors.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{hospital.doctors.length - 2} more doctors
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-3">
                      <button
                        onClick={() => openHospitalDialog(hospital)}
                        className="w-full btn-primary text-sm py-3"
                      >
                        View Details
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {hospital.doctors && hospital.doctors.length > 0 && (
                          <button
                            onClick={() => openAppointmentDialog(hospital.doctors[0], hospital)}
                            className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-xl transition-all duration-300 text-xs"
                          >
                            <FaStethoscope className="text-xs" />
                            <span>Book</span>
                          </button>
                        )}

                        <button
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-xl transition-all duration-300 text-xs"
                        >
                          <FaDirections className="text-xs" />
                          <span>Directions</span>
                        </button>

                        {hospital.phone && (
                          <button
                            className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl transition-all duration-300 text-xs"
                          >
                            <FaPhone className="text-xs" />
                            <span>Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {hospitalDialog && selectedHospital && (
        <Dialog
          open={hospitalDialog}
          onClose={closeHospitalDialog}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh'
            }
          }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-playfair font-bold mb-3">
                  {selectedHospital.name}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-lg ${i < (selectedHospital.rating || 0) ? 'text-yellow-300' : 'text-white/30'}`}
                      />
                    ))}
                  </div>
                  <span className="text-white/90">
                    ({selectedHospital.rating}/5)
                  </span>
                  {selectedHospital.isVerified && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeHospitalDialog}
                className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          <DialogContent sx={{ p: 3 }}>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-600 mr-3" />
                    <span>{selectedHospital.address}, {selectedHospital.city}</span>
                  </div>
                  {selectedHospital.phone && (
                    <div className="flex items-center">
                      <FaPhone className="text-blue-600 mr-3" />
                      <span>{selectedHospital.phone}</span>
                    </div>
                  )}
                  {selectedHospital.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="text-blue-600 mr-3" />
                      <span>{selectedHospital.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.specialties.map(specialty => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Medical Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedHospital.doctors.map((doctor, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center mb-2">
                        <FaUserMd className="text-blue-600 mr-3" />
                        <span className="font-semibold">{doctor.name}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{doctor.specialty}</p>
                      {doctor.experience && (
                        <p className="text-slate-500 text-xs mt-1">Experience: {doctor.experience} years</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Button
              variant="outlined"
              startIcon={<FaDirections />}
              sx={{
                color: '#3b82f6',
                borderColor: '#3b82f6',
                '&:hover': { bgcolor: '#eff6ff' }
              }}
            >
              Get Directions
            </Button>

            {selectedHospital.phone && (
              <Button
                variant="contained"
                startIcon={<FaPhone />}
                sx={{
                  bgcolor: '#059669',
                  '&:hover': { bgcolor: '#047857' }
                }}
              >
                Call Hospital
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {appointmentDialog && selectedDoctor && (
        <Dialog
          open={appointmentDialog}
          onClose={closeAppointmentDialog}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
          }}
        >
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FaStethoscope className="text-2xl" />
                <h2 className="text-2xl font-playfair font-bold">Book Appointment</h2>
              </div>
              <button
                onClick={closeAppointmentDialog}
                className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          <DialogContent sx={{ p: 3 }}>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Dr. {selectedDoctor.name}
                </h3>
                <p className="text-slate-600 mb-1">
                  {selectedDoctor.specialty} • {selectedDoctor.hospital?.name}
                </p>
                <p className="text-slate-500 text-sm">
                  Experience: {selectedDoctor.experience} years
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Patient Name *"
                  value={appointmentData.patientName}
                  onChange={(e) => setAppointmentData({...appointmentData, patientName: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="Phone Number *"
                  value={appointmentData.patientPhone}
                  onChange={(e) => setAppointmentData({...appointmentData, patientPhone: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={appointmentData.patientEmail}
                  onChange={(e) => setAppointmentData({...appointmentData, patientEmail: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="Preferred Date *"
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
                <FormControl fullWidth>
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
                <TextField
                  fullWidth
                  label="Reason for Visit"
                  multiline
                  rows={3}
                  value={appointmentData.reason}
                  onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                  placeholder="Please describe your symptoms or reason for consultation..."
                  sx={{ gridColumn: 'span 2' }}
                />
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  ⚠️ Demo System Notice:
                </p>
                <p className="text-sm text-slate-600">
                  This is a demonstration system. No real appointment will be booked with the hospital.
                  In a real implementation, the hospital would be notified automatically.
                </p>
              </div>
            </div>
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
              sx={{
                bgcolor: '#059669',
                '&:hover': { bgcolor: '#047857' }
              }}
            >
              Book Appointment
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default HospitalDiscovery;
