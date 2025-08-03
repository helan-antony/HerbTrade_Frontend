import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Shield,
  Sparkles,
  Leaf,
  Heart,
  AlertCircle
} from "lucide-react";
import { API_ENDPOINTS } from '../config/api';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateEmail(val) {
    if (!val) return "Email is required";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return "Please enter a valid email address";
    return "";
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailError(validateEmail(email));
    setError("");
    setIsLoading(true);

    if (!validateEmail(email)) {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setSubmitted(true);
        } else {
          setError(data.error + (data.details ? ": " + data.details : ""));
        }
      } catch (err) {
        setError("Failed to send reset email");
      }
    }
    setIsLoading(false);
  }

  if (submitted && !error) {
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
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 leading-relaxed">
                If this email address exists, a password reset link has been sent to
              </p>
              <p className="text-emerald-600 font-semibold mt-2 break-all">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-800">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ul className="space-y-1 text-emerald-700">
                    <li>• Check your email inbox and spam folder</li>
                    <li>• Click the reset link within 1 hour</li>
                    <li>• Create a new secure password</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
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
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {(emailError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium">
                  {emailError || error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:ring-2 transition-all duration-300 placeholder:text-gray-400 text-gray-700 ${
                    emailError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm font-medium mt-1 animate-fade-in">
                  {emailError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || emailError}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none mt-8"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200"
              >
                Sign in here
              </Link>
            </p>

            <Link
              to="/signup"
              className="block text-gray-500 hover:text-emerald-600 text-sm hover:underline transition-all duration-200"
            >
              Don't have an account? Sign up
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

export default ForgotPassword;