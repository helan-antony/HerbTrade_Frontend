import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { FaMapMarkerAlt, FaUserMd, FaPhone } from "react-icons/fa";

const hospitals = [
  { name: "Ayurveda Wellness Center", region: "Delhi", doctor: "Dr. Sharma", phone: "9876543210", specialty: "Immunity" },
  { name: "Herbal Health Hospital", region: "Mumbai", doctor: "Dr. Patel", phone: "9123456780", specialty: "Stress Relief" }
];

function HospitalDiscovery() {
  return (
    <Box sx={{ minHeight: "100vh", height: "100vh", width: "100vw", bgcolor: "#f3e7d4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "serif", boxSizing: "border-box", m: 0, p: 0, overflow: "hidden" }}>
      <Box sx={{ width: "100%", maxWidth: 1000, px: { xs: 2, md: 0 } }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" mb={2} fontFamily="serif" textAlign="center">
          Hospital Discovery 🏥
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {hospitals.map(h => (
            <Grid item xs={12} sm={6} md={5} key={h.name} sx={{ display: "flex", justifyContent: "center" }}>
              <Card sx={{ bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif", minHeight: 180, width: "100%", maxWidth: 350 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>{h.name}</Typography>
                  <Typography><FaMapMarkerAlt /> {h.region}</Typography>
                  <Typography><FaUserMd /> {h.doctor} ({h.specialty})</Typography>
                  <Typography><FaPhone /> {h.phone}</Typography>
                  <Button variant="outlined" sx={{ mt: 1, color: "#3a4d2d", borderColor: "#3a4d2d", fontFamily: "serif" }}>
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default HospitalDiscovery; 