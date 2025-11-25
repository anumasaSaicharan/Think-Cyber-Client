import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { authService } from '../../services/apiService';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'తెలుగు', native: 'Telugu' },
  { code: 'hi', label: 'हिंदी', native: 'Hindi' },
];

const SignupModal = ({ isOpen, onClose, onVerificationNeeded }) => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setForm({ firstName: '', lastName: '', email: '' });
      setSelectedLang('en');
      setTermsAccepted(false);
    }
  }, [isOpen]);

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
   // //debugger;
     e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill all fields');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions to continue');
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
      
      // Save email before resetting form
      const userEmail = form.email;
      
      // Reset form
      setForm({ firstName: '', lastName: '', email: '' });
      setTermsAccepted(false);
      
      // Trigger verification modal in parent component
      // Parent will handle closing this modal and opening verification modal
      if (onVerificationNeeded) {
        onVerificationNeeded(userEmail);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Signup failed');
    }
    setLoading(false);
  };



  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40">
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
              <input 
                type="checkbox" 
                className="mr-2" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                By Signing Up, You Agree To The <a href="#" className="underline text-blue-600">Terms & Conditions</a>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded font-semibold mb-4" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form> 
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
