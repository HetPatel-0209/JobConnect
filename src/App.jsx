import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Dashboard from './Pages/Dashboard/Dashboard';
import Jobdetails from './Pages/JobDetails/Jobdetails';
import OrgProfile from './Pages/ProfilePage/Orgprofile';
import Postjob from './Pages/PostJobPage/Postjob';
import AuthPage from './Pages/Auth/AuthPage';
import Home from './Pages/Home/Home';
import './App.css';


function App() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('jobs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard jobs={jobs} setJobs={setJobs} />} />
        <Route path="/profile" element={<OrgProfile />} />
        <Route path="/postjob" element={<Postjob setJobs={setJobs} />} />
        <Route path="/job/:id" element={<Jobdetails jobs={jobs} setJobs={setJobs} />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
