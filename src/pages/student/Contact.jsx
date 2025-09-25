
import React, { useEffect, useState } from 'react';
import { homepageService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import Footer from '../../components/student/Footer';
import { assets } from '../../assets/assets';

const Contact = () => {
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
    <>
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center py-10 px-2 md:px-0">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-2 md:mt-8">We're here to help!</h1>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Contact Address */}
            <div className="flex-1 bg-white rounded-lg shadow p-6 min-w-[260px] max-w-md border border-gray-100">
              <h2 className="text-lg font-bold text-blue-700 mb-4">Contact Address</h2>
              <div className="mb-2 text-gray-700 flex flex-col gap-3">
                <span className="flex items-center gap-3">
                  <img src={assets.AddressIcon} alt="Location" className="w-7 h-7 text-blue-500" />
                  <span className="ml-1 text-lg font-medium">{contact.address}</span>
                </span>
                <span className="flex items-center gap-3">
                  <img src={assets.PhoneIcon} alt="Phone" className="w-7 h-7 text-blue-500" />
                  <span className="ml-1 text-lg font-medium">{contact.phone}</span>
                </span>
                <span className="flex items-center gap-3">
                  <img src={assets.EmailIcon} alt="Email" className="w-7 h-7 text-blue-500" />
                  <span className="ml-1 text-lg font-medium">{contact.email}</span>
                </span>
              </div>
            </div>
            {/* Form and Illustration in a single card */}
            <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-100 flex flex-col md:flex-row gap-6">
              {/* Illustration left, align to top */}
              <div className="hidden md:flex w-1/3 self-start">
                <img src={assets.contactusBanner} alt="Contact Illustration" className="w-full h-full object-contain" />
              </div>
              {/* Form right */}
              <div className="w-full md:w-2/3">
                <h2 className="text-lg font-bold text-blue-700 mb-2">Let's talk</h2>
                <p className="text-gray-600 text-sm mb-4">Please fill out the form and we will get back to you promptly.</p>
                <form className="w-full flex flex-col gap-4 mt-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Your Name
                    <input type="text" placeholder="Name" className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-base bg-[#f8fafc] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700 mb-1">Email Address
                    <input type="email" placeholder="Example@gmail.com" className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-base bg-[#f8fafc] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700 mb-1">Message
                    <textarea placeholder="Type here" rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-base bg-[#f8fafc] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none" />
                  </label>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-4 py-3 font-semibold text-base mt-2 shadow hover:from-blue-600 hover:to-blue-700 transition-colors">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
