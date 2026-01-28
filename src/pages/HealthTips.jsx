import { Box, Typography, Container, Grid, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import { FaLeaf, FaAppleAlt, FaWalking, FaUserMd, FaCalendarAlt, FaTasks, FaClock } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

function HealthTips() {
  const [healthTips] = useState([
    {
      id: 1,
      title: "Stay Hydrated Throughout the Day",
      content: "Drinking enough water is essential for maintaining energy levels, supporting digestion, and keeping your skin healthy.",
      category: "Nutrition",
      icon: <FaAppleAlt size={24} color="#4caf50" />,
      type: 'tip'
    },
    {
      id: 2,
      title: "Take Regular Walking Breaks",
      content: "Even a 5-minute walk every hour can improve circulation, reduce stress, and boost your mood during long work sessions.",
      category: "Activity",
      icon: <FaWalking size={24} color="#2196f3" />,
      type: 'tip'
    },
    {
      id: 3,
      title: "Practice Mindful Breathing",
      content: "Deep breathing exercises can reduce anxiety, lower blood pressure, and improve mental clarity.",
      category: "Mindfulness",
      icon: <FaLeaf size={24} color="#8bc34a" />,
      type: 'tip'
    },
    {
      id: 4,
      title: "Prioritize Quality Sleep",
      content: "Aim for 7-9 hours of sleep per night to allow your body to recover and maintain optimal cognitive function.",
      category: "Rest",
      icon: <FaLeaf size={24} color="#9c27b0" />,
      type: 'tip'
    }
  ]);
  
  const [wellnessPrograms, setWellnessPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWellnessPrograms();
  }, []);

  const fetchWellnessPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view wellness programs');
        return;
      }

      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.GET_AVAILABLE_PROGRAMS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Use both assigned and unassigned programs
      const allPrograms = [
        ...(response.data.assignedPrograms || []),
        ...(response.data.unassignedPrograms || [])
      ];
      
      setWellnessPrograms(allPrograms);
    } catch (err) {
      console.error('Error fetching wellness programs:', err);
      setError('Failed to load wellness programs');
    } finally {
      setLoading(false);
    }
  };

  // Combine health tips and wellness programs
  const allItems = [
    ...healthTips,
    ...wellnessPrograms.map(program => ({
      id: program._id,
      title: program.name || program.title,
      content: program.description,
      category: program.category || 'Wellness Program',
      icon: <FaUserMd size={24} color="#ff9800" />,
      type: 'program',
      duration: program.duration,
      difficulty: program.difficulty,
      startDate: program.startDate,
      endDate: program.endDate
    }))
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="#2d5016" mb={4}>
        Health Tips & Wellness Programs
      </Typography>
      
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      
      {loading && wellnessPrograms.length > 0 && (
        <Box display="flex" justifyContent="center" mb={4}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {allItems.map((item) => (
          <Grid item xs={12} sm={6} md={6} key={item.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 6 
                },
                transition: 'all 0.3s ease',
                border: item.type === 'program' ? '2px solid #ff9800' : '1px solid #e0e0e0'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {item.icon}
                  <Typography variant="h6" fontWeight={600} ml={2}>
                    {item.title}
                  </Typography>
                </Box>
                
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {item.content}
                </Typography>
                
                {item.type === 'program' && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {item.duration && (
                      <Chip 
                        icon={<FaClock />}
                        label={`${item.duration} days`}
                        size="small"
                        sx={{ 
                          backgroundColor: '#fff3e0',
                          color: '#e65100',
                          fontWeight: 600
                        }} 
                      />
                    )}
                    {item.difficulty && (
                      <Chip 
                        icon={<FaUserMd />}
                        label={item.difficulty}
                        size="small"
                        sx={{ 
                          backgroundColor: '#fff3e0',
                          color: '#e65100',
                          fontWeight: 600
                        }} 
                      />
                    )}
                  </Box>
                )}
                
                <Chip 
                  label={item.category} 
                  size="small" 
                  sx={{ 
                    backgroundColor: item.type === 'program' ? '#fff3e0' : '#e8f5e9',
                    color: item.type === 'program' ? '#e65100' : '#2d5016',
                    fontWeight: 600
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {!loading && allItems.length === 0 && (
        <Box textAlign="center" py={8}>
          <FaLeaf size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
          <Typography variant="h6" color="text.secondary">
            No health tips or wellness programs available yet
          </Typography>

        </Box>
      )}
    </Container>
  );
}

export default HealthTips;
