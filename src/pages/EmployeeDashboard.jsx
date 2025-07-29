import { useState, useEffect } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Avatar, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, CssBaseline, Toolbar
} from "@mui/material";
import { 
  Dashboard as DashboardIcon, Assignment, People, Inventory,
  TrendingUp, CheckCircle, Schedule, Notifications
} from '@mui/icons-material';

const drawerWidth = 280;

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({});
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData || {});
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [tasksRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/employee/tasks', { headers }),
        fetch('http://localhost:5000/api/employee/stats', { headers })
      ]);

      setTasks(await tasksRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
    }
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card className="professional-card hover-lift animate-fade-in">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="textSecondary">{title}</Typography>
              <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
              <Typography variant="body2" color="textSecondary">{change}</Typography>
            </Box>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${color}20`, color: color
            }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const sidebar = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar 
          src={user.profilePic} 
          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
        />
        <Typography variant="h6" fontWeight={700} className="gradient-text">
          {user.name}
        </Typography>
        <Chip label={user.role} size="small" color="primary" />
      </Box>
      
      {[
        { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
        { id: 'tasks', label: 'My Tasks', icon: <Assignment /> },
        { id: 'team', label: 'Team', icon: <People /> },
        { id: 'inventory', label: 'Inventory', icon: <Inventory /> }
      ].map((item) => (
        <ListItem 
          button 
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="hover-lift"
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: activeTab === item.id ? 'rgba(45, 80, 22, 0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(45, 80, 22, 0.05)' }
          }}
        >
          <ListItemIcon sx={{ color: activeTab === item.id ? '#2d5016' : '#666' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.label} 
            sx={{ color: activeTab === item.id ? '#2d5016' : '#666' }}
          />
        </ListItem>
      ))}
    </Box>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Box className="stagger-animation">
            <Typography variant="h4" fontWeight={700} mb={4} className="gradient-text animate-fade-in">
              Welcome back, {user.name}! 👋
            </Typography>
            
            <Grid container spacing={3} mb={4}>
              <StatCard 
                title="Tasks Completed" 
                value={stats.completedTasks || '12'} 
                change="This month" 
                icon={<CheckCircle />} 
                color="#4caf50"
              />
              <StatCard 
                title="Pending Tasks" 
                value={stats.pendingTasks || '5'} 
                change="Due this week" 
                icon={<Schedule />} 
                color="#ff9800"
              />
              <StatCard 
                title="Team Performance" 
                value="95%" 
                change="+5% from last month" 
                icon={<TrendingUp />} 
                color="#2196f3"
              />
              <StatCard 
                title="Notifications" 
                value={stats.notifications || '3'} 
                change="Unread" 
                icon={<Notifications />} 
                color="#9c27b0"
              />
            </Grid>

            <Card className="professional-card animate-slide-in-left">
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3}>Recent Activities</Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {[
                    { action: 'Completed herb quality check', time: '2 hours ago', status: 'completed' },
                    { action: 'Updated inventory records', time: '4 hours ago', status: 'completed' },
                    { action: 'Reviewed supplier documents', time: '1 day ago', status: 'pending' }
                  ].map((activity, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, bgcolor: '#f8f6f0', borderRadius: 2 }}>
                      <CheckCircle sx={{ color: activity.status === 'completed' ? '#4caf50' : '#ff9800', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{activity.action}</Typography>
                        <Typography variant="body2" color="textSecondary">{activity.time}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
      
      case 'tasks':
        return (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>My Tasks</Typography>
            <TableContainer component={Paper} className="professional-card">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell fontWeight={600}>Task</TableCell>
                    <TableCell fontWeight={600}>Priority</TableCell>
                    <TableCell fontWeight={600}>Due Date</TableCell>
                    <TableCell fontWeight={600}>Status</TableCell>
                    <TableCell fontWeight={600}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { task: 'Quality check for Ashwagandha batch', priority: 'High', dueDate: '2024-01-15', status: 'In Progress' },
                    { task: 'Update supplier database', priority: 'Medium', dueDate: '2024-01-18', status: 'Pending' },
                    { task: 'Prepare monthly report', priority: 'Low', dueDate: '2024-01-20', status: 'Not Started' }
                  ].map((task, index) => (
                    <TableRow key={index} className="hover-lift">
                      <TableCell>{task.task}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority} 
                          color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status} 
                          color={task.status === 'In Progress' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      
      default:
        return <Typography>Content for {activeTab}</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        className="glass-effect"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.2)'
          },
        }}
      >
        <Toolbar />
        {sidebar}
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;