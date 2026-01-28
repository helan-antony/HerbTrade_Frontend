import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  InputBase,
  IconButton
} from '@mui/material';
import {
  FaLeaf,
  FaCalendarAlt,
  FaArrowRight,
  FaSearch,
  FaHeartbeat,
  FaSpa,
  FaAppleAlt
} from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';

const Newsletter = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    fetchNewsletters();
  }, [currentPage]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      // Using mock data fallback if API fails or is empty for demo purposes
      try {
        const response = await axios.get(`${API_ENDPOINTS.NEWSLETTER.GET_ALL}?page=${currentPage}&limit=6`);
        if (response.data.newsletters && response.data.newsletters.length > 0) {
          setNewsletters(response.data.newsletters);
          setTotalPages(response.data.pagination.pages);
        } else {
          throw new Error("No data");
        }
      } catch (e) {
        // Mock data for display if backend is empty
        setNewsletters([
          { _id: '1', title: 'Spring Detox Rituals', content: 'Cleanse your body with these ancient ayurvedic practices perfect for the spring season...', category: 'seasonal', publishedDate: new Date(), author: 'Dr. Veda' },
          { _id: '2', title: 'Managing Stress Naturally', content: 'Discover herbs like Ashwagandha and Brahmi that help calm the mind and reduce cortisol...', category: 'wellness_tips', publishedDate: new Date(), author: 'Wellness Team' },
          { _id: '3', title: 'Ayurvedic Diet for Immunity', content: 'Boost your ojas (vitality) with these golden milk recipes and immune-boosting spices...', category: 'specific_condition', publishedDate: new Date(), author: 'Nutritionist Priya' },
          { _id: '4', title: 'Yoga for Better Sleep', content: 'Simple evening asanas to ground your energy and prepare for deep, restorative sleep...', category: 'wellness_tips', publishedDate: new Date(), author: 'Yogi Ram' },
        ]);
      }
    } catch (err) {
      setError('Failed to fetch newsletters');
      console.error('Error fetching newsletters:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Tips', icon: <FaLeaf /> },
    { id: 'seasonal', label: 'Seasonal', icon: <FaCalendarAlt /> },
    { id: 'wellness_tips', label: 'Wellness', icon: <FaSpa /> },
    { id: 'diet', label: 'Nutrition', icon: <FaAppleAlt /> },
  ];

  const handleEnroll = (id, title) => {
    const slug = title.toLowerCase().replace(/ /g, '-');
    navigate(`/newsletter/enroll/${slug}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f9fbe7 0%, #ffffff 100%)' }}>
      {/* Hero Section */}
      <Box sx={{
        bg: 'white',
        pt: 8,
        pb: 6,
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 50%, #effbe7 0%, #ffffff 100%)'
      }}>
        <Container maxWidth="md">
          <Chip icon={<FaHeartbeat />} label="Holistic Health Hub" sx={{ mb: 2, bgcolor: '#e8f5e9', color: '#2E7D32', fontWeight: 600 }} />
          <Typography variant="h2" component="h1" gutterBottom sx={{
            color: '#1a330a',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 800,
            mb: 2
          }}>
            Wellness Wisdom &  <span style={{ color: '#2E7D32' }}>Daily Tips</span>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: '600px', mx: 'auto' }}>
            Explore curated Ayurvedic insights, seasonal guides, and expert advice to nurture your body and mind. Enroll in topics to master them.
          </Typography>

          {/* Search Bar */}
          <Paper
            component="form"
            elevation={0}
            sx={{
              p: '4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 500,
              mx: 'auto',
              borderRadius: '50px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <FaSearch color="#2E7D32" size={18} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search for health tips (e.g., 'Detox', 'Sleep')"
            />
            <Button variant="contained" sx={{ borderRadius: '50px', bgcolor: '#2E7D32', px: 3 }}>
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Categories */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedTag(cat.id)}
              startIcon={cat.icon}
              variant={selectedTag === cat.id ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '50px',
                px: 3,
                py: 1,
                bgcolor: selectedTag === cat.id ? '#2E7D32' : 'transparent',
                borderColor: selectedTag === cat.id ? '#2E7D32' : '#c8e6c9',
                color: selectedTag === cat.id ? 'white' : '#2E7D32',
                '&:hover': {
                  bgcolor: selectedTag === cat.id ? '#1b5e20' : '#f1f8e9',
                  borderColor: '#2E7D32'
                }
              }}
            >
              {cat.label}
            </Button>
          ))}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: '#2E7D32' }} /></Box>
        ) : (
          <Grid container spacing={4}>
            {newsletters.map((newsletter) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={newsletter._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    bgcolor: 'white',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(46, 125, 50, 0.1)',
                      borderColor: '#c8e6c9'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Chip
                        label={newsletter.category.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: '#f1f8e9',
                          color: '#558b2f',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          borderRadius: '6px'
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FaCalendarAlt size={10} /> {new Date(newsletter.publishedDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Typography variant="h5" sx={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 700,
                      mb: 2,
                      color: '#1a330a',
                      lineHeight: 1.3
                    }}>
                      {newsletter.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {newsletter.content.replace(/<[^>]*>/g, '')}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" fontWeight={600} color="#2E7D32">
                        By {newsletter.author}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleEnroll(newsletter._id, newsletter.title)}
                      endIcon={<FaArrowRight />}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: '#1a330a',
                        py: 1.2,
                        '&:hover': { bgcolor: '#2E7D32' }
                      }}
                    >
                      Enroll & Watch
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Newsletter;