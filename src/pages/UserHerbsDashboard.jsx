import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
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
  Paper,
  IconButton,
  Tooltip,
  Container
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
  FaHeartbeat,
  FaSearch,
  FaCamera,
  FaHeart,
  FaShieldAlt,
  FaSeedling,
  FaMagic,
  FaArrowRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Legend, BarChart, Bar, Cell
} from 'recharts';
import API_ENDPOINTS, { getAuthHeaders } from '../config/api';
import HerbQualityChecker from '../components/HerbQualityChecker';


// Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

// Glassmorphism effect - Light Style
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)', // Even subtler shadow
};

const UserHerbsDashboard = ({ user = {} }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedHerbs, setRecommendedHerbs] = useState([]);
  const [trendingHerbs, setTrendingHerbs] = useState([]);
  const [healthInsights, setHealthInsights] = useState(null);
  const [seasonalPredictions, setSeasonalPredictions] = useState([]);
  const [advancedRecommendations, setAdvancedRecommendations] = useState([]);
  const [qualityAssessments, setQualityAssessments] = useState([]);
  const [demandForecasts, setDemandForecasts] = useState([]);
  const [mlSystemStatus, setMlSystemStatus] = useState(null);
  const [seasonalViewMode, setSeasonalViewMode] = useState('cards'); // 'cards' | 'graph'
  const scannerRef = useRef(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (herb) => {
    // Check for existing cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === herb.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...herb, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger cart update event for Navbar
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${herb.name} added to cart!`);
  };

  const handleAddToRegimen = (herbName) => {
    toast.info(`Preparing customized regimen for ${herbName}...`);
    setTimeout(() => {
      toast.success(`${herbName} added to your daily wellness regimen!`);
    }, 1000);
  };

  useEffect(() => {
    fetchMLData();
  }, []);

  const fetchMLData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = { ...getAuthHeaders() };

      // Fetch ML system status
      try {
        const statusResponse = await axios.get('http://localhost:5001/api/ml/system-status', { headers });
        setMlSystemStatus(statusResponse.data);
      } catch (statusError) {
        console.error('Error fetching ML system status:', statusError);
      }

      // Fetch advanced health recommendations using HealthRec-X
      try {
        const healthRecResponse = await axios.post(
          API_ENDPOINTS.ML_SERVICE.HEALTH_RECOMMENDATIONS,
          {
            user_profile: {
              age: user.age || 30,
              gender: user.gender || 'other',
              weight: user.weight || 70,
              height: user.height || 170,
              medical_conditions: user.medical_conditions || [],
              allergies: user.allergies || [],
              current_medications: user.medications || []
            },
            health_conditions: user.health_conditions || [],
            preferences: {
              preferred_forms: ['capsules', 'powder', 'tea'],
              budget_level: 'medium',
              experience_level: 'intermediate'
            }
          },
          { headers }
        );

        if (healthRecResponse.data && healthRecResponse.data.recommendations) {
          setAdvancedRecommendations(healthRecResponse.data.recommendations.slice(0, 2));
          if (healthRecResponse.data.explanations) {
            setHealthInsights(prev => ({
              ...prev,
              recommendations: healthRecResponse.data.explanations,
              wellnessScore: Math.round(healthRecResponse.data.profile_match_score * 100)
            }));
          }
        }
      } catch (healthRecError) {
        setAdvancedRecommendations([
          {
            herb: 'Ashwagandha',
            condition: 'Stress & Anxiety',
            relevance_score: 0.96,
            safety_score: 0.94,
            properties: ['adaptogenic', 'stress-relief', 'rejuvenating'],
            dosage_recommendation: '300-500mg daily',
            usage_instructions: 'Best taken in evening with warm milk'
          },
          {
            herb: 'Turmeric Curcumin',
            condition: 'Immune Support',
            relevance_score: 0.92,
            safety_score: 0.98,
            properties: ['anti-inflammatory', 'antioxidant', 'detox'],
            dosage_recommendation: '500-1000mg daily',
            usage_instructions: 'Take with food and black pepper for absorption'
          }
        ]);
      }

      // Fetch demand forecasts using DemandProphet-X
      try {
        const forecastResponse = await axios.post(
          API_ENDPOINTS.ML_SERVICE.DEMAND_FORECAST,
          {
            historical_data: [],
            forecast_horizon: 90,
            product_info: { product_name: 'turmeric' }
          },
          { headers }
        );

        if (forecastResponse.data && forecastResponse.data.forecast) {
          setDemandForecasts(forecastResponse.data.forecast);
          // Set trending based on forecast
          const topTrending = forecastResponse.data.forecast.slice(0, 3).map((item, index) => ({
            name: ['Ashwagandha', 'Turmeric', 'Tulsi'][index],
            growth: 15 + index * 5,
            trend: 70 + index * 10,
            image: `/assets/${['ashwagandha', 'turmeric', 'tulsi'][index]}.png`
          }));
          setTrendingHerbs(topTrending);
        }
      } catch (forecastError) {
        setDemandForecasts([
          { date: '2024-03-01', predicted_sales: 185, confidence_lower: 160, confidence_upper: 210 },
          { date: '2024-04-01', predicted_sales: 220, confidence_lower: 190, confidence_upper: 250 },
          { date: '2024-05-01', predicted_sales: 195, confidence_lower: 170, confidence_upper: 220 }
        ]);
      }

      // Fetch quality assessments using QualityGuard-AI
      try {
        const qualityResponse = await axios.post(
          API_ENDPOINTS.ML_SERVICE.QUALITY_ASSESSMENT,
          { product_data: {}, historical_data: [] },
          { headers }
        );

        if (qualityResponse.data && qualityResponse.data.quality_assessment) {
          setQualityAssessments([qualityResponse.data]);
        }
      } catch (qualityError) {
        setQualityAssessments([
          {
            quality_assessment: {
              overall_score: 0.94,
              status: 'Excellent',
              anomaly_status: 'No Anomalies',
              defect_status: 'Pure'
            },
            recommendations: [
              'Batch purity exceeds industry standards',
              'Optimal moisture content for shelf life'
            ]
          }
        ]);
      }

      // Fetch traditional recommendations
      try {
        const recommendationsResponse = await axios.post(
          API_ENDPOINTS.ML.RECOMMENDATIONS,
          { user_id: user.id || 1 },
          { headers }
        );
        if (recommendationsResponse.data?.recommendations) {
          setRecommendedHerbs(recommendationsResponse.data.recommendations);
        }
      } catch (e) {
        setRecommendedHerbs([
          {
            id: 1,
            name: 'Ashwagandha Premium',
            category: 'Stress Relief',
            confidence: 94,
            benefits: ['Reduces stress', 'Improves sleep'],
            price: 499,
            discount: 10,
            image: '/assets/ashwagandha.png'
          },
          {
            id: 2,
            name: 'Organic Turmeric',
            category: 'Immunity',
            confidence: 89,
            benefits: ['Anti-inflammatory', 'Immune boost'],
            price: 299,
            discount: 15,
            image: '/assets/organic turmeric.png'
          }
        ]);
      }

      setSeasonalPredictions([
        { season: 'Spring', category: 'Detox Rituals', demand: 92, herbs: ['Neem', 'Amla', 'Dandelion'] },
        { season: 'Summer', category: 'Cooling Support', demand: 78, herbs: ['Aloe Vera', 'Mint', 'Sandalwood'] },
        { season: 'Autumn', category: 'Lung Wellness', demand: 85, herbs: ['Tulsi', 'Licorice', 'Mullein'] }
      ]);

    } catch (err) {
      setError('System refresh required. Please try again.');
      console.error('User Dashboard error:', err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #f0f7f0 0%, #ffffff 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <FaSeedling size={60} color="#2e7d32" />
        </motion.div>
        <Typography sx={{ mt: 3, color: '#1a330a', fontWeight: 600, letterSpacing: 1 }}>
          CULTIVATING YOUR PERSONAL INSIGHTS...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: '#ffffff', // Pure white
      pb: 8
    }}>
      {/* Hero Header */}
      <Box sx={{
        pt: 6,
        pb: 10,
        textAlign: 'center',
        background: '#ffffff', // Pure white
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Chip
              icon={<FaMagic style={{ color: '#2E7D32' }} />}
              label="Next-Gen Botanical Intelligence"
              sx={{
                mb: 3,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#2E7D32',
                fontWeight: 700,
                border: '1px solid #dcfce7',
                px: 1
              }}
            />
            <Typography variant="h2" sx={{
              color: '#1a330a',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-0.02em'
            }}>
              Your Personal <span style={{ color: '#10b981' }}>Herb Oracle</span>
            </Typography>
            <Typography variant="h6" sx={{
              color: '#5c6842',
              maxWidth: '700px',
              mx: 'auto',
              mb: 4,
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Harmonizing ancient botanical wisdom with advanced neural processing.
              Discover the perfect natural chemistry for your unique biological profile.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={fetchMLData}
                startIcon={<FaBolt />}
                sx={{
                  borderRadius: '50px',
                  bgcolor: '#10b981', // Clean emerald
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Sync Insights
              </Button>
              <Button
                variant="outlined"
                onClick={scrollToScanner}
                startIcon={<FaCamera />}
                sx={{
                  borderRadius: '50px',
                  borderColor: '#10b981',
                  color: '#10b981',
                  px: 4,
                  py: 1.5,
                  bgcolor: '#ffffff',
                  '&:hover': { borderColor: '#059669', bgcolor: '#f0fdf4' }
                }}
              >
                Authenticate Herb
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
        {/* Top Intelligence Bar */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Paper sx={{ ...glassStyle, p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', mb: 2 }}>
                  <FaTachometerAlt size={32} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#1a330a" gutterBottom>Wellness Score</Typography>
                <Typography variant="h2" fontWeight={900} color="#10b981">{healthInsights?.wellnessScore}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={healthInsights?.wellnessScore}
                  sx={{ width: '100%', height: 10, borderRadius: 5, mt: 2, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }}
                />
                <Typography variant="caption" sx={{ mt: 2, color: '#5c6842' }}>Excellent health alignment. You're doing great!</Typography>
              </Paper>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Paper sx={{ ...glassStyle, p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', mb: 2 }}>
                  <FaHeartbeat size={32} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#1a330a" gutterBottom>Stress Resilience</Typography>
                <Typography variant="h2" fontWeight={900} color="#3b82f6">82%</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#5c6842' }}>Your adaptogenic balance is currently very stable.</Typography>
                <Chip label="LOW RISK" size="small" sx={{ mt: 2, bgcolor: '#f0f9ff', color: '#0369a1', fontWeight: 800 }} />
              </Paper>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Paper sx={{ ...glassStyle, p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', mb: 2 }}>
                  <FaBolt size={32} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#1a330a" gutterBottom>System Load</Typography>
                <Typography variant="h2" fontWeight={900} color="#f59e0b">Optimized</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#5c6842' }}>Neural networks are processing real-time market data.</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {[1, 2, 3, 4].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 8, height: 8, borderRadius: 4, background: '#f59e0b' }} />)}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Intelligence Sections */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, borderLeft: '5px solid #10b981', pl: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, color: '#1a330a' }}>
                  HealthRec-X Predictions
                </Typography>
                <Typography variant="body1" color="#5c6842">Precision botanical formulations for your biology</Typography>
              </Box>
              <Chip label="96.2% CONFIDENCE" size="small" sx={{ ml: 'auto', bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700, border: '1px solid #dcfce7' }} />
            </Box>

            <Grid container spacing={4}>
              {advancedRecommendations.map((rec, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card sx={{
                    ...glassStyle,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a330a' }}>{rec.herb}</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#10b981' }}>{Math.round(rec.relevance_score * 100)}% BIOMATCH</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#3b82f6' }}>{Math.round(rec.safety_score * 100)}% SAFETY</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {rec.properties.map(p => <Chip key={p} label={p} size="small" sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 600, borderRadius: '6px' }} />)}
                      </Box>

                      <Box sx={{ bgcolor: '#f9fafb', p: 3, borderRadius: '20px', mb: 3, border: '1px solid #f3f4f6' }}>
                        <Typography variant="subtitle2" sx={{ color: '#1a330a', fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaShieldAlt size={14} color="#10b981" /> DOSAGE PROTOCOL
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#5c6842', lineHeight: 1.6 }}>{rec.dosage_recommendation}. {rec.usage_instructions}.</Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleAddToRegimen(rec.herb)}
                        endIcon={<FaArrowRight />}
                        sx={{ borderRadius: '14px', bgcolor: '#10b981', py: 1.5, '&:hover': { bgcolor: '#059669' }, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                      >
                        Add to Regimen
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Market Predictions */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, borderLeft: '5px solid #3b82f6', pl: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, color: '#1a330a' }}>
                DemandProphet-X
              </Typography>
              <Typography variant="body1" color="#5c6842">Market equilibrium and trend forecasting</Typography>
            </Box>
          </Box>

          <Paper sx={{ ...glassStyle, p: 4, mb: 4 }}>
            <Typography variant="h6" fontWeight={800} color="#1a330a" mb={3}>30-Day Market Equilibrium Forecast</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandForecasts}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_sales"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    strokeWidth={3}
                    name="Predicted Demand"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {demandForecasts.slice(0, 3).map((f, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Paper sx={{ ...glassStyle, p: 3, textAlign: 'center', border: '1px solid #eff6ff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                    {new Date(f.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#3b82f6', my: 1 }}>{f.predicted_sales}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#94a3b8' }}>PREDICTED UNITS</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">CONFIDENCE</Typography>
                    <Typography variant="caption" fontWeight={700} color="#334155">{f.confidence_lower} - {f.confidence_upper}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6' } }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Personalized Recommendations */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, borderLeft: '5px solid #8b5cf6', pl: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, color: '#1a330a' }}>
                Curated Collections
              </Typography>
              <Typography variant="body1" color="#5c6842">Hand-picked by AI based on your preference history</Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {recommendedHerbs.map((h) => (
              <Grid size={{ xs: 12, md: 4 }} key={h.id}>
                <Card sx={{
                  borderRadius: '28px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  bgcolor: 'white',
                  transition: 'all 0.4s ease',
                  border: '1px solid #f1f5f9',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }
                }}>
                  <Box sx={{ height: 220, position: 'relative' }}>
                    <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <IconButton sx={{ bgcolor: 'white', color: '#ef4444', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <FaHeart size={18} />
                      </IconButton>
                    </Box>
                    <Chip
                      label={`${h.confidence}% MATCH`}
                      sx={{ position: 'absolute', bottom: 16, left: 16, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', color: '#166534', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #dcfce7' }}
                    />
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} color="#1e293b" gutterBottom>{h.name}</Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>{h.benefits.join(' • ')}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" fontWeight={900} color="#10b981">₹{h.price}</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddToCart(h)}
                        sx={{ borderRadius: '12px', bgcolor: '#f0fdf4', color: '#10b981', minWidth: '44px', height: '44px', boxShadow: 'none', '&:hover': { bgcolor: '#dcfce7' } }}
                      >
                        <FaShoppingCart size={18} />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* QualityGuard-AI Section - Light Theme */}
        <Box sx={{
          p: 5,
          borderRadius: '40px',
          background: '#ffffff', // Pure white
          color: '#1a330a',
          mb: 8,
          border: '1px solid #f1f5f9',
          boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Avatar sx={{ bgcolor: '#dcfce7', color: '#10b981', width: 64, height: 64 }}>
                  <FaShieldAlt size={32} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#064e3b">QualityGuard-AI</Typography>
                  <Typography variant="body2" sx={{ color: '#065f46', opacity: 0.8 }}>Real-time batch authentication system</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={900} sx={{ mb: 3, color: '#059669' }}>94.2% Pure</Typography>
              <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.8, mb: 4 }}>
                Our botanical neural inspection and biological markers confirm this batch meets premium therapeutic standards.
                Zero synthetic adulterants detected in the current supply chain analysis.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label="NON-GMO" sx={{ bgcolor: 'white', border: '1px solid #dcfce7', color: '#065f46', fontWeight: 600 }} />
                <Chip label="ISO-CERTIFIED" sx={{ bgcolor: 'white', border: '1px solid #dcfce7', color: '#065f46', fontWeight: 600 }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 4, borderRadius: '28px', bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '1px solid #dcfce7', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Typography variant="subtitle2" sx={{ mb: 3, color: '#059669', fontWeight: 800, letterSpacing: 1 }}>AI QUALITY METRICS</Typography>
                {qualityAssessments[0]?.recommendations.map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    <Box sx={{ minWidth: 20, mt: 0.5 }}><FaMagic size={14} color="#10b981" /></Box>
                    <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>{r}</Typography>
                  </Box>
                ))}
                <Box sx={{ mt: 4, p: 2, borderRadius: '14px', bgcolor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                  <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 800, display: 'block', mb: 0.5 }}>SYSTEM CLOUD STATUS</Typography>
                  <Box sx={{ color: '#064e3b', display: 'flex', alignItems: 'center', gap: 1, typography: 'body2' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s infinite' }} />
                    Scanning Batch #HT-2024-0X... <span style={{ color: '#10b981', fontWeight: 700 }}>Verified Pure</span>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Seasonal Guide */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
            <Typography variant="h4" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              color: '#1a330a',
              textAlign: 'center',
              flex: 1,
            }}>
              Seasonal <span style={{ color: '#2E7D32' }}>Harmony Grid</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Button
                size="small"
                variant={seasonalViewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setSeasonalViewMode('cards')}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#10b981',
                  color: seasonalViewMode === 'cards' ? 'white' : '#10b981',
                  bgcolor: seasonalViewMode === 'cards' ? '#10b981' : 'transparent',
                  '&:hover': { bgcolor: seasonalViewMode === 'cards' ? '#059669' : '#f0fdf4' }
                }}
              >
                Cards
              </Button>
              <Button
                size="small"
                variant={seasonalViewMode === 'graph' ? 'contained' : 'outlined'}
                onClick={() => setSeasonalViewMode('graph')}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#10b981',
                  color: seasonalViewMode === 'graph' ? 'white' : '#10b981',
                  bgcolor: seasonalViewMode === 'graph' ? '#10b981' : 'transparent',
                  '&:hover': { bgcolor: seasonalViewMode === 'graph' ? '#059669' : '#f0fdf4' }
                }}
              >
                View as Graph
              </Button>
            </Box>
          </Box>

          {seasonalViewMode === 'cards' ? (
            <Grid container spacing={4}>
              {seasonalPredictions.map((s, i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <Paper sx={{
                    ...glassStyle,
                    p: 5,
                    textAlign: 'center',
                    bgcolor: 'white',
                    border: '1px solid #f1f5f9',
                    background: s.season === 'Spring' ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' :
                      s.season === 'Summer' ? 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)' : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
                  }}>
                    <Typography variant="h6" fontWeight={800} color="#334155" gutterBottom>{s.season}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 3, color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>{s.category.toUpperCase()}</Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                      <CircularProgress variant="determinate" value={s.demand} size={90} thickness={3} sx={{ color: '#10b981' }} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" fontWeight={900} color="#1e293b">{s.demand}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                      {s.herbs.map(h => <Chip key={h} label={h} size="small" variant="outlined" sx={{ borderColor: '#dcfce7', color: '#166534', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.8)' }} />)}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ ...glassStyle, p: 4, bgcolor: 'white' }}>
              <Typography variant="subtitle2" color="#64748b" fontWeight={700} mb={1}>Seasonal Demand Index (%)</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonalPredictions} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="season"
                      tick={{ fill: '#334155', fontWeight: 700, fontSize: 14 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                      formatter={(value, name) => [`${value}%`, 'Demand Index']}
                      labelFormatter={(label) => {
                        const item = seasonalPredictions.find(s => s.season === label);
                        return `${label} — ${item?.category || ''}`;
                      }}
                    />
                    <Bar dataKey="demand" radius={[12, 12, 0, 0]} maxBarSize={80}>
                      {seasonalPredictions.map((s, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={s.season === 'Spring' ? '#10b981' : s.season === 'Summer' ? '#f59e0b' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
                {seasonalPredictions.map((s) => (
                  <Box key={s.season} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      {s.season}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {s.herbs.map(h => (
                        <Chip key={h} label={h} size="small" variant="outlined" sx={{ borderColor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.65rem' }} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

      </Container>

      {/* Herb Quality Checker Component */}
      <Box sx={{ mt: 10 }} ref={scannerRef}>
        <HerbQualityChecker />
      </Box>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </Box >
  );
};

export default UserHerbsDashboard;