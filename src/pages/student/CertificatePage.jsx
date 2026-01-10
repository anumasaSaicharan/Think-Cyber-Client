import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { certificateService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import { FiDownload, FiArrowLeft, FiShare2, FiCheckCircle } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { assets } from '../../assets/assets';

const CertificatePage = () => {
  const { certificateNumber } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await certificateService.verifyCertificate(certificateNumber);
        if (response?.success) {
          setCertificate(response.data);
          // Generate QR Code
          const verifyUrl = `${window.location.origin}/verify?cert=${response.data.certificate_number}`;
          const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 200,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeUrl(qrDataUrl);
        } else {
          toast.error('Certificate not found');
        }
      } catch (error) {
        console.error('Error fetching certificate:', error?.message || 'Request failed');
        toast.error('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    if (certificateNumber) {
      fetchCertificate();
    }
  }, [certificateNumber]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `Certificate-${certificate.certificate_number}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error?.message || 'Request failed');
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ThinkCyber Certificate',
          text: `I've earned a certificate in ${certificate.category_name} from ThinkCyber!`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-4">The certificate you're looking for doesn't exist or has been revoked.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <FiShare2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-700">Verified Certificate</p>
              <p className="text-sm text-green-600">
                Certificate ID: {certificate.certificate_number}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div 
          ref={certificateRef}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Certificate Border */}
          <div className="border-8 border-double border-blue-600 m-4 rounded-lg p-8">
            {/* Header Pattern */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4"> 
                  <img src={assets.logo} alt="Logo" className="w-36 lg:w-56 cursor-pointer" />
               </div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Certificate of Completion
              </h1>
              <div className="flex justify-center mb-2">
                <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg mb-4">This is to certify that</p>
              <h2 className="text-3xl font-bold text-blue-700 mb-4 font-serif">
                {certificate.user_name}
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                has successfully completed the assessment for
              </p>
              <div className="flex justify-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 px-8 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  {certificate.category_name}
                </h3>
              </div>
            </div>

            {/* Score & Details */}
            <div className="flex justify-center mb-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">{certificate.score_percentage}%</p>
                <p className="text-gray-500 text-sm">Score Achieved</p>
              </div>
              {/* <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{certificate.correct_answers}</p>
                <p className="text-gray-500 text-sm">Correct Answers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-600">{certificate.total_questions}</p>
                <p className="text-gray-500 text-sm">Total Questions</p>
              </div> */}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-500">Date Issued</p>
                <p className="font-semibold">{formatDate(certificate.issued_at)}</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center mb-2 overflow-hidden border border-gray-200">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                  ) : (
                    <div className="text-xs text-gray-500 text-center p-2">
                      <p>QR Code</p>
                      <p className="font-mono text-[8px] mt-1">{certificate.certificate_number}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Scan to verify</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-500">ThinkCyber</p>
                <p className="font-semibold">Official Signature</p>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-300">
              <p className="text-xs text-gray-400">
                Certificate Number: {certificate.certificate_number}
              </p>
              <p className="text-xs text-gray-400">
                This certificate can be verified at {window.location.origin}/verify
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-4">Certificate Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Recipient</p>
              <p className="font-semibold">{certificate.user_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-semibold">{certificate.user_email}</p>
            </div>
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-semibold">{certificate.category_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Issue Date</p>
              <p className="font-semibold">{formatDate(certificate.issued_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
