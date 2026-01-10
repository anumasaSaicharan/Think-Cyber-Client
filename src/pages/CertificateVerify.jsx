import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { certificateService } from '../services/apiService';
import Loading from '../components/student/Loading';
import { FiCheckCircle, FiShield, FiMail, FiArrowLeft } from 'react-icons/fi';

const CertificateVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [certificateNumber, setCertificateNumber] = useState(searchParams.get('cert') || '');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!certificateNumber || !email) {
      toast.error('Please enter certificate number and email');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8082'}/api/certificates/verify/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateNumber, email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setTimeLeft(120); // 2 minutes
        toast.success('OTP sent to your email');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8082'}/api/certificates/verify/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateNumber, email, otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCertificate(data.data);
        toast.success('Certificate verified successfully!');
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/verify'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <FiArrowLeft className="w-5 h-5" />
            Verify Another Certificate
          </button>

          {/* Verified Badge */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verified</h1>
              <p className="text-gray-600">This certificate is authentic and valid</p>
            </div>

            {/* Certificate Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Certificate Number</p>
                  <p className="font-mono font-semibold text-gray-900">{certificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recipient Name</p>
                  <p className="font-semibold text-gray-900">{certificate.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{certificate.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{certificate.category_name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Score Achieved</p>
                  <p className="text-3xl font-bold text-green-600">{certificate.score_percentage}%</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Correct Answers</p>
                    <p className="text-2xl font-bold text-blue-600">{certificate.correct_answers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Questions</p>
                    <p className="text-2xl font-bold text-gray-600">{certificate.total_questions}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(certificate.issued_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    certificate.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {certificate.status === 'active' ? '✓ Active' : '✗ ' + certificate.status}
                  </span>
                </div>
              </div>
            </div>

            {/* View Full Certificate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => window.open(`/certificate/${certificate.certificate_number}`, '_blank')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View Full Certificate
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <FiShield className="w-5 h-5" />
              <p className="text-sm font-semibold">This certificate has been verified through secure OTP authentication</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Certificate</h1>
          <p className="text-gray-600">Enter certificate details to verify authenticity</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Number
                </label>
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  placeholder="TC-2026-XXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the email associated with this certificate
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <FiMail className="w-5 h-5" />
                    Send Verification OTP
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 text-center">
                  OTP sent to <span className="font-semibold">{email}</span>
                </p>
                {timeLeft > 0 && (
                  <p className="text-xs text-blue-600 text-center mt-1">
                    Expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-2xl text-center tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Certificate'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setTimeLeft(0);
                }}
                className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Change Email or Certificate Number
              </button>

              {timeLeft === 0 && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  Resend OTP
                </button>
              )}
            </form>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have the certificate number?{' '}
            <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700 font-semibold">
              Go to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;
