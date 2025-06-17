import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

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
  const isUploadPage = path === '/user/upload-resume';

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isAuthPage);
  }, [path]);
    return (
    <div className={`page-wrapper ${isUploadPage ? 'upload-background' : ''}`}>
      {/* Unified Navbar - shows appropriate navbar based on auth state and route */}
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* General */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* ✅ Company Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/job/:id" element={<Jobdetails />} />
          <Route path="/profile" element={<OrgProfile />} />
          <Route path="/job/:jobId/applicants" element={<ApplicantsList />} />
          <Route path="/postjob" element={<Postjob />} />
          <Route path="/register-organization" element={<RegisterOrganization />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/company-details" element={<CompanyDetailsPage />} />

          {/* ✅ User Routes */}
          <Route path="/user/job-dashboard" element={<JobDashboard />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/upload-resume" element={<UploadResume />} />
          <Route path="/user/job/:id" element={<UserJobDetails />} />
          <Route path="/user/job/:id/hr" element={<HRDetails />} />
          <Route path="/user/job/:id/company" element={<CompanyDetails />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;

