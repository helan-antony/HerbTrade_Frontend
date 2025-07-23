import { Box, Typography, Grid, Card, CardContent, Button, Avatar } from "@mui/material";
import { FaShoppingCart, FaSeedling, FaHospital, FaUserShield, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u || {});
  }, []);
  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#e8f5e9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', m: 0, p: 0, overflow: 'hidden' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={user.profilePic} sx={{ width: 64, height: 64, mr: 2 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#3a4d2d">
              {user.name || 'User'}
            </Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>
          <Button sx={{ ml: 2 }} variant="outlined" onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
        </Box>
        <Grid container spacing={4}>
          {/* User Dashboard */}
          {user.role === 'user' && (
            <>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <FaShoppingCart size={32} />
                    <Typography variant="h6" fontWeight={600} mt={2}>My Orders</Typography>
                    <Typography>Track your herb orders and shipments.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <FaSeedling size={32} />
                    <Typography variant="h6" fontWeight={600} mt={2}>Upload Herbs</Typography>
                    <Typography>For sellers: manage stock and grading.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <FaHospital size={32} />
                    <Typography variant="h6" fontWeight={600} mt={2}>Hospitals</Typography>
                    <Typography>Register and manage hospital info.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          {/* Admin Dashboard */}
          {user.role === 'admin' && (
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <FaUserShield size={32} />
                  <Typography variant="h6" fontWeight={600} mt={2}>Admin Panel</Typography>
                  <Typography>Manage users, content, and analytics.</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
        {/* Analytics for admin only */}
        {user.role === 'admin' && (
          <Box sx={{ mt: 4 }}>
            <Card>
              <CardContent>
                <FaChartBar size={32} />
                <Typography variant="h6" fontWeight={600} mt={2}>Analytics</Typography>
                <Typography>View sales, user activity, and more.</Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard; 