import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Eye, EyeOff, AlertCircle, Search, ChevronDown, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganizationSearch } from '../../hooks/useOrganizationSearch';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, user } = useAuth(); // Added user from context
  const { 
    organizations, 
    loading: orgLoading, 
    searchOrganizations, 
    clearSearch 
  } = useOrganizationSearch();
  
  const defaultType = searchParams.get('type') || 'jobseeker';
  const [userType, setUserType] = useState(defaultType);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    organizationId: ''
  });

  // Organization dropdown state
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showEnlistButton, setShowEnlistButton] = useState(false);
  
  const dropdownRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectAfterRegistration, setRedirectAfterRegistration] = useState(false);

  // Handle redirect after successful registration
  useEffect(() => {
    if (redirectAfterRegistration && user) {
      if (user.role === 'jobseeker') {
        console.log('Redirecting jobseeker to dashboard');
        navigate('/user/job-dashboard');
      } else if (user.role === 'recruiter') {
        console.log('Redirecting recruiter to dashboard');
        navigate('/dashboard');
      }
      setRedirectAfterRegistration(false);
    }
  }, [user, redirectAfterRegistration, navigate]);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOrgDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);  // Search organizations with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (orgSearchQuery.trim() && userType === 'recruiter') {
        const orgsData = await searchOrganizations(orgSearchQuery, { limit: 10 });
        setShowEnlistButton(orgsData.length === 0);
      } else {
        clearSearch();
        setShowEnlistButton(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [orgSearchQuery, userType, searchOrganizations, clearSearch]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.includes('@')) newErrors.email = 'Email must include @';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) newErrors.confirm = 'Passwords do not match';
      // For recruiters, organization selection is required
    if (userType === 'recruiter' && !selectedOrganization) {
      newErrors.organization = 'Please select an organization or click "Enlist Organization" to register your company';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (validate()) {
      try {        
        const userData = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: userType === 'jobseeker' ? 'jobseeker' : 'recruiter'
        };        // Add organizationId for recruiters
        if (userType === 'recruiter' && selectedOrganization) {
          userData.organizationId = selectedOrganization.id;
        } else if (userType === 'recruiter' && !selectedOrganization) {
          throw new Error('Organization selection is required for recruiters');
        }

        const response = await register(userData);
        // Set flag to trigger redirect when user state updates
        setRedirectAfterRegistration(true);
        
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOrgSearch = (e) => {
    setOrgSearchQuery(e.target.value);
    setShowOrgDropdown(true);
    if (!e.target.value.trim()) {
      setSelectedOrganization(null);
      setShowEnlistButton(false);
    }
  };

  const handleOrgSelect = (org) => {
    setSelectedOrganization(org);
    setOrgSearchQuery(org.name);
    setShowOrgDropdown(false);
    setShowEnlistButton(false);
    // Clear organization error if it exists
    if (errors.organization) {
      setErrors(prev => ({ ...prev, organization: '' }));
    }
  };

  const handleEnlistOrganization = () => {
    navigate('/register-organization');
  };
  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Reset organization-related fields when switching user types
    if (type === 'jobseeker') {
      setSelectedOrganization(null);
      setOrgSearchQuery('');
      setShowOrgDropdown(false);
      setShowEnlistButton(false);
      clearSearch();
    }
    // Clear organization error
    if (errors.organization) {
      setErrors(prev => ({ ...prev, organization: '' }));
    }
  };return (
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}      {/* User Type Toggle */}
      <div className="flex gap-2 mb-5">
        <button 
          type="button"
          className={`flex-1 py-2.5 px-2 text-sm border rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
            userType === 'jobseeker' 
              ? 'bg-blue-50 text-blue-600 border-blue-600' 
              : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
          }`}
          onClick={() => handleUserTypeChange('jobseeker')}
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
          onClick={() => handleUserTypeChange('recruiter')}
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
        </div>        <div>
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

        {/* Organization Dropdown for Recruiters */}
        {userType === 'recruiter' && (
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Organization
            </label>
            <div className="flex items-center px-2.5 py-2 border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
              <Building className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={orgSearchQuery}
                onChange={handleOrgSearch}
                onFocus={() => setShowOrgDropdown(true)}
                placeholder="Search for your organization..."
                className="border-none outline-none bg-transparent flex-1 text-sm py-1 placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 ml-2" />
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            
            {/* Dropdown */}
            {showOrgDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {orgLoading ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Searching organizations...
                  </div>
                ) : organizations.length > 0 ? (
                  <>                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => handleOrgSelect(org)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-gray-900">{org.name}</div>
                        {org.contact?.address && (
                          <div className="text-xs text-gray-500">
                            {org.contact.address.city && org.contact.address.state
                              ? `${org.contact.address.city}, ${org.contact.address.state}`
                              : org.contact.address.city || org.contact.address.state || ''
                            }
                          </div>
                        )}
                        {org.gstin && (
                          <div className="text-xs text-gray-400">GST: {org.gstin}</div>
                        )}
                      </button>
                    ))}
                  </>
                ) : orgSearchQuery.trim() && showEnlistButton ? (
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-3">
                      No organizations found for "{orgSearchQuery}"
                    </p>
                    <button
                      type="button"
                      onClick={handleEnlistOrganization}
                      className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Enlist Organization
                    </button>
                  </div>
                ) : orgSearchQuery.trim() ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    No organizations found
                  </div>
                ) : (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    Start typing to search organizations
                  </div>
                )}
              </div>
            )}
            
            {errors.organization && <span className="text-xs text-red-600 mt-1 block">{errors.organization}</span>}
          </div>
        )}

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
