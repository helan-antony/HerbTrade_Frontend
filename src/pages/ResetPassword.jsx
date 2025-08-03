import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle,
  Shield,
  AlertCircle,
  Sparkles,
  Leaf,
  Heart
} from "lucide-react";
import { API_ENDPOINTS } from '../config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  function validatePassword(val) {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(val)) return "Password must contain at least one letter";
    if (!/[0-9]/.test(val)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(val)) return "Password must contain at least one special character";
    return "";
  }

  function validateConfirmPassword(val) {
    if (!val) return "Confirm your password";
    if (val !== password) return "Passwords do not match";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const passErr = validatePassword(password);
    const confErr = validateConfirmPassword(confirm);
    setPasswordError(passErr);
    setConfirmError(confErr);
    if (passErr || confErr) return;

    setError("");
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Failed to reset password");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

          {/* Floating elements */}
          <div className="absolute top-20 right-20 opacity-20">
            <Leaf className="w-8 h-8 text-emerald-500 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-32 left-16 opacity-20">
            <Heart className="w-6 h-6 text-emerald-400 animate-bounce" style={{ animationDelay: '3s' }} />
          </div>
          <div className="absolute top-1/2 right-16 opacity-20">
            <Sparkles className="w-7 h-7 text-teal-500 animate-bounce" style={{ animationDelay: '5s' }} />
          </div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-scale-in text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 mb-8">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>

            {/* Success Message */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <p className="text-emerald-800 font-medium">Redirecting to login...</p>
              </div>
            </div>

            {/* Manual Login Link */}
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200"
            >
              <span>Go to Login Now</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-300/10 to-green-300/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />

        {/* Floating elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <Leaf className="w-8 h-8 text-emerald-500 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-32 left-16 opacity-20">
          <Heart className="w-6 h-6 text-emerald-400 animate-bounce" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute top-1/2 right-16 opacity-20">
          <Sparkles className="w-7 h-7 text-teal-500 animate-bounce" style={{ animationDelay: '5s' }} />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl focus:ring-2 transition-all duration-300 placeholder:text-gray-400 text-gray-700 ${
                    passwordError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm font-medium mt-1 animate-fade-in">
                  {passwordError}
                </p>
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
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl focus:ring-2 transition-all duration-300 placeholder:text-gray-400 text-gray-700 ${
                    confirmError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmError && (
                <p className="text-red-500 text-sm font-medium mt-1 animate-fade-in">
                  {confirmError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!password || !confirm || passwordError || confirmError}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none mt-8"
            >
              Reset Password
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Your password is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 