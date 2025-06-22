import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

export default function ApiDebug() {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState({
    profile: { loading: false, data: null, error: null },
    auth: { loading: false, data: null, error: null }
  });

  const testProfileAPI = async () => {
    setApiStatus(prev => ({
      ...prev,
      profile: { loading: true, data: null, error: null }
    }));

    try {
      const response = await AuthService.getProfile();
      console.log('✅ Profile API Response:', response);
      setApiStatus(prev => ({
        ...prev,
        profile: { loading: false, data: response, error: null }
      }));
    } catch (error) {
      console.error('❌ Profile API Error:', error);
      setApiStatus(prev => ({
        ...prev,
        profile: { loading: false, data: null, error: error.message }
      }));
    }
  };

  const testAuthStatus = () => {
    setApiStatus(prev => ({
      ...prev,
      auth: { loading: true, data: null, error: null }
    }));

    try {
      const user = AuthService.getCurrentUser();
      const token = localStorage.getItem('token');
      console.log('✅ Auth Status:', { user, token: !!token });
      setApiStatus(prev => ({
        ...prev,
        auth: { 
          loading: false, 
          data: { user: user, hasToken: !!token }, 
          error: null 
        }
      }));
    } catch (error) {
      console.error('❌ Auth Status Error:', error);
      setApiStatus(prev => ({
        ...prev,
        auth: { loading: false, data: null, error: error.message }
      }));
    }
  };

  useEffect(() => {
    console.log('🔍 ApiDebug mounted, user:', user);
    testAuthStatus();
    if (user) {
      testProfileAPI();
    }
  }, [user]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-lg mb-3">API Debug Panel</h3>
      
      {/* Auth Status */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Auth Status:</h4>
        <button 
          onClick={testAuthStatus}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs mr-2"
          disabled={apiStatus.auth.loading}
        >
          {apiStatus.auth.loading ? 'Testing...' : 'Test Auth'}
        </button>
        {apiStatus.auth.data && (
          <div className="text-xs mt-1">
            <div>User: {apiStatus.auth.data.user?.name || 'None'}</div>
            <div>Token: {apiStatus.auth.data.hasToken ? '✅' : '❌'}</div>
          </div>
        )}
        {apiStatus.auth.error && (
          <div className="text-red-500 text-xs mt-1">{apiStatus.auth.error}</div>
        )}
      </div>

      {/* Profile API */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Profile API:</h4>
        <button 
          onClick={testProfileAPI}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs mr-2"
          disabled={apiStatus.profile.loading || !user}
        >
          {apiStatus.profile.loading ? 'Loading...' : 'Test Profile API'}
        </button>
        {apiStatus.profile.data && (
          <div className="text-xs mt-1 text-green-600">
            ✅ Profile loaded: {apiStatus.profile.data.user?.name || 'Unknown'}
          </div>
        )}
        {apiStatus.profile.error && (
          <div className="text-red-500 text-xs mt-1">❌ {apiStatus.profile.error}</div>
        )}
      </div>

      {/* Current Context User */}
      <div className="text-xs text-gray-600">
        <div>Context User: {user?.name || 'None'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Role: {user?.role || 'None'}</div>
      </div>
    </div>
  );
}
