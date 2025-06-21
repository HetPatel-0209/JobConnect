import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Generic Job Details Component
 * Redirects users to their appropriate job details page based on their role
 */
const GenericJobDetails = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect based on user role
  if (user?.role === 'jobseeker') {
    return <Navigate to={`/user/job/${id}`} replace />;
  } else if (user?.role === 'recruiter') {
    return <Navigate to={`/job/${id}`} replace />;
  } else {
    // If no user or unknown role, redirect to home
    return <Navigate to="/" replace />;
  }
};

export default GenericJobDetails;
