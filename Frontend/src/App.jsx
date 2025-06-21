import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { usePreventAltArrowNavigation } from './hooks/usePreventAltArrowNavigation';

import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ChatProvider } from './contexts/ChatContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import Dashboard from './pages/CompanySide/Dashboard/Dashboard';
import RecruiterJobDetails from './pages/CompanySide/JobDetails/RecruiterJobDetails';
import ApplicantsList from './pages/CompanySide/JobDetails/ApplicantsList';
import ApplicantProfile from './pages/CompanySide/ApplicantProfile/ApplicantProfile';
import OrgProfile from './pages/CompanySide/ProfilePage/Orgprofile';
import OrganizationProfile from './pages/CompanySide/ProfilePage/OrganizationProfile';
import RecruiterProfile from './pages/CompanySide/ProfilePage/RecruiterProfile';
import Postjob from './pages/CompanySide/PostJobPage/Postjob';
import RegisterOrganization from './pages/CompanySide/RegisterOrg/RegisterOrganization';
import RegistrationSuccess from './pages/CompanySide/RegisterOrg/RegistrationSuccess';
import CompanyDetailsPage from './pages/CompanySide/CompanyDetails/CompanyDetails';
import AnalyticsDashboard from './pages/CompanySide/Analytics/AnalyticsDashboard';
import JobAnalytics from './pages/CompanySide/Analytics/JobAnalytics';
import PublicCompanyProfile from './pages/CompanySide/PublicProfile/PublicCompanyProfile';
import GenericJobDetails from './components/common/GenericJobDetails';
import ChatPage from './pages/Chat/ChatPage';
import NotificationManager from './components/chat/NotificationManager';

import Home from './pages/Home/Home';
import AuthPage from './pages/Auth/AuthPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import JobDashboard from './pages/UserSide/UserDashboard/JobDashboard';
import UserProfile from './pages/UserSide/UserProfile/UserProfile';
import JobseekerProfile from './pages/UserSide/UserProfile/JobseekerProfile';
import UserJobDetails from './pages/UserSide/UserJobDetails/UserJobDetails';
import HRDetails from './pages/UserSide/UserJobDetails/HRDetails';
import CompanyDetails from './pages/UserSide/UserJobDetails/CompanyDetails'; // ✅ User Side Details Page
import UploadResume from './pages/UserSide/UserResume/UploadResume';
import SavedJobs from './pages/UserSide/SavedJobs/SavedJobs';
import OrganizationListing from './pages/Common/OrganizationListing/OrganizationListing';
import OrganizationDetails from './pages/UserSide/OrganizationDetails/OrganizationDetails';
import PublicOrganizationDetails from './pages/Common/OrganizationDetails/PublicOrganizationDetails';

import './App.css';

function App() {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage = path === '/auth';
  const isHomePage = path === '/' || path === '/home';
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
              <NotificationManager />

              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/register-organization" element={<RegisterOrganization />} />
                  <Route path="/registration-success" element={<RegistrationSuccess />} />

                  {/* Public Organization Routes */}
                  <Route path="/organizations" element={<OrganizationListing />} />
                  <Route path="/organization/:orgId" element={<PublicOrganizationDetails />} />

                  {/* ✅ Generic Job Details Route - Redirects based on user role */}
                  <Route path="/jobs/:id" element={
                    <ProtectedRoute allowedRoles={['jobseeker', 'recruiter']}>
                      <GenericJobDetails />
                    </ProtectedRoute>
                  } />

                  {/* ✅ Company Routes - Protected for recruiter users */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/job/:id" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <RecruiterJobDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <OrgProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/recruiter/profile" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <RecruiterProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/job/:jobId/applicants" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <ApplicantsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/applicant/:applicantId" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <ApplicantProfile />
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
                  <Route path="/organization/profile" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <OrganizationProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/job/:jobId/analytics" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <JobAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <ChatPage />
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
                  <Route path="/user/profile-view" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <JobseekerProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/upload-resume" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <UploadResume />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/saved-jobs" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <SavedJobs />
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
                  <Route path="/user/organization/:orgId" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <OrganizationDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/chat" element={
                    <ProtectedRoute allowedRoles={['jobseeker']}>
                      <ChatPage />
                    </ProtectedRoute>
                  } />
                  {/* Public Company Profile - accessible to all authenticated users */}
                  <Route path="/company/:companyId" element={
                    <ProtectedRoute allowedRoles={['jobseeker', 'recruiter']}>
                      <PublicCompanyProfile />
                    </ProtectedRoute>
                  } />

                  {/* Catch-all route - redirect to home for undefined routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
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
