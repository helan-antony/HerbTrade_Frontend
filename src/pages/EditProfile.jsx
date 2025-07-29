import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Avatar, Card, CardContent, 
  Snackbar, Alert, IconButton 
} from '@mui/material';
import { ArrowBack, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      setName(u.name || '');
      setPhone(u.phone || '');
      setProfilePic(u.profilePic || '');
    }
  }, []);

  async function handleSave() {
    setError("");
    setSuccess(false);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, profilePic, email: user.email })
      });
      const data = await res.json();
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess(true);
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Update failed');
    }
  }

  const handleBackToDashboard = () => {
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user.role === 'employee' || user.role === 'manager' || user.role === 'supervisor') {
      navigate('/employee-dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F8F8', pt: 10, px: 3 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Header with Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={handleBackToDashboard}
            sx={{ 
              mr: 2, 
              bgcolor: '#FF9900', 
              color: '#FFF',
              '&:hover': { bgcolor: '#E68900' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#232F3E' }}>
            Edit Profile
          </Typography>
        </Box>

        {/* Back to Dashboard Button for Admin */}
        {user.role === 'admin' && (
          <Button
            variant="outlined"
            startIcon={<Dashboard />}
            onClick={handleBackToDashboard}
            sx={{
              mb: 3,
              borderColor: '#FF9900',
              color: '#FF9900',
              '&:hover': {
                borderColor: '#E68900',
                bgcolor: 'rgba(255, 153, 0, 0.1)'
              }
            }}
          >
            Back to Admin Dashboard
          </Button>
        )}

        <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Profile Avatar */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar 
                src={profilePic} 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#FF9900',
                  fontSize: '3rem'
                }}
              >
                {name?.charAt(0) || user.name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h6" color="text.secondary">
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'employee' ? 'Employee' :
                 user.role === 'manager' ? 'Manager' :
                 user.role === 'supervisor' ? 'Supervisor' : 'User'}
              </Typography>
            </Box>

            {/* Form Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Profile Picture URL"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled
                variant="outlined"
                helperText="Email cannot be changed"
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    flex: 1,
                    bgcolor: '#FF9900',
                    '&:hover': { bgcolor: '#E68900' }
                  }}
                >
                  Save Changes
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleBackToDashboard}
                  sx={{
                    flex: 1,
                    borderColor: '#232F3E',
                    color: '#232F3E',
                    '&:hover': {
                      borderColor: '#232F3E',
                      bgcolor: 'rgba(35, 47, 62, 0.1)'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Success/Error Snackbars */}
      <Snackbar open={success} autoHideDuration={3000}>
        <Alert severity="success">Profile updated successfully!</Alert>
      </Snackbar>
      
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
}

export default EditProfile; 
