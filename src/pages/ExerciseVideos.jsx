import { Box, Typography, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import { FaHeart, FaShare } from 'react-icons/fa';

function ExerciseVideos() {
  // Sample exercise videos data (non-gym focused)
  const exerciseVideos = [
    {
      id: 1,
      title: "Home Workout - No Equipment Needed",
      channel: "FitnessBlender",
      duration: "30:22",
      thumbnail: "https://img.youtube.com/vi/XbGSB3ZZc2c/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=XbGSB3ZZc2c"
    },
    {
      id: 2,
      title: "Bodyweight Strength Training",
      channel: "ATHLEAN-X",
      duration: "25:18",
      thumbnail: "https://img.youtube.com/vi/8fbZ7y62K48/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=8fbZ7y62K48"
    },
    {
      id: 3,
      title: "Outdoor Running Tips",
      channel: "Running with Amy",
      duration: "15:45",
      thumbnail: "https://img.youtube.com/vi/8Sj222VQy2o/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=8Sj222VQy2o"
    },
    {
      id: 4,
      title: "Calisthenics Basics",
      channel: "Howcast",
      duration: "12:30",
      thumbnail: "https://img.youtube.com/vi/6W0fX0y0FOY/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=6W0fX0y0FOY"
    }
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="#2d5016" mb={4}>
        Exercise Videos
      </Typography>
      
      <Grid container spacing={3}>
        {exerciseVideos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 6 
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => window.open(video.url, '_blank')}
            >
              <Box 
                component="img" 
                src={video.thumbnail} 
                alt={video.title}
                sx={{ 
                  width: '100%', 
                  height: '160px', 
                  objectFit: 'cover' 
                }} 
              />
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {video.channel}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {video.duration}
                  </Typography>
                  <Box>
                    <IconButton size="small" color="secondary">
                      <FaHeart />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <FaShare />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ExerciseVideos;