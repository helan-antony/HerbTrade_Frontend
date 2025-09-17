import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Tabs, Tab, Alert, CircularProgress, Avatar, Divider, FormControl,
  InputLabel, Select, MenuItem, AppBar, Toolbar, Badge, Drawer,
  List, ListItem, ListItemIcon, ListItemText, ListItemButton
} from '@mui/material';
import {
  FaUsers, FaShoppingCart, FaHospital, FaChartLine,
  FaEye, FaEdit, FaTrash, FaUserCheck, FaUserTimes,
  FaPlus, FaDownload, FaSync, FaHeart, FaCalendarAlt,
  FaBell, FaTachometerAlt, FaFileExport, FaBars, FaTimes, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function EnhancedAdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [addEmployeeDialog, setAddEmployeeDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetailsDialog, setEmployeeDetailsDialog] = useState(false);
  const [editEmployeeDialog, setEditEmployeeDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetailsDialog, setBookingDetailsDialog] = useState(false);
  const [editBookingDialog, setEditBookingDialog] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveDetailsDialog, setLeaveDetailsDialog] = useState(false);
  const [leaveStats, setLeaveStats] = useState({});
  const [deleteBookingDialog, setDeleteBookingDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    hospitalName: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    consultationFee: '',
    bookingStatus: 'Pending',
    paymentStatus: 'Pending'
  });
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: ''
  });
  const [editEmployeeData, setEditEmployeeData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: ''
  });
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const [usersRes, employeesRes, statsRes, bookingsRes, leavesRes, leaveStatsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/employees', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/hospital-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/leaves', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/leaves/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        // Handle both direct array and object with data property
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : (bookingsData.data || []);
        setBookings(bookingsArray);
      } else {
        // Fallback to sample data if API fails
        setBookings([
          {
            _id: 'demo-booking-1',
            patientDetails: { name: 'John Doe', phone: '+91 98765 43210' },
            hospitalDetails: { name: 'Ayurvedic Wellness Center' },
            appointmentDetails: {
              appointmentDate: '2024-01-15',
              appointmentTime: '10:00',
              doctorName: 'Dr. Rajesh Kumar'
            },
            bookingStatus: 'Confirmed',
            paymentDetails: { consultationFee: 500, paymentStatus: 'Paid' },
            createdAt: new Date().toISOString()
          },
          {
            _id: '507f1f77bcf86cd799439012',
            patientDetails: { name: 'Jane Smith', phone: '+91 87654 32109' },
            hospitalDetails: { name: 'Herbal Care Hospital' },
            appointmentDetails: {
              appointmentDate: '2024-01-16',
              appointmentTime: '14:30',
              doctorName: 'Dr. Priya Sharma'
            },
            bookingStatus: 'Pending',
            paymentDetails: { consultationFee: 600, paymentStatus: 'Pending' },
            createdAt: new Date().toISOString()
          }
        ]);
      }

      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
      }

      if (leaveStatsRes.ok) {
        const leaveStatsData = await leaveStatsRes.json();
        setLeaveStats(leaveStatsData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Demo data fallback
      setUsers([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          isActive: true,
          createdAt: new Date().toISOString(),
          stats: {
            cartItems: 3,
            wishlistItems: 5,
            totalBookings: 2,
            lastActivity: new Date().toISOString()
          }
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 87654 32109',
          isActive: true,
          createdAt: new Date().toISOString(),
          stats: {
            cartItems: 1,
            wishlistItems: 8,
            totalBookings: 1,
            lastActivity: new Date().toISOString()
          }
        }
      ]);
      
      setEmployees([
        {
          _id: '1',
          name: 'Alice Johnson',
          email: 'alice@herbtrade.com',
          role: 'employee',
          department: 'Customer Support',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Bob Smith',
          email: 'bob@herbtrade.com',
          role: 'manager',
          department: 'Sales',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
      
      setStats({
        totalUsers: 150,
        totalSellers: 25,
        totalEmployees: 8,
        totalRevenue: '125,000',
        ordersToday: '45'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ));
        toast.success(result.message);
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      // Demo success
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } finally {
      setActionLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedUser(result.data);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Demo data
      const user = users.find(u => u._id === userId);
      setSelectedUser({
        ...user,
        cart: { items: [], totalItems: user.stats?.cartItems || 0, totalAmount: 1250 },
        wishlist: { items: [] },
        bookings: [],
        stats: {
          totalBookings: user.stats?.totalBookings || 0,
          pendingBookings: 1,
          completedBookings: 1,
          cartValue: 1250,
          wishlistCount: user.stats?.wishlistItems || 0
        }
      });
    } finally {
      setActionLoading(false);
      setUserDetailsDialog(true);
    }
  };

  const addEmployee = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      // Prepare data based on role
      const submitData = { ...employeeData };
      
      // If it's a delivery agent, include location data
      if (employeeData.role === 'delivery') {
        if (employeeData.latitude && employeeData.longitude) {
          submitData.currentLocation = {
            type: 'Point',
            coordinates: [parseFloat(employeeData.longitude), parseFloat(employeeData.latitude)]
          };
        }
        submitData.maxDeliveryRadius = employeeData.maxDeliveryRadius ? parseInt(employeeData.maxDeliveryRadius) : 10;
        submitData.vehicleType = employeeData.vehicleType || 'bike';
        submitData.licenseNumber = employeeData.licenseNumber || '';
        submitData.isAvailable = true;
      }

      const response = await fetch('http://localhost:5000/api/admin/add-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        setEmployees(prev => [result.employee, ...prev]);
        setEmployeeData({ name: '', email: '', role: 'employee', department: '' });
        setAddEmployeeDialog(false);
        toast.success('Employee added successfully! Email sent with login credentials.');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeDetailsDialog(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department || ''
    });
    setEditEmployeeDialog(true);
  };

  const toggleEmployeeStatus = async (employeeId, currentStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Update the employees list
        setEmployees(prev => prev.map(employee =>
          employee._id === employeeId
            ? { ...employee, isActive: !currentStatus }
            : employee
        ));
        // Update selectedEmployee if it's the one being toggled
        if (selectedEmployee && selectedEmployee._id === employeeId) {
          setSelectedEmployee(prev => ({ ...prev, isActive: !currentStatus }));
        }
        setSnackbar({
          open: true,
          message: result.message || `Employee ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
          severity: 'success'
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to update employee status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      // Demo success - update local state even if API fails
      setEmployees(prev => prev.map(employee =>
        employee._id === employeeId
          ? { ...employee, isActive: !currentStatus }
          : employee
      ));
      if (selectedEmployee && selectedEmployee._id === employeeId) {
        setSelectedEmployee(prev => ({ ...prev, isActive: !currentStatus }));
      }
      setSnackbar({
        open: true,
        message: `Employee ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
        severity: 'success'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableEmployee = async (employee) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/admin/employees/${employee._id}/disable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Employee disabled successfully',
          severity: 'success'
        });
        fetchEmployees(); // Refresh the employee list
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to disable employee',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error disabling employee:', error);
      setSnackbar({
        open: true,
        message: 'Error disabling employee',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateEmployee = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/admin/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editEmployeeData)
      });

      if (response.ok) {
        const result = await response.json();
        setEmployees(prev => prev.map(emp =>
          emp._id === selectedEmployee._id ? result.employee : emp
        ));
        setEditEmployeeDialog(false);
        setSelectedEmployee(null);
        setEditEmployeeData({ name: '', email: '', role: 'employee', department: '' });
        toast.success('Employee updated successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.message || 'Failed to update employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Booking Management Functions
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingDetailsDialog(true);
  };

  const handleEditBooking = () => {};

  const handleDeleteBooking = () => {};

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/admin/hospital-bookings/${bookingToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setBookings(prev => prev.filter(booking => booking._id !== bookingToDelete._id));
        setDeleteBookingDialog(false);
        setBookingToDelete(null);
        setSnackbar({
          open: true,
          message: 'Booking deleted successfully!',
          severity: 'success'
        });
      } else {
        const error = await response.json();
        // Handle demo data case
        if (response.status === 400 && error.message && error.message.includes('demo data')) {
          // For demo data, just remove from local state
          setBookings(prev => prev.filter(booking => booking._id !== bookingToDelete._id));
          setDeleteBookingDialog(false);
          setBookingToDelete(null);
          setSnackbar({
            open: true,
            message: 'Demo booking removed from display',
            severity: 'info'
          });
        } else {
          throw new Error(error.error || 'Failed to delete booking');
        }
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete booking',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/admin/hospital-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingStatus: status })
      });

      if (response.ok) {
        const result = await response.json();
        setBookings(prev => prev.map(booking =>
          booking._id === bookingId ? { ...booking, bookingStatus: status } : booking
        ));
        toast.success(`Booking status updated to ${status}!`);
      } else {
        let message = 'Failed to update booking status';
        try {
          const error = await response.json();
          message = error.error || error.message || message;
        } catch (_) {
          // non-JSON (e.g., HTML) response
        }
        throw new Error(message);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error(error.message || 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const updateBooking = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const updateData = {
        patientDetails: {
          name: bookingData.patientName,
          phone: bookingData.patientPhone,
          email: bookingData.patientEmail
        },
        hospitalDetails: {
          name: bookingData.hospitalName
        },
        appointmentDetails: {
          doctorName: bookingData.doctorName,
          appointmentDate: bookingData.appointmentDate,
          appointmentTime: bookingData.appointmentTime
        },
        paymentDetails: {
          consultationFee: parseFloat(bookingData.consultationFee),
          paymentStatus: bookingData.paymentStatus
        },
        bookingStatus: bookingData.bookingStatus
      };

      const response = await fetch(`http://localhost:5000/api/admin/hospital-bookings/${selectedBooking._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(booking =>
          booking._id === selectedBooking._id ? updatedBooking : booking
        ));
        setEditBookingDialog(false);
        setBookingData({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          hospitalName: '',
          doctorName: '',
          appointmentDate: '',
          appointmentTime: '',
          consultationFee: '',
          bookingStatus: 'Pending',
          paymentStatus: 'Pending'
        });
        toast.success('Booking updated successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.message || 'Failed to update booking');
    } finally {
      setActionLoading(false);
    }
  };

  const exportBookings = () => {
    try {
      // Create CSV content
      const headers = ['Patient Name', 'Phone', 'Hospital', 'Doctor', 'Date', 'Time', 'Fee', 'Status', 'Payment'];
      const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
          `"${booking.patientDetails.name}"`,
          `"${booking.patientDetails.phone}"`,
          `"${booking.hospitalDetails.name}"`,
          `"${booking.appointmentDetails.doctorName}"`,
          `"${booking.appointmentDetails.appointmentDate}"`,
          `"${booking.appointmentDetails.appointmentTime}"`,
          `"₹${booking.paymentDetails.consultationFee}"`,
          `"${booking.bookingStatus}"`,
          `"${booking.paymentDetails.paymentStatus}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `hospital_bookings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Bookings exported successfully!');
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
    }
  };

  const exportUsers = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Phone', 'Registration Date', 'Status', 'Cart Items', 'Wishlist Items', 'Total Bookings', 'Cart Value'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          `"${user.name}"`,
          `"${user.email}"`,
          `"${user.phone || 'N/A'}"`,
          `"${new Date(user.createdAt).toLocaleDateString()}"`,
          `"${user.isActive !== false ? 'Active' : 'Inactive'}"`,
          `"${user.stats?.cartItems || 0}"`,
          `"${user.stats?.wishlistItems || 0}"`,
          `"${user.stats?.totalBookings || 0}"`,
          `"₹${user.stats?.cartValue || 0}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `registered_users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Users exported successfully!');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  const exportEmployees = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Role', 'Department', 'Join Date', 'Status'];
      const csvContent = [
        headers.join(','),
        ...employees.map(employee => [
          `"${employee.name}"`,
          `"${employee.email}"`,
          `"${employee.role}"`,
          `"${employee.department || 'General'}"`,
          `"${new Date(employee.createdAt).toLocaleDateString()}"`,
          `"${employee.isActive ? 'Active' : 'Disabled'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Employees exported successfully!');
    } catch (error) {
      console.error('Error exporting employees:', error);
      toast.error('Failed to export employees');
    }
  };

  // Leave Management Functions
  const handleLeaveAction = async (leaveId, status, adminComment = '') => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/admin/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminComment })
      });

      if (response.ok) {
        const result = await response.json();
        setLeaves(prev => prev.map(leave =>
          leave._id === leaveId ? result.leave : leave
        ));
        setLeaveDetailsDialog(false);
        toast.success(result.message);
        
        // Refresh leave stats
        const statsResponse = await fetch('http://localhost:5000/api/admin/leaves/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setLeaveStats(statsData);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update leave status');
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(error.message || 'Failed to update leave status');
    } finally {
      setActionLoading(false);
    }
  };

  const getLeaveStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'error';
      case 'personal': return 'info';
      case 'vacation': return 'success';
      case 'emergency': return 'warning';
      default: return 'default';
    }
  };

  const exportLeaves = () => {
    try {
      const headers = ['Employee Name', 'Email', 'Type', 'Reason', 'Start Date', 'End Date', 'Status', 'Admin Comment', 'Applied Date'];
      const csvContent = [
        headers.join(','),
        ...leaves.map(leave => [
          `"${leave.seller?.name || 'N/A'}"`,
          `"${leave.seller?.email || 'N/A'}"`,
          `"${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}"`,
          `"${leave.reason}"`,
          `"${new Date(leave.startDate).toLocaleDateString()}"`,
          `"${new Date(leave.endDate).toLocaleDateString()}"`,
          `"${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}"`,
          `"${leave.adminComment || 'N/A'}"`,
          `"${new Date(leave.createdAt).toLocaleDateString()}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leave_applications_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Leave applications exported successfully!');
    } catch (error) {
      console.error('Error exporting leaves:', error);
      toast.error('Failed to export leave applications');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      case 'Completed': return 'info';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      case 'Refunded': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#2d5016' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '0 20px 20px 0',
          }
        }}
      >
        <div className="p-6">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FaTimes className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Admin Profile Section */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Admin</h3>
              <p className="text-emerald-100 text-sm">Administrator</p>
            </div>
          </div>

          {/* Menu Items */}
          <List sx={{ padding: 0 }}>
            <ListItemButton
              onClick={() => {
                setTabValue(0);
                setSidebarOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                <FaTachometerAlt />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </ListItemButton>

            <ListItemButton
              onClick={() => {
                setTabValue(1);
                setSidebarOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                <FaUsers />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>

            <ListItemButton
              onClick={() => {
                setTabValue(2);
                setSidebarOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                <FaUserCheck />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>

            <ListItemButton
              onClick={() => {
                setTabValue(3);
                setSidebarOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                <FaHospital />
              </ListItemIcon>
              <ListItemText primary="Bookings" />
            </ListItemButton>

            <ListItemButton
              onClick={() => {
                exportBookings();
                setSidebarOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                <FaFileExport />
              </ListItemIcon>
              <ListItemText primary="Export Bookings" />
            </ListItemButton>

            <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#ef4444', minWidth: '40px' }}>
                <FaSignOutAlt />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: '#ef4444' }} />
            </ListItemButton>
          </List>
        </div>
      </Drawer>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-lg relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors duration-200"
              >
                <FaBars className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-emerald-700">
                  🌿 HerbTrade - Admin Dashboard
                </h1>
                <p className="text-slate-600 font-medium">
                  Advanced platform management and comprehensive analytics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <div className="relative">
                <button className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
                  <FaBell className="w-5 h-5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    5
                  </span>
                </button>
              </div>

              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">Total Users</p>
                <p className="text-3xl font-playfair font-bold text-slate-900">
                  {stats.totalUsers || 0}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">Total Revenue</p>
                <p className="text-3xl font-playfair font-bold text-slate-900">
                  ₹{stats.totalRevenue || '0'}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                <FaChartLine className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Orders Today Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">Orders Today</p>
                <p className="text-3xl font-playfair font-bold text-slate-900">
                  {stats.ordersToday || 0}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                <FaShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Hospital Bookings Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">Hospital Bookings</p>
                <p className="text-3xl font-playfair font-bold text-slate-900">
                  {bookings.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-lg">
                <FaHospital className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>


        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setTabValue(0)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tabValue === 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105'
              }`}
            >
              <FaUsers className="w-4 h-4" />
              <span>User Management</span>
            </button>
            <button
              onClick={() => setTabValue(1)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tabValue === 1
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105'
              }`}
            >
              <FaUserCheck className="w-4 h-4" />
              <span>Employee Management</span>
            </button>
            <button
              onClick={() => setTabValue(2)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tabValue === 2
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105'
              }`}
            >
              <FaHospital className="w-4 h-4" />
              <span>Hospital Bookings</span>
            </button>
            <button
              onClick={() => setTabValue(3)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tabValue === 3
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105'
              }`}
            >
              <FaCalendarAlt className="w-4 h-4" />
              <span>Leave Management</span>
            </button>
            <button
              onClick={() => setTabValue(4)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tabValue === 4
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105'
              }`}
            >
              <FaChartLine className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>


        {/* User Management Tab */}
        {tabValue === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-slate-900">
                Registered Users ({users.length})
              </h2>
              <button
                onClick={exportUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                title="Export users to CSV"
              >
                <FaDownload className="w-4 h-4" />
                <span>Export Users</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">User</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Contact</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Registration Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Activity</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">ID: {user._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">{user.email}</p>
                        <p className="text-sm text-slate-500">{user.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Cart: {user.stats?.cartItems || 0}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            Wishlist: {user.stats?.wishlistItems || 0}
                          </span>
                          <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">
                            Bookings: {user.stats?.totalBookings || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewUserDetails(user._id)}
                            disabled={actionLoading}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                              user.isActive
                                ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                : 'bg-green-100 hover:bg-green-200 text-green-600'
                            }`}
                          >
                            {user.isActive ? <FaUserTimes className="w-4 h-4" /> : <FaUserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Employee Management Tab */}
        {tabValue === 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-slate-900">
                Employees ({employees.length})
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportEmployees}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  title="Export employees to CSV"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Export Employees</span>
                </button>
                <button
                  onClick={() => setAddEmployeeDialog(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Role & Department</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Contact</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Join Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{employee.name}</p>
                            <p className="text-sm text-slate-500">ID: {employee._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900 capitalize">{employee.role}</p>
                        <p className="text-sm text-slate-500">{employee.department || 'General'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">{employee.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          employee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewEmployee(employee)}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors duration-200"
                            title="View Employee Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200"
                            title="Edit Employee"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* Hospital Bookings Tab */}
        {tabValue === 2 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-slate-900">
                Hospital Bookings ({bookings.length})
              </h2>
              <button
                onClick={exportBookings}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                title="Export bookings to CSV"
              >
                <FaDownload className="w-4 h-4" />
                <span>Export Bookings</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Patient</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Hospital</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Appointment</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Fee</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Payment</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{booking.patientDetails.name}</p>
                        <p className="text-sm text-slate-500">{booking.patientDetails.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">{booking.hospitalDetails.name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">{booking.appointmentDetails.appointmentDate}</p>
                        <p className="text-sm text-slate-500">
                          {booking.appointmentDetails.appointmentTime} - {booking.appointmentDetails.doctorName}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">₹{booking.paymentDetails.consultationFee}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          booking.paymentDetails.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                          booking.paymentDetails.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.paymentDetails.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors duration-200"
                            title="View Booking Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* Leave Management Tab */}
        {tabValue === 3 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-slate-900">
                Leave Management ({leaves.length})
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={exportLeaves}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Leave Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Applications</p>
                    <p className="text-2xl font-bold">{leaveStats.totalLeaves || 0}</p>
                  </div>
                  <FaCalendarAlt className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending Review</p>
                    <p className="text-2xl font-bold">{leaveStats.pendingLeaves || 0}</p>
                  </div>
                  <FaBell className="w-8 h-8 text-yellow-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Approved</p>
                    <p className="text-2xl font-bold">
                      {leaveStats.statusStats?.find(s => s._id === 'approved')?.count || 0}
                    </p>
                  </div>
                  <FaUserCheck className="w-8 h-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Rejected</p>
                    <p className="text-2xl font-bold">
                      {leaveStats.statusStats?.find(s => s._id === 'rejected')?.count || 0}
                    </p>
                  </div>
                  <FaUserTimes className="w-8 h-8 text-red-200" />
                </div>
              </div>
            </div>

            {/* Leave Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Reason</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Applied</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-slate-900">{leave.seller?.name || 'N/A'}</div>
                          <div className="text-sm text-slate-600">{leave.seller?.email || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{leave.seller?.department || 'General'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Chip
                          label={leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                          color={getLeaveTypeColor(leave.type)}
                          size="small"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div>{new Date(leave.startDate).toLocaleDateString()}</div>
                          <div className="text-slate-600">to {new Date(leave.endDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">
                            {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-700 max-w-xs truncate" title={leave.reason}>
                          {leave.reason}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Chip
                          label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          color={getLeaveStatusColor(leave.status)}
                          size="small"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setLeaveDetailsDialog(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <FaEye />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {leaves.length === 0 && (
                <div className="text-center py-12">
                  <FaCalendarAlt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No leave applications found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tabValue === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-playfair font-bold text-slate-900">Platform Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Engagement Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 p-6">
                <h3 className="text-xl font-playfair font-bold text-slate-900 mb-4">User Engagement</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {users.filter(u => u.isActive).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Cart Items</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {users.reduce((sum, user) => sum + (user.stats?.cartItems || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Wishlist Items</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {users.reduce((sum, user) => sum + (user.stats?.wishlistItems || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Statistics Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 p-6">
                <h3 className="text-xl font-playfair font-bold text-slate-900 mb-4">Booking Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-slate-900">{bookings.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Confirmed Bookings</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {bookings.filter(b => b.bookingStatus === 'Confirmed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Pending Bookings</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {bookings.filter(b => b.bookingStatus === 'Pending').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Dialog - keeping Material-UI for complex dialogs */}
      <Dialog
        open={userDetailsDialog}
        onClose={() => setUserDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(236, 253, 245, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(16, 185, 129, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
            User Details
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedUser && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{
                    fontFamily: 'Playfair Display',
                    color: '#1e293b',
                    borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
                    pb: 2
                  }}>
                    Personal Information
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Name</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedUser.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Email</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedUser.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Phone</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedUser.phone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={2}>Status</Typography>
                    <Chip
                      label={selectedUser.isActive ? 'Active' : 'Disabled'}
                      sx={{
                        backgroundColor: selectedUser.isActive ? '#dcfce7' : '#fecaca',
                        color: selectedUser.isActive ? '#166534' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1,
                        border: selectedUser.isActive ? '1px solid #bbf7d0' : '1px solid #fca5a5'
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{
                    fontFamily: 'Playfair Display',
                    color: '#1e293b',
                    borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
                    pb: 2
                  }}>
                    Activity Summary
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Cart Items</Typography>
                    <Typography variant="h3" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
                      {selectedUser.stats?.cartItems || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Wishlist Items</Typography>
                    <Typography variant="h3" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
                      {selectedUser.stats?.wishlistCount || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Total Bookings</Typography>
                    <Typography variant="h3" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
                      {selectedUser.stats?.totalBookings || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Cart Value</Typography>
                    <Typography variant="h3" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#059669' }}>
                      ₹{selectedUser.stats?.cartValue || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setUserDetailsDialog(false)}
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              }
            }}
          >
            CLOSE
          </Button>
          {selectedUser && (
            <Button
              variant="contained"
              onClick={() => toggleUserStatus(selectedUser._id, selectedUser.isActive)}
              disabled={actionLoading}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: selectedUser.isActive ? '#dc2626' : '#059669',
                fontWeight: 700,
                borderRadius: '12px',
                border: selectedUser.isActive ? '2px solid #b91c1c' : '2px solid #047857',
                boxShadow: selectedUser.isActive ? '0 4px 14px 0 rgba(220, 38, 38, 0.2)' : '0 4px 14px 0 rgba(5, 150, 105, 0.2)',
                '&:hover': {
                  backgroundColor: selectedUser.isActive ? '#b91c1c' : '#047857',
                  border: selectedUser.isActive ? '2px solid #991b1b' : '2px solid #065f46',
                  boxShadow: selectedUser.isActive ? '0 6px 20px 0 rgba(220, 38, 38, 0.3)' : '0 6px 20px 0 rgba(5, 150, 105, 0.3)'
                }
              }}
              sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
            >
              {selectedUser.isActive ? 'Disable User' : 'Enable User'}
            </Button>
          )}
        </DialogActions>
      </Dialog>


      <Dialog
        open={addEmployeeDialog}
        onClose={() => setAddEmployeeDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(236, 253, 245, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(16, 185, 129, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
            Add New Employee
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={employeeData.name}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, name: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#10b981'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 14px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={employeeData.email}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#10b981'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 14px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{
                  color: '#6b7280',
                  fontWeight: 500,
                  '&.Mui-focused': { color: '#10b981' }
                }}>
                  Role
                </InputLabel>
                <Select
                  value={employeeData.role}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, role: e.target.value }))}
                  label="Role"
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    },
                    '& .MuiSelect-select': {
                      padding: '16px 14px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#1e293b'
                    }
                  }}
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={employeeData.department}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Customer Support, Sales"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#10b981'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 14px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            
            {/* Location fields for delivery agents */}
            {employeeData.role === 'delivery' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 600, 
                    mb: 2,
                    fontFamily: 'Playfair Display'
                  }}>
                    Delivery Location Settings
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Latitude"
                    type="number"
                    value={employeeData.latitude || ''}
                    onChange={(e) => setEmployeeData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="e.g., 12.9716"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(203, 213, 225, 0.5)',
                        '&:hover': {
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                        '&.Mui-focused': {
                          border: '2px solid #10b981',
                          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#10b981'
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '16px 14px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#1e293b'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Longitude"
                    type="number"
                    value={employeeData.longitude || ''}
                    onChange={(e) => setEmployeeData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 77.5946"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(203, 213, 225, 0.5)',
                        '&:hover': {
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                        '&.Mui-focused': {
                          border: '2px solid #10b981',
                          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#10b981'
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '16px 14px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#1e293b'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Delivery Radius (km)"
                    type="number"
                    value={employeeData.maxDeliveryRadius || ''}
                    onChange={(e) => setEmployeeData(prev => ({ ...prev, maxDeliveryRadius: e.target.value }))}
                    placeholder="e.g., 10"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(203, 213, 225, 0.5)',
                        '&:hover': {
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                        '&.Mui-focused': {
                          border: '2px solid #10b981',
                          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#10b981'
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '16px 14px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#1e293b'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{
                      color: '#6b7280',
                      fontWeight: 500,
                      '&.Mui-focused': { color: '#10b981' }
                    }}>
                      Vehicle Type
                    </InputLabel>
                    <Select
                      value={employeeData.vehicleType || 'bike'}
                      onChange={(e) => setEmployeeData(prev => ({ ...prev, vehicleType: e.target.value }))}
                      label="Vehicle Type"
                      sx={{
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(203, 213, 225, 0.5)',
                        '&:hover': {
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                        '&.Mui-focused': {
                          border: '2px solid #10b981',
                          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        },
                        '& .MuiSelect-select': {
                          padding: '16px 14px',
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: '#1e293b'
                        }
                      }}
                    >
                      <MenuItem value="bike">Bike</MenuItem>
                      <MenuItem value="scooter">Scooter</MenuItem>
                      <MenuItem value="car">Car</MenuItem>
                      <MenuItem value="van">Van</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={employeeData.licenseNumber || ''}
                    onChange={(e) => setEmployeeData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    placeholder="e.g., DL123456789"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(203, 213, 225, 0.5)',
                        '&:hover': {
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                        '&.Mui-focused': {
                          border: '2px solid #10b981',
                          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#10b981'
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '16px 14px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#1e293b'
                      }
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Alert
            severity="info"
            sx={{
              mt: 4,
              borderRadius: '16px',
              backgroundColor: 'rgba(219, 234, 254, 0.8)',
              border: '1px solid rgba(147, 197, 253, 0.5)',
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-icon': {
                color: '#3b82f6'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e40af' }}>
              <strong>Note:</strong> Login credentials will be automatically generated and sent to the employee's email address.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setAddEmployeeDialog(false)}
            disabled={actionLoading}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              },
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={addEmployee}
            disabled={actionLoading || !employeeData.name || !employeeData.email}
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <FaPlus />}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: '#10b981',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #059669',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.2)',
              '&:hover': {
                backgroundColor: '#059669',
                border: '2px solid #047857',
                boxShadow: '0 6px 20px 0 rgba(16, 185, 129, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                border: '2px solid #6b7280',
                boxShadow: 'none'
              }
            }}
          >
            {actionLoading ? 'ADDING...' : 'ADD EMPLOYEE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Dialog (View) */}
      <Dialog
        open={employeeDetailsDialog}
        onClose={() => setEmployeeDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(236, 253, 245, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(16, 185, 129, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
            Employee Details
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedEmployee && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{
                    fontFamily: 'Playfair Display',
                    color: '#1e293b',
                    borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
                    pb: 2
                  }}>
                    Personal Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Full Name</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedEmployee.name}</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Email Address</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedEmployee.email}</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Employee ID</Typography>
                    <Typography variant="body1" fontWeight={500} color="#64748b">{selectedEmployee._id}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={2}>Status</Typography>
                    <Chip
                      label={selectedEmployee.isActive ? 'Active' : 'Disabled'}
                      sx={{
                        backgroundColor: selectedEmployee.isActive ? '#dcfce7' : '#fecaca',
                        color: selectedEmployee.isActive ? '#166534' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1,
                        border: selectedEmployee.isActive ? '1px solid #bbf7d0' : '1px solid #fca5a5'
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{
                    fontFamily: 'Playfair Display',
                    color: '#1e293b',
                    borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
                    pb: 2
                  }}>
                    Work Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Role</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b" sx={{ textTransform: 'capitalize' }}>
                      {selectedEmployee.role}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Department</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">
                      {selectedEmployee.department || 'General'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Join Date</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">
                      {new Date(selectedEmployee.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Account Created</Typography>
                    <Typography variant="body1" fontWeight={500} color="#64748b">
                      {new Date(selectedEmployee.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setEmployeeDetailsDialog(false)}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              }
            }}
          >
            CLOSE
          </Button>
          {selectedEmployee && (
            <Button
              onClick={() => toggleEmployeeStatus(selectedEmployee._id, selectedEmployee.isActive)}
              disabled={actionLoading}
              sx={{
                px: 6,
                py: 2,
                backgroundColor: selectedEmployee.isActive ? '#ef4444' : '#059669',
                color: 'white',
                fontWeight: 700,
                borderRadius: '12px',
                border: selectedEmployee.isActive ? '2px solid #dc2626' : '2px solid #047857',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                boxShadow: selectedEmployee.isActive
                  ? '0 4px 14px 0 rgba(239, 68, 68, 0.2)'
                  : '0 4px 14px 0 rgba(5, 150, 105, 0.2)',
                '&:hover': {
                  backgroundColor: selectedEmployee.isActive ? '#dc2626' : '#047857',
                  border: selectedEmployee.isActive ? '2px solid #b91c1c' : '2px solid #065f46',
                  boxShadow: selectedEmployee.isActive
                    ? '0 6px 20px 0 rgba(239, 68, 68, 0.3)'
                    : '0 6px 20px 0 rgba(5, 150, 105, 0.3)'
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }
              }}
            >
              {selectedEmployee.isActive ? 'DISABLE EMPLOYEE' : 'ENABLE EMPLOYEE'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog
        open={editEmployeeDialog}
        onClose={() => setEditEmployeeDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(236, 253, 245, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(16, 185, 129, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
            Edit Employee
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={editEmployeeData.name}
                onChange={(e) => setEditEmployeeData(prev => ({ ...prev, name: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#10b981'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 14px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={editEmployeeData.email}
                onChange={(e) => setEditEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#10b981'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 14px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{
                  color: '#6b7280',
                  fontWeight: 500,
                  '&.Mui-focused': { color: '#10b981' }
                }}>
                  Role
                </InputLabel>
                <Select
                  value={editEmployeeData.role}
                  onChange={(e) => setEditEmployeeData(prev => ({ ...prev, role: e.target.value }))}
                  label="Role"
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    },
                    '& .MuiSelect-select': {
                      padding: '16px 14px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#1e293b'
                    }
                  }}
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={editEmployeeData.department}
                onChange={(e) => setEditEmployeeData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Customer Support, Sales"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(203, 213, 225, 0.5)',
                    '&:hover': {
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#10b981'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 14px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setEditEmployeeDialog(false)}
            disabled={actionLoading}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              },
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={updateEmployee}
            disabled={actionLoading || !editEmployeeData.name || !editEmployeeData.email}
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <FaEdit />}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: '#3b82f6',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #2563eb',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.2)',
              '&:hover': {
                backgroundColor: '#2563eb',
                border: '2px solid #1d4ed8',
                boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                border: '2px solid #6b7280',
                boxShadow: 'none'
              }
            }}
          >
            {actionLoading ? 'UPDATING...' : 'UPDATE EMPLOYEE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details Dialog (View) */}
      <Dialog
        open={bookingDetailsDialog}
        onClose={() => setBookingDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(236, 253, 245, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(16, 185, 129, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
            Booking Details
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedBooking && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{
                    fontFamily: 'Playfair Display',
                    color: '#1e293b',
                    borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
                    pb: 2
                  }}>
                    Patient Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Patient Name</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedBooking.patientDetails.name}</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Phone Number</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedBooking.patientDetails.phone}</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Email</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedBooking.patientDetails.email || 'N/A'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={2}>Booking Status</Typography>
                    <Chip
                      label={selectedBooking.bookingStatus}
                      sx={{
                        backgroundColor: selectedBooking.bookingStatus === 'Confirmed' ? '#dcfce7' :
                                        selectedBooking.bookingStatus === 'Pending' ? '#fef3c7' : '#fecaca',
                        color: selectedBooking.bookingStatus === 'Confirmed' ? '#166534' :
                               selectedBooking.bookingStatus === 'Pending' ? '#92400e' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{
                    fontFamily: 'Playfair Display',
                    color: '#1e293b',
                    borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
                    pb: 2
                  }}>
                    Appointment Details
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Hospital</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedBooking.hospitalDetails.name}</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Doctor</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">{selectedBooking.appointmentDetails.doctorName}</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Date & Time</Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">
                      {selectedBooking.appointmentDetails.appointmentDate} at {selectedBooking.appointmentDetails.appointmentTime}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Consultation Fee</Typography>
                    <Typography variant="h6" fontWeight={600} color="#059669">
                      ₹{selectedBooking.paymentDetails.consultationFee}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} mb={2}>Payment Status</Typography>
                    <Chip
                      label={selectedBooking.paymentDetails.paymentStatus}
                      sx={{
                        backgroundColor: selectedBooking.paymentDetails.paymentStatus === 'Paid' ? '#dcfce7' :
                                        selectedBooking.paymentDetails.paymentStatus === 'Pending' ? '#fef3c7' : '#fecaca',
                        color: selectedBooking.paymentDetails.paymentStatus === 'Paid' ? '#166534' :
                               selectedBooking.paymentDetails.paymentStatus === 'Pending' ? '#92400e' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setBookingDetailsDialog(false)}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              }
            }}
          >
            CLOSE
          </Button>
          {selectedBooking && selectedBooking.bookingStatus !== 'Confirmed' && (
            <Button
              onClick={() => {
                updateBookingStatus(selectedBooking._id, 'Confirmed');
                setBookingDetailsDialog(false);
              }}
              disabled={actionLoading}
              sx={{
                px: 6,
                py: 2,
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: 700,
                borderRadius: '12px',
                border: '2px solid #059669',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.2)',
                '&:hover': {
                  backgroundColor: '#059669',
                  border: '2px solid #047857',
                  boxShadow: '0 6px 20px 0 rgba(16, 185, 129, 0.3)'
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af',
                  border: '2px solid #6b7280',
                  boxShadow: 'none'
                }
              }}
            >
              CONFIRM BOOKING
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog
        open={editBookingDialog}
        onClose={() => setEditBookingDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(236, 253, 245, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(16, 185, 129, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#1e293b' }}>
            Edit Booking
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={bookingData.patientName}
                onChange={(e) => setBookingData(prev => ({ ...prev, patientName: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Phone"
                value={bookingData.patientPhone}
                onChange={(e) => setBookingData(prev => ({ ...prev, patientPhone: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient Email"
                type="email"
                value={bookingData.patientEmail}
                onChange={(e) => setBookingData(prev => ({ ...prev, patientEmail: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hospital Name"
                value={bookingData.hospitalName}
                onChange={(e) => setBookingData(prev => ({ ...prev, hospitalName: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Doctor Name"
                value={bookingData.doctorName}
                onChange={(e) => setBookingData(prev => ({ ...prev, doctorName: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Date"
                type="date"
                value={bookingData.appointmentDate}
                onChange={(e) => setBookingData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Time"
                value={bookingData.appointmentTime}
                onChange={(e) => setBookingData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                placeholder="e.g., 10:00 AM"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Consultation Fee"
                type="number"
                value={bookingData.consultationFee}
                onChange={(e) => setBookingData(prev => ({ ...prev, consultationFee: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: '#059669', fontWeight: 600 }}>₹</Typography>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Booking Status</InputLabel>
                <Select
                  value={bookingData.bookingStatus}
                  onChange={(e) => setBookingData(prev => ({ ...prev, bookingStatus: e.target.value }))}
                  label="Booking Status"
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' }
                  }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={bookingData.paymentStatus}
                  onChange={(e) => setBookingData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  label="Payment Status"
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' }
                  }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setEditBookingDialog(false)}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              }
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={updateBooking}
            disabled={actionLoading}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: '#10b981',
              color: 'white',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #059669',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.2)',
              '&:hover': {
                backgroundColor: '#059669',
                border: '2px solid #047857',
                boxShadow: '0 6px 20px 0 rgba(16, 185, 129, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                border: '2px solid #6b7280',
                boxShadow: 'none'
              }
            }}
          >
            {actionLoading ? 'UPDATING...' : 'UPDATE BOOKING'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Booking Confirmation Dialog */}
      <Dialog
        open={deleteBookingDialog}
        onClose={() => setDeleteBookingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 251, 249, 0.95), rgba(248, 250, 252, 0.95), rgba(254, 242, 242, 0.3))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.05), rgba(248, 250, 252, 0.5), rgba(239, 68, 68, 0.05))',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          p: 4
        }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontFamily: 'Playfair Display', color: '#dc2626' }}>
            Delete Booking
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {bookingToDelete && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }}>
                Are you sure you want to delete this booking?
              </Typography>

              <Paper sx={{
                p: 3,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(203, 213, 225, 0.5)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight={600} color="#1e293b">
                      Patient: {bookingToDelete.patientDetails.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Hospital: {bookingToDelete.hospitalDetails.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Doctor: {bookingToDelete.appointmentDetails.doctorName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Date: {bookingToDelete.appointmentDetails.appointmentDate} at {bookingToDelete.appointmentDetails.appointmentTime}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="warning" sx={{ mt: 3, borderRadius: '12px' }}>
                This action cannot be undone. The booking will be permanently deleted.
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          background: 'rgba(248, 250, 252, 0.5)',
          gap: 2
        }}>
          <Button
            onClick={() => setDeleteBookingDialog(false)}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: 'rgba(203, 213, 225, 0.8)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.5)'
              }
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={confirmDeleteBooking}
            disabled={actionLoading}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #b91c1c',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.2)',
              '&:hover': {
                backgroundColor: '#b91c1c',
                border: '2px solid #991b1b',
                boxShadow: '0 6px 20px 0 rgba(220, 38, 38, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                border: '2px solid #6b7280',
                boxShadow: 'none'
              }
            }}
          >
            {actionLoading ? 'DELETING...' : 'DELETE BOOKING'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Details Dialog */}
      <Dialog
        open={leaveDetailsDialog}
        onClose={() => setLeaveDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', 
          color: 'white', 
          fontWeight: 700,
          fontSize: '1.5rem',
          textAlign: 'center',
          py: 3
        }}>
          Leave Application Details
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedLeave && (
            <div className="space-y-6">
              {/* Employee Information */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Employee Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Name:</span>
                    <p className="text-slate-900 font-semibold">{selectedLeave.seller?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Email:</span>
                    <p className="text-slate-900">{selectedLeave.seller?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Role:</span>
                    <p className="text-slate-900 capitalize">{selectedLeave.seller?.role || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Department:</span>
                    <p className="text-slate-900">{selectedLeave.seller?.department || 'General'}</p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Leave Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Type:</span>
                    <Chip
                      label={selectedLeave.type.charAt(0).toUpperCase() + selectedLeave.type.slice(1)}
                      color={getLeaveTypeColor(selectedLeave.type)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Status:</span>
                    <Chip
                      label={selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                      color={getLeaveStatusColor(selectedLeave.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Start Date:</span>
                    <p className="text-slate-900 font-semibold">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">End Date:</span>
                    <p className="text-slate-900 font-semibold">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-slate-600">Duration:</span>
                    <p className="text-slate-900 font-semibold">
                      {Math.ceil((new Date(selectedLeave.endDate) - new Date(selectedLeave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason and Description */}
              <div className="bg-green-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Reason & Description</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Reason:</span>
                    <p className="text-slate-900 font-semibold">{selectedLeave.reason}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Description:</span>
                    <p className="text-slate-900 bg-white p-3 rounded-lg border border-slate-200">
                      {selectedLeave.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Review Section */}
              {selectedLeave.status !== 'pending' && (
                <div className="bg-purple-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Admin Review</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Reviewed By:</span>
                      <p className="text-slate-900 font-semibold">{selectedLeave.reviewedBy?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Review Date:</span>
                      <p className="text-slate-900">{selectedLeave.reviewedAt ? new Date(selectedLeave.reviewedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    {selectedLeave.adminComment && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Admin Comment:</span>
                        <p className="text-slate-900 bg-white p-3 rounded-lg border border-slate-200">
                          {selectedLeave.adminComment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Action Section for Pending Leaves */}
              {selectedLeave.status === 'pending' && (
                <div className="bg-yellow-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Admin Action Required</h3>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Admin Comment (Optional)"
                    placeholder="Add any comments about this leave application..."
                    value={selectedLeave.tempAdminComment || ''}
                    onChange={(e) => setSelectedLeave(prev => ({ ...prev, tempAdminComment: e.target.value }))}
                    sx={{ mb: 3 }}
                  />
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleLeaveAction(selectedLeave._id, 'approved', selectedLeave.tempAdminComment)}
                      disabled={actionLoading}
                      variant="contained"
                      color="success"
                      startIcon={<FaUserCheck />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none'
                      }}
                    >
                      {actionLoading ? 'Processing...' : 'Approve Leave'}
                    </Button>
                    <Button
                      onClick={() => handleLeaveAction(selectedLeave._id, 'rejected', selectedLeave.tempAdminComment)}
                      disabled={actionLoading}
                      variant="contained"
                      color="error"
                      startIcon={<FaUserTimes />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none'
                      }}
                    >
                      {actionLoading ? 'Processing...' : 'Reject Leave'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Application Timeline */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Application Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Applied on {new Date(selectedLeave.createdAt).toLocaleDateString()}</span>
                  </div>
                  {selectedLeave.reviewedAt && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${selectedLeave.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-slate-600">
                        {selectedLeave.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(selectedLeave.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => setLeaveDetailsDialog(false)}
            sx={{
              px: 6,
              py: 2,
              backgroundColor: '#6b7280',
              color: 'white',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #4b5563',
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px 0 rgba(107, 114, 128, 0.2)',
              '&:hover': {
                backgroundColor: '#4b5563',
                border: '2px solid #374151',
                boxShadow: '0 6px 20px 0 rgba(107, 114, 128, 0.3)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EnhancedAdminDashboard;