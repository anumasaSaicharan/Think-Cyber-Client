import React, { useEffect, useState } from 'react';
import { privacyService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const MobilePrivacyPolicy = () => {
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
                    // If no data found, set empty object to trigger static content fallback
                    setPrivacyData({});
                }
            } catch (err) {
                console.error('Error fetching privacy policy:', err);
                // If error occurs, set empty object to trigger static content fallback
                setPrivacyData({});
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacyPolicy();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (!privacyData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">No privacy policy available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {privacyData.title || 'Privacy Policy'}
                    </h1>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-3">
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
                <div className="prose prose-sm max-w-none">
                    {privacyData.content ? (
                        <MarkdownRenderer content={privacyData.content} />
                    ) : (
                        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Information We Collect</h2>
                                <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">How We Use Your Information</h2>
                                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Information Sharing</h2>
                                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Data Security</h2>
                                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h2>
                                <p>If you have any questions about this Privacy Policy, please contact us at privacy@thinkcyber.com</p>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobilePrivacyPolicy;
