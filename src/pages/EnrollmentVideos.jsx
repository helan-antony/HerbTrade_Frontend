import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Fade,
    useTheme,
    Paper
} from '@mui/material';
import {
    FaPlay,
    FaCheckCircle,
    FaLeaf,
    FaArrowLeft,
    FaShareAlt,
    FaHeart
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const EnrollmentVideos = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock data - In a real app, fetch based on 'id'
    const enrollmentTitle = id ? id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Advanced Wellness";

    const videos = [
        {
            id: 1,
            title: "Introduction to Ayurvedic Balance",
            duration: "12:45",
            type: "Lecture",
            url: "https://www.youtube.com/embed/Yy0JjW6z9Kk", // Placeholder
            thumbnail: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300"
        },
        {
            id: 2,
            title: "Daily Morning Rituals (Dinacharya)",
            duration: "08:30",
            type: "Practice",
            url: "https://www.youtube.com/embed/Yy0JjW6z9Kk",
            thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300"
        },
        {
            id: 3,
            title: "Herbal Teas for Digestion",
            duration: "15:20",
            type: "Recipe",
            url: "https://www.youtube.com/embed/Yy0JjW6z9Kk",
            thumbnail: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300"
        }
    ];

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f4f9f4',
            pb: 8
        }}>
            {/* Success Banner */}
            <Box sx={{
                bgcolor: '#2E7D32',
                color: 'white',
                py: 4,
                px: 2,
                mb: 4,
                background: 'linear-gradient(135deg, #2E7D32 0%, #558b2f 100%)',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.2)'
            }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<FaArrowLeft />}
                        sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, '&:hover': { color: 'white' } }}
                        onClick={() => navigate('/newsletter')}
                    >
                        Back to Tips
                    </Button>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Fade in={mounted} timeout={1000}>
                            <Box sx={{
                                bgcolor: 'white',
                                borderRadius: '50%',
                                p: 1.5,
                                display: 'flex',
                                boxShadow: '0 0 0 8px rgba(255,255,255,0.2)'
                            }}>
                                <FaCheckCircle color="#2E7D32" size={32} />
                            </Box>
                        </Fade>
                        <Box>
                            <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
                                Successfully Enrolled!
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                Welcome to your journey in {enrollmentTitle}
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Main Video Player */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255,255,255,0.5)'
                        }}>
                            <Box sx={{
                                position: 'relative',
                                paddingTop: '56.25%', // 16:9 Aspect Ratio
                                bgcolor: 'black'
                            }}>
                                <iframe
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 0
                                    }}
                                    src={videos[activeVideo].url}
                                    title={videos[activeVideo].title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </Box>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, mb: 1, color: '#1a330a' }}>
                                            {videos[activeVideo].title}
                                        </Typography>
                                        <Box display="flex" gap={1}>
                                            <Chip label={videos[activeVideo].type} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2E7D32', fontWeight: 600 }} />
                                            <Chip label={videos[activeVideo].duration} size="small" variant="outlined" />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <IconButton size="small"><FaHeart /></IconButton>
                                        <IconButton size="small"><FaShareAlt /></IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    Master the art of {enrollmentTitle.toLowerCase()} with this comprehensive guide.
                                    Watch carefully and take notes as we explore the fundamental principles.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Playlist Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{
                            p: 3,
                            borderRadius: '24px',
                            bgcolor: 'white',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            height: '100%'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1a330a' }}>
                                Course Content
                            </Typography>
                            <List sx={{ width: '100%' }}>
                                {videos.map((video, index) => (
                                    <ListItem
                                        key={video.id}
                                        button
                                        onClick={() => setActiveVideo(index)}
                                        sx={{
                                            borderRadius: '16px',
                                            mb: 1,
                                            bgcolor: activeVideo === index ? '#f1f8e9' : 'transparent',
                                            border: activeVideo === index ? '1px solid #c8e6c9' : '1px solid transparent',
                                            '&:hover': { bgcolor: '#f1f8e9' }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="rounded"
                                                src={video.thumbnail}
                                                sx={{ width: 60, height: 40, mr: 2 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: activeVideo === index ? '#2E7D32' : 'inherit' }}>
                                                    {video.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                    <FaPlay size={10} color="#999" />
                                                    <Typography variant="caption" color="text.secondary">{video.duration}</Typography>
                                                </Box>
                                            }
                                        />
                                        {activeVideo === index && <FaPlay size={12} color="#2E7D32" />}
                                    </ListItem>
                                ))}
                            </List>

                            <Box mt={4} p={3} sx={{ bgcolor: '#FFF8E1', borderRadius: '16px' }}>
                                <Typography variant="subtitle2" sx={{ color: '#F57F17', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaLeaf /> Pro Tip
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Complete all videos to earn the "Wellness Scholar" badge for your profile!
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default EnrollmentVideos;
