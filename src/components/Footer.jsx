import { Box, Typography } from "@mui/material";
import { FaWhatsapp, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <Box sx={{ bgcolor: "#a67c52", color: "#f9f6f1", p: 2, mt: 4, textAlign: "center", fontFamily: "serif" }}>
      <Typography variant="body1" sx={{ fontFamily: "serif" }}>
        🌿 HerbTrade AI &copy; {new Date().getFullYear()} | Connect with us
      </Typography>
      <Box sx={{ mt: 1 }}>
        <FaWhatsapp style={{ margin: "0 8px" }} />
        <FaInstagram style={{ margin: "0 8px" }} />
        <FaTwitter style={{ margin: "0 8px" }} />
      </Box>
    </Box>
  );
}

export default Footer; 