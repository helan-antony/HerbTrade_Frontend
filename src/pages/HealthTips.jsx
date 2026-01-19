import { Box, Typography, Container, Grid, Card, CardContent, Chip } from '@mui/material';
import { FaLeaf, FaAppleAlt, FaWalking } from 'react-icons/fa';

function HealthTips() {
  // Sample health tips data
  const healthTips = [
    {
      id: 1,
      title: "Stay Hydrated Throughout the Day",
      content: "Drinking enough water is essential for maintaining energy levels, supporting digestion, and keeping your skin healthy.",
      category: "Nutrition",
      icon: <FaAppleAlt size={24} color="#4caf50" />
    },
    {
      id: 2,
      title: "Take Regular Walking Breaks",
      content: "Even a 5-minute walk every hour can improve circulation, reduce stress, and boost your mood during long work sessions.",
      category: "Activity",
      icon: <FaWalking size={24} color="#2196f3" />
    },
    {
      id: 3,
      title: "Practice Mindful Breathing",
      content: "Deep breathing exercises can reduce anxiety, lower blood pressure, and improve mental clarity.",
      category: "Mindfulness",
      icon: <FaLeaf size={24} color="#8bc34a" />
    },
    {
      id: 4,
      title: "Prioritize Quality Sleep",
      content: "Aim for 7-9 hours of sleep per night to allow your body to recover and maintain optimal cognitive function.",
      category: "Rest",
      icon: <FaLeaf size={24} color="#9c27b0" />
    }
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="#2d5016" mb={4}>
        Health Tips
      </Typography>
      
      <Grid container spacing={3}>
        {healthTips.map((tip) => (
          <Grid item xs={12} sm={6} md={6} key={tip.id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 6 
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {tip.icon}
                  <Typography variant="h6" fontWeight={600} ml={2}>
                    {tip.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {tip.content}
                </Typography>
                <Chip 
                  label={tip.category} 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#e8f5e9',
                    color: '#2d5016',
                    fontWeight: 600
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HealthTips;