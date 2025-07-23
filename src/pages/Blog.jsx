import { Box, Typography, Grid, Card, CardContent, TextField, Button } from "@mui/material";
import { FaPenFancy, FaCommentDots } from "react-icons/fa";
import { useState, useEffect } from "react";

function Blog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/blog")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load blog posts");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }
    // Use localStorage user for author
    const user = JSON.parse(localStorage.getItem('user'));
    const author = user?.name || "Anonymous";
    try {
      const res = await fetch("http://localhost:5000/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author })
      });
      const data = await res.json();
      if (data._id) {
        setPosts([data, ...posts]);
        setTitle("");
        setContent("");
        setSuccess("Blog post submitted!");
      } else {
        setError(data.error || "Failed to submit post");
      }
    } catch {
      setError("Failed to submit post");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", height: "100vh", width: "100vw", bgcolor: "#f3e7d4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "serif", boxSizing: "border-box", m: 0, p: 0, overflow: "hidden" }}>
      <Box sx={{ width: "100%", maxWidth: 1200, px: { xs: 2, md: 0 } }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" mb={2} fontFamily="serif" textAlign="center">
          Herbal Blog ✍️
        </Typography>
        <Box sx={{ mb: 4, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1, width: "100%", maxWidth: 600, mx: "auto" }}>
          <Typography variant="h6" fontWeight={600} mb={1} fontFamily="serif"><FaPenFancy /> Share Your Remedy</Typography>
          <TextField fullWidth label="Title" value={title} onChange={e => setTitle(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Content" value={content} onChange={e => setContent(e.target.value)} multiline rows={3} sx={{ mb: 2 }} />
          <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif" }} onClick={handleSubmit}>Submit</Button>
          {success && <Typography sx={{ color: 'green', fontSize: 14, mt: 1, textAlign: 'center' }}>{success}</Typography>}
          {error && <Typography sx={{ color: 'red', fontSize: 14, mt: 1, textAlign: 'center' }}>{error}</Typography>}
        </Box>
        {loading ? (
          <Typography sx={{ color: '#3a4d2d', fontFamily: 'serif', textAlign: 'center', mt: 2 }}>Loading...</Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {posts.map((p, i) => (
              <Grid item xs={12} sm={6} md={6} key={p._id || i} sx={{ display: "flex", justifyContent: "center" }}>
                <Card sx={{ bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif", minHeight: 180, width: "100%", maxWidth: 400 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600}>{p.title}</Typography>
                    <Typography color="text.secondary">by {p.author}</Typography>
                    <Typography sx={{ mt: 1 }}>{p.content}</Typography>
                    <Button variant="text" sx={{ color: "#3a4d2d", fontFamily: "serif", mt: 1 }} startIcon={<FaCommentDots />}>
                      Comment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Blog; 