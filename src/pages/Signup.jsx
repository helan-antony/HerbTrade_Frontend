import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Link as MuiLink, InputAdornment, IconButton, Divider } from "@mui/material";
import { FaUserPlus, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
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
          document.getElementById("google-signup-btn"),
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

  function validate() {
      if (!name || !email || !phone || !password || !confirmPassword) return "All fields are required";
      if (/^\s/.test(name)) return "No leading spaces allowed in name";
      if (/[^a-zA-Z ]/.test(name)) return "Name must not contain numbers or special characters";
      if (!/^([a-zA-Z0-9._%+-]+@(gmail\.com|mca\.ajce\.in))$/.test(email)) return "Enter a valid Gmail or mca.ajce.in email address";
      if (!/^[6-9][0-9]{9}$/.test(phone)) return "Enter a valid 10-digit phone starting with 6,7,8,9";
      if (password.length < 8) return "Password must be at least 8 characters";
      if (password !== confirmPassword) return "Passwords do not match";
      return "";
  }

  async function handleSignup() {
    const validationError = validate();
    if (validationError) {
        setError(validationError);
        return;
    }
    
    setError("");
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (data.user) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Signup failed');
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f9f9f9" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" textAlign="center" mb={2} fontFamily="serif">
          Create Account
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <div id="google-signup-btn"></div>
        </Box>

        <Divider>or</Divider>

        <TextField fullWidth label="Name" variant="outlined" margin="normal" value={name} onChange={e => setName(e.target.value)} InputProps={{ startAdornment: <FaUserPlus style={{ marginRight: 8, color: '#757575' }} /> }} />
        <TextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={e => setEmail(e.target.value)} InputProps={{ startAdornment: <FaEnvelope style={{ marginRight: 8, color: '#757575' }} /> }} />
        <TextField fullWidth label="Phone" variant="outlined" margin="normal" value={phone} onChange={e => setPhone(e.target.value)} InputProps={{ startAdornment: <FaPhone style={{ marginRight: 8, color: '#757575' }} /> }} />
        <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} variant="outlined" margin="normal" value={password} onChange={e => setPassword(e.target.value)} InputProps={{
            startAdornment: <FaLock style={{ marginRight: 8, color: '#757575' }} />,
            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
        }} />
        <TextField fullWidth label="Confirm Password" type={showConfirm ? "text" : "password"} variant="outlined" margin="normal" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} InputProps={{
            startAdornment: <FaLock style={{ marginRight: 8, color: '#757575' }} />,
            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">{showConfirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
        }} />
        
        <Button variant="contained" size="large" fullWidth sx={{ mt: 2, bgcolor: "#3a4d2d", color: "white", fontFamily: "serif", fontWeight: 600, '&:hover': { bgcolor: '#2e3b24' } }} onClick={handleSignup}> 
          Sign Up
        </Button>
        
        {success && <Typography sx={{ color: "green", fontSize: 15, mt: 2, textAlign: 'center' }}>Signup successful! Redirecting to login...</Typography>}
        {error && <Typography sx={{ color: "red", fontSize: 15, mt: 2, textAlign: 'center' }}>{error}</Typography>}
        
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account? <MuiLink component={Link} to="/login" sx={{ color: '#3a4d2d', fontWeight: 'bold' }}>Login</MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}

export default Signup; 