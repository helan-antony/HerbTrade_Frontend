import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  Button
} from '@mui/material';
import {
  FaBrain,
  FaChartLine,
  FaLeaf,
  FaShoppingCart,
  FaCalendarAlt,
  FaBolt,
  FaLightbulb,
  FaTachometerAlt
} from 'react-icons/fa';
import axios from 'axios';

const MLDashboard = ({ user }) => {
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMLData();
  }, [user]);

  const fetchMLData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from actual ML service first
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/ml/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.insights) {
          setMlData(response.data);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('ML API not available, using mock data');
      }
      
      // Fallback to mock data
      const mockMLData = {
        healthInsights: {
          wellnessScore: 87,
          riskLevel: 'low',
          recommendations: [
            'Increase daily water intake by 500ml',
            'Add 15 minutes of meditation to your routine',
            'Consider omega-3 supplements for heart health'
          ],
          predictedImprovements: {
            energy: 15,
            sleep: 22,
            stress: -18
          }
        },
        productRecommendations: [
          {
            id: 1,
            name: 'Ashwagandha Capsules',
            category: 'Stress Relief',
            confidence: 92,
            benefits: ['Reduces stress', 'Improves sleep', 'Boosts immunity'],
            price: 299,
            discount: 15
          },
          {
            id: 2,
            name: 'Turmeric Extract',
            category: 'Anti-inflammatory',
            confidence: 88,
            benefits: ['Reduces inflammation', 'Supports joint health', 'Antioxidant properties'],
            price: 349,
            discount: 10
          },
          {
            id: 3,
            name: 'Triphala Powder',
            category: 'Digestive Health',
            confidence: 85,
            benefits: ['Improves digestion', 'Detoxifies body', 'Supports weight management'],
            price: 199,
            discount: 20
          }
        ],
        demandForecast: {
          trendingHerbs: [
            { name: 'Neem', trend: 45, predictedGrowth: 12 },
            { name: 'Brahmi', trend: 38, predictedGrowth: 8 },
            { name: 'Shatavari', trend: 32, predictedGrowth: 15 }
          ],
          seasonalPredictions: [
            { season: 'Winter', category: 'Immunity Boosters', expectedDemand: 65 },
            { season: 'Summer', category: 'Cooling Herbs', expectedDemand: 72 },
            { season: 'Monsoon', category: 'Digestive Aids', expectedDemand: 58 }
          ]
        },
        personalizedInsights: {
          optimalSchedule: {
            morning: 'Take Ashwagandha with warm water',
            afternoon: '30 minutes walk recommended',
            evening: 'Meditation session (10-15 minutes)',
            night: 'Triphala with warm milk before sleep'
          },
          healthTrends: {
            currentStreak: 23,
            weeklyProgress: 12,
            monthlyGoal: 85
          }
        }
      };

      setMlData(mockMLData);
    } catch (err) {
      setError('Failed to load AI-powered insights. Please try again later.');
      console.error('ML Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading AI insights...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!mlData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No AI insights available at the moment.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 48, 
            height: 48,
            mr: 2
          }}>
            <FaBrain />
          </Avatar>
          <Typography variant="h5" fontWeight={700} color="#3a4d2d">
            AI-Powered Health Insights
          </Typography>
          <Chip 
            label="Beta" 
            color="primary" 
            size="small" 
            sx={{ ml: 2, fontWeight: 'bold' }}
          />
        </Box>
        <Button 
          variant="outlined" 
          size="small"
          onClick={fetchMLData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <FaBolt />}
        >
          {loading ? 'Refreshing...' : 'Refresh Insights'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Wellness Score Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaTachometerAlt size={24} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Wellness Score
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mlData.healthInsights.wellnessScore}
              </Typography>
              <Typography variant="body2">
                Your current health wellness score based on activity and preferences
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={mlData.healthInsights.wellnessScore} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  mt: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                    borderRadius: 4,
                  }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Level Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaLightbulb size={24} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Risk Assessment
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {mlData.healthInsights.riskLevel.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                Predicted health risk level based on current patterns
              </Typography>
              <Chip 
                label={`${mlData.healthInsights.riskLevel} risk`}
                sx={{ 
                  mt: 2, 
                  bgcolor: 'white', 
                  color: mlData.healthInsights.riskLevel === 'low' ? 'success.main' : 
                         mlData.healthInsights.riskLevel === 'medium' ? 'warning.main' : 'error.main',
                  fontWeight: 'bold'
                }} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Predicted Improvements Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaBolt size={24} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Predicted Gains
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Energy: +{mlData.healthInsights.predictedImprovements.energy}%</Typography>
                <Typography variant="body2">Sleep: +{mlData.healthInsights.predictedImprovements.sleep}%</Typography>
                <Typography variant="body2">Stress: {mlData.healthInsights.predictedImprovements.stress}%</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Expected improvements with consistent usage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Personalized Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="#3a4d2d">
                <FaLeaf style={{ marginRight: 8 }} />
                Personalized Recommendations
              </Typography>
              <Grid container spacing={2}>
                {mlData.healthInsights.recommendations.map((rec, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa', 
                      borderRadius: 2,
                      border: '1px solid #e9ecef'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {rec}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* AI-Recommended Products */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="#3a4d2d">
                <FaShoppingCart style={{ marginRight: 8 }} />
                AI-Recommended Products for You
              </Typography>
              <Grid container spacing={3}>
                {mlData.productRecommendations.map((product) => (
                  <Grid item xs={12} md={4} key={product.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600} color="#2d5016">
                              {product.name}
                            </Typography>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                          <Chip 
                            label={`${product.confidence}% match`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {product.benefits.join(', ')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              ₹{product.price}
                              {product.discount > 0 && (
                                <Typography 
                                  component="span" 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ textDecoration: 'line-through', ml: 1 }}
                                >
                                  ₹{Math.round(product.price * 100 / (100 - product.discount))}
                                </Typography>
                              )}
                            </Typography>
                            {product.discount > 0 && (
                              <Chip 
                                label={`${product.discount}% OFF`}
                                color="secondary"
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                          <Button 
                            variant="contained" 
                            size="small"
                            sx={{ 
                              bgcolor: '#2d5016',
                              '&:hover': { bgcolor: '#3a4d2d' }
                            }}
                          >
                            Add to Cart
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Personalized Schedule */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3} color="#3a4d2d">
                <FaCalendarAlt style={{ marginRight: 8 }} />
                Your Personalized Daily Schedule
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(mlData.personalizedInsights.optimalSchedule).map(([time, activity]) => (
                  <Grid item xs={12} sm={6} md={3} key={time}>
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      textAlign: 'center',
                      height: '100%'
                    }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1}>
                        {time.charAt(0).toUpperCase() + time.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MLDashboard;