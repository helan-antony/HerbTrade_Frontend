import { useState, useEffect } from 'react';
import { FaArrowLeft, FaUser, FaPhone, FaImage, FaEnvelope, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function EditProfile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const u = JSON.parse(userData);
        console.log('User data loaded:', u);
        setUser(u);
        setName(u.name || '');
        setPhone(u.phone || '');
        setProfilePic(u.profilePic || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Set default user object to prevent navigation issues
        setUser({ role: 'user' });
      }
    } else {
      console.log('No user data found in localStorage');
      // Set default user object to prevent navigation issues
      setUser({ role: 'user' });
    }


  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, profilePic, email: user.email })
      });
      const data = await res.json();
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Profile updated successfully!');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  }

  const handleBackToDashboard = () => {
    console.log('Back arrow clicked, user role:', user?.role);
    try {
      if (user?.role === 'admin') {
        console.log('Navigating to admin dashboard');
        navigate('/admin-dashboard');
      } else if (user?.role === 'employee' || user?.role === 'manager' || user?.role === 'supervisor') {
        console.log('Navigating to employee dashboard');
        navigate('/employee-dashboard');
      } else {
        console.log('Navigating to profile page');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error during navigation:', error);
      // Fallback navigation
      navigate('/profile');
    }
  };

  // Alternative simple back navigation
  const handleSimpleBack = () => {
    console.log('Simple back navigation');
    navigate(-1); // Go back to previous page in history
  };

  // Add keyboard shortcut for back navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape key pressed - going back');
        handleBackToDashboard();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [user]); // Include user in dependency array

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-ultra p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              console.log('Back button clicked!');
              handleBackToDashboard();
            }}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            title="Go back to previous page (or press Escape)"
          >
            <FaArrowLeft className="text-lg transition-transform duration-200 hover:-translate-x-0.5" />
          </button>
          <h1 className="text-3xl font-playfair font-bold gradient-text">Edit Profile</h1>
        </div>
          {/* Profile Avatar */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl border-4 border-white">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="text-white text-3xl" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-700">{user?.name || 'User'}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-emerald-600 mb-3">
                <FaUser className="mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-500 text-slate-700 shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-emerald-600 mb-3">
                <FaPhone className="mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-500 text-slate-700 shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-emerald-600 mb-3">
                <FaImage className="mr-2" />
                Profile Picture URL
              </label>
              <input
                type="url"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-500 text-slate-700 shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="Enter profile picture URL (optional)"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-emerald-600 mb-3">
                <FaEnvelope className="mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-6 py-4 bg-slate-100/80 border-2 border-slate-200/50 rounded-2xl text-slate-500 cursor-not-allowed shadow-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 btn-primary py-4 px-8 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  console.log('Cancel button clicked!');
                  handleBackToDashboard();
                }}
                className="flex-1 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 py-4 px-8 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile; 
