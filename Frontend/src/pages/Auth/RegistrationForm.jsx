import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'jobseeker';  // ✅ Read from URL
  const [userType, setUserType] = useState(defaultType);         // ✅ Set as default
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.email.includes('@')) errors.email = 'Email must include @';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errors.confirm = 'Passwords do not match';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validate()) {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = JSON.parse(localStorage.getItem('users')) || [];

      const newUser = {
        name: form.name,
        email: form.email,
        password: form.password,
        type: userType
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      if (userType === 'jobseeker') {
        navigate('/user/job-dashboard');
      } else {
        navigate('/register-organization');
      }
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };  return (
    <div className="max-w-[390px] mx-auto mt-8 mb-8 px-6 py-7 bg-white rounded-xl shadow-lg font-['Inter',_sans-serif]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create your account</h2>
        <p className="text-sm text-gray-600 mb-4">
          Or{' '}
          <span 
            className="text-blue-600 font-medium cursor-pointer hover:text-blue-700 transition-colors"
            onClick={() => navigate('/auth?mode=login')}
          >
            Sign in to your existing account
          </span>
        </p>
      </div>

      {/* User Type Toggle */}
      <div className="flex gap-2 mb-5">
        <button 
          type="button"
          className={`flex-1 py-2.5 px-2 text-sm border rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
            userType === 'jobseeker' 
              ? 'bg-blue-50 text-blue-600 border-blue-600' 
              : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
          }`}
          onClick={() => setUserType('jobseeker')}
        >
          <User className="w-4 h-4" />
          Find a Job
        </button>
        <button 
          type="button"
          className={`flex-1 py-2.5 px-2 text-sm border rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
            userType === 'recruiter' 
              ? 'bg-blue-50 text-blue-600 border-blue-600' 
              : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
          }`}
          onClick={() => setUserType('recruiter')}
        >
          <Briefcase className="w-4 h-4" />
          Hire Talent
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <User className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Full Name"
              className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="you@example.com"
              className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              required
            />
          </div>
          {errors.email && <span className="text-xs text-red-600 mt-1 block">{errors.email}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Lock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
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
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-600 mt-1 block">{errors.password}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <Lock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              name="confirm"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirm}
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
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirm && <span className="text-xs text-red-600 mt-1 block">{errors.confirm}</span>}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2.5 bg-blue-600 text-white py-2.5 px-4 border-none rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
