import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Link as MuiLink, InputAdornment, IconButton, Divider } from "@mui/material";
import { FaUser, FaLock } from "react-icons/fa";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // GIS script loading and initialization
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
          { theme: "outline", size: "large", type: 'standard' }
        );
      }
    };
    return () => { document.body.removeChild(script); };
  }, []);
  
  function handleGoogleResponse(response) {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const user = JSON.parse(jsonPayload);
    localStorage.setItem('user', JSON.stringify({ name: user.name, email: user.email, role: 'user' }));
    navigate('/dashboard');
  }

  function validateEmail(val) {
    if (!val) return "Email is required";
    if (!/^([a-zA-Z0-9._%+-]+@(gmail\.com|mca\.ajce\.in))$/.test(val)) return "Enter a valid Gmail or mca.ajce.in email address";
    return "";
  }

  function validatePassword(val) {
    if (!val) return "Password is required";
    return "";
  }

  async function handleLogin() {
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }
    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }
    
    setError("");
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
        else navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f9f9f9" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" textAlign="center" mb={2} fontFamily="serif">
          Login 🔐
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <div id="google-signin-btn"></div>
        </Box>

        <Divider>or</Divider>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={e => setEmail(e.target.value)}
          InputProps={{ startAdornment: <FaUser style={{ marginRight: 8, color: '#757575' }} /> }}
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
          InputProps={{
            startAdornment: <FaLock style={{ marginRight: 8, color: '#757575' }} />,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ textAlign: 'right', mb: 2 }}>
            <MuiLink component={Link} to="/forgot-password" underline="hover" sx={{ color: "#3a4d2d", fontFamily: "serif", fontWeight: 600 }}>
                Forgot Password?
            </MuiLink>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ bgcolor: "#3a4d2d", color: "white", fontFamily: "serif", fontWeight: 600, '&:hover': { bgcolor: '#2e3b24' } }}
          onClick={handleLogin}
        >
          Login
        </Button>

        {error && <Typography sx={{ color: "red", fontSize: 15, mt: 2, textAlign: 'center' }}>{error}</Typography>}
      </Box>
    </Box>
  );
}

export default Login; 