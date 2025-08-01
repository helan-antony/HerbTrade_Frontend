import { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaHospital, FaUserMd, FaClock, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaEdit, FaTrash, FaEye, FaFilter,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaSpinner,
  FaArrowLeft, FaDownload, FaPrint, FaSearch, FaTimes, FaInfoCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip
} from '@mui/material';
import '../styles/ViewBookings.css';

function ViewBookings() {
  const [appointments, setAppointments] = useState([]);
  const [hospitalBookings, setHospitalBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled, completed
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced functionality state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch both types of bookings
      const [appointmentsRes, hospitalBookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/appointments/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/hospital-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData || []);
      }

      if (hospitalBookingsRes.ok) {
        const hospitalBookingsData = await hospitalBookingsRes.json();
        setHospitalBookings(hospitalBookingsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaSpinner className="text-yellow-500" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Combine and filter bookings
  const allBookings = [
    ...appointments.map(apt => ({
      ...apt,
      type: 'appointment',
      id: apt._id,
      hospitalName: apt.hospitalName || apt.hospital?.name,
      doctorName: apt.doctorName || apt.doctor?.name,
      date: apt.date || apt.appointmentDate,
      time: apt.time || apt.appointmentTime,
      status: apt.status || 'pending'
    })),
    ...hospitalBookings.map(booking => ({
      ...booking,
      type: 'hospital_booking',
      id: booking._id,
      hospitalName: booking.hospitalDetails?.name,
      doctorName: booking.appointmentDetails?.doctorName,
      date: booking.appointmentDetails?.appointmentDate,
      time: booking.appointmentDetails?.appointmentTime,
      status: booking.bookingStatus?.toLowerCase() || 'pending'
    }))
  ];

  const filteredBookings = allBookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = !searchQuery || 
      booking.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.doctorName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Enhanced cancel booking with confirmation
  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = bookingToCancel.type === 'appointment'
        ? `http://localhost:5000/api/appointments/${bookingToCancel.id}`
        : `http://localhost:5000/api/hospital-bookings/${bookingToCancel.id}/cancel`;

      const method = bookingToCancel.type === 'appointment' ? 'DELETE' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Booking cancelled successfully');
        fetchAllBookings();
        setShowCancelDialog(false);
        setBookingToCancel(null);
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  // View details functionality
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const closeDetailsDialog = () => {
    setShowDetailsDialog(false);
    setSelectedBooking(null);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  // Reschedule functionality
  const handleReschedule = (booking) => {
    setBookingToReschedule(booking);
    setShowRescheduleDialog(true);
  };

  const closeRescheduleDialog = () => {
    setShowRescheduleDialog(false);
    setBookingToReschedule(null);
  };

  const handleRescheduleSubmit = () => {
    // For now, just show a message and close dialog
    // In a real app, this would open a date/time picker
    toast.info('Reschedule functionality coming soon! Please contact the hospital directly.');
    closeRescheduleDialog();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
              </div>
              <p className="text-xl font-medium text-slate-700">Loading your bookings...</p>
              <p className="text-slate-500">Please wait while we fetch your appointment history</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
              >
                <FaArrowLeft className="text-slate-600" />
              </button>
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 tracking-tight">
                My Bookings
              </h1>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              📅 View and manage all your hospital appointments
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/hospitals')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <FaHospital />
              <span>Book New Appointment</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 p-6 card-ultra">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filter === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 text-xs">
                      ({allBookings.filter(b => b.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-auto">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospitals or doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-80 pl-12 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaCalendarAlt className="text-4xl text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">
              {filter === 'all' ? 'No bookings found' : `No ${filter} bookings`}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? 'Try adjusting your search criteria' : 'Book your first appointment with our partner hospitals!'}
            </p>
            <button
              onClick={() => navigate('/hospitals')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book New Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              <div
                key={booking.id}
                className="card-ultra booking-card p-6 hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FaHospital className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{booking.hospitalName}</h3>
                          <p className="text-slate-600 flex items-center space-x-1">
                            <FaUserMd className="text-sm" />
                            <span>Dr. {booking.doctorName}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(booking.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3 text-slate-600">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>
                          {booking.date ? new Date(booking.date).toLocaleDateString() : 'Date not set'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-600">
                        <FaClock className="text-blue-500" />
                        <span>{booking.time || 'Time not set'}</span>
                      </div>
                    </div>

                    {booking.reason && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1">Reason for visit:</p>
                        <p className="text-slate-700">{booking.reason}</p>
                      </div>
                    )}

                    {booking.type === 'hospital_booking' && booking.medicalInfo?.symptoms && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1">Symptoms:</p>
                        <p className="text-slate-700">{booking.medicalInfo.symptoms}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 lg:w-48">
                    {/* Cancel button - show for pending and confirmed bookings */}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="action-button cancel-button flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all duration-200 border border-red-200 hover:shadow-md"
                      >
                        <FaTimesCircle className="text-sm" />
                        <span>Cancel</span>
                      </button>
                    )}

                    {/* Reschedule button - show for pending and confirmed bookings */}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => handleReschedule(booking)}
                        className="action-button reschedule-button flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-semibold rounded-xl transition-all duration-200 border border-yellow-200 hover:shadow-md"
                      >
                        <FaEdit className="text-sm" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* View Details button - always available */}
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="action-button view-details-button flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all duration-200 border border-blue-200 hover:shadow-md"
                    >
                      <FaEye className="text-sm" />
                      <span>View Details</span>
                    </button>

                    {/* Contact Hospital button for confirmed bookings */}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          if (booking.hospitalPhone) {
                            window.location.href = `tel:${booking.hospitalPhone}`;
                          } else {
                            toast.info('Hospital contact information not available');
                          }
                        }}
                        className="action-button call-button flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-semibold rounded-xl transition-all duration-200 border border-green-200 hover:shadow-md"
                      >
                        <FaPhone className="text-sm" />
                        <span>Call Hospital</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={closeCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaExclamationCircle style={{ color: '#ef4444' }} />
            <Typography variant="h6" component="span">
              Cancel Booking
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to cancel this booking?
          </Typography>
          {bookingToCancel && (
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {bookingToCancel.hospitalName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dr. {bookingToCancel.doctorName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bookingToCancel.date ? new Date(bookingToCancel.date).toLocaleDateString() : 'Date not set'} at {bookingToCancel.time || 'Time not set'}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. You may need to book a new appointment if you change your mind.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={closeCancelDialog}
            variant="outlined"
            disabled={cancelLoading}
          >
            Keep Booking
          </Button>
          <Button
            onClick={confirmCancelBooking}
            variant="contained"
            color="error"
            disabled={cancelLoading}
            startIcon={cancelLoading ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={closeDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaInfoCircle style={{ color: '#3b82f6' }} />
              <Typography variant="h6" component="span">
                Booking Details
              </Typography>
            </Box>
            <Button
              onClick={closeDetailsDialog}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <FaTimes />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ space: 3 }}>
              {/* Hospital Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaHospital style={{ color: '#3b82f6' }} />
                  Hospital Information
                </Typography>
                <Box sx={{ pl: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedBooking.hospitalName}
                  </Typography>
                  {selectedBooking.hospitalAddress && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <FaMapMarkerAlt />
                      {selectedBooking.hospitalAddress}
                    </Typography>
                  )}
                  {selectedBooking.hospitalPhone && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <FaPhone />
                      {selectedBooking.hospitalPhone}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Doctor Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaUserMd style={{ color: '#10b981' }} />
                  Doctor Information
                </Typography>
                <Box sx={{ pl: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Dr. {selectedBooking.doctorName}
                  </Typography>
                  {selectedBooking.department && (
                    <Typography variant="body2" color="text.secondary">
                      Department: {selectedBooking.department}
                    </Typography>
                  )}
                  {selectedBooking.consultationType && (
                    <Typography variant="body2" color="text.secondary">
                      Consultation Type: {selectedBooking.consultationType}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Appointment Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaCalendarAlt style={{ color: '#f59e0b' }} />
                  Appointment Details
                </Typography>
                <Box sx={{ pl: 3 }}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FaCalendarAlt />
                    <strong>Date:</strong> {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : 'Date not set'}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FaClock />
                    <strong>Time:</strong> {selectedBooking.time || 'Time not set'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <strong>Status:</strong>
                    <Chip
                      label={selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
                      color={
                        selectedBooking.status === 'confirmed' ? 'success' :
                        selectedBooking.status === 'pending' ? 'warning' :
                        selectedBooking.status === 'cancelled' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Medical Information */}
              {selectedBooking.reason && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Medical Information
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Reason for visit:</strong>
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.reason}
                      </Typography>
                      {selectedBooking.medicalInfo?.symptoms && (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                            <strong>Symptoms:</strong>
                          </Typography>
                          <Typography variant="body1">
                            {selectedBooking.medicalInfo.symptoms}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* Booking Information */}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Booking Information
                </Typography>
                <Box sx={{ pl: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Booking ID:</strong> {selectedBooking.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Booking Type:</strong> {selectedBooking.type === 'hospital_booking' ? 'Hospital Booking' : 'Appointment'}
                  </Typography>
                  {selectedBooking.createdAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Booked on:</strong> {new Date(selectedBooking.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDetailsDialog} variant="outlined">
            Close
          </Button>
          {selectedBooking && ['pending', 'confirmed'].includes(selectedBooking.status) && (
            <Button
              onClick={() => {
                closeDetailsDialog();
                handleCancelBooking(selectedBooking);
              }}
              variant="contained"
              color="error"
              startIcon={<FaTimesCircle />}
            >
              Cancel Booking
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={showRescheduleDialog}
        onClose={closeRescheduleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaEdit style={{ color: '#f59e0b' }} />
            <Typography variant="h6" component="span">
              Reschedule Appointment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Would you like to reschedule this appointment?
          </Typography>
          {bookingToReschedule && (
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {bookingToReschedule.hospitalName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dr. {bookingToReschedule.doctorName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current: {bookingToReschedule.date ? new Date(bookingToReschedule.date).toLocaleDateString() : 'Date not set'} at {bookingToReschedule.time || 'Time not set'}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please contact the hospital directly to reschedule your appointment. We're working on adding online rescheduling soon!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={closeRescheduleDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRescheduleSubmit}
            variant="contained"
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
            startIcon={<FaPhone />}
          >
            Contact Hospital
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ViewBookings;
