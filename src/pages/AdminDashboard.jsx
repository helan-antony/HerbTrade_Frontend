import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Avatar, IconButton, Drawer, List, ListItem, ListItemIcon,
  ListItemText, Toolbar, AppBar, Badge, Divider, LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Business, PersonAdd, Receipt,
  BarChart, TrendingUp, ShoppingCart, Visibility, Delete, Edit,
  Download, Refresh, NotificationsActive
} from '@mui/icons-material';
import { FaUsers, FaChartLine, FaHospital, FaShoppingBag } from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const drawerWidth = 280;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats, users, employees data
      // Mock data for now
      setStats({
        totalUsers: 1247,
        totalRevenue: '₹2,45,000',
        ordersToday: 67,
        hospitalBookings: 23
      });
      setUsers([
        { id: 1, name: 'Teena Ram', email: 'teena@gmail.com', status: 'Active', joinDate: '2024-01-15' },
        { id: 2, name: 'Anmaria Tom', email: 'ann@gmail.com', status: 'Active', joinDate: '2024-02-10' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color, bgColor }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
      border: 'none',
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 40px ${color}40`
      }
    }}>
      <CardContent sx={{ p: 3, color: 'white', position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ my: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {change}
            </Typography>
          </Box>
          <Box sx={{
            width: 60, height: 60, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
      <Box sx={{
        position: 'absolute',
        top: 0, right: 0,
        width: 100, height: 100,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.1)',
        transform: 'translate(30px, -30px)'
      }} />
    </Card>
  );

  const Sidebar = () => (
    <Box sx={{ width: drawerWidth, height: '100%', bgcolor: '#1a1a2e', color: 'white' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" fontWeight={700} color="#4caf50">
          🌿 Admin Panel
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
          Management Dashboard
        </Typography>
      </Box>
      
      <List sx={{ p: 2 }}>
        {[
          { id: 'overview', label: 'Overview', icon: <DashboardIcon />, badge: null },
          { id: 'users', label: 'Users', icon: <People />, badge: users.length },
          { id: 'employees', label: 'Employees', icon: <PersonAdd />, badge: null },
          { id: 'orders', label: 'Orders', icon: <Receipt />, badge: '12' },
          { id: 'analytics', label: 'Analytics', icon: <BarChart />, badge: null }
        ].map((item) => (
          <ListItem 
            button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: activeTab === item.id ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
              border: activeTab === item.id ? '1px solid #4caf50' : '1px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: activeTab === item.id ? '#4caf50' : 'rgba(255,255,255,0.7)',
              minWidth: 40
            }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontWeight: activeTab === item.id ? 600 : 400,
                  color: activeTab === item.id ? '#4caf50' : 'rgba(255,255,255,0.9)'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const OverviewContent = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1a1a2e">
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your platform today.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={loading}
          sx={{ 
            borderColor: '#4caf50', 
            color: '#4caf50',
            '&:hover': { borderColor: '#45a049', bgcolor: 'rgba(76, 175, 80, 0.05)' }
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            change="+12% from last month"
            icon={<FaUsers size={24} />}
            color="#2196f3"
            bgColor="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue || '₹0'}
            change="+8% from last month"
            icon={<FaChartLine size={24} />}
            color="#4caf50"
            bgColor="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Orders Today"
            value={stats.ordersToday || 0}
            change="+23% from yesterday"
            icon={<FaShoppingBag size={24} />}
            color="#ff9800"
            bgColor="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hospital Bookings"
            value={stats.hospitalBookings || 0}
            change="+5% from last week"
            icon={<FaHospital size={24} />}
            color="#e91e63"
            bgColor="#e91e63"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Recent Activity
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 300,
              color: 'text.secondary'
            }}>
              <ShoppingCart sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No recent activity
              </Typography>
              <Typography variant="body2">
                Activity will appear here once users start interacting with the platform
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<PersonAdd />}
                fullWidth
                sx={{ 
                  bgcolor: '#4caf50', 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Add New Employee
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Business />}
                fullWidth
                sx={{ 
                  borderColor: '#2196f3',
                  color: '#2196f3',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Manage Sellers
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                fullWidth
                sx={{ 
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Export Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const UsersContent = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Registered Users ({users.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ 
            bgcolor: '#4caf50',
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Export Users
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#1a1a2e' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a1a2e' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a1a2e' }}>Join Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a1a2e' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a1a2e' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#4caf50', mr: 2, width: 40, height: 40 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.joinDate}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small" 
                    sx={{ 
                      bgcolor: user.status === 'Active' ? '#e8f5e9' : '#ffebee',
                      color: user.status === 'Active' ? '#2e7d32' : '#c62828',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" sx={{ color: '#2196f3' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#ff9800' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#f44336' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Loading dashboard data...
          </Typography>
        </Box>
      );
    }

    switch (activeTab) {
      case 'overview': return <OverviewContent />;
      case 'users': return <UsersContent />;
      default: return <OverviewContent />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
          },
        }}
      >
        <Sidebar />
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
              <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ fontFamily: 'Poppins' }}>
                🌿 HerbTrade AI - Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive platform management and analytics
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                sx={{ 
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e0e0e0' }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsActive color="action" />
                </Badge>
              </IconButton>
              
              <Avatar 
                sx={{ 
                  bgcolor: '#4caf50',
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
        
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 
