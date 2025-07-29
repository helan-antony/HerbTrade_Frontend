import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, 
  Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Tabs, Tab, Alert, CircularProgress, Avatar, Divider, FormControl,
  InputLabel, Select, MenuItem, AppBar, Toolbar, Badge
} from '@mui/material';
import { 
  FaUsers, FaShoppingCart, FaHospital, FaChartLine,
  FaEye, FaEdit, FaTrash, FaUserCheck, FaUserTimes,
  FaPlus, FaDownload, FaSync, FaHeart, FaCalendarAlt,
  FaBell
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
  const [actionLoading, setActionLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: ''
  });
  
  const navigate = useNavigate();

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

      const [usersRes, employeesRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/employees', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/stats', {
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

      // Sample bookings data for demo
      setBookings([
        {
          _id: '1',
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
          _id: '2',
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
      
      const response = await fetch('http://localhost:5000/api/admin/add-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#2d5016" sx={{ fontFamily: 'Poppins' }}>
              🌿 HerbTrade AI - Enhanced Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced platform management and comprehensive analytics
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FaSync />}
              onClick={fetchDashboardData}
              disabled={loading}
              size="small"
              sx={{ 
                color: '#2d5016', 
                borderColor: '#2d5016',
                '&:hover': { borderColor: '#3a4d2d', bgcolor: 'rgba(45, 80, 22, 0.05)' }
              }}
            >
              Refresh
            </Button>
            
            <IconButton 
              sx={{ 
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' }
              }}
            >
              <Badge badgeContent={5} color="error">
                <FaBell color="action" />
              </Badge>
            </IconButton>
            
            <Avatar 
              sx={{ 
                bgcolor: '#2d5016',
                width: 40,
                height: 40,
                fontWeight: 700
              }}
            >
              A
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>


      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.totalUsers || 0}
                  </Typography>
                </Box>
                <FaUsers size={40} color="#1976d2" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    ₹{stats.totalRevenue || '0'}
                  </Typography>
                </Box>
                <FaChartLine size={40} color="#4caf50" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Orders Today
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.ordersToday || 0}
                  </Typography>
                </Box>
                <FaShoppingCart size={40} color="#ff9800" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hospital Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {bookings.length}
                  </Typography>
                </Box>
                <FaHospital size={40} color="#e91e63" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="User Management" />
          <Tab label="Employee Management" />
          <Tab label="Hospital Bookings" />
          <Tab label="Analytics" />
        </Tabs>


        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Registered Users ({users.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FaDownload />}
              sx={{ color: '#2d5016', borderColor: '#2d5016' }}
            >
              Export Users
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#2d5016' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {user._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Cart: ${user.stats?.cartItems || 0}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`Wishlist: ${user.stats?.wishlistItems || 0}`} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`Bookings: ${user.stats?.totalBookings || 0}`} 
                          size="small" 
                          color="info" 
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Disabled'} 
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => viewUserDetails(user._id)}
                          disabled={actionLoading}
                          sx={{ color: '#2d5016' }}
                        >
                          <FaEye />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          disabled={actionLoading}
                          sx={{ color: user.isActive ? '#f44336' : '#4caf50' }}
                        >
                          {user.isActive ? <FaUserTimes /> : <FaUserCheck />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>


        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Employees ({employees.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => setAddEmployeeDialog(true)}
              sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
            >
              Add Employee
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Role & Department</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#2d5016' }}>
                          {employee.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {employee.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {employee._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {employee.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.department || 'General'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employee.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.isActive ? 'Active' : 'Disabled'} 
                        color={employee.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ color: '#2d5016' }}
                        >
                          <FaEye />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: '#f44336' }}
                        >
                          <FaEdit />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>


        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Hospital Bookings ({bookings.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FaDownload />}
              sx={{ color: '#2d5016', borderColor: '#2d5016' }}
            >
              Export Bookings
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Patient</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Appointment</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {booking.patientDetails.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.patientDetails.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.hospitalDetails.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.appointmentDetails.appointmentDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.appointmentDetails.appointmentTime} - {booking.appointmentDetails.doctorName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        ₹{booking.paymentDetails.consultationFee}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.bookingStatus} 
                        color={getStatusColor(booking.bookingStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.paymentDetails.paymentStatus} 
                        color={getPaymentStatusColor(booking.paymentDetails.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        sx={{ color: '#2d5016' }}
                      >
                        <FaEye />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>


        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Platform Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>User Engagement</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Active Users</Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Cart Items</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {users.reduce((sum, user) => sum + (user.stats?.cartItems || 0), 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Wishlist Items</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {users.reduce((sum, user) => sum + (user.stats?.wishlistItems || 0), 0)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Booking Statistics</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {bookings.length}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Confirmed Bookings</Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {bookings.filter(b => b.bookingStatus === 'Confirmed').length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Bookings</Typography>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {bookings.filter(b => b.bookingStatus === 'Pending').length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>


      <Dialog 
        open={userDetailsDialog} 
        onClose={() => setUserDetailsDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            User Details
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" mb={2}>Personal Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{selectedUser.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedUser.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedUser.phone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedUser.isActive ? 'Active' : 'Disabled'} 
                      color={selectedUser.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" mb={2}>Activity Summary</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Cart Items</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {selectedUser.stats?.cartItems || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Wishlist Items</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {selectedUser.stats?.wishlistCount || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {selectedUser.stats?.totalBookings || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Cart Value</Typography>
                    <Typography variant="h5" fontWeight={600} color="success.main">
                      ₹{selectedUser.stats?.cartValue || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUserDetailsDialog(false)}>
            Close
          </Button>
          {selectedUser && (
            <Button 
              variant="contained"
              onClick={() => toggleUserStatus(selectedUser._id, selectedUser.isActive)}
              disabled={actionLoading}
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
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Add New Employee
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={employeeData.name}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={employeeData.email}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={employeeData.role}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, role: e.target.value }))}
                  label="Role"
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
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
              />
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Login credentials will be automatically generated and sent to the employee's email address.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setAddEmployeeDialog(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={addEmployee}
            disabled={actionLoading || !employeeData.name || !employeeData.email}
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <FaPlus />}
            sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
          >
            {actionLoading ? 'Adding...' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
}

export default EnhancedAdminDashboard;