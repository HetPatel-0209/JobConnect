import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { usePreventAltArrowNavigation } from './hooks/usePreventAltArrowNavigation';

import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ChatProvider } from './contexts/ChatContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import Dashboard from './pages/CompanySide/Dashboard/Dashboard';
import Jobdetails from './pages/CompanySide/JobDetails/Jobdetails';
import ApplicantsList from './pages/CompanySide/JobDetails/ApplicantsList';
import OrgProfile from './pages/CompanySide/ProfilePage/Orgprofile';
import Postjob from './pages/CompanySide/PostJobPage/Postjob';
import RegisterOrganization from './pages/CompanySide/RegisterOrg/RegisterOrganization';
import RegistrationSuccess from './pages/CompanySide/RegisterOrg/RegistrationSuccess';
import CompanyDetailsPage from './pages/CompanySide/CompanyDetails/CompanyDetails'; // ✅ Company Side Details Page

import Home from './pages/Home/Home';
import AuthPage from './pages/Auth/AuthPage';

import JobDashboard from './pages/UserSide/UserDashboard/JobDashboard';
import UserProfile from './pages/UserSide/UserProfile/UserProfile';
import UserJobDetails from './pages/UserSide/UserJobDetails/UserJobDetails';
import HRDetails from './pages/UserSide/UserJobDetails/HRDetails';
import CompanyDetails from './pages/UserSide/UserJobDetails/CompanyDetails'; // ✅ User Side Details Page
import UploadResume from './pages/UserSide/UserResume/UploadResume';

import './App.css';

function App() {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage = path === '/auth';
  const isHomePage = path === '/home';
  const isUploadPage = path === '/user/upload-resume';

  // Use our custom hook to prevent Alt + Arrow key navigation
  usePreventAltArrowNavigation();

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isAuthPage);
  }, [path]);

  return (
    <AuthProvider>
      <ProfileProvider>
        <ChatProvider>
          <OrganizationProvider>
            <div className={`page-wrapper ${isUploadPage ? 'upload-background' : ''}`}>
              {/* Unified Navbar - shows appropriate navbar based on auth state and route */}
              <Navbar />

              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/register-organization" element={<RegisterOrganization />} />
                  <Route path="/registration-success" element={<RegistrationSuccess />} />

                  {/* ✅ Company Routes - Protected for recruiter users */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/job/:id" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <Jobdetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <OrgProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/job/:jobId/applicants" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <ApplicantsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/postjob" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <Postjob />
                    </ProtectedRoute>
                  } />


                  <Route path="/company-details" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <CompanyDetailsPage />
                    </ProtectedRoute>
                  } />

                  {/* ✅ User Routes - Protected for jobseeker users */}
                  <Route path="/user/job-dashboard" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <JobDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/profile" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/upload-resume" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <UploadResume />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/job/:id" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <UserJobDetails />
                    </ProtectedRoute>
                  } />                  <Route path="/user/job/:id/hr" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <HRDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/job/:id/company" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <CompanyDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/recruiter-details/:id" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <HRDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/company-details/:id" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <CompanyDetails />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>        
              {isHomePage && <Footer />}
            </div>
          </OrganizationProvider>
        </ChatProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
