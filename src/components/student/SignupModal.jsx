import React, { useState } from 'react';
import VerifyModal from './VerifyModal';
 import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { authService } from '../../services/apiService';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'తెలుగు', native: 'Telugu' },
  { code: 'hi', label: 'हिंदी', native: 'Hindi' },
];

const SignupModal = ({ isOpen, onClose }) => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  if (!isOpen) return null;

  // Google Translate logic
  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    let googleLang = 'en';
    if (lang === 'hi') googleLang = 'hi';
    if (lang === 'te') googleLang = 'te';

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,te',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      };
    }
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = googleLang;
          select.dispatchEvent(new Event('change'));
        }
      }, 1500);
    } else {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = googleLang;
        select.dispatchEvent(new Event('change'));
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
   // debugger;
     e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.signupUser({
        email: form.email,
        firstname: form.firstName,
        lastname: form.lastName
      }); 
      toast.success(res?.message || 'Signup successful!');
      setForm({ firstName: '', lastName: '', email: '' });
      setShowVerifyModal(true);
      // Do not close signup modal immediately, show verify modal
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex overflow-hidden relative animate-fade-in">
          {/* Close Button */}
          <button
            className="absolute top-12 right-6 text-3xl text-red-500 hover:text-red-700"
            onClick={onClose}
          >
            &times;
          </button>
          {/* Signup Form Only */}
          <div className="flex flex-col justify-center w-full p-10">
            <div className="flex items-center gap-2 mb-4">
              <img src={assets.LoginLogo} alt="ThinkCyber" className="w-44 mt-4" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Create Account</h3>
            <p className="text-gray-600 mb-4">Nice to see you! Please Create your account.</p>
            <form onSubmit={handleSubmit}>
              <label className="block text-gray-700 mb-1 font-semibold">First Name</label>
              <input name="firstName" type="text" value={form.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500" placeholder="First Name" />
              <label className="block text-gray-700 mb-1 font-semibold">Last Name</label>
              <input name="lastName" type="text" value={form.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500" placeholder="Last Name" />
              <label className="block text-gray-700 mb-1 font-semibold">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500" placeholder="Example@gmail.com" />
              <div className="flex items-center mb-4">
                <input type="checkbox" className="mr-2" id="terms" />
                <label htmlFor="terms" className="text-xs text-gray-600">By Signing Up, You Agree To The <a href="#" className="underline text-blue-600">Terms & Conditions</a></label>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded font-semibold mb-4" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
            </form>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 font-semibold">Select Language</label>
              <span className="block text-xs text-gray-400 mb-1">Choose Preferred Language</span>
              <div className="flex gap-3">
                {LANGUAGES.map(lang => (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex-1 border ${selectedLang === lang.code ? 'border-blue-600 bg-blue-50' : 'border-gray-300'} text-gray-600 px-4 py-3 rounded-lg font-semibold flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-blue-400 relative`}
                  >
                    <span className="text-base font-bold text-black">{lang.label}</span>
                    <span className="text-xs font-normal">{lang.native}</span>
                    {selectedLang === lang.code && (
                      <span className="absolute top-2 right-2 text-blue-600">
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#2563eb" strokeWidth="2" fill="#fff"/><path d="M6 10.5l2.5 2.5L14 8.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {/* Google Translate container (hidden) */}
              <div id="google_translate_element" style={{ display: 'none' }}></div>
            </div>
          </div>
        </div>
      </div>
      {/* VerifyModal for OTP */}
      <VerifyModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          onClose && onClose();
        }}
        email={form.email}
      />
    </>
  );
};

export default SignupModal;
