import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { homepageService } from '../../services/apiService';
import Loading from '../../components/student/Loading';

const Footer = () => {


const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const resp = await homepageService.getHomepageByLanguage('en');
        setContact(resp.data.contact);
      } catch (err) {
        setError('Failed to load contact info');
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!contact) return null;

  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-b border-white/20">
          {/* Company Info Section */}
          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <img 
              src={assets.logo_dark} 
              alt="ThinkCyber Logo" 
              className="w-32 h-auto mb-6" 
            />
            <p className="text-sm text-white/80 text-center md:text-left leading-relaxed mb-6 max-w-xs">
              ThinkCyber Education, built specifically for educational centers, is dedicated to engaging teaching and learners.
            </p>
          </div>

          {/* Company Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-white text-lg mb-4">Company</h3>
            <ul className="space-y-3 text-center md:text-left">
              <li>
                <a href=" /" className="text-sm text-white/80 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href=" /about" className="text-sm text-white/80 hover:text-white transition-colors">
                  About us
                </a>
              </li>
              <li>
                <a href=" /contact" className="text-sm text-white/80 hover:text-white transition-colors">
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-white text-lg mb-4">Community</h3>
            <ul className="space-y-3 text-center md:text-left">
              <li>
                <a href=" /faq" className="text-sm text-white/80 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-white text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-center md:text-left mb-6">
              <p className="text-sm text-white/80">{contact.phone}</p>
              <p className="text-sm text-white/80">Email: {contact.email}</p>
              <p className="text-sm text-white/80">Address: {contact.address}</p>
            </div>
            <div className="flex gap-3 justify-center md:justify-start">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <img src={assets.google_play_icon} alt="Get it on Google Play" className="h-10 w-auto" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <img src={assets.app_store_icon} alt="Download on the App Store" className="h-10 w-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center py-3 text-sm text-white/60">
          <p className="mb-4 md:mb-0 text-center md:text-left">
            Copyright © 2025 ThinkCyber. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href=" /terms" className="hover:text-white transition-colors">
              Terms of Use
            </a>
            <a href=" /privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
