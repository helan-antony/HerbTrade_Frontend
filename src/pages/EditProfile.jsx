import { Box, Typography, TextField, Button, Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setProfilePic(user.profilePic || "");
      setEmail(user.email || "");
      setNewEmail(user.email || "");
    }
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  }

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
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Update failed');
    }
  }

  async function handleEmailUpdate() {
    setEmailError("");
    setEmailSuccess("");
    if (!newEmail || newEmail === email) {
      setEmailError("Enter a new email");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail: email, newEmail })
      });
      const data = await res.json();
      if (data.user) {
        setEmailSuccess("Email updated!");
        setEmailError("");
        setEmail(data.user.email);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setEmailError(data.error || 'Update failed');
      }
    } catch (err) {
      setEmailError('Update failed');
    }
  }

  async function handlePasswordUpdate() {
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword) {
      setPasswordError("Both fields required");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.message && data.message.toLowerCase().includes('updated')) {
        setPasswordSuccess("Password updated!");
        setPasswordError("");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordError(data.error || 'Update failed');
      }
    } catch (err) {
      setPasswordError('Update failed');
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", width: "100vw", bgcolor: "#f3e7d4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", m: 0, p: 0, overflow: "hidden" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" textAlign="center" mb={2} fontFamily="serif">
          Edit Profile
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar src={profilePic} sx={{ width: 80, height: 80, mb: 1 }} />
          <Button variant="outlined" component="label">Upload Picture
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
        </Box>
        <TextField fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Phone" value={phone} onChange={e => setPhone(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} sx={{ mb: 1 }} />
        <Button variant="outlined" sx={{ mb: 1, color: '#3a4d2d', borderColor: '#3a4d2d' }} fullWidth onClick={handleEmailUpdate}>Update Email</Button>
        {emailSuccess && <Typography sx={{ color: 'green', fontSize: 14, mb: 1, textAlign: 'center' }}>{emailSuccess}</Typography>}
        {emailError && <Typography sx={{ color: 'red', fontSize: 14, mb: 1, textAlign: 'center' }}>{emailError}</Typography>}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} color="#3a4d2d" mb={1}>Change Password</Typography>
          <TextField fullWidth label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} sx={{ mb: 1 }} />
          <TextField fullWidth label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={{ mb: 1 }} />
          <Button variant="outlined" sx={{ color: '#3a4d2d', borderColor: '#3a4d2d' }} fullWidth onClick={handlePasswordUpdate}>Update Password</Button>
          {passwordSuccess && <Typography sx={{ color: 'green', fontSize: 14, mb: 1, textAlign: 'center' }}>{passwordSuccess}</Typography>}
          {passwordError && <Typography sx={{ color: 'red', fontSize: 14, mb: 1, textAlign: 'center' }}>{passwordError}</Typography>}
        </Box>
        <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif", fontWeight: 600, mb: 2 }} fullWidth onClick={handleSave}>Save</Button>
        {success && <Typography sx={{ color: "green", fontSize: 15, mt: 1, textAlign: 'center' }}>Profile updated!</Typography>}
        {error && <Typography sx={{ color: "red", fontSize: 15, mt: 1, textAlign: 'center' }}>{error}</Typography>}
      </Box>
    </Box>
  );
}

export default EditProfile; 