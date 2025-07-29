import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLeaf } from 'react-icons/fa';

function Navbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const onStorage = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };

    const onUserChange = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('userChanged', onUserChange);

    const origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      origSetItem.apply(this, arguments);
      if (key === 'user') {
        window.dispatchEvent(new Event('userChanged'));
      }
    };

    const origRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      origRemoveItem.apply(this, arguments);
      if (key === 'user') {
        window.dispatchEvent(new Event('userChanged'));
      }
    };

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userChanged', onUserChange);
      localStorage.setItem = origSetItem;
      localStorage.removeItem = origRemoveItem;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(135deg, #2d5016 0%, #3a4d2d 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 1201
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FaLeaf size={28} style={{ color: '#4caf50', marginRight: '12px' }} />
          <Typography 
            variant="h5" 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: 700, 
              color: '#FFFFFF',
              textDecoration: 'none',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': { color: '#4caf50' }
            }}
          >
            HerbTrade
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {/* Admin Navigation - Only show Profile */}
              {user.role === 'admin' ? (
                <>
                  <IconButton onClick={handleMenuClick} sx={{ color: '#FFFFFF' }}>
                    <Avatar src={user.profilePic} sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                      {user.name?.charAt(0) || 'A'}
                    </Avatar>
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/edit-profile'); }}>
                      <FaUserCircle style={{ marginRight: '8px' }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                      Logout
                    </MenuItem>
                  </Menu>

                  <Typography sx={{ color: '#FFFFFF', fontWeight: 600, ml: 1 }}>
                    Admin
                  </Typography>
                </>
              ) : (
                <>
                  {/* Regular User Navigation */}
                  <Button 
                    sx={{ 
                      color: "#FFFFFF", 
                      fontWeight: 600, 
                      '&:hover': { color: '#4caf50' } 
                    }} 
                    component={Link} 
                    to="/herbs"
                  >
                    🌿 HERBS
                  </Button>
                  <Button 
                    sx={{ 
                      color: "#FFFFFF", 
                      fontWeight: 600, 
                      '&:hover': { color: '#4caf50' } 
                    }} 
                    component={Link} 
                    to="/hospital-discovery"
                  >
                    🏥 HOSPITALS
                  </Button>
                  <Button 
                    sx={{ 
                      color: "#FFFFFF", 
                      fontWeight: 600, 
                      '&:hover': { color: '#4caf50' } 
                    }} 
                    component={Link} 
                    to="/blog"
                  >
                    📝 BLOG
                  </Button>

                  <IconButton onClick={handleMenuClick} sx={{ color: '#FFFFFF' }}>
                    <Avatar src={user.profilePic} sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                      {user.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                      <FaUserCircle style={{ marginRight: '8px' }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                      Logout
                    </MenuItem>
                  </Menu>

                  <Typography sx={{ color: '#FFFFFF', fontWeight: 600, ml: 1 }}>
                    {user.name || user.email}
                  </Typography>
                </>
              )}
            </>
          ) : (
            <>
              <Button 
                sx={{ 
                  color: "#FFFFFF", 
                  fontWeight: 600, 
                  '&:hover': { color: '#4caf50' } 
                }} 
                component={Link} 
                to="/herbs"
              >
                🌿 HERBS
              </Button>
              <Button 
                sx={{ 
                  color: "#FFFFFF", 
                  fontWeight: 600, 
                  '&:hover': { color: '#4caf50' } 
                }} 
                component={Link} 
                to="/hospital-discovery"
              >
                🏥 HOSPITALS
              </Button>
              <Button 
                sx={{ 
                  color: "#FFFFFF", 
                  fontWeight: 600, 
                  '&:hover': { color: '#4caf50' } 
                }} 
                component={Link} 
                to="/blog"
              >
                📝 BLOG
              </Button>
              <Button 
                sx={{ 
                  color: "#FFFFFF", 
                  fontWeight: 600, 
                  '&:hover': { color: '#4caf50' } 
                }} 
                component={Link} 
                to="/login"
              >
                Sign In
              </Button>
              <Button 
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: '#FFFFFF', 
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#45a049' }
                }} 
                component={Link} 
                to="/signup"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
