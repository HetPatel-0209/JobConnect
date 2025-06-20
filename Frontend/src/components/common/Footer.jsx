import React from 'react';
import { Briefcase, Instagram, Linkedin, Facebook } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">JobConnect</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting talented professionals with innovative companies through AI-powered job matching.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/auth/?mode=register&type=jobseeker" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Create Account
                </a>
              </li>
              <li>
                <a href="/auth/?mode=login" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Browse Jobs
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/auth/?mode=register&type=recruiter" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="/auth/?mode=login" className="text-gray-300 hover:text-white transition-colors text-sm">
                  AI Matching
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mt-8 pt-6 border-t border-gray-700">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <FaXTwitter className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Facebook className="w-6 h-6" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm mt-6">
          © 2025 JobConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;