import { Box, Typography, Container, Grid, Card, CardContent, Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
  
  const [newsletterPrograms, setNewsletterPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchNewsletterPrograms();
  }, []);

  const fetchNewsletterPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view newsletter programs');
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
      
      setNewsletterPrograms(allPrograms);
    } catch (err) {
      console.error('Error fetching newsletter programs:', err);
      setError('Failed to load newsletter programs');
    } finally {
      setLoading(false);
    }
  };

  // Combine health tips and newsletter programs
  const allPrograms = [
    ...healthTips,
    ...newsletterPrograms.map(program => ({
      id: program._id,
      title: program.programName || program.title,
      content: program.programDescription || program.content,
      category: program.programCategory || program.category || 'Newsletter Program',
      icon: <FaUserMd size={24} color="#ff9800" />,
      type: 'program',
      duration: program.programDuration,
      difficulty: program.programDifficulty,
      startDate: program.programStartDate,
      endDate: program.programEndDate,
      // Additional newsletter program data
      targetAudience: program.programTargetAudience || [],
      prerequisites: program.programPrerequisites || [],
      benefits: program.programBenefits || [],
      goals: program.programGoals || [],
      dailyTasks: program.programDailyTasks || [],
      weeklyMilestones: program.programWeeklyMilestones || [],
      status: program.programStatus || 'published',
      createdAt: program.publishedDate,
      updatedAt: program.publishedDate
    }))
  ];
  
  // Filter programs by category
  const filteredItems = filterCategory === 'all' 
    ? allPrograms 
    : allPrograms.filter(item => 
        item.category.toLowerCase().includes(filterCategory.toLowerCase()) ||
        (item.type === 'program' && item.category === filterCategory)
      );

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="#2d5016" mb={4}>
        Health Tips & All Wellness Programs
      </Typography>
      
      <Typography variant="body1" color="text.secondary" mb={3}>
        Browse all available newsletter programs and health tips to enhance your wellbeing journey.
        {newsletterPrograms.length > 0 && (
          <span style={{ fontWeight: 600, color: '#2d5016' }}>
            {' '}Showing {newsletterPrograms.length} newsletter programs from our collection.
          </span>
        )}
      </Typography>
      
      {/* Category Filter */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={filterCategory}
            label="Filter by Category"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Nutrition">Nutrition</MenuItem>
            <MenuItem value="Activity">Activity</MenuItem>
            <MenuItem value="Mindfulness">Mindfulness</MenuItem>
            <MenuItem value="Rest">Rest</MenuItem>
            <MenuItem value="stress-management">Stress Management</MenuItem>
            <MenuItem value="sleep-hygiene">Sleep Hygiene</MenuItem>
            <MenuItem value="weight-loss">Weight Loss</MenuItem>
            <MenuItem value="fitness">Fitness</MenuItem>
            <MenuItem value="mindfulness">Mindfulness</MenuItem>
            <MenuItem value="detox">Detox</MenuItem>
            <MenuItem value="general-wellness">General Wellness</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      
      {loading && (
        <Box display="flex" justifyContent="center" mb={4}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
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
                  <Box sx={{ mb: 2 }}>
                    {item.goals && item.goals.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#2d5016">
                          Goals:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.goals.join(', ')}
                        </Typography>
                      </Box>
                    )}
                    
                    {item.benefits && item.benefits.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#2d5016">
                          Benefits:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.benefits.slice(0, 3).join(', ')}{item.benefits.length > 3 ? '...' : ''}
                        </Typography>
                      </Box>
                    )}
                    
                    {item.prerequisites && item.prerequisites.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#2d5016">
                          Prerequisites:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.prerequisites.slice(0, 2).join(', ')}{item.prerequisites.length > 2 ? '...' : ''}
                        </Typography>
                      </Box>
                    )}
                    
                    {item.dailyTasks && item.dailyTasks.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FaTasks size={16} color="#666" />
                        <Typography variant="body2" color="text.secondary">
                          {item.dailyTasks.length} daily tasks
                        </Typography>
                      </Box>
                    )}
                    
                    {item.weeklyMilestones && item.weeklyMilestones.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FaCalendarAlt size={16} color="#666" />
                        <Typography variant="body2" color="text.secondary">
                          {item.weeklyMilestones.length} weekly milestones
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
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
                    {item.status && (
                      <Chip 
                        icon={<FaCalendarAlt />}
                        label={item.status}
                        size="small"
                        sx={{ 
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          fontWeight: 600
                        }} 
                      />
                    )}
                    {item.targetAudience && item.targetAudience.length > 0 && (
                      <Chip 
                        icon={<FaUserMd />}
                        label={`Target: ${item.targetAudience.join(', ')}`}
                        size="small"
                        sx={{ 
                          backgroundColor: '#f3e5f5',
                          color: '#7b1fa2',
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
      
      {!loading && filteredItems.length === 0 && (
        <Box textAlign="center" py={8}>
          <FaLeaf size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            No health content available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filterCategory === 'all' 
              ? 'There are currently no health tips or wellness programs in the system.'
              : `No content found for category: ${filterCategory}`
            }
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default HealthTips;
