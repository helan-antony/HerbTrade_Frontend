import { useState, useEffect } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  CheckCircle,
  Leaf,
  Heart
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from '../config/api';

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Country codes
  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+974", country: "Qatar", flag: "🇶🇦" },
    { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  ];

  // Real-time validation functions
  const validateName = (value) => {
    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (value.length > 50) return "Name must be less than 50 characters";
    if (/^\s/.test(value)) return "Name cannot start with a space";
    if (/\s$/.test(value)) return "Name cannot end with a space";
    if (/\s{2,}/.test(value)) return "Only single spaces allowed between words";
    if (/[^a-zA-Z\s]/.test(value)) return "Only letters and spaces allowed";
    
    // Check if each word starts with capital letter
    const words = value.split(' ');
    for (let word of words) {
      if (word && !/^[A-Z]/.test(word)) {
        return "Each word must start with a capital letter";
      }
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    if (value.length > 254) return "Email address is too long";
    return "";
  };

  const validatePhone = (value) => {
    if (!value) return "Phone number is required";
    if (!/^\d+$/.test(value)) return "Only numbers allowed";
    if (value.length !== 10) return "Phone number must be exactly 10 digits";
    if (!/^[6-9]/.test(value)) return "Phone number must start with 6, 7, 8, or 9";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (value.length > 128) return "Password is too long";
    if (/^\s/.test(value) || /\s$/.test(value)) return "Password cannot have leading or trailing spaces";
    return "";
  };

  const validateConfirmPassword = (value, originalPassword) => {
    if (!value) return "Please confirm your password";
    if (value !== originalPassword) return "Passwords do not match";
    return "";
  };

  // Handle real-time validation with input restrictions
  const handleFieldChange = (field, value) => {
    let error = "";
    let processedValue = value;
    
    switch (field) {
      case 'name':
        // Only allow letters and single spaces, then capitalize first letter of each word
        processedValue = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');
        // Auto-capitalize first letter of each word
        processedValue = processedValue.replace(/\b\w/g, l => l.toUpperCase());
        setName(processedValue);
        error = validateName(processedValue);
        break;
      case 'email':
        // Convert to lowercase and remove spaces
        processedValue = value.toLowerCase().replace(/\s/g, '');
        setEmail(processedValue);
        error = validateEmail(processedValue);
        break;
      case 'phone':
        // Only allow numbers and limit to 10 digits
        processedValue = value.replace(/\D/g, '').slice(0, 10);
        setPhone(processedValue);
        error = validatePhone(processedValue);
        break;
      case 'password':
        setPassword(value);
        error = validatePassword(value);
        // Also revalidate confirm password if it exists
        if (confirmPassword) {
          const confirmError = validateConfirmPassword(confirmPassword, value);
          setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        error = validateConfirmPassword(value, password);
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'Very Weak', color: 'text-red-500' };
      case 2: return { text: 'Weak', color: 'text-orange-500' };
      case 3: return { text: 'Fair', color: 'text-yellow-500' };
      case 4: return { text: 'Good', color: 'text-blue-500' };
      case 5: return { text: 'Strong', color: 'text-green-500' };
      default: return { text: '', color: '' };
    }
  };

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "402168891475-ag50v1vdjblsjhd317v8mrn2v9q3dc02.apps.googleusercontent.com",
          callback: handleGoogleResponse
        });
        
        // Render the Google Sign-Up button
        const buttonElement = document.getElementById("google-signup-btn");
        if (buttonElement) {
          window.google.accounts.id.renderButton(
            buttonElement,
            { 
              theme: "outline", 
              size: "large", 
              type: 'standard',
              width: '100%',
              text: 'continue_with'
            }
          );
        }
      }
    };

    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  async function handleGoogleResponse(response) {
    try {
      setIsLoading(true);
      setError("");
      
      // Decode the JWT token from Google
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      const googleUser = JSON.parse(jsonPayload);
      
      // Send to backend for authentication/registration
      const res = await fetch(API_ENDPOINTS.AUTH.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          googleId: googleUser.sub
        })
      });
      
      const data = await res.json();
      
      if (data.token && data.user) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess(true);
        
        // Navigate based on user role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin');
          } else if (['seller', 'employee', 'manager', 'supervisor'].includes(data.user.role)) {
            navigate('/seller-dashboard');
          } else {
            navigate('/herbs');
          }
        }, 1500);
      } else {
        setError(data.error || 'Google authentication failed');
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      setError('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function validate() {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    
    if (nameError) return nameError;
    if (emailError) return emailError;
    if (phoneError) return phoneError;
    if (passwordError) return passwordError;
    if (confirmPasswordError) return confirmPasswordError;
    
    return "";
  }

  async function handleSignup() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError("");
    setSuccess(false);
    setIsLoading(true);
    
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();

      if (res.ok && data.user && data.token) {
        // Store authentication data immediately after successful registration
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setSuccess(true);

        // Navigate to herbs page after successful registration
        setTimeout(() => {
          navigate('/herbs');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4 pt-24 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      
      {/* Enhanced Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-teal-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-cyan-400/25 to-blue-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/4 right-1/3 w-60 h-60 bg-gradient-to-tl from-yellow-400/20 to-orange-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }} />

      {/* Enhanced Floating Icons with glow effects */}
      <div className="absolute top-32 right-20 animate-bounce-slow">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-lg animate-pulse"></div>
          <Sparkles className="w-8 h-8 text-emerald-300 relative z-10 drop-shadow-lg" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 animate-pulse-slow">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-lg animate-pulse"></div>
          <Leaf className="w-10 h-10 text-teal-300 relative z-10 drop-shadow-lg" />
        </div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-pink-400/30 rounded-full blur-lg animate-pulse"></div>
          <Heart className="w-7 h-7 text-pink-300 relative z-10 drop-shadow-lg" />
        </div>
      </div>
      <div className="absolute top-1/4 left-1/4 animate-bounce-slow" style={{ animationDelay: '3s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-lg animate-pulse"></div>
          <Shield className="w-6 h-6 text-cyan-300 relative z-10 drop-shadow-lg" />
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-emerald-300 rounded-full animate-particle opacity-70" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 bg-teal-300 rounded-full animate-particle opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-particle opacity-80" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-pink-300 rounded-full animate-particle opacity-50" style={{ animationDelay: '6s' }}></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-10 animate-scale-in relative overflow-hidden">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
          
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl mb-6 shadow-2xl relative animate-glow-pulse">
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <UserPlus className="w-10 h-10 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-3 animate-text-glow">
              Create Account
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Join thousands in their wellness journey
            </p>
            
            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-emerald-300/20 to-teal-300/15 rounded-full opacity-50 animate-pulse-slow"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tl from-cyan-300/15 to-blue-300/10 rounded-full opacity-40 animate-float"></div>
          </div>

          {/* Google Sign Up */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div id="google-signup-btn" style={{ width: '100%' }}></div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserPlus className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className={`w-full pl-12 pr-4 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${
                    validationErrors.name 
                      ? 'border-red-300 focus:ring-red-300/30 focus:border-red-500' 
                      : 'border-gray-200/50 focus:ring-emerald-300/30 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${
                    validationErrors.email 
                      ? 'border-red-300 focus:ring-red-300/30 focus:border-red-500' 
                      : 'border-gray-200/50 focus:ring-emerald-300/30 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="flex space-x-2">
                {/* Country Code Selector */}
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="appearance-none bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl px-4 py-5 pr-10 focus:ring-4 focus:ring-emerald-300/30 focus:border-emerald-500 transition-all duration-500 text-gray-700 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                  >
                    {countryCodes.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Phone Number Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    className={`w-full pl-12 pr-4 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${
                      validationErrors.phone 
                        ? 'border-red-300 focus:ring-red-300/30 focus:border-red-500' 
                        : 'border-gray-200/50 focus:ring-emerald-300/30 focus:border-emerald-500'
                    }`}
                    placeholder="Enter your phone number"
                    maxLength="10"
                  />
                </div>
              </div>
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => handleFieldChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${
                    validationErrors.password 
                      ? 'border-red-300 focus:ring-red-300/30 focus:border-red-500' 
                      : 'border-gray-200/50 focus:ring-emerald-300/30 focus:border-emerald-500'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.password}
                </p>
              )}
              
              {/* Password Strength Indicator */}
              {password && !validationErrors.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getPasswordStrength(password) === 1 ? 'bg-red-500 w-1/5' :
                          getPasswordStrength(password) === 2 ? 'bg-orange-500 w-2/5' :
                          getPasswordStrength(password) === 3 ? 'bg-yellow-500 w-3/5' :
                          getPasswordStrength(password) === 4 ? 'bg-blue-500 w-4/5' :
                          getPasswordStrength(password) === 5 ? 'bg-green-500 w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthText(getPasswordStrength(password)).color}`}>
                      {getPasswordStrengthText(getPasswordStrength(password)).text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => handleFieldChange('confirmPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${
                    validationErrors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-300/30 focus:border-red-500' 
                      : 'border-gray-200/50 focus:ring-emerald-300/30 focus:border-emerald-500'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="group relative w-full py-5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 disabled:shadow-none mt-10 text-lg overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-center space-x-3">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
          </button>

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-emerald-700 font-medium">
                  Signup successful! Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-8 text-center relative z-20">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200 cursor-pointer relative z-30 inline-block px-2 py-1 rounded hover:bg-emerald-50"
                onClick={() => navigate('/login')}
                style={{ pointerEvents: 'auto' }}
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup; 


