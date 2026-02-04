import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import HerbCatalog from "./pages/HerbCatalog";
import UploadHerb from "./pages/UploadHerb";
import HospitalDiscovery from "./pages/HospitalDiscovery";
import Blog from "./pages/Blog";
import Discussion from "./pages/Discussion";

import EnhancedWishlist from "./pages/EnhancedWishlist";
import EnhancedCart from "./pages/EnhancedCart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import HospitalBooking from "./pages/HospitalBooking";
import ViewBookings from "./pages/ViewBookings";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import Newsletter from "./pages/Newsletter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import EditProfile from "./pages/EditProfile";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import SellerDashboard from "./pages/SellerDashboard";
import Logout from "./pages/Logout";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MyOrders from "./pages/MyOrders";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminNewsletter from "./pages/AdminNewsletter";
import WellnessCoachDashboard from './pages/WellnessCoachDashboard';
import WellnessProgram from './pages/WellnessProgram';
import CoachPostEnrollment from './pages/CoachPostEnrollment';
import EnrollmentVideos from "./pages/EnrollmentVideos";

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

function ProtectedRoute({ children, adminOnly = false, allowedRoles = [] }) {
  const user = JSON.parse(localStorage.getItem("user") || 'null');
  const token = localStorage.getItem("token");

  if (!user || !token) return <Navigate to="/login" />;

  // If adminOnly is true, only allow admin users
  if (adminOnly && user.role !== "admin") return <Navigate to="/herbs" />;

  // If allowedRoles is specified, check if user role is in the allowed list
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" />;
    } else if (['seller', 'employee', 'manager', 'supervisor'].includes(user.role)) {
      return <Navigate to="/seller-dashboard" />;
    } else if (user.role === "delivery") {
      return <Navigate to="/delivery-dashboard" />;
    } else {
      return <Navigate to="/herbs" />;
    }
  }

  const currentPath = window.location.pathname;
  if (user.role === "admin" && currentPath === "/herbs") {
    return <Navigate to="/admin-dashboard" />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const isFullScreenPage = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, paddingTop: isFullScreenPage ? 0 : '80px' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly={true}><EnhancedAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin-orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin-newsletter" element={<ProtectedRoute adminOnly={true}><AdminNewsletter /></ProtectedRoute>} />

            <Route path="/herbs" element={<ProtectedRoute><HerbCatalog /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload-herb" element={<ProtectedRoute><UploadHerb /></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute><HospitalDiscovery /></ProtectedRoute>} />
            <Route path="/hospital-discovery" element={<ProtectedRoute><HospitalDiscovery /></ProtectedRoute>} />
            <Route path="/hospital-booking/:hospitalId" element={<ProtectedRoute><HospitalBooking /></ProtectedRoute>} />
            <Route path="/view-bookings" element={<ProtectedRoute><ViewBookings /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
            <Route path="/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><EnhancedCart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><EnhancedWishlist /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/seller-dashboard" element={<ProtectedRoute allowedRoles={['seller', 'employee', 'manager', 'supervisor']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['employee', 'manager', 'supervisor']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/delivery-dashboard" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/newsletter/enroll/:id" element={<ProtectedRoute><EnrollmentVideos /></ProtectedRoute>} />
            <Route path="/wellness-coach-dashboard" element={<ProtectedRoute allowedRoles={['wellness_coach', 'admin']}><WellnessCoachDashboard /></ProtectedRoute>} />
            <Route path="/wellness-program" element={<ProtectedRoute><WellnessProgram /></ProtectedRoute>} />
            <Route path="/coach-post-enrollment" element={<ProtectedRoute allowedRoles={['wellness_coach', 'admin']}><CoachPostEnrollment /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Chatbot />
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </ThemeProvider>
  );
}

export default App;