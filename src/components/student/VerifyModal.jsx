import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { authService } from '../../services/apiService';

const VerifyModal = ({ isOpen, onClose, email }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUserData } = useContext(AppContext);
   if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col overflow-hidden relative animate-fade-in p-8">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-2 text-center">Verify OTP</h3>
        <p className="text-gray-600 mb-6 text-center">Enter the OTP sent to your email <span className="font-semibold">{email}</span></p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              const res = await authService.verifyOtp(email, otp);
              debugger;
              setLoading(false);
              if (res.success === true) { 
                if (res.user) { 
                  setUserData(res.user); // Update global state
                }
                toast.success(res.message || 'Verification successful!');
                onClose();
              } else {
                setError(res.error || 'Invalid OTP. Please try again.');
              }
            } catch (err) {
              setLoading(false);
              setError('Verification failed. Please try again.');
            }
          }}
        >
          <label className="block text-gray-700 mb-1 font-semibold">OTP</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded font-semibold mb-4" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyModal;
