import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Alert, Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaLock, FaEnvelope } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "402168891475-ag50v1vdjblsjhd317v8mrn2v9q3dc02.apps.googleusercontent.com",
          callback: handleGoogleResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", type: 'standard', width: '100%' }
        );
      }
    };
    return () => { document.body.removeChild(script); };
  }, []);
  
  async function handleGoogleResponse(response) {
    try {
      setLoading(true);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const googleUser = JSON.parse(jsonPayload);
      
      const res = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          googleId: googleUser.sub
        })
      });
      
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else if (data.user.role === 'seller') navigate('/seller-dashboard');
        else if (data.user.role === 'employee') navigate('/employee-dashboard');
        else navigate('/profile');
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else if (data.user.role === 'seller') navigate('/seller-dashboard');
        else if (data.user.role === 'employee') navigate('/employee-dashboard');
        else navigate('/profile');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      py: 4
    }}>
      <Box className="professional-card animate-fade-in" sx={{ 
        width: "100%", 
        maxWidth: 450, 
        mx: 2
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            className="gradient-text animate-bounce-in"
            sx={{ fontFamily: "Poppins", mb: 2 }}
          >
            Welcome Back! 🔐
          </Typography>
          <Typography 
            variant="body1" 
            color="#5c6842"
            sx={{ fontFamily: "Poppins" }}
          >
            Sign in to continue your herbal journey
          </Typography>
        </Box>
        
        <Box className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <div id="google-signin-btn" style={{ width: '100%' }}></div>
          </Box>
        </Box>

        <Divider sx={{ my: 3, '&::before, &::after': { borderColor: '#e0e0e0' } }}>
          <Typography variant="body2" color="textSecondary">or continue with email</Typography>
        </Divider>

        <Box className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: <FaEnvelope style={{ marginRight: 8, color: '#2d5016' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#2d5016' },
                '&.Mui-focused fieldset': { borderColor: '#2d5016' }
              }
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: <FaLock style={{ marginRight: 8, color: '#2d5016' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#2d5016' },
                '&.Mui-focused fieldset': { borderColor: '#2d5016' }
              }
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Box className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary"
            sx={{ 
              mt: 3, 
              py: 2, 
              fontSize: '1.1rem',
              fontFamily: 'Poppins',
              textTransform: 'none',
              borderRadius: '12px'
            }}
          >
            {loading ? <div className="loading-spinner" /> : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              style={{ 
                color: '#2d5016', 
                textDecoration: 'none', 
                fontWeight: 600 
              }}
            >
              Sign up here
            </Link>
          </Typography>
          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#2d5016', 
              textDecoration: 'none', 
              fontSize: '0.9rem' 
            }}
          >
            Forgot your password?
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Login; 


