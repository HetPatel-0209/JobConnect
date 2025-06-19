import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login({ email, password });
        // Redirect based on user role
      if (response.user.role === 'jobseeker') {
        navigate('/user/job-dashboard');
      } else if (response.user.role === 'recruiter') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome Back</h2>
        <p className="text-sm text-gray-600 mb-4">
          Or{' '}
          <span 
            className="text-blue-600 font-medium cursor-pointer hover:text-blue-700 transition-colors"
            onClick={() => navigate('/auth?mode=register')}
          >
            Create new account
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Lock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-2">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-2"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <span className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
            Forgot password?
          </span>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2.5 bg-blue-600 text-white py-2.5 px-4 border-none rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </div>
  );
}
