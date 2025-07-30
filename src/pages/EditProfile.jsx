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
      const u = JSON.parse(userData);
      setUser(u);
      setName(u.name || '');
      setPhone(u.phone || '');
      setProfilePic(u.profilePic || '');
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
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user.role === 'employee' || user.role === 'manager' || user.role === 'supervisor') {
      navigate('/employee-dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <button
            onClick={handleBackToDashboard}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <h1 className="text-2xl font-semibold text-emerald-600">Edit Profile</h1>
        </div>

        <div className="p-6">
          {/* Profile Avatar */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="text-white text-2xl" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-lg font-medium text-gray-600">User</h2>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="Teena Ram"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="Enter profile picture URL"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                onClick={handleBackToDashboard}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
