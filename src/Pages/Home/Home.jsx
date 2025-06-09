import React from 'react';
import './Home.css';
import { TbCircleNumber1Filled, TbCircleNumber2Filled, TbCircleNumber3Filled } from "react-icons/tb";

// ✅ Importing images correctly (make sure these files are in src/assets/)
import card1 from '../../assets/card1.png';
import card2 from '../../assets/card2.png';
import card3 from '../../assets/card3.png';
import card4 from '../../assets/card4.png';

const Home = () => {
  return (
    <div>
      {/* Section 1 */}
      <div className="section1">
        <div className="containerh">
          <h1 className='t1'>Connect with the Right Talent Using AI</h1>
          <h5 className='t2'>
            JobConnect uses advanced AI matching to connect companies with qualified candidates based on skills, experience, and culture fit.
          </h5>
        </div>

        <div className='button'>
          <button className='b1'>Find a job</button>
          <button className='b2'>Post a job</button>
        </div>
      </div>

      {/* Section 2 */}
      <div className="section2">
        <div className="containerg">
          <h1>Why Choose JobConnect</h1>
          <p>Our AI-powered platform makes hiring and job searching more efficient and effective.</p>
        </div>

        <div className='card-container'>
          <div className='card'>
            <img src={card1} className='pic' alt="AI-Based Matching" />
            <h2>AI-Based Matching</h2>
            <p>Our AI algorithm analyzes resumes and job descriptions to find the perfect matches.</p>
          </div>

          <div className='card'>
            <img src={card2} className='pic' alt="Smart Job Listings" />
            <h2>Smart Job Listings</h2>
            <p>Create detailed job postings that attract qualified candidates with the right skills.</p>
          </div>

          <div className='card'>
            <img src={card3} className='pic' alt="Applicant Tracking" />
            <h2>Applicant Tracking</h2>
            <p>Manage candidates, track applications, and collaborate with your hiring team.</p>
          </div>

          <div className='card'>
            <img src={card4} className='pic' alt="Real-Time Chat" />
            <h2>Real-Time Chat</h2>
            <p>Connect directly with potential candidates or employers through our messaging system.</p>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="section3">
        <h1>How JobConnect Works</h1>
        <p>Our platform makes the hiring process simple and efficient for both employers and job seekers.</p>
        <div className='containerf'>
          <div className='c1'>
            <div className='size'><TbCircleNumber1Filled /></div>
            <h3>Create Your Profile</h3>
            <p>Sign up and create a detailed profile. For job seekers, upload your resume; for employers, set up your company profile.</p>
          </div>

          <div className='c1'>
            <div className='size'><TbCircleNumber2Filled /></div>
            <h3>Connect with AI Matching</h3>
            <p>Our AI system analyzes profiles and job listings to suggest the best matches based on skills, experience, and requirements.</p>
          </div>

          <div className='c1'>
            <div className='size'><TbCircleNumber3Filled /></div>
            <h3>Apply or Hire with Confidence</h3>
            <p>Job seekers can apply to recommended positions, while employers can review vetted candidates and make informed hiring decisions.</p>
          </div>
        </div>
      </div>

      {/* Section 5 */}
      <div className='section5'>
        <div className='containeri'>
          <h2>List Your Organization</h2>
          <p>Join thousands of companies hiring top talent through JobConnect</p>
        </div>
        <button className='but2'>List Your Organization</button>
      </div>

      {/* Section 4 */}
      <div className='section4'>
        <h1 className='text'>Ready to Find Your Perfect Match?</h1>
        <p className='text'>Join thousands of companies and job seekers who have already found success with JobConnect.</p>
        <div className='button2'>
          <button className="bu1">Sign Up as Job Seeker</button>
          <button className="bu2">Sign Up as Job Employer</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
