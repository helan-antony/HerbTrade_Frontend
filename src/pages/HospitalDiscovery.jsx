import {
  Box, Typography, Grid, Card, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Rating, List, ListItem, ListItemText, Divider, Tab, Tabs,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Skeleton
} from "@mui/material";
import {
  FaMapMarkerAlt, FaUserMd, FaPhone, FaEnvelope, FaGlobe,
  FaClock, FaStar, FaDirections, FaSearch, FaTimes, FaHospital,
  FaStethoscope, FaLeaf, FaFilter, FaCalendarCheck, FaInfoCircle
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
  const [place, setPlace] = useState("");
  const [hospitalDialog, setHospitalDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchingPlace, setSearchingPlace] = useState(false);
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
      console.log('Fetching hospitals from API...');

      // Use the correct hospitals endpoint
      const response = await axios.get('http://localhost:5000/api/hospitals');
      console.log('Hospitals response:', response.data);

      const hospitalsData = Array.isArray(response.data) ? response.data : [];
      setHospitals(hospitalsData);
      setFilteredHospitals(hospitalsData);

      // Extract unique specialties and cities
      const uniqueSpecialties = [...new Set(hospitalsData.flatMap(h => h.specialties || []))];
      const uniqueCities = [...new Set(hospitalsData.map(h => h.city).filter(Boolean))];
      setSpecialties(uniqueSpecialties);
      setCities(uniqueCities);

      if (hospitalsData.length > 0) {
        toast.success(`Found ${hospitalsData.length} hospitals`);
      } else {
        toast.info('No hospitals found. Please run the seed script to add sample hospitals.');
        console.log('No hospitals found. You may need to seed the database.');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(`Failed to load hospitals: ${error.response.data.error || error.message}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('Cannot connect to server. Please check if the backend is running on port 5000.');
      } else {
        console.error('Error setting up request:', error.message);
        toast.error(`Request error: ${error.message}`);
      }
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
          setLocationPermissionDenied(false); // Reset permission denied state
          toast.success('Location access granted! You can now find nearby hospitals.');
        },
        (error) => {
          console.log('Location access denied:', error);
          
          // Set location permission denied state
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermissionDenied(true);
          }
          
          // Handle different types of geolocation errors
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. You can still search hospitals by entering a city or place name.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please search by city or place name.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please search by city or place name.';
              break;
            default:
              errorMessage = 'Unable to get your location. Please search by city or place name.';
              break;
          }
          
          // Show a user-friendly toast message
          toast.info(errorMessage, {
            autoClose: 5000,
            hideProgressBar: false,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      toast.info('Geolocation is not supported by this browser. Please search by city or place name.');
    }
  };

  // Filter hospitals based on search criteria
  useEffect(() => {
    let filtered = hospitals;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(hospital =>
        (hospital.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hospital.specialties || []).some(spec =>
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (hospital.doctors || []).some(doc =>
          (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (hospital.address || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(hospital =>
        (hospital.specialties || []).includes(selectedSpecialty)
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(hospital =>
        hospital.city === selectedCity
      );
    }

    // Place filter (removed pincode filter as we're using Google Places API)

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedSpecialty, selectedCity]);

  const openHospitalDialog = (hospital) => {
    setSelectedHospital(hospital);
    setHospitalDialog(true);
    setTabValue(0);
  };

  const closeHospitalDialog = () => {
    setHospitalDialog(false);
    setSelectedHospital(null);
  };

  // Search hospitals by place using Google Places API
  const searchHospitalsByPlace = async (placeName) => {
    if (!placeName.trim()) {
      toast.error('Please enter a place name');
      return;
    }

    setSearchingPlace(true);
    setLoading(true);

    try {
      console.log(`🔍 Searching for Ayurvedic hospitals in: ${placeName}`);

      const response = await fetch(`http://localhost:5000/api/google-places/search-hospitals/${encodeURIComponent(placeName)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log(`✅ Found ${data.length} hospitals from Google Places`);

      if (data.length === 0) {
        toast.info(`No Ayurvedic hospitals found in ${placeName}. Try a different location.`);
      } else {
        setHospitals(data);
        setFilteredHospitals(data);
        toast.success(`Found ${data.length} Ayurvedic hospitals in ${placeName}`);
      }

    } catch (error) {
      console.error('Error searching hospitals by place:', error);
      toast.error('Failed to search hospitals. Please try again.');
    } finally {
      setSearchingPlace(false);
      setLoading(false);
    }
  };

  // Handle place search on Enter key or button click
  const handlePlaceSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      searchHospitalsByPlace(place);
    }
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

        // Dispatch event for admin notification
        window.dispatchEvent(new CustomEvent('newAppointmentBooked', {
          detail: {
            patientName: appointmentData.patientName,
            doctorName: selectedDoctor.name,
            hospitalName: selectedDoctor.hospital.name,
            date: appointmentData.date,
            time: appointmentData.time
          }
        }));

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

  // Retry location access
  const retryLocationAccess = () => {
    setLocationPermissionDenied(false);
    getUserLocation();
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Get distance text for display
  const getDistanceText = (hospital) => {
    if (!userLocation || !hospital.geometry?.location) return null;
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      hospital.geometry.location.lat,
      hospital.geometry.location.lng
    );
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${distance.toFixed(1)}km away`;
    }
  };

  // Handle directions functionality
  const handleDirections = (hospital) => {
    try {
      const address = encodeURIComponent(`${hospital.address}, ${hospital.city}`);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(googleMapsUrl, '_blank');
      toast.success('Opening directions in Google Maps...');
    } catch (error) {
      console.error('Error opening directions:', error);
      toast.error('Failed to open directions');
    }
  };

  // Handle call functionality
  const handleCall = (hospital) => {
    try {
      if (hospital.phone) {
        const phoneNumber = (hospital.phone || '').replace(/\s+/g, '').replace(/-/g, '');
        window.location.href = `tel:${phoneNumber}`;
        toast.success(`Calling ${hospital.name || 'Hospital'}...`);
      } else {
        toast.error('Phone number not available');
      }
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to initiate call');
    }
  };

  // Handle booking navigation
  const handleBookAppointment = (hospital) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to book appointments');
        navigate('/login');
        return;
      }

      // Navigate to hospital booking page
      navigate(`/hospital-booking/${hospital._id}`);
      toast.success('Redirecting to booking page...');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to navigate to booking page');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 tracking-tight">
              Hospital Discovery
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              🏥 Find trusted Ayurvedic hospitals near you
            </p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1">
                <FaInfoCircle className="text-blue-500" />
                <span>Real-time availability</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaStethoscope className="text-green-500" />
                <span>Verified doctors</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/view-bookings')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <FaCalendarCheck />
              <span>My Bookings</span>
            </button>
          </div>
        </div>

        {/* Location Permission Banner */}
        {locationPermissionDenied && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FaMapMarkerAlt className="w-6 h-6 text-amber-600 mt-1" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  📍 Location Access Needed for Better Results
                </h3>
                <p className="text-amber-700 mb-3">
                  To find hospitals near you and show accurate distances, we need access to your location. 
                  You can still search by entering a city or place name below.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={retryLocationAccess}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <FaMapMarkerAlt />
                    <span>Allow Location Access</span>
                  </button>
                  <button
                    onClick={() => setLocationPermissionDenied(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  💡 <strong>Tip:</strong> If you've blocked location access, you can reset it by clicking the tune icon next to the URL in your browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-playfair font-bold text-slate-900">
                🔍 Find Ayurvedic Hospitals Near You
              </h2>
              {userLocation && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span className="font-medium">Location Enabled</span>
                </div>
              )}
            </div>
            <p className="text-slate-600">Search by place name to find Ayurvedic hospitals from Google Places</p>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 <strong>New Feature:</strong> Enter a place name to search for Ayurvedic hospitals in that location using Google Places API.
              </p>
            </div>
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
                Place/Location
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600" />
                <input
                  type="text"
                  placeholder="Enter place (e.g., Kattappana)"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  onKeyPress={handlePlaceSearch}
                  className="w-full pl-12 pr-16 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-500"
                />
                <button
                  onClick={handlePlaceSearch}
                  disabled={searchingPlace || !place.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                  title="Search hospitals in this place"
                >
                  {searchingPlace ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FaSearch className="text-sm" />
                  )}
                </button>
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
                  setPlace("");
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
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-slate-700">Finding hospitals...</p>
                <p className="text-slate-500">Searching for the best Ayurvedic care near you</p>
              </div>
              {/* Loading skeleton cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                    <div className="flex items-start mb-4">
                      <Skeleton variant="circular" width={56} height={56} className="mr-4" />
                      <div className="flex-1">
                        <Skeleton variant="text" width="80%" height={32} />
                        <Skeleton variant="text" width="60%" height={24} />
                      </div>
                    </div>
                    <Skeleton variant="text" width="100%" height={20} className="mb-2" />
                    <Skeleton variant="text" width="70%" height={20} className="mb-4" />
                    <div className="flex space-x-2 mb-4">
                      <Skeleton variant="rounded" width={80} height={24} />
                      <Skeleton variant="rounded" width={100} height={24} />
                    </div>
                    <Skeleton variant="rounded" width="100%" height={48} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-playfair font-bold text-slate-900">
                    Found {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''}
                  </h2>
                  {filteredHospitals.length > 0 && (
                    <p className="text-slate-600">
                      Showing results {searchQuery || selectedSpecialty || selectedCity || place ? 'for your search' : 'in your area'}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {userLocation && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full border border-green-200">
                      <FaMapMarkerAlt className="text-sm" />
                      <span className="text-sm font-medium">Location enabled</span>
                    </div>
                  )}
                  {filteredHospitals.length !== hospitals.length && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                      <FaFilter className="text-sm" />
                      <span className="text-sm font-medium">Filtered results</span>
                    </div>
                  )}
                </div>
              </div>

              {filteredHospitals.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <FaHospital className="text-4xl text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-700 mb-2">No hospitals found</h3>
                  <p className="text-slate-500 mb-6">Try adjusting your search criteria or clearing filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSpecialty("");
                      setSelectedCity("");
                      setPlace("");
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
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
                        {(hospital.specialties || []).slice(0, 3).map(specialty => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200 flex items-center space-x-1"
                          >
                            <FaLeaf className="text-xs" />
                            <span>{specialty}</span>
                          </span>
                        ))}
                        {(hospital.specialties || []).length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                            +{(hospital.specialties || []).length - 3} more
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
                        {(hospital.doctors || []).slice(0, 2).map(doctor => (
                          <div key={doctor.name} className="flex items-center text-sm text-slate-600">
                            <FaUserMd className="text-blue-600 mr-3" />
                            <span>{doctor.name} - {doctor.specialty}</span>
                          </div>
                        ))}
                        {(hospital.doctors || []).length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{(hospital.doctors || []).length - 2} more doctors
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hospital Contact Info */}
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {hospital.phone && (
                          <div className="flex items-center text-slate-600">
                            <FaPhone className="text-blue-500 mr-3 text-xs" />
                            <span>{hospital.phone}</span>
                          </div>
                        )}
                        {hospital.email && (
                          <div className="flex items-center text-slate-600">
                            <FaEnvelope className="text-blue-500 mr-3 text-xs" />
                            <span className="truncate">{hospital.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-3 relative z-20">
                      {/* Primary Action - View Details */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openHospitalDialog(hospital);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 cursor-pointer relative z-30 flex items-center justify-center space-x-2"
                        type="button"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <FaInfoCircle className="text-sm" />
                        <span>View Details</span>
                      </button>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (hospital.doctors && hospital.doctors.length > 0) {
                              handleBookAppointment(hospital);
                            } else {
                              // Show a message or redirect to general booking
                              toast.info('General booking available - Contact hospital directly');
                              handleCall(hospital);
                            }
                          }}
                          className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 text-xs hover:shadow-lg transform hover:scale-105 cursor-pointer relative z-30 shadow-md"
                          type="button"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <FaStethoscope className="text-xs" />
                          <span>Book</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDirections(hospital);
                          }}
                          className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 text-xs hover:shadow-lg transform hover:scale-105 cursor-pointer relative z-30"
                          type="button"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <FaDirections className="text-xs" />
                          <span>Directions</span>
                        </button>

                        {hospital.phone ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCall(hospital);
                            }}
                            className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-300 text-xs hover:shadow-lg transform hover:scale-105 cursor-pointer relative z-30 shadow-md"
                            type="button"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <FaPhone className="text-xs" />
                            <span>Call</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-600 font-medium rounded-lg text-xs cursor-not-allowed shadow-sm">
                            <FaPhone className="text-xs mr-1" />
                            <span>Call</span>
                          </div>
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
              borderRadius: '16px',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <div className="flex justify-between items-center">
              <span>{selectedHospital.name}</span>
              <IconButton onClick={closeHospitalDialog} sx={{ color: 'white' }}>
                <FaTimes />
              </IconButton>
            </div>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <div className="space-y-0">
              {/* Hospital Info Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Contact Information */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <FaHospital className="text-blue-600 mr-3" />
                      Hospital Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                          <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900">Address</p>
                            <p className="text-slate-600 text-sm">{selectedHospital.address}</p>
                            <p className="text-slate-600 text-sm">{selectedHospital.city}</p>
                          </div>
                        </div>
                        {selectedHospital.phone && (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <FaPhone className="text-blue-600 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">Phone</p>
                              <p className="text-slate-600 text-sm">{selectedHospital.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {selectedHospital.email && (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <FaEnvelope className="text-blue-600 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">Email</p>
                              <p className="text-slate-600 text-sm break-all">{selectedHospital.email}</p>
                            </div>
                          </div>
                        )}
                        {selectedHospital.website && (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <FaGlobe className="text-blue-600 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">Website</p>
                              <p className="text-slate-600 text-sm break-all">{selectedHospital.website}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating and Verification */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-2xl ${i < (selectedHospital.rating || 0) ? 'text-yellow-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-2xl font-bold text-slate-900 mb-1">
                        {selectedHospital.rating}/5
                      </p>
                      <p className="text-slate-600 text-sm mb-4">Patient Rating</p>
                      {selectedHospital.isVerified && (
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                          <FaStethoscope className="mr-2" />
                          Verified Hospital
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <FaLeaf className="text-emerald-600 mr-3" />
                  Medical Specialties
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedHospital.specialties?.map(specialty => (
                    <div
                      key={specialty}
                      className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <FaStethoscope className="text-blue-600 mr-2 text-sm" />
                      <span className="text-blue-800 text-sm font-medium">{specialty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <FaUserMd className="text-purple-600 mr-3" />
                  Medical Team
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedHospital.doctors?.map((doctor, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                          <FaUserMd className="text-purple-600 text-lg" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{doctor.name}</h4>
                          <p className="text-purple-600 text-sm font-medium mb-2">{doctor.specialty}</p>
                          {doctor.experience && (
                            <div className="flex items-center text-slate-500 text-xs">
                              <FaClock className="mr-1" />
                              <span>{doctor.experience} years experience</span>
                            </div>
                          )}
                          <div className="mt-3 flex items-center space-x-2">
                            <button
                              onClick={() => openAppointmentDialog(doctor, selectedHospital)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                            >
                              Book Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 4, bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', borderTop: '1px solid #e2e8f0' }}>
            <div className="flex flex-wrap gap-3 w-full justify-center">
              <Button
                variant="outlined"
                startIcon={<FaDirections />}
                onClick={() => handleDirections(selectedHospital)}
                sx={{
                  color: '#3b82f6',
                  borderColor: '#3b82f6',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#eff6ff',
                    borderColor: '#2563eb',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                  }
                }}
              >
                Get Directions
              </Button>

              {selectedHospital.phone && (
                <Button
                  variant="contained"
                  startIcon={<FaPhone />}
                  onClick={() => handleCall(selectedHospital)}
                  sx={{
                    bgcolor: '#059669',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#047857',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                    }
                  }}
                >
                  Call Hospital
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<FaStethoscope />}
                onClick={() => handleBookAppointment(selectedHospital)}
                sx={{
                  bgcolor: '#2563eb',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }
                }}
              >
                Book Appointment
              </Button>
            </div>
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

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-800 font-semibold mb-2">
                  ✅ Secure Booking System:
                </p>
                <p className="text-sm text-slate-600">
                  Your appointment will be confirmed and the hospital will be notified automatically.
                  You'll receive a confirmation email with all the details.
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
              onClick={handleAppointmentSubmit}
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
