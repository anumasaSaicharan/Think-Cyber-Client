import React, { useState } from 'react';
import { authService } from '../../services/apiService';
import VerifyModal from './VerifyModal';
import { assets } from '../../assets/assets';
import SignupModal from './SignupModal';
import { toast } from 'react-toastify';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'తెలుగు', native: 'Telugu' },
  { code: 'hi', label: 'हिंदी', native: 'Hindi' },
];

const LoginModal = ({ isOpen, onClose }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verificationType, setVerificationType] = useState('login');
  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setShowSignup(false);
      setShowVerify(false);
      setVerifyEmail('');
      setVerificationType('login');
    }
  }, [isOpen]);
  if (!isOpen && !showSignup && !showVerify) return null;

  if (showSignup) {
    return <SignupModal 
      isOpen={showSignup} 
      onClose={() => { setShowSignup(false); onClose(); }}
      onVerificationNeeded={(email) => {
        setVerifyEmail(email);
        setVerificationType('signup');
        setShowSignup(false);
        setShowVerify(true);
      }}
    />;
  }
  if (showVerify) {
    return <VerifyModal 
      isOpen={showVerify} 
      onClose={() => { setShowVerify(false); onClose(); }} 
      email={verifyEmail || email}
      type={verificationType}
      onVerificationSuccess={(user) => {
        // Handle successful verification
        setShowVerify(false);
        onClose();
      }}
    />;
  }

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
        {/* Login Form Only */}
        <div className="flex flex-col justify-center w-full p-10">
          <div className="flex items-center gap-2 mb-4">
            <img src={assets.LoginLogo} alt="ThinkCyber" className="w-44 mt-4" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Login</h3>
          <p className="text-gray-600 mb-4">Nice to see you! Please log in with your account.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setLoading(true);
              try {
                // For email-only login, send OTP to email and open verification modal
                const res = await authService.resendOtp(email);
                setLoading(false);
                if (res.success === true) {
                  toast.success('OTP sent to your email.');
                  setVerifyEmail(email);
                  setVerificationType('login');
                  setShowVerify(true);
                } else {
                  setError(res.data?.error || 'Failed to send OTP');
                }
              } catch (err) {
                setLoading(false);
                setError(err.response?.data?.error || 'Failed to send OTP');
              }
            }}
          >
            <label className="block text-gray-700 mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
              placeholder="Example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            {error && error.includes('not verified') && (
              <div className="text-blue-600 mb-2 text-sm cursor-pointer underline" onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const res = await authService.resendOtp(email);
                  setLoading(false);
                  if (res.success === true || res.status === 403) {
                    toast.success('OTP resent to your email.');
                    setVerifyEmail(email);
                    setVerificationType('login');
                    setShowVerify(true);
                  } else {
                    setError(res.data?.error || 'Failed to resend OTP');
                  }
                } catch (err) {
                  setLoading(false);
                  setError(err.response?.data?.error || 'Failed to resend OTP');
                }
              }}>
                Resend Code
              </div>
            )}
            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded font-semibold mb-4" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form> 
          <div className="text-sm text-gray-500 mt-4 text-center">
            Already Have An Account? <button type="button" onClick={() => setShowSignup(true)} className="text-blue-600 font-medium"><span className="underline">Create Account</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
