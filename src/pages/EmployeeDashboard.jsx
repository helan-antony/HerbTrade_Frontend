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
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-2">Tasks Completed</p>
                    <p className="text-3xl font-playfair font-bold text-slate-900">{stats.completedTasks || '12'}</p>
                    <p className="text-sm text-slate-500">This month</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-2">Pending Tasks</p>
                    <p className="text-3xl font-playfair font-bold text-slate-900">{stats.pendingTasks || '5'}</p>
                    <p className="text-sm text-slate-500">Due this week</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                    <Schedule className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-2">Team Performance</p>
                    <p className="text-3xl font-playfair font-bold text-slate-900">95%</p>
                    <p className="text-sm text-slate-500">+5% from last month</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-2">Notifications</p>
                    <p className="text-3xl font-playfair font-bold text-slate-900">{stats.notifications || '3'}</p>
                    <p className="text-sm text-slate-500">Unread</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                    <Notifications className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 p-6">
              <h3 className="text-xl font-playfair font-bold text-slate-900 mb-6">Recent Activities</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {[
                  { action: 'Completed herb quality check', time: '2 hours ago', status: 'completed' },
                  { action: 'Updated inventory records', time: '4 hours ago', status: 'completed' },
                  { action: 'Reviewed supplier documents', time: '1 day ago', status: 'pending' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className={`p-2 rounded-xl ${activity.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <CheckCircle className={`w-5 h-5 ${activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'tasks':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold text-slate-900">My Tasks</h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Task</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Priority</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Due Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { task: 'Quality check for Ashwagandha batch', priority: 'High', dueDate: '2024-01-15', status: 'In Progress' },
                      { task: 'Update supplier database', priority: 'Medium', dueDate: '2024-01-18', status: 'Pending' },
                      { task: 'Prepare monthly report', priority: 'Low', dueDate: '2024-01-20', status: 'Not Started' }
                    ].map((task, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900">{task.task}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-slate-900">{task.dueDate}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors duration-200 font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'team':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold text-slate-900">Team Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Sarah Johnson', role: 'Quality Manager', status: 'online', avatar: 'S' },
                { name: 'Mike Chen', role: 'Inventory Specialist', status: 'offline', avatar: 'M' },
                { name: 'Lisa Rodriguez', role: 'Supplier Relations', status: 'online', avatar: 'L' }
              ].map((member, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-playfair font-bold text-slate-900">{member.name}</h3>
                      <p className="text-sm text-slate-600">{member.role}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                        member.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold text-slate-900">Inventory Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Ashwagandha', stock: 150, unit: 'kg', status: 'In Stock' },
                { name: 'Turmeric Powder', stock: 25, unit: 'kg', status: 'Low Stock' },
                { name: 'Neem Leaves', stock: 200, unit: 'kg', status: 'In Stock' }
              ].map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-6">
                  <h3 className="font-playfair font-bold text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{item.stock} {item.unit}</p>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-playfair font-bold text-slate-900">Content for {activeTab}</h2>
            <p className="text-slate-600 mt-2">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/50 shadow-lg relative z-10">
          <div className="p-6">
            {/* User Profile Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {user.name?.charAt(0) || 'E'}
              </div>
              <h2 className="text-xl font-playfair font-bold text-slate-900 mb-2">{user.name}</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                {user.role}
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'tasks', label: 'My Tasks', icon: '📋' },
                { id: 'team', label: 'Team', icon: '👥' },
                { id: 'inventory', label: 'Inventory', icon: '📦' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100 hover:scale-105'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 relative z-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;