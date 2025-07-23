import { Box, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function validateEmail(val) {
    if (!val) return "Email is required";
    if (!/^([a-zA-Z0-9._%+-]+@(gmail\.com|mca\.ajce\.in))$/.test(val)) return "Enter a valid Gmail or mca.ajce.in email address";
    return "";
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  }

  async function handleSubmit() {
    setEmailError(validateEmail(email));
    setError("");
    if (!validateEmail(email)) {
      try {
        const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setSubmitted(true);
        } else {
          setError(data.error + (data.details ? ": " + data.details : ""));
        }
      } catch (err) {
        setError("Failed to send reset email");
      }
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", height: "100vh", width: "100vw", bgcolor: "#f3e7d4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", m: 0, p: 0, overflow: "hidden" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" textAlign="center" mb={2} fontFamily="serif">
          Forgot Password?
        </Typography>
        {submitted && !error ? (
          <Typography sx={{ color: "#3a4d2d", fontFamily: "serif", textAlign: "center", mt: 2 }}>
            If this email address exists, a password reset link has been sent.
          </Typography>
        ) : (
          <>
            <TextField fullWidth label="Email" type="email" value={email} onChange={handleEmailChange} sx={{ mb: 1 }} InputProps={{ startAdornment: <FaEnvelope style={{ marginRight: 8 }} /> }} />
            {emailError && <Typography sx={{ color: "red", fontSize: 13, mb: 1 }}>{emailError}</Typography>}
            {error && <Typography sx={{ color: "red", fontSize: 13, mb: 1 }}>{error}</Typography>}
            <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif", fontWeight: 600 }} fullWidth onClick={handleSubmit}>
              Send Reset Link
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

export default ForgotPassword; 