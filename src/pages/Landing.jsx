import { Box, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import { FaLeaf, FaHospital, FaBlog, FaRobot, FaShippingFast, FaUserMd } from "react-icons/fa";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <Box sx={{ p: 4, bgcolor: "#f3e7d4", minHeight: "90vh", fontFamily: "serif" }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" fontWeight={700} color="#3a4d2d" gutterBottom sx={{ fontFamily: "serif" }}>
          🌿 HerbTrade AI
        </Typography>
        <Typography variant="h5" color="#5c6842" gutterBottom sx={{ fontFamily: "serif" }}>
          Modernizing Ayurvedic Herb Trade with AI, Traceability, and Instant Support 🚀
        </Typography>
        <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif", mt: 2, '&:hover': { bgcolor: '#5c6842' } }} size="large" component={Link} to="/signup">
          Get Started
        </Button>
      </Box>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 220, bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
            <CardContent>
              <FaLeaf size={36} />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, fontFamily: "serif" }}>Herb Marketplace</Typography>
              <Typography>Buy, sell, and grade herbs like Tulsi, Ashwagandha, Neem, and more. 🌱</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 220, bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
            <CardContent>
              <FaHospital size={36} />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, fontFamily: "serif" }}>Hospital Discovery</Typography>
              <Typography>Find Ayurvedic hospitals, doctors, and services near you. 🏥</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 220, bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
            <CardContent>
              <FaBlog size={36} />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, fontFamily: "serif" }}>Herbal Blog</Typography>
              <Typography>Share remedies, read experiences, and grow herbal wisdom. ✍️</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 220, bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
            <CardContent>
              <FaRobot size={36} />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, fontFamily: "serif" }}>AI Chatbot</Typography>
              <Typography>Instant answers to herbal, export, and hospital queries. 🤖</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 220, bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
            <CardContent>
              <FaShippingFast size={36} />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, fontFamily: "serif" }}>Export System</Typography>
              <Typography>Generate export docs, track shipments, and secure downloads. 📦</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 220, bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
            <CardContent>
              <FaUserMd size={36} />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, fontFamily: "serif" }}>Role-Based Dashboards</Typography>
              <Typography>Smart dashboards for users, sellers, hospitals, and admins. 📊</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Landing; 