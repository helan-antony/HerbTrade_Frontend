import { 
  Box, Typography, Button, Grid, Card, CardContent, Container, 
  Chip, Divider, Paper, Avatar
} from "@mui/material";
import { Link } from "react-router-dom";
import { 
  FaLeaf, FaShieldAlt, FaRobot, FaUsers, FaStar, FaArrowRight,
  FaHospital, FaComments, FaShoppingCart, FaUserMd, FaSearch,
  FaChartLine, FaGlobe, FaLock, FaHeartbeat
} from "react-icons/fa";
import { useEffect, useState } from "react";

function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f6f0' }}>

      <Box sx={{ 
        background: 'linear-gradient(135deg, #2d5016 0%, #3a4d2d 50%, #4a6741 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>

        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            textAlign: "center", 
            py: { xs: 8, md: 12 },
            px: 2
          }}>
            <Chip 
              label="🚀 Professional System - Experience the Future of Ayurvedic Trade"
              sx={{ 
                mb: 4, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                px: 2,
                py: 1
              }}
            />
            
            <Typography 
              variant="h1" 
              fontWeight={800} 
              gutterBottom 
              sx={{ 
                fontFamily: "Poppins", 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4.5rem', lg: '5rem' },
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                background: 'linear-gradient(45deg, #ffffff 30%, #e8f5e8 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              🌿 HerbTrade AI
            </Typography>
            
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontFamily: "Poppins", 
                mb: 6, 
                maxWidth: 900, 
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.4,
                fontSize: { xs: '1.5rem', md: '2rem' },
                opacity: 0.95
              }}
            >
              Complete Ayurvedic Ecosystem: Trade Premium Herbs, Consult Expert Doctors, 
              and Access AI-Powered Health Solutions
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
              <Button 
                variant="contained" 
                size="large"
                component={Link} 
                to="/signup"
                endIcon={<FaArrowRight />}
                sx={{ 
                  px: 6, 
                  py: 3, 
                  fontSize: '1.2rem',
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  borderRadius: '50px',
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: '#2d5016',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  '&:hover': { 
                    bgcolor: '#f5f5f5', 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                Get Started Now
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                component={Link} 
                to="/herbs"
                sx={{ 
                  px: 6, 
                  py: 3, 
                  fontSize: '1.2rem',
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  borderRadius: '50px',
                  textTransform: 'none',
                  borderColor: 'white',
                  color: 'white',
                  borderWidth: 2,
                  '&:hover': { 
                    borderColor: '#f5f5f5',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Explore Catalog
              </Button>
            </Box>


            <Grid container spacing={4} sx={{ mt: 4 }}>
              {[
                { number: "1000+", label: "Premium Herbs" },
                { number: "50+", label: "Expert Doctors" },
                { number: "24/7", label: "AI Support" },
                { number: "100%", label: "Quality Assured" }
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>


      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            fontWeight={700} 
            color="#2d5016" 
            gutterBottom
            sx={{ fontFamily: "Poppins", mb: 2 }}
          >
            Complete Ayurvedic Platform
          </Typography>
          <Typography 
            variant="h5" 
            color="#5c6842" 
            sx={{ fontFamily: "Poppins", maxWidth: 600, mx: 'auto' }}
          >
            Everything you need for Ayurvedic wellness in one integrated platform
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Row 1: E-commerce & Healthcare */}
          <Grid item xs={12}>
            <Typography 
              variant="h4" 
              fontWeight={600} 
              color="#2d5016" 
              gutterBottom
              sx={{ fontFamily: "Poppins", mb: 4, textAlign: 'center' }}
            >
              🛒 E-commerce & Healthcare Services
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #e8f5e8',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)',
                      borderColor: '#4caf50'
                    }
                  }}
                  component={Link}
                  to="/herbs"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: '#4caf50', 
                      color: 'white',
                      width: 64,
                      height: 64,
                      mr: 3
                    }}>
                      <FaShoppingCart size={32} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color="#2d5016"
                        sx={{ fontFamily: "Poppins", mb: 1 }}
                      >
                        Herb Marketplace
                      </Typography>
                      <Chip 
                        label="Premium Quality" 
                        size="small" 
                        sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="#5c6842"
                    sx={{ fontFamily: "Poppins", lineHeight: 1.6, mb: 3 }}
                  >
                    Browse and purchase premium Ayurvedic herbs with complete quality assurance and authenticity certificates.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#4caf50', fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Shop Now</Typography>
                    <FaArrowRight size={12} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #e3f2fd',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(33, 150, 243, 0.2)',
                      borderColor: '#2196f3'
                    }
                  }}
                  component={Link}
                  to="/hospital-discovery"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: '#2196f3', 
                      color: 'white',
                      width: 64,
                      height: 64,
                      mr: 3
                    }}>
                      <FaHospital size={32} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color="#2d5016"
                        sx={{ fontFamily: "Poppins", mb: 1 }}
                      >
                        Hospital Discovery
                      </Typography>
                      <Chip 
                        label="Location Based" 
                        size="small" 
                        sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="#5c6842"
                    sx={{ fontFamily: "Poppins", lineHeight: 1.6, mb: 3 }}
                  >
                    Find nearby Ayurvedic hospitals and clinics with location-based search and pincode filtering.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#2196f3', fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Find Hospitals</Typography>
                    <FaArrowRight size={12} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Row 2: Professional Services */}
          <Grid item xs={12}>
            <Typography 
              variant="h4" 
              fontWeight={600} 
              color="#2d5016" 
              gutterBottom
              sx={{ fontFamily: "Poppins", mb: 4, textAlign: 'center' }}
            >
              👨‍⚕️ Professional Consultation Services
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #fff3e0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(255, 152, 0, 0.2)',
                      borderColor: '#ff9800'
                    }
                  }}
                  component={Link}
                  to="/hospital-discovery"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: '#ff9800', 
                      color: 'white',
                      width: 64,
                      height: 64,
                      mr: 3
                    }}>
                      <FaUserMd size={32} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color="#2d5016"
                        sx={{ fontFamily: "Poppins", mb: 1 }}
                      >
                        Doctor Consultation
                      </Typography>
                      <Chip 
                        label="Certified Experts" 
                        size="small" 
                        sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="#5c6842"
                    sx={{ fontFamily: "Poppins", lineHeight: 1.6, mb: 3 }}
                  >
                    Book appointments with certified Ayurvedic doctors and specialists for personalized treatment.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#ff9800', fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Book Appointment</Typography>
                    <FaArrowRight size={12} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #f3e5f5',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(156, 39, 176, 0.2)',
                      borderColor: '#9c27b0'
                    }
                  }}
                  component={Link}
                  to="/chatbot"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: '#9c27b0', 
                      color: 'white',
                      width: 64,
                      height: 64,
                      mr: 3
                    }}>
                      <FaRobot size={32} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color="#2d5016"
                        sx={{ fontFamily: "Poppins", mb: 1 }}
                      >
                        AI Health Assistant
                      </Typography>
                      <Chip 
                        label="AI Powered" 
                        size="small" 
                        sx={{ bgcolor: '#f3e5f5', color: '#6a1b9a', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="#5c6842"
                    sx={{ fontFamily: "Poppins", lineHeight: 1.6, mb: 3 }}
                  >
                    Get instant health advice and herb recommendations from our intelligent chatbot system.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#9c27b0', fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Chat Now</Typography>
                    <FaArrowRight size={12} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Row 3: Community & Analytics */}
          <Grid item xs={12}>
            <Typography 
              variant="h4" 
              fontWeight={600} 
              color="#2d5016" 
              gutterBottom
              sx={{ fontFamily: "Poppins", mb: 4, textAlign: 'center' }}
            >
              🌐 Community & Business Tools
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #ffebee',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(244, 67, 54, 0.2)',
                      borderColor: '#f44336'
                    }
                  }}
                  component={Link}
                  to="/blog"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: '#f44336', 
                      color: 'white',
                      width: 64,
                      height: 64,
                      mr: 3
                    }}>
                      <FaComments size={32} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color="#2d5016"
                        sx={{ fontFamily: "Poppins", mb: 1 }}
                      >
                        Community Blog
                      </Typography>
                      <Chip 
                        label="Interactive" 
                        size="small" 
                        sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="#5c6842"
                    sx={{ fontFamily: "Poppins", lineHeight: 1.6, mb: 3 }}
                  >
                    Read expert articles, share experiences, and engage with the Ayurvedic community.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#f44336', fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Join Community</Typography>
                    <FaArrowRight size={12} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #eceff1',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(96, 125, 139, 0.2)',
                      borderColor: '#607d8b'
                    }
                  }}
                  component={Link}
                  to="/dashboard"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: '#607d8b', 
                      color: 'white',
                      width: 64,
                      height: 64,
                      mr: 3
                    }}>
                      <FaChartLine size={32} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color="#2d5016"
                        sx={{ fontFamily: "Poppins", mb: 1 }}
                      >
                        Business Analytics
                      </Typography>
                      <Chip 
                        label="Professional Tools" 
                        size="small" 
                        sx={{ bgcolor: '#eceff1', color: '#37474f', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="#5c6842"
                    sx={{ fontFamily: "Poppins", lineHeight: 1.6, mb: 3 }}
                  >
                    Track your orders, manage inventory, and analyze market trends with comprehensive dashboards.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#607d8b', fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>View Analytics</Typography>
                    <FaArrowRight size={12} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>


      <Box sx={{ bgcolor: '#e8f5e8', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip 
              label="🎯 Platform Features"
              sx={{ 
                mb: 3, 
                bgcolor: '#4caf50', 
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                px: 3,
                py: 1
              }}
            />
            <Typography 
              variant="h3" 
              fontWeight={700} 
              color="#2d5016" 
              gutterBottom
              sx={{ fontFamily: "Poppins", mb: 2 }}
            >
              Comprehensive Platform Features
            </Typography>
            <Typography 
              variant="h6" 
              color="#5c6842" 
              sx={{ fontFamily: "Poppins", maxWidth: 700, mx: 'auto' }}
            >
              Explore all the powerful features available on our platform
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { 
                icon: <FaShoppingCart />, 
                title: "E-commerce Platform", 
                description: "Browse herbs, add to cart, and make secure purchases",
                status: "Fully Functional"
              },
              { 
                icon: <FaUserMd />, 
                title: "Appointment Booking", 
                description: "Book appointments with certified Ayurvedic doctors",
                status: "Professional System"
              },
              { 
                icon: <FaRobot />, 
                title: "AI Health Assistant", 
                description: "Get health advice and personalized herb recommendations",
                status: "AI Powered"
              },
              { 
                icon: <FaComments />, 
                title: "Community Features", 
                description: "Engage with blogs, share experiences, and connect",
                status: "Interactive"
              },
              { 
                icon: <FaSearch />, 
                title: "Location Search", 
                description: "Find hospitals and clinics by location and pincode",
                status: "Location Based"
              },
              { 
                icon: <FaLock />, 
                title: "Secure Authentication", 
                description: "Safe login, registration, and profile management",
                status: "Secure"
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid #c8e6c9',
                    bgcolor: 'white',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      borderColor: '#4caf50'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#4caf50', 
                      color: 'white',
                      width: 48,
                      height: 48,
                      mr: 2
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#2d5016" sx={{ fontFamily: "Poppins" }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#5c6842" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#2d5016" fontWeight={600}>
                      Status:
                    </Typography>
                    <Chip
                      label={feature.status}
                      size="small"
                      sx={{
                        bgcolor: '#e8f5e8',
                        color: '#2e7d32',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ 
        background: 'linear-gradient(135deg, #2d5016 0%, #3a4d2d 100%)',
        color: 'white',
        py: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              fontWeight={800}
              mb={3}
              sx={{
                fontFamily: "Poppins",
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Start Your Journey Today
            </Typography>
            <Typography
              variant="h5"
              mb={6}
              sx={{
                opacity: 0.9,
                fontFamily: "Poppins",
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              Experience the future of Ayurvedic trade and healthcare
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/signup"
                endIcon={<FaArrowRight />}
                sx={{
                  px: 6,
                  py: 3,
                  fontSize: '1.2rem',
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  borderRadius: '50px',
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: '#2d5016',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                Get Started Now
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/herbs"
                sx={{
                  px: 6,
                  py: 3,
                  fontSize: '1.2rem',
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  borderRadius: '50px',
                  textTransform: 'none',
                  borderColor: 'white',
                  color: 'white',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#f5f5f5',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Explore Products
              </Button>
            </Box>

            <Box sx={{ mt: 6, pt: 6, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography variant="body1" sx={{ opacity: 0.8, fontFamily: "Poppins" }}>
                🌿 <strong>HerbTrade AI</strong> - Revolutionizing Ayurvedic Healthcare & Commerce
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;

