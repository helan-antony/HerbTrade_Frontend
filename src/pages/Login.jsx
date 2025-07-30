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

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9]+@(gmail\.com|mca\.ajce\.in)$/;

  // Real-time validation functions
  const validateEmail = (value) => {
    if (!value) return "Email is required";
    if (/^\s/.test(value) || /\s$/.test(value)) return "Email cannot have leading or trailing spaces";
    if (!emailRegex.test(value)) return "Only Gmail and mca.ajce.in emails allowed";
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
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", type: 'standard', width: '100%' }
        );
      }
    };
    return () => { document.body.removeChild(script); };
  }, []);
  
  async function handleGoogleResponse(response) {
    try {
      setLoading(true);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const googleUser = JSON.parse(jsonPayload);
      
      const res = await fetch('http://localhost:5000/api/auth/google-login', {
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
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else if (data.user.role === 'seller') navigate('/seller-dashboard');
        else if (data.user.role === 'employee') navigate('/employee-dashboard');
        else navigate('/herbs');
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google authentication failed');
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
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.user && data.token) {
        // Store both user and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        setSuccess(true);
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/herbs');
          }
        }, 1500);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 pt-24 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Floating Icons */}
      <div className="absolute top-32 right-20 animate-bounce-slow">
        <Sparkles className="w-6 h-6 text-emerald-400 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-20 animate-pulse-slow">
        <Leaf className="w-8 h-8 text-teal-400 opacity-50" />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
        <Heart className="w-5 h-5 text-pink-400 opacity-70" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">
              Sign in to continue your herbal journey
            </p>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div id="google-signin-btn" style={{ width: '100%' }}></div>
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
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:ring-2 transition-all duration-300 placeholder:text-gray-400 text-gray-700 ${
                    validationErrors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
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
                  className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl focus:ring-2 transition-all duration-300 placeholder:text-gray-400 text-gray-700 ${
                    validationErrors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
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

          {/* Submit Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading || loading}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none mt-8"
          >
            {(isLoading || loading) ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200"
              >
                Sign up here
              </Link>
            </p>

            <Link
              to="/forgot-password"
              className="block text-gray-500 hover:text-emerald-600 text-sm hover:underline transition-all duration-200"
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






