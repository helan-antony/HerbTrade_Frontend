import { Box, Typography, Grid, Card, CardContent, CardMedia, TextField, Button } from "@mui/material";
import { FaSearch, FaShoppingBasket } from "react-icons/fa";
import { useState } from "react";

const herbs = [
  { name: "Tulsi", image: "/assets/tulsi.png", desc: "Holy Basil, immunity booster 🌱" },
  { name: "Ashwagandha", image: "/assets/ashwagandha.png", desc: "Stress relief, energy ⚡" },
  { name: "Neem", image: "/assets/neem.png", desc: "Detox, skin care 🍃" },
  { name: "Brahmi", image: "/assets/brahmi.png", desc: "Memory, focus 🧠" }
];

function HerbCatalog() {
  const [search, setSearch] = useState("");
  return (
    <Box sx={{ minHeight: "100vh", width: "100vw", bgcolor: "#f3e7d4", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "serif", py: 4, boxSizing: "border-box" }}>
      <Typography variant="h4" fontWeight={700} color="#3a4d2d" mb={2} fontFamily="serif">
        Herb Catalog 🌿
      </Typography>
      <Box sx={{ width: "100%", maxWidth: 600, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search herbs (e.g. neem for hair fall)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <FaSearch style={{ marginRight: 8 }} /> }}
          sx={{ bgcolor: "#f9f6f1", borderRadius: 1 }}
        />
      </Box>
      <Grid container spacing={4} justifyContent="center" sx={{ width: "100%", maxWidth: 1200 }}>
        {herbs.filter(h => h.name.toLowerCase().includes(search.toLowerCase())).map(h => (
          <Grid item xs={12} sm={6} md={3} key={h.name}>
            <Card sx={{ bgcolor: "#f9f6f1", color: "#3a4d2d", fontFamily: "serif" }}>
              <CardMedia component="img" height="180" image={h.image} alt={h.name} sx={{ objectFit: "cover" }} />
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{h.name}</Typography>
                <Typography>{h.desc}</Typography>
                <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", mt: 1, fontFamily: "serif" }} startIcon={<FaShoppingBasket />}>
                  Buy
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HerbCatalog; 