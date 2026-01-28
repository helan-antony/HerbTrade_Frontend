import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Button, 
  Chip, 
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  FaLeaf,
  FaRunning,
  FaUtensils,
  FaBed,
  FaYoutube,
  FaCalendarAlt,
  FaStar,
  FaCheck,
  FaTimes,
  FaPlay
} from 'react-icons/fa';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const WellnessProgram = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({
    overall: 0,
    dailyGoals: 0,
    weeklyMilestones: 0
  });

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(API_ENDPOINTS.WELLNESS_COACH.GET_CURRENT_PROGRAM, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Verify that the program belongs to the current user
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (response.data.clientId && response.data.clientId !== currentUser.id) {
        setError('You do not have access to this program');
        return;
      }
      
      setProgram(response.data);
      
      // Calculate progress
      const completedTasks = response.data.dailyTasks.filter(task => task.completed).length;
      const totalTasks = response.data.dailyTasks.length;
      const completedMilestones = response.data.weeklyMilestones.filter(milestone => milestone.achieved).length;
      const totalMilestones = response.data.weeklyMilestones.length;
      
      setProgress({
        overall: response.data.progress?.overall || Math.round(((completedTasks + completedMilestones) / (totalTasks + totalMilestones)) * 100),
        dailyGoals: response.data.progress?.dailyGoals || Math.round((completedTasks / totalTasks) * 100),
        weeklyMilestones: response.data.progress?.weeklyMilestones || Math.round((completedMilestones / totalMilestones) * 100)
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No active wellness program found. Contact your coach to get started.');
      } else {
        setError('Failed to fetch wellness program');
      }
      console.error('Error fetching wellness program:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaskComplete = async (taskId) => {
    try {
      // In a real implementation, we would update the backend
      // await axios.put(`${API_ENDPOINTS.WELLNESS_PROGRAM.TASK}/${taskId}/complete`, {}, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // For now, update locally
      const updatedProgram = { ...program };
      const taskIndex = updatedProgram.dailyTasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        updatedProgram.dailyTasks[taskIndex].completed = !updatedProgram.dailyTasks[taskIndex].completed;
        setProgram(updatedProgram);
        
        // Recalculate progress
        const completedTasks = updatedProgram.dailyTasks.filter(task => task.completed).length;
        const totalTasks = updatedProgram.dailyTasks.length;
        const completedMilestones = updatedProgram.weeklyMilestones.filter(milestone => milestone.achieved).length;
        const totalMilestones = updatedProgram.weeklyMilestones.length;
        
        setProgress({
          overall: Math.round(((completedTasks + completedMilestones) / (totalTasks + totalMilestones)) * 100),
          dailyGoals: Math.round((completedTasks / totalTasks) * 100),
          weeklyMilestones: Math.round((completedMilestones / totalMilestones) * 100)
        });
      }
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task:', err);
    }
  };

  const handlePlayVideo = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!program) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" py={8}>
          <FaLeaf size={64} color="#2d5016" style={{ marginBottom: '1rem' }} />
          <Typography variant="h5" color="text.secondary">
            No wellness program assigned
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Contact your wellness coach to get started with a personalized program
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        color: '#2d5016',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        mb: 3
      }}>
        <FaLeaf style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        My Wellness Program
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Program Overview */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ color: '#2d5016', mb: 1 }}>
                {program.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {program.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2d5016', mr: 2 }}>
                  {program.coachId?.userId?.name?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Coach:</strong> {program.coachId?.userId?.name || 'Coach Name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {program.coachId?.qualifications?.[0] || 'Qualified Wellness Coach'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                {program.goals.map((goal, index) => (
                  <Chip 
                    key={index} 
                    label={goal} 
                    variant="outlined" 
                    sx={{ bgcolor: 'rgba(45, 80, 22, 0.05)', color: '#2d5016' }} 
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'rgba(45, 80, 22, 0.05)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: '#2d5016', mb: 2 }}>Program Progress</Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.overall} 
                    sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {progress.overall}% Complete
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Duration: {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Daily Tasks" />
        <Tab label="Weekly Milestones" />
        <Tab label="Recommendations" />
        <Tab label="Progress" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {program.dailyTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: task.completed ? '#2d5016' : '#666' }}>
                          {task.title}
                        </Typography>
                        <Chip 
                          label={task.category} 
                          size="small" 
                          variant="outlined" 
                          sx={{ ml: 2, textTransform: 'capitalize' }} 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {task.description}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(task.date).toLocaleDateString()}
                      </Typography>
                      
                      {task.youtubeVideoUrl && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<FaYoutube />}
                            onClick={() => handlePlayVideo(task.youtubeVideoUrl)}
                            sx={{ 
                              borderColor: '#ff0000',
                              color: '#ff0000',
                              '&:hover': { 
                                backgroundColor: 'rgba(255, 0, 0, 0.04)',
                                borderColor: '#cc0000'
                              }
                            }}
                          >
                            Watch Exercise Video
                          </Button>
                        </Box>
                      )}
                    </Box>
                    
                    <Button
                      variant={task.completed ? "contained" : "outlined"}
                      color={task.completed ? "success" : "primary"}
                      onClick={() => handleMarkTaskComplete(task.id)}
                      sx={{ 
                        minWidth: 'auto',
                        bgcolor: task.completed ? '#4caf50' : '#2d5016',
                        '&:hover': { bgcolor: task.completed ? '#388e3c' : '#3a4d2d' }
                      }}
                    >
                      {task.completed ? <FaCheck /> : <FaPlay />}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {program.weeklyMilestones.map((milestone, index) => (
            <Grid item xs={12} key={index}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: milestone.achieved ? '#2d5016' : '#666', mb: 1 }}>
                        Week {milestone.week}: {milestone.goal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={milestone.achieved ? 'Achieved' : 'In Progress'} 
                      color={milestone.achieved ? 'success' : 'info'} 
                      variant="filled"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {program.recommendations.map((rec, index) => (
            <Grid item xs={12} key={index}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {rec.category === 'diet' && <FaUtensils style={{ marginRight: '12px', color: '#2d5016' }} />}
                    {rec.category === 'exercise' && <FaRunning style={{ marginRight: '12px', color: '#2d5016' }} />}
                    {rec.category === 'lifestyle' && <FaBed style={{ marginRight: '12px', color: '#2d5016' }} />}
                    {rec.category === 'herbs' && <FaLeaf style={{ marginRight: '12px', color: '#2d5016' }} />}
                    <Typography variant="h6" sx={{ color: '#2d5016' }}>
                      {rec.title}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rec.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {rec.items.map((item, idx) => (
                      <Chip 
                        key={idx} 
                        label={item} 
                        variant="outlined" 
                        sx={{ bgcolor: 'rgba(45, 80, 22, 0.05)', color: '#2d5016' }} 
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2d5016', mb: 2, textAlign: 'center' }}>
                  Overall Progress
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#2d5016' }}>
                    {progress.overall}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.overall} 
                    sx={{ height: 12, borderRadius: 6, mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2d5016', mb: 2, textAlign: 'center' }}>
                  Daily Goals
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#2d5016' }}>
                    {progress.dailyGoals}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.dailyGoals} 
                    sx={{ height: 12, borderRadius: 6, mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2d5016', mb: 2, textAlign: 'center' }}>
                  Weekly Milestones
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#2d5016' }}>
                    {progress.weeklyMilestones}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.weeklyMilestones} 
                    sx={{ height: 12, borderRadius: 6, mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardHeader 
                title="Achievement Badges" 
                sx={{ bgcolor: 'rgba(45, 80, 22, 0.1)' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(45, 80, 22, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mb: 1 
                    }}>
                      <FaCalendarAlt size={32} color="#2d5016" />
                    </Box>
                    <Typography variant="body2">7-Day Streak</Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(45, 80, 22, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mb: 1 
                    }}>
                      <FaUtensils size={32} color="#2d5016" />
                    </Box>
                    <Typography variant="body2">Healthy Eater</Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(45, 80, 22, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mb: 1 
                    }}>
                      <FaRunning size={32} color="#2d5016" />
                    </Box>
                    <Typography variant="body2">Active Lifestyle</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default WellnessProgram;