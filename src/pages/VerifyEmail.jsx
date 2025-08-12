import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { CheckCircle, AlertCircle, MailCheck, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully. You can now log in.');
          // Clean any stale auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired verification link.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Verification failed. Please try again later.');
      }
    }

    verify();
  }, []);

  const icon = status === 'success' ? (
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
      <CheckCircle className="w-10 h-10 text-white" />
    </div>
  ) : status === 'error' ? (
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl mb-6 shadow-lg">
      <AlertCircle className="w-10 h-10 text-white" />
    </div>
  ) : (
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-400 to-slate-500 rounded-2xl mb-6 shadow-lg">
      <MailCheck className="w-10 h-10 text-white animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-scale-in text-center">
          {icon}
          <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-3">
            {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Failed' : 'Verifying Email'}
          </h1>
          <p className="text-gray-700 mb-6">{message}</p>

          {status === 'success' && (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Go to Login <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Link to="/signup" className="block text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">Back to Signup</Link>
              <Link to="/login" className="block text-gray-600 hover:text-gray-800 font-semibold hover:underline">Go to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}