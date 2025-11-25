import React, { useEffect, useState } from 'react';
import { privacyService } from '../../services/apiService';
import Loading from '../../components/student/Loading';

const PrivacyPolicy = () => {
  const [privacyData, setPrivacyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true);
        // Fetch all privacy policies and get the latest one
        const response = await privacyService.getAllPrivacyPolicies({ 
          limit: 1, 
          sortBy: 'createdAt', 
          sortOrder: 'desc' 
        });
        
        if (response?.data && response.data.length > 0) {
          setPrivacyData(response.data[0]);
        } else {
          setError('No privacy policy found');
        }
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
        setError('Failed to load privacy policy');
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!privacyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No privacy policy available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {privacyData.title || 'Privacy Policy'}
          </h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            {privacyData.lastUpdated && (
              <span>
                Last updated: {new Date(privacyData.lastUpdated).toLocaleDateString()}
              </span>
            )}
            {privacyData.version && (
              <span>Version: {privacyData.version}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            {privacyData.content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: privacyData.content }}
                className="leading-relaxed text-gray-700"
              />
            ) : (
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
                  <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
                  <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information Sharing</h2>
                  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
                  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                  <p>If you have any questions about this Privacy Policy, please contact us at privacy@thinkcyber.com</p>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;