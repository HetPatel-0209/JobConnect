import './Footer.css';
import logo from "../../assets/Job.jpeg";
import { FaInstagram, FaLinkedinIn, FaFacebookF } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Left Section: Logo & Description */}
                <div className="footer-left">
                    <div className="footer-brand">
                        <img src={logo} alt="Logo" className="footer-logo" />
                        <p className="footer-description">
                            Connecting talented professionals with innovative companies through AI-powered job matching.
                        </p>
                    </div>
                </div>


                {/* Center Section: Links */}
                <div className="footer-links">
                    <div className="footer-column">
                        <h2>For Job Seekers</h2>
                        <a>Create Account</a>
                        <a>Browse Jobs</a>
                    </div>
                    <div className="footer-column">
                        <h2>For Employers</h2>
                        <a>Post a Job</a>
                        <a>AI Matching</a>
                    </div>
                    <div className="footer-column">
                        <h2>Resources</h2>
                        <a>Contact Us</a>
                    </div>
                </div>


                {/* Bottom: Social Icons */}
                <div className="footer-socials">
                    <FaInstagram className="icon" />
                    <FaLinkedinIn className="icon" />
                    <BsTwitterX className="icon" />
                    <FaFacebookF className="icon" />
                </div>
            </div>
        </footer>
    );
}
