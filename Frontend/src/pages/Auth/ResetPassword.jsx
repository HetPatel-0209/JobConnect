import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    const validateResetToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token.');
        setValidatingToken(false);
        return;
      }

      try {
        await AuthService.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setError(error.response?.data?.message || 'Invalid or expired reset token.');
      } finally {
        setValidatingToken(false);
      }
    };

    validateResetToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.resetPassword(token, formData.password);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset token...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password Reset Successful</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-gray-600 mb-6">
            {error || 'This password reset link is invalid or has expired.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Request New Reset Link
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

  // Reset password form
  return (
    <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Reset Your Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your new password below.
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
            New Password
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Lock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="•••••••••"
              className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Lock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="•••••••••"
              className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !formData.password || !formData.confirmPassword}
          className="bg-blue-600 text-white py-2.5 px-4 border-none rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
