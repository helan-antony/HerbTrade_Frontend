import { Box, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import { FaSeedling, FaUpload } from "react-icons/fa";

function UploadHerb() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [packaging, setPackaging] = useState("");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3e7d4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif" }}>
      <Box sx={{ width: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" textAlign="center" mb={2} fontFamily="serif">
          Upload Herb <FaSeedling />
        </Typography>
        <TextField fullWidth label="Herb Name" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Type" value={type} onChange={e => setType(e.target.value)} sx={{ mb: 2 }} />
        <Button variant="contained" component="label" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif", mb: 2 }} startIcon={<FaUpload />}>
          Upload Image
          <input type="file" hidden onChange={e => setImage(e.target.files[0])} />
        </Button>
        <TextField fullWidth label="Packaging" value={packaging} onChange={e => setPackaging(e.target.value)} sx={{ mb: 2 }} />
        <Button variant="contained" sx={{ bgcolor: "#3a4d2d", color: "#f3e7d4", fontFamily: "serif" }} fullWidth>
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default UploadHerb; 