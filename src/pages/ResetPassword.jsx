import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  function validatePassword(val) {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(val)) return "Password must contain at least one letter";
    if (!/[0-9]/.test(val)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(val)) return "Password must contain at least one special character";
    return "";
  }

  function validateConfirmPassword(val) {
    if (!val) return "Confirm your password";
    if (val !== password) return "Passwords do not match";
    return "";
  }

  async function handleSubmit() {
    const passErr = validatePassword(password);
    const confErr = validateConfirmPassword(confirm);
    setPasswordError(passErr);
    setConfirmError(confErr);
    if (passErr || confErr) return;

    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Failed to reset password");
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", height: "100vh", width: "100vw", bgcolor: "#f3e7d4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", m: 0, p: 0, overflow: "hidden" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" textAlign="center" mb={2} fontFamily="serif">
          Reset Password
        </Typography>
        {success ? (
          <Typography sx={{ color: "#3a4d2d", fontFamily: "serif", textAlign: "center", mt: 2 }}>
            Password reset successful. Redirecting to login...
          </Typography>
        ) : (
          <>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 1 }}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              sx={{ mb: 1 }}
              error={!!confirmError}
              helperText={confirmError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((show) => !show)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {error && <Typography sx={{ color: "red", fontSize: 13, mb: 1 }}>{error}</Typography>}
            <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif", fontWeight: 600 }} fullWidth onClick={handleSubmit}>
              Reset Password
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

export default ResetPassword; 