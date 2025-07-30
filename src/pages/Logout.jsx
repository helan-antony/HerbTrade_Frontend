import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Logout() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear all user-related data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('wishlistItems');
    localStorage.removeItem('herbtradeCart');
    localStorage.removeItem('herbtradeWishlist');
    
    // Dispatch events to update other components
    window.dispatchEvent(new Event('userChanged'));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('wishlistUpdated'));
    
    // Show success message
    toast.success('Logged out successfully!');
    
    // Navigate to login
    navigate('/login');
    
    // Force refresh to clear any cached data
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center pt-24">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
        <p className="text-xl text-slate-600 font-medium">Logging out...</p>
      </div>
    </div>
  );
}

export default Logout; 