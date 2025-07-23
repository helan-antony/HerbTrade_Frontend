import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaLeaf, FaBlog, FaHospital, FaUserCircle } from "react-icons/fa";
import { MdLocalFlorist } from "react-icons/md";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

function Navbar() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for changes in localStorage from other tabs
    const onStorage = () => {
      const u = localStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', onStorage);

    // Listen for custom event in this tab
    const onUserChange = () => {
      const u = localStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('userChanged', onUserChange);

    // Monkey-patch localStorage.setItem/removeItem to dispatch event
    const origSetItem = localStorage.setItem;
    const origRemoveItem = localStorage.removeItem;
    localStorage.setItem = function(key, value) {
      origSetItem.apply(this, arguments);
      if (key === 'user') {
        window.dispatchEvent(new Event('userChanged'));
      }
    };
    localStorage.removeItem = function(key) {
      origRemoveItem.apply(this, arguments);
      if (key === 'user') {
        window.dispatchEvent(new Event('userChanged'));
      }
    };

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userChanged', onUserChange);
      localStorage.setItem = origSetItem;
      localStorage.removeItem = origRemoveItem;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#3a4d2d", fontFamily: "serif" }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <MdLocalFlorist size={32} style={{ marginRight: 8, color: "#a67c52" }} />
          <Link to="/" style={{ color: "#f3e7d4", textDecoration: "none", fontWeight: 700, fontSize: 22, fontFamily: "serif" }}>
            HerbTrade AI
          </Link>
        </Box>
        <Button sx={{ color: "#f3e7d4", fontFamily: "serif" }} component={Link} to="/herbs" startIcon={<FaLeaf />}>Herbs</Button>
        <Button sx={{ color: "#f3e7d4", fontFamily: "serif" }} component={Link} to="/hospitals" startIcon={<FaHospital />}>Hospitals</Button>
        <Button sx={{ color: "#f3e7d4", fontFamily: "serif" }} component={Link} to="/blog" startIcon={<FaBlog />}>Blog</Button>
        <Button sx={{ color: "#f3e7d4", fontFamily: "serif" }} component={Link} to="/dashboard" startIcon={<FaUserCircle />}>Dashboard</Button>
        {user ? (
          <>
            <Box sx={{ color: '#f3e7d4', fontFamily: 'serif', mx: 2, fontWeight: 600 }}>
              {user.name || user.email}
            </Box>
            <Button sx={{ color: '#f3e7d4', fontFamily: 'serif', fontWeight: 600 }} onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Button sx={{ color: "#f3e7d4", fontFamily: "serif" }} component={Link} to="/login">Login</Button>
            <Button sx={{ color: "#f3e7d4", fontFamily: "serif" }} component={Link} to="/signup">Signup</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 