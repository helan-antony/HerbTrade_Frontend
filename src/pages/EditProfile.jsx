import { useState, useEffect } from 'react';
import { FaArrowLeft, FaUser, FaPhone, FaImage, FaEnvelope, FaSave, FaTimes, FaUpload, FaTrash, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function EditProfile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
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
        setPreviewUrl(u.profilePic || '');
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

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(profilePic); // Revert to original profile pic
  };

  // Convert file to base64 for upload
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Validation rules aligned with signup page
  const validateName = (value) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 50) return 'Name must be less than 50 characters';
    if (/^\s/.test(value)) return 'Name cannot start with a space';
    if (/\s$/.test(value)) return 'Name cannot end with a space';
    if (/\s{2,}/.test(value)) return 'Only single spaces allowed between words';
    if (/[^a-zA-Z\s]/.test(value)) return 'Only letters and spaces allowed';
    const words = value.split(' ');
    for (let word of words) {
      if (word && !/^[A-Z]/.test(word)) {
        return 'Each word must start with a capital letter';
      }
    }
    return '';
  };

  const validatePhone = (value) => {
    if (!value) return 'Phone number is required';
    if (!/^\d+$/.test(value)) return 'Only numbers allowed';
    if (value.length !== 10) return 'Phone number must be exactly 10 digits';
    if (!/^[6-9]/.test(value)) return 'Phone number must start with 6, 7, 8, or 9';
    return '';
  };

  const handleNameChange = (val) => {
    const processed = val.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    setName(processed);
    setValidationErrors(prev => ({ ...prev, name: validateName(processed) }));
  };

  const handlePhoneChange = (val) => {
    const processed = val.replace(/\D/g, '').slice(0, 10);
    setPhone(processed);
    setValidationErrors(prev => ({ ...prev, phone: validatePhone(processed) }));
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      } else {
        toast.error(data.error || 'Password change failed');
      }
    } catch (err) {
      toast.error('Password change failed');
    } finally {
      setLoading(false);
    }
  };

  async function handleSave() {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      // Validate before sending
      const nameErr = validateName(name);
      const phoneErr = validatePhone(phone);
      setValidationErrors(prev => ({ ...prev, name: nameErr, phone: phoneErr }));
      if (nameErr || phoneErr) {
        setLoading(false);
        return;
      }

      // If a new file is selected, convert to base64, otherwise keep existing URL/string
      let imageData = profilePic;
      if (selectedFile) {
        imageData = await convertToBase64(selectedFile);
        setProfilePic(imageData); // keep state in sync
      }
      
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, profilePic: imageData, email: user.email })
      });
      
      const data = await res.json();
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Profile updated successfully!');
        setSelectedFile(null);
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
    console.log('handleBackToDashboard function called');
    console.log('Current user object:', user);
    console.log('User role:', user?.role);
    console.log('User type:', typeof user);

    try {
      // Check if user exists and has a role
      if (!user) {
        console.log('No user found, navigating to profile page');
        navigate('/profile');
        return;
      }

      const userRole = user.role;
      console.log('Determined user role:', userRole);

      if (userRole === 'admin') {
        console.log('User is admin - navigating to admin dashboard');
        navigate('/admin-dashboard');
      } else if (['seller', 'employee', 'manager', 'supervisor'].includes(userRole)) {
        console.log('User is seller/employee/manager/supervisor - navigating to seller dashboard');
        navigate('/seller-dashboard?tab=profile');
      } else {
        console.log('User is regular user - navigating to profile page');
        navigate('/profile');
      }

      console.log('Navigation command executed successfully');
    } catch (error) {
      console.error('Error during navigation:', error);
      console.log('Attempting fallback navigation to profile');
      try {
        navigate('/profile');
        console.log('Fallback navigation successful');
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
        // Last resort - use window.location
        console.log('Using window.location as last resort');
        window.location.href = '/profile';
      }
    }
  };

  // Alternative simple back navigation
  const handleSimpleBack = () => {
    console.log('Simple back navigation - going to profile');
    try {
      navigate('/profile');
      console.log('Simple navigation to profile successful');
    } catch (error) {
      console.error('Simple navigation failed:', error);
      window.location.href = '/profile';
    }
  };

  // Emergency back navigation using browser history
  const handleHistoryBack = () => {
    console.log('History back navigation');
    try {
      navigate(-1); // Go back to previous page in history
      console.log('History back successful');
    } catch (error) {
      console.error('History back failed:', error);
      handleSimpleBack();
    }
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
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Back button clicked! Event:', e);
                console.log('Current user:', user);
                console.log('User role:', user?.role);
                try {
                  handleBackToDashboard();
                  console.log('handleBackToDashboard called successfully');
                } catch (error) {
                  console.error('Error calling handleBackToDashboard:', error);
                  // Fallback to simple back navigation
                  console.log('Falling back to simple navigation');
                  navigate('/profile');
                }
              }}
              className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border-2 border-transparent hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              title="Go back to previous page (or press Escape)"
              type="button"
            >
              <FaArrowLeft className="text-lg transition-transform duration-200 hover:-translate-x-0.5" />
            </button>
            <h1 className="text-3xl font-playfair font-bold gradient-text">Edit Profile</h1>
          </div>

          {/* Secondary back button as text link */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Secondary back button clicked');
              handleSimpleBack();
            }}
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm underline hover:no-underline transition-all duration-200 cursor-pointer"
            style={{ pointerEvents: 'auto', zIndex: 10 }}
            type="button"
          >
            ← Back to Profile
          </button>
        </div>
          {/* Profile Avatar */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl border-4 border-white">
                {(previewUrl || profilePic) ? (
                  <img
                    src={previewUrl || profilePic}
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
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-500 text-slate-700 shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-emerald-600 mb-3">
                <FaPhone className="mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-500 text-slate-700 shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="Enter your phone number"
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-emerald-600 mb-3">
                <FaImage className="mr-2" />
                Profile Picture
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('profilePicInput')?.click()}
                  className="relative z-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-colors"
                >
                  <FaUpload className="inline mr-2" />
                  Choose from device
                </button>
                {selectedFile && (
                  <span className="text-sm text-slate-600 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                )}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
                  >
                    <FaTrash className="inline mr-1" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Max size 5MB. JPG, PNG, or GIF.
              </p>
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

            {/* Password Change Section */}
            <div className="border-t border-slate-200 pt-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                  <FaLock className="mr-2 text-emerald-600" />
                  Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200"
                >
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/50">
                  <div>
                    <label className="flex items-center text-sm font-medium text-slate-600 mb-2">
                      <FaLock className="mr-2" />
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-6 py-3 bg-white border-2 border-slate-200/50 rounded-xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-300 text-slate-700 pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-slate-600 mb-2">
                      <FaLock className="mr-2" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-6 py-3 bg-white border-2 border-slate-200/50 rounded-xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-300 text-slate-700 pr-12"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-slate-600 mb-2">
                      <FaLock className="mr-2" />
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-6 py-3 bg-white border-2 border-slate-200/50 rounded-xl focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-300 text-slate-700 pr-12"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <FaLock />
                          Change Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
