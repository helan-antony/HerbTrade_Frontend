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
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    FaPlay,
    FaCheckCircle,
    FaLeaf,
    FaArrowLeft,
    FaShareAlt,
    FaHeart,
    FaVideo,
    FaBook,
    FaLink,
    FaDumbbell,
    FaUtensils,
    FaLightbulb
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { handleYouTubeThumbnailError } from '../utils/errorHandler';

const EnrollmentVideos = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [postEnrollmentData, setPostEnrollmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userProgress, setUserProgress] = useState({
        overallProgress: 0,
        contentProgress: []
    });
    
    useEffect(() => {
        fetchPostEnrollmentContent();
        fetchUserProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    
    // Track video viewing progress
    useEffect(() => {
        if (videos[activeVideo]) {
            const currentVideo = videos[activeVideo];
            
            // Mark video as started when user selects it
            saveProgress(currentVideo.id, 10, false);
            
            // Set a timer to mark as completed after watching for a while
            const timer = setTimeout(() => {
                saveProgress(currentVideo.id, 100, true);
            }, 30000); // 30 seconds to mark as completed
            
            // Cleanup timer if user switches to another video
            return () => {
                clearTimeout(timer);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVideo]);
    
    // Check if user is enrolled before allowing access to post-enrollment content
    const fetchPostEnrollmentContent = async () => {
        try {
            setLoading(true);
            setError('');
            
            // First, try to enroll the user if they haven't already (this will also validate access)
            try {
                const enrollResponse = await axios.post(
                    API_ENDPOINTS.WELLNESS_COACH.ENROLL_IN_NEWSLETTER(id),
                    {},
                    {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }
                );
                console.log('Successfully enrolled in newsletter:', enrollResponse.data.message);
            } catch (enrollErr) {
                // Handle 409 conflicts gracefully - user already enrolled is normal behavior
                if (enrollErr.response?.status === 409) {
                    console.log('User already enrolled in this newsletter - this is expected behavior');
                    // No error message needed, this is normal
                } else {
                    console.warn('Enrollment failed with unexpected error:', enrollErr.message);
                    // Only show error for actual failures, not conflicts
                    setError('Failed to verify enrollment: ' + enrollErr.message);
                    return;
                }
            }
            
            // Now fetch the post-enrollment content for this specific newsletter
            const response = await axios.get(
                API_ENDPOINTS.WELLNESS_COACH.GET_POST_ENROLLMENT_DATA(id),
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            const fetchedData = response.data.postEnrollmentData || [];
            
            // If no data from API, use enhanced mock data with working videos
            if (fetchedData.length === 0) {
                setPostEnrollmentData([
                    {
                        id: 1,
                        type: 'video',
                        title: "Introduction to Ayurvedic Balance",
                        content: "Learn the fundamentals of Ayurvedic balance and understand your dosha constitution. This comprehensive guide will help you identify your body type and learn how to maintain optimal health through personalized wellness practices.",
                        duration: "15:30",
                        difficulty: "beginner",
                        url: "https://www.youtube.com/embed/Yy0JjW6z9Kk?rel=0",
                        tags: ["ayurveda", "balance", "doshas", "beginner"]
                    },
                    {
                        id: 2,
                        type: 'video',
                        title: "Morning Wellness Routine",
                        content: "Start your day with this energizing morning routine that combines gentle stretching, breathing exercises, and mindfulness practices. Perfect for setting a positive tone for your entire day.",
                        duration: "12:45",
                        difficulty: "beginner",
                        url: "https://www.youtube.com/embed/4pKly2JojMw?rel=0",
                        tags: ["morning", "routine", "stretching", "breathing"]
                    },
                    {
                        id: 3,
                        type: 'video',
                        title: "Herbal Teas for Digestion",
                        content: "Discover the power of herbal teas for digestive health. Learn about different herbs, their benefits, and how to prepare the perfect digestive tea blend for your specific needs.",
                        duration: "18:20",
                        difficulty: "intermediate",
                        url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
                        tags: ["herbs", "digestion", "tea", "natural remedies"]
                    },
                    {
                        id: 4,
                        type: 'tip',
                        title: "Daily Hydration Guide",
                        content: "Proper hydration is the foundation of good health. Learn how much water you need based on your body weight, activity level, and climate. Discover signs of dehydration and tips for maintaining optimal hydration throughout the day.",
                        duration: "5 min read",
                        difficulty: "beginner",
                        tags: ["hydration", "water", "health", "wellness"]
                    },
                    {
                        id: 5,
                        type: 'article',
                        title: "Seasonal Eating for Optimal Health",
                        content: "Align your diet with nature's cycles. This comprehensive guide explains how to eat seasonally, the benefits of seasonal foods, and practical meal planning strategies for each season to maximize nutrition and minimize environmental impact.",
                        duration: "8 min read",
                        difficulty: "intermediate",
                        tags: ["seasonal eating", "nutrition", "sustainable", "health"]
                    },
                    {
                        id: 6,
                        type: 'exercise',
                        title: "Desk Yoga for Office Workers",
                        content: "Combat the effects of prolonged sitting with these simple yoga poses you can do at your desk. Improve posture, reduce stress, and increase energy without leaving your workspace.",
                        duration: "10 min",
                        difficulty: "beginner",
                        url: "https://www.youtube.com/embed/MPao-L8VtZk?rel=0",
                        tags: ["yoga", "office", "stretching", "posture"]
                    }
                ]);
            } else {
                setPostEnrollmentData(fetchedData);
            }
            
        } catch (err) {
            console.error('Error fetching post-enrollment content:', err);
            setError('Failed to load post-enrollment content: ' + (err.response?.data?.message || err.message));
            // Set default mock data for demo purposes
            setPostEnrollmentData([
                {
                    id: 1,
                    type: 'tip',
                    title: "Morning Wellness Tip",
                    content: "Start your day with 10 minutes of meditation and a glass of warm water",
                    duration: "1 min",
                    difficulty: "beginner",
                    tags: ["morning", "meditation", "hydration"]
                },
                {
                    id: 2,
                    type: 'video',
                    title: "Introduction to Ayurvedic Balance",
                    content: "Learn the basics of Ayurvedic balance and doshas",
                    duration: "12:45",
                    difficulty: "beginner",
                    url: "https://www.youtube.com/embed/Yy0JjW6z9Kk",
                    tags: ["ayurveda", "balance", "doshas"]
                },
                {
                    id: 3,
                    type: 'article',
                    title: "Herbal Teas for Digestion",
                    content: "Discover herbal teas that can improve your digestive health",
                    duration: "5 min read",
                    difficulty: "beginner",
                    tags: ["herbs", "digestion", "tea"]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch user progress from database
    const fetchUserProgress = async () => {
        try {
            const response = await axios.get(
                API_ENDPOINTS.WELLNESS_COACH.GET_PROGRESS(id),
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            setUserProgress({
                overallProgress: response.data.overallProgress || 0,
                contentProgress: response.data.contentProgress || []
            });
        } catch {
            // No progress data found, starting fresh
            // This is fine - user hasn't started yet
        }
    };
    
    // Save user progress to database
    const saveProgress = async (contentId, progress = 0, completed = false) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.WELLNESS_COACH.SAVE_PROGRESS(id),
                {
                    contentId,
                    progress,
                    completed,
                    viewedAt: new Date()
                },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            // Update local progress state
            setUserProgress(prev => ({
                ...prev,
                overallProgress: response.data.progress,
                contentProgress: [
                    ...prev.contentProgress.filter(cp => cp.contentId !== contentId),
                    response.data.contentProgress
                ]
            }));
            
            console.log('Progress saved successfully');
        } catch (err) {
            console.error('Error saving progress:', err);
        }
    };
    

    


    // Define helper functions first to avoid hoisting issues
    const getThumbnailUrl = (url) => {
        if (!url) {
            return "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300";
        }
        
        // Handle YouTube URLs
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            
            if (url.includes('youtube.com')) {
                // Handle different YouTube URL formats
                if (url.includes('embed/')) {
                    videoId = url.split('embed/')[1]?.split('?')[0];
                } else if (url.includes('watch?v=')) {
                    videoId = url.split('watch?v=')[1]?.split('&')[0];
                }
            } else if (url.includes('youtu.be')) {
                // Handle youtu.be URLs
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            }
            
            // Fallback if we couldn't extract video ID
            if (!videoId) {
                // Use a default wellness-related video ID
                videoId = 'Yy0JjW6z9Kk';
            }
            
            // Add a cache buster to prevent 404 errors for unavailable videos
            const timestamp = Date.now();
            return `https://img.youtube.com/vi/${videoId}/0.jpg?cache=${timestamp}`;
        }
        
        // For other URLs or non-video content, return appropriate thumbnails
        return "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300";
    };
    
    const getIconForType = (type) => {
        if (!type) return <FaLightbulb size={10} color="#999" />;
        switch (type.toLowerCase()) {
            case 'video':
                return <FaVideo size={10} color="#999" />;
            case 'article':
                return <FaBook size={10} color="#999" />;
            case 'resource':
                return <FaLink size={10} color="#999" />;
            case 'exercise':
                return <FaDumbbell size={10} color="#999" />;
            case 'recipe':
                return <FaUtensils size={10} color="#999" />;
            case 'tip':
            default:
                return <FaLightbulb size={10} color="#999" />;
        }
    };
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const enrollmentTitle = id ? id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Advanced Wellness";

    // Map post-enrollment data to video format with progress tracking
    const videos = postEnrollmentData.map((item, index) => {
        const contentId = item._id || item.id || `content-${index}`;
        const progressData = userProgress.contentProgress.find(cp => cp.contentId === contentId);
        
        return {
            id: contentId,
            title: item.title,
            duration: item.duration || 'N/A',
            type: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Content',
            content: item.content,
            url: item.url || '',
            thumbnail: getThumbnailUrl(item.url),
            tags: item.tags || [],
            difficulty: item.difficulty || 'beginner',
            progress: progressData?.progress || 0,
            completed: progressData?.completed || false,
            viewedAt: progressData?.viewedAt,
            ...item
        };
    });

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
                    
                    {/* Progress Indicator */}
                    {userProgress.overallProgress > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                                    Your Progress
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>
                                    {userProgress.overallProgress}% Complete
                                </Typography>
                            </Box>
                            <Box sx={{
                                height: 8,
                                bgcolor: 'rgba(255,255,255,0.3)',
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${userProgress.overallProgress}%`,
                                    bgcolor: 'white',
                                    transition: 'width 0.3s ease'
                                }} />
                            </Box>
                        </Box>
                    )}
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
                {loading && (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress sx={{ color: '#2E7D32' }} />
                    </Box>
                )}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>
                )}
                
                {!loading && (
                    <Grid container spacing={4}>
                        {/* Main Content Player */}
                        <Grid size={{ xs: 12, md: 8 }}>
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
                                    {videos[activeVideo]?.url ? (
                                        <>
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
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                sandbox="allow-same-origin allow-scripts allow-popups"
                                                onError={(e) => {
                                                    console.warn('Failed to load video:', e);
                                                    // Mark as viewed even if there's an error loading
                                                    saveProgress(videos[activeVideo].id, 100, true);
                                                }}
                                            />
                                            {/* Fallback for thumbnail loading errors */}
                                            <img
                                                src={videos[activeVideo].thumbnail}
                                                alt="Video thumbnail"
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.log('Thumbnail error detected for:', videos[activeVideo].thumbnail);
                                                    handleYouTubeThumbnailError(e);
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                        </>
                                    ) : (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#f5f5f5',
                                            color: '#666',
                                            p: 3,
                                            textAlign: 'center'
                                        }}>
                                            <FaVideo size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                            <Typography variant="h6" sx={{ mb: 1 }}>
                                                {videos[activeVideo]?.type === 'Tip' || videos[activeVideo]?.type === 'Article' 
                                                    ? 'Content Preview' 
                                                    : 'Video Content'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ maxWidth: '80%' }}>
                                                {videos[activeVideo]?.content || 'No content available for this item.'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, mb: 1, color: '#1a330a' }}>
                                                {videos[activeVideo]?.title}
                                            </Typography>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                <Chip label={videos[activeVideo]?.type} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2E7D32', fontWeight: 600 }} />
                                                <Chip label={videos[activeVideo]?.duration} size="small" variant="outlined" />
                                                <Chip label={videos[activeVideo]?.difficulty} size="small" sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 600 }} />
                                            </Box>
                                            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                                                {videos[activeVideo]?.tags?.map((tag, idx) => (
                                                    <Chip key={idx} label={tag} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <IconButton size="small"><FaHeart /></IconButton>
                                            <IconButton size="small"><FaShareAlt /></IconButton>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" paragraph>
                                        {videos[activeVideo]?.content}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Master the art of {enrollmentTitle.toLowerCase()} with this comprehensive guide.
                                        Watch carefully and take notes as we explore the fundamental principles.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Content Sidebar */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: '24px',
                                bgcolor: 'white',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                height: '100%'
                            }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1a330a' }}>
                                    Course Content ({videos.length} items)
                                </Typography>
                                <List sx={{ width: '100%' }}>
                                    {videos.map((video, index) => (
                                        <ListItem
                                            key={video.id}
                                            onClick={() => {
                                                setActiveVideo(index);
                                                // Save progress when user selects a video
                                                saveProgress(video.id, 5, false);
                                            }}
                                            sx={{
                                                borderRadius: '16px',
                                                mb: 1,
                                                bgcolor: activeVideo === index ? '#f1f8e9' : 'transparent',
                                                border: activeVideo === index ? '1px solid #c8e6c9' : '1px solid transparent',
                                                '&:hover': { bgcolor: '#f1f8e9' },
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    variant="rounded"
                                                    src={video.thumbnail}
                                                    sx={{ width: 60, height: 40, mr: 2 }}
                                                    onError={(e) => {
                                                        console.log('Sidebar thumbnail error detected for:', video.thumbnail);
                                                        handleYouTubeThumbnailError(e);
                                                    }}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: activeVideo === index ? '#2E7D32' : 'inherit' }}>
                                                        {video.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box component="span" display="flex" alignItems="center" gap={1} mt={0.5}>
                                                        {getIconForType(video.type)}
                                                        <Typography variant="caption" color="text.secondary" component="span">{video.duration}</Typography>
                                                    </Box>
                                                }
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {video.completed && <FaCheckCircle size={14} color="#4CAF50" />}
                                                {activeVideo === index && <FaPlay size={12} color="#2E7D32" />}
                                                {video.progress > 0 && !video.completed && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {video.progress}%
                                                    </Typography>
                                                )}
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>

                                <Box mt={4} p={3} sx={{ bgcolor: '#FFF8E1', borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ color: '#F57F17', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FaLeaf /> Pro Tip
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Complete all content items to enhance your wellness journey!
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default EnrollmentVideos;