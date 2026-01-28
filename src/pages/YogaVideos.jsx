import { Box, Typography, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import { FaPlay, FaHeart, FaShare } from 'react-icons/fa';

function YogaVideos() {
  // Sample yoga videos data
  const yogaVideos = [
    {
      id: 1,
      title: "Morning Yoga Routine",
      channel: "Yoga with Adriene",
      duration: "20:15",
      thumbnail: "https://img.youtube.com/vi/oaciZU8lHBI/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=oaciZU8lHBI"
    },
    {
      id: 2,
      title: "10 Minute Full Body Stretch",
      channel: "Boho Beautiful",
      duration: "10:32",
      thumbnail: "https://img.youtube.com/vi/_NnnE9JEm0s/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=_NnnE9JEm0s"
    },
    {
      id: 3,
      title: "Beginner Yoga Class",
      channel: "Yoga Journal",
      duration: "30:18",
      thumbnail: "https://img.youtube.com/vi/dCy6NW7KJD8/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=dCy6NW7KJD8"
    },
    {
      id: 4,
      title: "Yin Yoga for Relaxation",
      channel: "Purple Valley Ashtanga Yoga",
      duration: "25:40",
      thumbnail: "https://img.youtube.com/vi/0Dfi05sqo-U/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=0Dfi05sqo-U"
    }
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="#2d5016" mb={4}>
        Yoga Videos
      </Typography>
      
      <Grid container spacing={3}>
        {yogaVideos.map((video) => (
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

export default YogaVideos;