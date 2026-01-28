import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box, 
  Chip, 
  Rating, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Alert,
  Pagination
} from '@mui/material';
import { FaUserMd, FaCertificate, FaStar, FaRupeeSign, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const WellnessCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    specializations: '',
    minRating: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchCoaches();
  }, [filters, pagination.page]);
  
  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError('');
        
      const params = new URLSearchParams({
        specializations: filters.specializations,
        minRating: filters.minRating,
        page: pagination.page,
        limit: 12
      }).toString();
  
      const response = await axios.get(`${API_ENDPOINTS.WELLNESS_COACH.GET_ALL}?${params}`);
        
      setCoaches(response.data.coaches);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch wellness coaches');
      console.error('Error fetching coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.userId.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         coach.bio.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSpecialization = !filters.specializations || 
                                 coach.specializations.some(spec => 
                                   spec.toLowerCase().includes(filters.specializations.toLowerCase())
                                 );
    
    const matchesMinRating = !filters.minRating || coach.rating >= parseFloat(filters.minRating);
    
    return matchesSearch && matchesSpecialization && matchesMinRating;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        color: '#2d5016',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        mb: 3,
        textAlign: 'center'
      }}>
        <FaUserMd style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        Meet Our Wellness Coaches
      </Typography>

      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Connect with certified Ayurvedic wellness experts for personalized guidance
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card elevation={3} sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Coaches"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={filters.specializations}
                onChange={(e) => handleFilterChange('specializations', e.target.value)}
                label="Specialization"
              >
                <MenuItem value="">All Specializations</MenuItem>
                <MenuItem value="detox">Detox</MenuItem>
                <MenuItem value="weight management">Weight Management</MenuItem>
                <MenuItem value="stress management">Stress Management</MenuItem>
                <MenuItem value="skin care">Skin Care</MenuItem>
                <MenuItem value="yoga therapy">Yoga Therapy</MenuItem>
                <MenuItem value="digestive health">Digestive Health</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Minimum Rating</InputLabel>
              <Select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                label="Minimum Rating"
              >
                <MenuItem value="">Any Rating</MenuItem>
                <MenuItem value="4.0">4.0+</MenuItem>
                <MenuItem value="4.5">4.5+</MenuItem>
                <MenuItem value="4.8">4.8+</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Coaches Grid */}
      {filteredCoaches.length === 0 ? (
        <Box textAlign="center" py={8}>
          <FaUserMd size={64} color="#2d5016" style={{ marginBottom: '1rem' }} />
          <Typography variant="h6" color="text.secondary">
            No wellness coaches found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters to see more coaches
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredCoaches.map((coach) => (
              <Grid item xs={12} sm={6} md={4} key={coach._id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(45, 80, 22, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <FaUserMd size={24} color="#2d5016" />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#2d5016', fontWeight: 600 }}>
                          {coach.userId.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {coach.experience} years experience
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={coach.rating} 
                        readOnly 
                        precision={0.1}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({coach.totalReviews} reviews)
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                      {coach.bio}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {coach.qualifications.slice(0, 2).map((qual, index) => (
                        <Chip 
                          key={index} 
                          label={qual} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem' }} 
                        />
                      ))}
                      {coach.qualifications.length > 2 && (
                        <Chip 
                          label={`+${coach.qualifications.length - 2} more`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem' }} 
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {coach.specializations.slice(0, 3).map((spec, index) => (
                        <Chip 
                          key={index} 
                          label={spec} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(45, 80, 22, 0.1)', 
                            color: '#2d5016',
                            fontSize: '0.7rem'
                          }} 
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FaRupeeSign size={14} color="#2d5016" />
                        <Typography variant="h6" sx={{ color: '#2d5016', fontWeight: 600, ml: 0.5 }}>
                          {coach.consultationFee}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          /session
                        </Typography>
                      </Box>
                      <Chip 
                        label={coach.isAvailable ? "Available" : "Unavailable"} 
                        color={coach.isAvailable ? "success" : "default"} 
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {coach.languages.map((lang, index) => (
                        <Chip 
                          key={index} 
                          label={lang} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem' }} 
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!coach.isAvailable}
                      sx={{ 
                        bgcolor: '#2d5016', 
                        '&:hover': { bgcolor: '#3a4d2d' },
                        color: 'white'
                      }}
                    >
                      {coach.isAvailable ? 'Book Consultation' : 'Currently Unavailable'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination 
                count={pagination.totalPages} 
                page={pagination.page} 
                onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default WellnessCoaches;