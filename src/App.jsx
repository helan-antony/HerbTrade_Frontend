import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import HerbCatalog from "./pages/HerbCatalog";
import UploadHerb from "./pages/UploadHerb";
import HospitalDiscovery from "./pages/HospitalDiscovery";
import Blog from "./pages/Blog";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import RequireAuth from "./components/RequireAuth";
import Logout from "./pages/Logout";
import EditProfile from "./pages/EditProfile";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";

const theme = createTheme({
  palette: {
    primary: { main: "#3a4d2d" },
    secondary: { main: "#a67c52" },
    background: { default: "#f9f6f1", paper: "#f3e7d4" },
    success: { main: "#7bb661" },
    text: { primary: "#3a4d2d", secondary: "#5c6842" }
  },
  typography: {
    fontFamily: "serif"
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ background: "#f9f6f1", minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/herbs" element={<HerbCatalog />} />
            <Route path="/upload-herb" element={<RequireAuth><UploadHerb /></RequireAuth>} />
            <Route path="/hospitals" element={<HospitalDiscovery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/edit-profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
          </Routes>
        </main>
        <Chatbot />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
