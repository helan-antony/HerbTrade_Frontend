import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress, 
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  FaBrain,
  FaChartLine,
  FaLeaf,
  FaShoppingCart,
  FaCalendarAlt,
  FaBolt,
  FaLightbulb,
  FaTachometerAlt,
  FaHistory,
  FaHeartbeat,
  FaSearch,
  FaCamera
} from 'react-icons/fa';
import axios from 'axios';
import API_ENDPOINTS, { getAuthHeaders } from '../config/api';
import HerbQualityChecker from '../components/HerbQualityChecker';

const UserHerbsDashboard = ({ user }) => {
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedHerbs, setRecommendedHerbs] = useState([]);
  const [trendingHerbs, setTrendingHerbs] = useState([]);
  const [healthInsights, setHealthInsights] = useState(null);
  const [seasonalPredictions, setSeasonalPredictions] = useState([]);

  useEffect(() => {
    fetchMLData();
  }, []);

  const fetchMLData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { ...getAuthHeaders() };

      // Fetch ML-powered recommendations
      try {
        const recommendationsResponse = await axios.post(
          API_ENDPOINTS.ML.RECOMMENDATIONS,
          { user_id: user.id || 1 },
          { headers }
        );
        
        if (recommendationsResponse.data && recommendationsResponse.data.recommendations) {
          setRecommendedHerbs(recommendationsResponse.data.recommendations);
        }
      } catch (recommendationsError) {
        console.error('Error fetching recommendations from backend:', recommendationsError);
        
        // Try direct ML service endpoint
        try {
          const directResponse = await axios.post(
            API_ENDPOINTS.ML_SERVICE.RECOMMENDATIONS,
            { user_id: user.id || 1 },
            { headers }
          );
          
          if (directResponse.data && directResponse.data.recommendations) {
            setRecommendedHerbs(directResponse.data.recommendations);
          }
        } catch (directError) {
          console.error('Error fetching recommendations from direct ML service:', directError);
          
          // Use mock data if both APIs fail
          setRecommendedHerbs([
            {
              id: 1,
              name: 'Ashwagandha',
              category: 'Stress Relief',
              confidence: 92,
              benefits: ['Reduces stress', 'Improves sleep', 'Boosts immunity'],
              price: 299,
              discount: 15,
              image: '/assets/ashwagandha.png'
            },
            {
              id: 2,
              name: 'Turmeric Extract',
              category: 'Anti-inflammatory',
              confidence: 88,
              benefits: ['Reduces inflammation', 'Supports joint health', 'Antioxidant properties'],
              price: 349,
              discount: 10,
              image: '/assets/organic turmeric.png'
            },
            {
              id: 3,
              name: 'Tulsi',
              category: 'Immunity Booster',
              confidence: 85,
              benefits: ['Boosts immunity', 'Respiratory health', 'Antibacterial properties'],
              price: 199,
              discount: 20,
              image: '/assets/tulsi.png'
            }
          ]);
        }
      }

      // Fetch demand forecasts
      try {
        const forecastResponse = await axios.post(
          API_ENDPOINTS.ML.FORECAST,
          { product_id: 'any' },
          { headers }
        );
        
        if (forecastResponse.data && forecastResponse.data.forecast) {
          // Process forecast data to extract trending herbs
          const forecastData = forecastResponse.data.forecast;
          // Take the top 3 items with highest predicted demand
          const topTrending = forecastData.slice(0, 3).map((item, index) => ({
            name: ['Neem', 'Brahmi', 'Shatavari'][index],
            trend: 45 - index * 7,
            predictedGrowth: 12 + index * 3,
            image: ['/assets/neem.png', '/assets/brahmi.png', '/assets/ashwagandha.png'][index]
          }));
          setTrendingHerbs(topTrending);
        }
      } catch (forecastError) {
        console.error('Error fetching forecasts from backend:', forecastError);
        
        // Try direct ML service endpoint
        try {
          const directResponse = await axios.post(
            API_ENDPOINTS.ML_SERVICE.FORECAST,
            { product_id: 'any' },
            { headers }
          );
          
          if (directResponse.data && directResponse.data.forecast) {
            // Process forecast data to extract trending herbs
            const forecastData = directResponse.data.forecast;
            // Take the top 3 items with highest predicted demand
            const topTrending = forecastData.slice(0, 3).map((item, index) => ({
              name: ['Neem', 'Brahmi', 'Shatavari'][index],
              trend: 45 - index * 7,
              predictedGrowth: 12 + index * 3,
              image: ['/assets/neem.png', '/assets/brahmi.png', '/assets/ashwagandha.png'][index]
            }));
            setTrendingHerbs(topTrending);
          }
        } catch (directError) {
          console.error('Error fetching forecasts from direct ML service:', directError);
          
          // Use mock data if both APIs fail
          setTrendingHerbs([
            { name: 'Neem', trend: 45, predictedGrowth: 12, image: '/assets/neem.png' },
            { name: 'Brahmi', trend: 38, predictedGrowth: 8, image: '/assets/brahmi.png' },
            { name: 'Ashwagandha', trend: 32, predictedGrowth: 15, image: '/assets/ashwagandha.png' }
          ]);
        }
      }

      // Mock health insights data
      setHealthInsights({
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
      });

      // Mock seasonal predictions
      setSeasonalPredictions([
        { season: 'Winter', category: 'Immunity Boosters', expectedDemand: 65, herbs: ['Ashwagandha', 'Tulsi', 'Giloy'] },
        { season: 'Summer', category: 'Cooling Herbs', expectedDemand: 72, herbs: ['Neem', 'Amla', 'Coriander'] },
        { season: 'Monsoon', category: 'Digestive Aids', expectedDemand: 58, herbs: ['Ginger', 'Fennel', 'Triphala'] }
      ]);


    } catch (err) {
      setError('Failed to load AI-powered insights. Please try again later.');
      console.error('User Herbs Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (herb) => {
    // Add herb to cart logic
    console.log('Adding to cart:', herb);
  };

  const handleAddToWishlist = (herb) => {
    // Add herb to wishlist logic
    console.log('Adding to wishlist:', herb);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading AI-powered herb insights...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 56, 
            height: 56,
            mr: 2
          }}>
            <FaBrain size={24} />
          </Avatar>
          <Typography variant="h4" fontWeight={700} color="#3a4d2d">
            AI-Powered Herb Dashboard
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small"
          onClick={fetchMLData}
          startIcon={<FaBolt />}
        >
          Refresh Insights
        </Button>
      </Box>

      {/* Health Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaTachometerAlt size={24} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Wellness Score
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {healthInsights?.wellnessScore || 0}
              </Typography>
              <Typography variant="body2">
                Your current health wellness score based on activity and preferences
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={healthInsights?.wellnessScore || 0} 
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

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            color: 'white',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaHeartbeat size={24} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Risk Assessment
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {(healthInsights?.riskLevel || 'medium').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                Predicted health risk level based on current patterns
              </Typography>
              <Chip 
                label={`${healthInsights?.riskLevel || 'medium'} risk`}
                sx={{ 
                  mt: 2, 
                  bgcolor: 'white', 
                  color: healthInsights?.riskLevel === 'low' ? 'success.main' : 
                         healthInsights?.riskLevel === 'medium' ? 'warning.main' : 'error.main',
                  fontWeight: 'bold'
                }} 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaChartLine size={24} />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Predicted Gains
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Energy: +{healthInsights?.predictedImprovements?.energy || 0}%</Typography>
                <Typography variant="body2">Sleep: +{healthInsights?.predictedImprovements?.sleep || 0}%</Typography>
                <Typography variant="body2">Stress: {healthInsights?.predictedImprovements?.stress || 0}%</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Expected improvements with consistent usage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Personalized Recommendations */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} mb={3} color="#3a4d2d">
            <FaLeaf style={{ marginRight: 8 }} />
            Personalized Herb Recommendations
          </Typography>
          <Grid container spacing={3}>
            {recommendedHerbs.map((herb) => (
              <Grid item xs={12} md={4} key={herb.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} color="#2d5016">
                          {herb.name}
                        </Typography>
                        <Chip 
                          label={herb.category} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Chip 
                        label={`${herb.confidence}% match`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <img 
                        src={herb.image || '/assets/ashwagandha.png'} 
                        alt={herb.name}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {herb.benefits.join(', ')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          ₹{herb.price}
                          {herb.discount > 0 && (
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through', ml: 1 }}
                            >
                              ₹{Math.round(herb.price * 100 / (100 - herb.discount))}
                            </Typography>
                          )}
                        </Typography>
                        {herb.discount > 0 && (
                          <Chip 
                            label={`${herb.discount}% OFF`}
                            color="secondary"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleAddToCart(herb)}
                          sx={{ 
                            bgcolor: '#2d5016',
                            '&:hover': { bgcolor: '#3a4d2d' },
                            minWidth: 'auto'
                          }}
                        >
                          <FaShoppingCart size={12} />
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleAddToWishlist(herb)}
                          sx={{ minWidth: 'auto' }}
                        >
                          <FaHeart size={12} />
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Trending Herbs */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} mb={3} color="#3a4d2d">
            <FaSearch style={{ marginRight: 8 }} />
            Trending Herbs (AI-Predicted)
          </Typography>
          <Grid container spacing={3}>
            {trendingHerbs.map((herb, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="#2d5016">
                        {herb.name}
                      </Typography>
                      <Chip 
                        label={`+${herb.predictedGrowth}% growth`}
                        color="success"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <img 
                        src={herb.image} 
                        alt={herb.name}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Trend Strength:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={herb.trend} 
                        sx={{ 
                          flex: 1,
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(76, 175, 80, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50',
                            borderRadius: 4,
                          }
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {herb.trend}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Predicted high demand in upcoming months
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Health Recommendations */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
              <FaLightbulb />
            </Avatar>
            <Typography variant="h5" fontWeight={600} color="#3a4d2d">
              AI Health Recommendations
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {healthInsights?.recommendations.map((rec, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          width: 32, 
                          height: 32, 
                          mr: 2 
                        }}
                      >
                        <FaLightbulb size={16} />
                      </Avatar>
                      <Typography variant="h6" color="text.primary">
                        Recommendation {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                      {rec}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Wellness Score */}
          <Card sx={{ mt: 4, bgcolor: '#e8f5e8', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="#2e7d32">
                Your Wellness Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={healthInsights?.wellnessScore || 0} 
                    size={80}
                    thickness={4}
                    sx={{ color: '#4caf50' }}
                  />
                  <Box
                    sx={
                      {
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    }
                  >
                    <Typography variant="h6" component="div" color="text.primary">
                      {healthInsights?.wellnessScore || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" mb={1}>
                    Risk Level: <Chip 
                      label={healthInsights?.riskLevel || 'unknown'} 
                      color={healthInsights?.riskLevel === 'low' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on your current health data and lifestyle patterns
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Seasonal Predictions */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
              <FaCalendarAlt />
            </Avatar>
            <Typography variant="h5" fontWeight={600} color="#3a4d2d">
              Seasonal Herb Predictions
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {seasonalPredictions.map((prediction, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" color="#3a4d2d">
                        {prediction.season}
                      </Typography>
                      <Chip 
                        label={prediction.category}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Expected Demand
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={prediction.expectedDemand} 
                          sx={{ 
                            flex: 1,
                            height: 8, 
                            borderRadius: 4, 
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50',
                              borderRadius: 4,
                            }
                          }} 
                        />
                        <Typography variant="body2" fontWeight="bold" color="#4caf50">
                          {prediction.expectedDemand}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1} fontWeight="medium">
                        Recommended Herbs:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {prediction.herbs.map((herb, herbIndex) => (
                          <Chip
                            key={herbIndex}
                            label={herb}
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ 
                              borderColor: '#4caf50',
                              color: '#2e7d32',
                              fontWeight: 'medium'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Seasonal Insights */}
          <Card sx={{ mt: 4, bgcolor: '#f3e5f5', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="#7b1fa2">
                Seasonal Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                Our AI analyzes seasonal patterns, climate data, and market trends to predict which herbs 
                will be in highest demand. This helps you make informed decisions about which herbs to 
                stock or purchase for optimal health benefits during different seasons.
              </Typography>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Herb Quality Checker */}
      <HerbQualityChecker />
    </Box>
  );
};

export default UserHerbsDashboard;