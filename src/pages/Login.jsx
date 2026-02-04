import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  Shield,
  Leaf,
  Heart,
  AlertCircle
} from "lucide-react";
import { API_ENDPOINTS, GOOGLE_CLIENT_ID } from '../config/api';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Email validation regex - more flexible
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Real-time validation functions
  const validateEmail = (value) => {
    if (!value) return "Email is required";
    if (/^\s/.test(value) || /\s$/.test(value)) return "Email cannot have leading or trailing spaces";
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    if (value.length > 254) return "Email address is too long";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters long";
    if (value.length > 128) return "Password is too long";
    if (/^\s/.test(value) || /\s$/.test(value)) return "Password cannot have leading or trailing spaces";
    return "";
  };

  // Handle real-time validation with input restrictions
  const handleFieldChange = (field, value) => {
    let error = "";
    let processedValue = value;

    switch (field) {
      case 'email':
        // Convert to lowercase and remove spaces
        processedValue = value.toLowerCase().replace(/\s/g, '');
        setEmail(processedValue);
        error = validateEmail(processedValue);
        break;
      case 'password':
        setPassword(value);
        error = validatePassword(value);
        break;
    }

    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const validate = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) return emailError;
    if (passwordError) return passwordError;

    return null;
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
        try {
          // Check if Google Client ID is properly configured
          if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '402168891475-ag50v1vdjblsjhd317v8mrn2v9q3dc02.apps.googleusercontent.com') {
            console.warn('Using default Google Client ID - please configure for production');
          }
          
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false
          });

          // Render the Google Sign-In button
          const buttonElement = document.getElementById("google-signin-btn");
          if (buttonElement) {
            window.google.accounts.id.renderButton(
              buttonElement,
              {
                theme: "outline",
                size: "large",
                type: 'standard',
                width: 400,
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left'
              }
            );
          }
        } catch (error) {
          console.error('Google Sign-In initialization error:', error);
          setError('Google Sign-In is not available. Please try again later.');
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
      setError('Failed to load Google Sign-In. Please check your internet connection.');
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
      setLoading(true);
      setError(''); // Clear any previous errors

      if (!response || !response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token from Google
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const googleUser = JSON.parse(jsonPayload);

      console.log('Google user data:', {
        name: googleUser.name,
        email: googleUser.email,
        verified: googleUser.email_verified
      });

      // Validate required fields
      if (!googleUser.email || !googleUser.name) {
        throw new Error('Incomplete user data from Google');
      }

      const res = await fetch(API_ENDPOINTS.AUTH.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          googleId: googleUser.sub,
          emailVerified: googleUser.email_verified
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('Google login successful for:', data.user.email);

        // Navigate based on user role
        if (data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.user.role === 'wellness_coach') {
          navigate('/wellness-coach-dashboard');
        } else if (['seller', 'employee', 'manager', 'supervisor'].includes(data.user.role)) {
          navigate('/seller-dashboard');
        } else if (data.user.role === 'delivery') {
          navigate('/delivery-dashboard');
        } else {
          navigate('/herbs');
        }
      } else {
        console.error('Google login failed:', data);
        setError(data.error || 'Google login failed. Please try again.');
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      setError(`Google authentication failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.user && data.token) {
        // Store both user and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        setSuccess(true);

        // For delivery users, navigate immediately to avoid delays
        if (data.user.role === 'delivery') {
          navigate('/delivery-dashboard');
        } else {
          // Navigate based on user role after a short delay for other roles
          setTimeout(() => {
            if (data.user.role === 'admin') {
              navigate('/admin-dashboard');
            } else if (data.user.role === 'wellness_coach') {
              navigate('/wellness-coach-dashboard');
            } else if (['seller', 'employee', 'manager', 'supervisor'].includes(data.user.role)) {
              navigate('/seller-dashboard');
            } else if (data.user.role === 'delivery') {
              navigate('/delivery-dashboard');
            } else {
              navigate('/herbs');
            }
          }, 1500);
        }
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
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
      <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }} >
        <div className="relative">
          <div className="absolute inset-0 bg-pink-400/30 rounded-full blur-lg animate-pulse"></div>
          <Heart className="w-7 h-7 text-pink-300 relative z-10 drop-shadow-lg" />
        </div>
      </div>
      <div className="absolute top-1/4 left-1/4 animate-bounce-slow" style={{ animationDelay: '3s' }} >
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
              <LogIn className="w-10 h-10 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-3 animate-text-glow">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Sign in to continue your herbal journey
            </p>

            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-emerald-300/20 to-teal-300/15 rounded-full opacity-50 animate-pulse-slow"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tl from-cyan-300/15 to-blue-300/10 rounded-full opacity-40 animate-float"></div>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div id="google-signin-btn" className="w-full max-w-sm"></div>
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
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${validationErrors.email
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
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 transition-all duration-500 placeholder:text-gray-400 text-gray-700 shadow-sm hover:shadow-md focus:shadow-lg font-medium ${validationErrors.password
                    ? 'border-red-300 focus:ring-red-300/30 focus:border-red-500'
                    : 'border-gray-200/50 focus:ring-emerald-300/30 focus:border-emerald-500'
                    }`}
                  placeholder="Enter your password"
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
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium">Login successful! Redirecting...</p>
              </div>
            </div>
          )}

          {/* Enhanced Submit Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading || loading}
            className="group relative w-full py-5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 disabled:shadow-none mt-10 text-lg overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <span>{(isLoading || loading) ? 'Signing In...' : 'Sign In'}</span>
              {!(isLoading || loading) && <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
          </button>

          {/* Links */}
          <div className="mt-8 space-y-4 text-center relative z-20">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200 cursor-pointer relative z-30 inline-block px-2 py-1 rounded hover:bg-emerald-50"
                onClick={() => navigate('/signup')}
                style={{ pointerEvents: 'auto' }}
              >
                Sign up here
              </Link>
            </p>

            <Link
              to="/forgot-password"
              className="block text-gray-500 hover:text-emerald-600 text-sm hover:underline transition-all duration-200 cursor-pointer relative z-30 inline-block px-2 py-1 rounded hover:bg-gray-50"
              onClick={() => navigate('/forgot-password')}
              style={{ pointerEvents: 'auto' }}
            >
              Forgot your password?
            </Link>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;