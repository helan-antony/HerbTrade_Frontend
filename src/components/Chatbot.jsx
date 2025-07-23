import { Fab, Box } from "@mui/material";
import { FaRobot } from "react-icons/fa";
import { useState } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      <Fab color="success" onClick={() => setOpen(!open)}>
        <FaRobot />
      </Fab>
      {open && (
        <Box sx={{
          position: "absolute", bottom: 70, right: 0, width: 320, bgcolor: "white", borderRadius: 2, boxShadow: 3, p: 2
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>🤖 HerbBot</div>
          <div>Hi! Ask me anything about herbs, exports, or hospitals. 🌱</div>
        </Box>
      )}
    </Box>
  );
}

export default Chatbot; 