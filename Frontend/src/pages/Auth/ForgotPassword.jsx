import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await AuthService.forgotPassword(email);
      setSuccess(true);
      setMessage(response.message || 'Password reset instructions have been sent to your email.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setMessage('');
              }}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
      <div className="text-center">
        <button
          onClick={() => navigate('/auth?mode=login')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Forgot Password?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !email.trim()}
          className="bg-blue-600 text-white py-2.5 px-4 border-none rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            'Send Reset Instructions'
          )}
        </button>
      </form>
    </div>
  );
}
