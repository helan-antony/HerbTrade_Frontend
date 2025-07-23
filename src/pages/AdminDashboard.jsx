import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Grid, Card, CardContent, Drawer, CssBaseline, Divider, Toolbar, ListItemIcon } from "@mui/material";
import { Money, Group, PersonAdd, BarChart, Dashboard as DashboardIcon, TableChart, Receipt, Business } from '@mui/icons-material';

const drawerWidth = 240;

const StatCard = ({ title, value, change, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">{title}</Typography>
                        <Typography variant="h5" component="div">{value}</Typography>
                        <Typography color={change.startsWith('+') ? 'success.main' : 'error.main'} variant="body2">{change}</Typography>
                    </Box>
                    <Box sx={{
                        width: 56, height: 56, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: color, color: 'white'
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Grid>
);

function AdminDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sellers, setSellers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchSellers();
    fetchUsers();
  }, []);

  async function fetchSellers() {
    const res = await fetch("http://localhost:5000/api/auth/sellers");
    if(res.ok){
      const data = await res.json();
      setSellers(data.sellers || []);
    }
  }

  async function fetchUsers() {
    const res = await fetch("http://localhost:5000/api/auth/users");
    if(res.ok){
        const data = await res.json();
        setUsersCount(data.count || 0);
    }
  }
  
  function validateName(val) {
    if (!val) return "Name is required";
    if (/^\s/.test(val)) return "No leading spaces allowed";
    if (/[^a-zA-Z ]/.test(val)) return "Name must not contain numbers or special characters";
    if (/ {2,}/.test(val)) return "No more than one space between words";
    return "";
  }
  function validateEmail(val) {
    if (!val) return "Email is required";
    if (!/^([a-zA-Z0-9._%+-]+@(gmail\.com|mca\.ajce\.in))$/.test(val)) return "Enter a valid Gmail or mca.ajce.in email address";
    return "";
  }
  function validatePhone(val) {
    if (!val) return "Phone number is required";
    if (!/^[6-9][0-9]{9}$/.test(val)) return "Enter a valid 10-digit phone starting with 6,7,8,9";
    return "";
  }
  function validatePassword(val) {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(val)) return "Password must contain at least one letter";
    if (!/[0-9]/.test(val)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(val)) return "Password must contain at least one special character";
    return "";
  }

  async function handleAddSeller() {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password);
    setNameError(nameErr); setEmailError(emailErr); setPhoneError(phoneErr); setPasswordError(passErr);
    if (nameErr || emailErr || phoneErr || passErr) return;

    setError(""); setSuccess("");
    const res = await fetch("http://localhost:5000/api/auth/add-seller", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if(res.ok){
      setSuccess("Seller added successfully");
      setName(""); setEmail(""); setPhone(""); setPassword("");
      fetchSellers();
    } else {
      setError(data.error || 'Failed to add seller');
    }
  }

  const sidebar = (
    <div>
      <Toolbar>
        <Business sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>HerbTrade</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button selected>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><TableChart /></ListItemIcon>
          <ListItemText primary="Tables" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><Receipt /></ListItemIcon>
          <ListItemText primary="Billing" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#fff' },
        }}
      >
        {sidebar}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Grid container spacing={3}>
          <StatCard title="Today's Money" value="$53,000" change="+55%" icon={<Money />} color="#4caf50" />
          <StatCard title="Today's Users" value={usersCount} change="+3%" icon={<Group />} color="#2196f3" />
          <StatCard title="New Clients" value={sellers.length} change="-2%" icon={<PersonAdd />} color="#f44336" />
          <StatCard title="Sales" value="$103,430" change="+5%" icon={<BarChart />} color="#ff9800" />

          <Grid item xs={12} md={7}>
             <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" mb={2}>Add New Seller</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth error={!!nameError} helperText={nameError} label="Name" value={name} onChange={e => setName(e.target.value)} />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField fullWidth error={!!emailError} helperText={emailError} label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField fullWidth error={!!phoneError} helperText={phoneError} label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth error={!!passwordError} helperText={passwordError} label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                             <Button variant="contained" onClick={handleAddSeller} sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}>Add Seller</Button>
                        </Grid>
                    </Grid>
                    {error && <Typography color="error" mt={2}>{error}</Typography>}
                    {success && <Typography color="success.main" mt={2}>{success}</Typography>}
                </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" mt={1}>All Sellers</Typography>
                    <List>
                        {sellers.length > 0 ? sellers.map(seller => (
                        <ListItem key={seller._id}>
                            <ListItemText primary={seller.name} secondary={seller.email} />
                        </ListItem>
                        )) : <Typography sx={{mt: 2, color: 'text.secondary'}}>No sellers added yet.</Typography>}
                    </List>
                </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AdminDashboard; 