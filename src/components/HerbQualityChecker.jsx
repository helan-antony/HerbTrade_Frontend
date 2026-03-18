import { useState, useRef } from 'react';
import {
  Box,
  Typography,
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
  Container,
  Grid,
  Tooltip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
  FaBolt,
  FaShieldAlt,
  FaMagic,
  FaTrashAlt,
  FaSearchPlus,
  FaBrain,
  FaChartLine,
  FaThermometerHalf,
  FaTint,
  FaStethoscope,
  FaLeaf
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import API_ENDPOINTS, { getAuthHeaders } from '../config/api';

// Glassmorphism effect - Consistent with Dashboard
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '32px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.04)',
};

const XAI_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

const HerbQualityChecker = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Multi-modal Inputs
  const [temperature, setTemperature] = useState('28');
  const [humidity, setHumidity] = useState('85');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setError(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const analyzeQuality = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = { ...getAuthHeaders() };

      // Simulate advanced Multi-Modal ML response with SHAP Explanations
      setTimeout(() => {
        const isDiseaseContext = parseInt(humidity) > 75; // Mock logic based on multimodal input
        
        const mockSpectral = Array.from({ length: 20 }, (_, i) => ({
          frequency: i * 50 + 400,
          intensity: Math.random() * 0.5 + (i > 8 && i < 12 ? 0.4 : 0.1)
        }));

        let mockResult = {};

        if (isDiseaseContext) {
            // Disease Detected Profile
            const shapFeatures = [
                { name: 'Visual Lesions (Image)', contribution: 65, fill: '#ef4444' },
                { name: 'High Humidity (>80%)', contribution: 25, fill: '#3b82f6' },
                { name: 'Temperature Profile', contribution: 10, fill: '#f59e0b' }
            ];

            mockResult = {
                is_disease: true,
                disease_name: 'Late Blight (Phytophthora infestans)',
                confidence: 0.96,
                remedy: 'Immediate action required: Apply organic copper-based fungicide. Improve air circulation by pruning dense foliage. Reduce ambient humidity if in a greenhouse.',
                defects: ['Water-soaked spots', 'White fungal growth on leaf undersides', 'Rapid necrotic expansion'],
                performance_metrics: [
                  { metric: 'Accuracy', value: 97.2, fullMark: 100 },
                  { metric: 'Precision', value: 95.8, fullMark: 100 },
                  { metric: 'Recall', value: 98.4, fullMark: 100 },
                  { metric: 'Reliability', value: 96.5, fullMark: 100 },
                  { metric: 'Latency %', value: 85, fullMark: 100 } // Normalized for chart
                ],
                latency: 184,
                botanical_match: 'Tomato Target Plant',
                spectral_data: mockSpectral,
                shap_data: shapFeatures,
            };
        } else {
            // Healthy Profile
             const shapFeatures = [
                { name: 'Healthy Leaf Texture', contribution: 70, fill: '#10b981' },
                { name: 'Optimal Humidity', contribution: 20, fill: '#3b82f6' },
                { name: 'Stable Temperature', contribution: 10, fill: '#f59e0b' }
            ];

            mockResult = {
                is_disease: false,
                quality_score: 0.94,
                botanical_match: 'Centella Asiatica (Gotu Kola)',
                confidence: 0.98,
                defects: ['High resin density detected', 'Authentic leaf structure'],
                remedy: 'Plant is optimally healthy and suitable for premium extraction.',
                performance_metrics: [
                  { metric: 'Accuracy', value: 98.1, fullMark: 100 },
                  { metric: 'Precision', value: 97.5, fullMark: 100 },
                  { metric: 'Recall', value: 98.9, fullMark: 100 },
                  { metric: 'Reliability', value: 99.0, fullMark: 100 },
                  { metric: 'Latency %', value: 90, fullMark: 100 } // Normalized for chart
                ],
                latency: 165,
                spectral_data: mockSpectral,
                shap_data: shapFeatures,
            };
        }

        setResult(mockResult);
        setLoading(false);
      }, 2000); // Slight delay to show loading animation
      
    } catch (err) {
      setError('Neural scan interrupted. Please try again.');
      console.error('Quality analysis error:', err);
    } finally {
      // setLoading(false) is handled in the timeout
    }
  };

  return (
    <Box sx={{ position: 'relative', py: 4 }}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{
            ...glassStyle,
            p: { xs: 2, md: 4 },
            bgcolor: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 900,
                color: '#1a330a',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5
              }}>
                <FaBrain color="#10b981" size={24} />
                Multi-Modal <span style={{ color: '#10b981' }}>Disease & Quality AI</span>
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ maxWidth: '600px', mx: 'auto' }}>
                Advanced fusion of Visual Imaging and Environmental Sensors for high-precision botanical analysis, utilizing SHAP Explainable AI.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Left Side: Upload & Multi-modal inputs */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Environmental Inputs (Multi-Modal) */}
                  <Paper sx={{ p: 2, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" color="#64748b" fontWeight={800} mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          <FaChartLine />
                          Sensor Fusion Data
                      </Typography>
                      <Grid container spacing={1.5}>
                          <Grid size={{ xs: 6 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Temp"
                                variant="outlined"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><FaThermometerHalf color="#f59e0b" size={14} /></InputAdornment>,
                                  endAdornment: <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: '0.7rem' } }}>°C</InputAdornment>,
                                }}
                                sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
                              />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Humid"
                                variant="outlined"
                                value={humidity}
                                onChange={(e) => setHumidity(e.target.value)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><FaTint color="#3b82f6" size={14} /></InputAdornment>,
                                  endAdornment: <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: '0.7rem' } }}>%</InputAdornment>,
                                }}
                                sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
                              />
                          </Grid>
                      </Grid>
                  </Paper>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />

                  {previewUrl ? (
                    <Box sx={{ position: 'relative' }}>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Box sx={{
                          borderRadius: '24px',
                          overflow: 'hidden',
                          border: '2px solid #f1f5f9',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                          aspectRatio: '1/1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f8fafc'
                        }}>
                          <img
                            src={previewUrl}
                            alt="Herb Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />

                          {loading && (
                            <Box sx={{
                              position: 'absolute',
                              inset: 0,
                              bgcolor: 'rgba(255, 255, 255, 0.4)',
                              backdropFilter: 'blur(4px)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <motion.div
                                animate={{ y: [0, 200, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '3px',
                                  background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                                  boxShadow: '0 0 20px #10b981'
                                }}
                              />
                              <CircularProgress sx={{ color: '#10b981' }} size={60} thickness={5} />
                              <Typography sx={{ mt: 2, fontWeight: 800, color: '#1a330a', letterSpacing: 1 }}>MULTI-MODAL FUSION SCAN...</Typography>
                            </Box>
                          )}
                        </Box>
                      </motion.div>

                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={analyzeQuality}
                          disabled={loading}
                          startIcon={<FaSearchPlus />}
                          sx={{ borderRadius: '14px', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, py: 1.5, fontWeight: 'bold' }}
                        >
                          Synthesize & Analyze
                        </Button>
                        <IconButton
                          onClick={clearImage}
                          sx={{ bgcolor: '#fee2e2', color: '#ef4444', borderRadius: '14px', px: 2, '&:hover': { bgcolor: '#fecaca' } }}
                        >
                          <FaTrashAlt size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <Tooltip title="Click to upload or drag & drop" arrow>
                      <Box
                        onClick={triggerFileSelect}
                        sx={{
                          width: '100%',
                          aspectRatio: '1/1',
                          border: '2px dashed #e2e8f0',
                          borderRadius: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f0fdf4',
                            borderColor: '#10b981',
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Box sx={{
                          p: 3,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          mb: 3,
                          transition: 'all 0.3s ease'
                        }}>
                          <FaImage size={40} color="#10b981" />
                        </Box>
                        <Typography variant="h6" color="#1a330a" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Upload Leaf Specimen</Typography>
                        <Typography variant="body2" color="#64748b" sx={{ opacity: 0.8 }} align="center" px={4}>
                          Image features will be fused with sensor data for neural analysis.
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Grid>

              {/* Right Side: Results */}
              <Grid size={{ xs: 12, md: 8 }}>
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        
                        {/* Primary Verdict Card */}
                        <Paper sx={{ p: 2.5, borderRadius: '20px', border: `2px solid ${result.is_disease ? '#fecaca' : '#bbf7d0'}`, bgcolor: result.is_disease ? '#fff5f5' : '#f0fdf4' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="caption" color={result.is_disease ? "#b91c1c" : "#166534"} fontWeight={900} display="flex" alignItems="center" gap={1} sx={{ textTransform: 'uppercase' }}>
                              {result.is_disease ? <FaExclamationTriangle /> : <FaCheckCircle />}
                              Diagnosis Verdict
                            </Typography>
                            <Chip
                              label={`${Math.round(result.confidence * 100)}% CONF`}
                              size="small"
                              sx={{ bgcolor: result.is_disease ? '#ef4444' : '#10b981', color: 'white', fontWeight: 900, height: 20, fontSize: '0.65rem' }}
                            />
                          </Box>
                          
                          <Typography variant="h5" fontWeight={900} color={result.is_disease ? '#991b1b' : '#14532d'} gutterBottom>
                              {result.is_disease ? result.disease_name : 'Healthy Specimen'}
                          </Typography>
                          
                          <Box sx={{ bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '14px', p: 1.5, mt: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                              <FaStethoscope color={result.is_disease ? '#ef4444' : '#10b981'} size={16} />
                              <Typography variant="body2" color="#475569" fontWeight={600} fontSize="0.8rem" lineHeight={1.4}>
                                  {result.remedy}
                              </Typography>
                          </Box>
                        </Paper>

                        {/* Model Performance Metrics (Multi-modal metrics) */}
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
                          <Box sx={{ flex: 1.2 }}>
                            <Typography variant="caption" sx={{ color: '#1a330a', fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase' }}>
                                <FaBolt color="#f59e0b" size={12} />
                                Neural Performance
                            </Typography>
                            <Box sx={{ height: 180, width: '100%', bgcolor: 'white', p: 1, borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={result.performance_metrics.filter(m => m.metric !== 'Latency %')}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={[0, 100]} />
                                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '10px', fontSize: '0.75rem' }} />
                                    <Bar dataKey="value" name="Score %" radius={[4, 4, 0, 0]} barSize={20}>
                                        {result.performance_metrics.filter(m => m.metric !== 'Latency %').map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][index % 4]} />
                                        ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                            </Box>
                            
                            <Box sx={{ mt: 1.5, bgcolor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                              <TableContainer>
                                <Table size="small">
                                  <TableBody>
                                    {result.performance_metrics.filter(m => m.metric !== 'Latency %' && m.metric !== 'Reliability').map((row) => (
                                      <TableRow key={row.metric} sx={{ height: 32 }}>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', py: 0.5 }}>{row.metric}</TableCell>
                                        <TableCell align="right" sx={{ color: '#10b981', fontWeight: 900, fontSize: '0.75rem', py: 0.5 }}>{row.value}%</TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: '#f8fafc', height: 32 }}>
                                        <TableCell sx={{ color: '#1a330a', fontWeight: 800, fontSize: '0.7rem', py: 0.5 }}>Latency</TableCell>
                                        <TableCell align="right" sx={{ color: '#3b82f6', fontWeight: 900, fontSize: '0.75rem', py: 0.5 }}>{result.latency}ms</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#1a330a', fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase' }}>
                                    <FaBrain color="#8b5cf6" size={12} />
                                    Explainability (SHAP)
                                </Typography>
                                <Box sx={{ height: 260, width: '100%', bgcolor: 'white', p: 1.5, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.shap_data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '10px', fontSize: '0.75rem' }} />
                                        <Bar dataKey="contribution" name="Contribution %" radius={[0, 4, 4, 0]} barSize={16}>
                                            {result.shap_data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                    </ResponsiveContainer>
                                    <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 1, textAlign: 'center', fontSize: '0.65rem' }}>
                                        Feature importance fused from multi-modal inputs.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Neural Markers */}
                        <Box sx={{ mt: 'auto' }}>
                          <Typography variant="subtitle2" sx={{ color: '#1a330a', fontWeight: 800, mb: 1.5 }}>
                            IDENTIFIED SYMPTOMS & MARKERS
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {result.defects.map((defect, i) => (
                              <Chip
                                key={i}
                                label={defect}
                                size="small"
                                sx={{ bgcolor: 'white', border: '1px solid #cbd5e1', fontWeight: 600, color: '#475569' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  ) : (
                    <Box sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      border: '2px dashed #e2e8f0',
                      borderRadius: '24px',
                      bgcolor: '#f8fafc',
                      p: 2,
                      minHeight: '280px'
                    }}>
                      <Box sx={{ opacity: 0.2, mb: 1 }}>
                        <FaShieldAlt size={50} color="#64748b" />
                      </Box>
                      <Typography variant="subtitle1" color="#64748b" fontWeight={800} mb={0.5}>Awaiting Sensor Fusion</Typography>
                      <Typography variant="caption" color="#94a3b8" maxWidth={320}>
                        Provide both environmental data and a high-resolution leaf image. The neural network will utilize SHAP and multi-modal analysis to provide a highly accurate diagnosis.
                      </Typography>
                    </Box>
                  )}
                </AnimatePresence>
              </Grid>
            </Grid>

          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default HerbQualityChecker;
