import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Navbar from './components/common/Navbarcompany';
import Navbarhome from './components/common/Navbarhome';
import Navbaruser from './components/common/Navbaruser';
import Footer from './components/common/Footer';

import Dashboard from './Pages/CompanySide/Dashboard/Dashboard';
import Jobdetails from './Pages/CompanySide/JobDetails/Jobdetails';
import ApplicantsList from './Pages/CompanySide/JobDetails/ApplicantsList';
import OrgProfile from './Pages/CompanySide/ProfilePage/Orgprofile';
import Postjob from './Pages/CompanySide/PostJobPage/Postjob';
import RegisterOrganization from './Pages/CompanySide/RegisterOrg/RegisterOrganization';
import RegistrationSuccess from './Pages/CompanySide/RegisterOrg/RegistrationSuccess';
import CompanyDetailsPage from './Pages/CompanySide/CompanyDetails/CompanyDetails'; // ✅ Company Side Details Page

import Home from './Pages/Home/Home';
import AuthPage from './Pages/Auth/AuthPage';

import JobDashboard from './Pages/UserSide/UserDashboard/JobDashboard';
import UserProfile from './Pages/UserSide/UserProfile/UserProfile';
import UploadResume from './Pages/UserSide/UserResume/UploadResume';
import UserJobDetails from './Pages/UserSide/UserJobDetails/UserJobDetails';
import HRDetails from './Pages/UserSide/UserJobDetails/HRDetails';
import CompanyDetails from './Pages/UserSide/UserJobDetails/CompanyDetails'; // ✅ User Side Details Page

import './App.css';

function App() {
  const location = useLocation();
  const path = location.pathname;

  const isHomePage = path === '/home' || path === '/';
  const isAuthPage = path === '/auth';
  const isUserPage = path.startsWith('/user');
  const isUploadPage = path === '/user/upload-resume';

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isAuthPage);
  }, [path]);

  return (
    <div className={`page-wrapper ${isUploadPage ? 'upload-background' : ''}`}>
      {/* Dynamic Navbar */}
      {isHomePage ? (
        <Navbarhome />
      ) : isAuthPage ? null : isUserPage ? (
        <Navbaruser />
      ) : (
        <Navbar />
      )}

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

