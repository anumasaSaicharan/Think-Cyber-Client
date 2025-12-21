import React, { useEffect, useState } from 'react';
import { termsService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const MobileTermsAndConditions = () => {
    const [termsData, setTermsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTermsAndConditions = async () => {
            try {
                setLoading(true);
                // Try to get latest terms first, fallback to getting all terms
                let response;
                try {
                    response = await termsService.getLatestTerms();
                } catch (latestError) {
                    // Fallback to getting all terms and pick the first one
                    response = await termsService.getAllTerms({
                        limit: 1,
                        sortBy: 'createdAt',
                        sortOrder: 'desc'
                    });
                    if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                        response = { data: response.data[0] };
                    }
                }

                if (response?.data) {
                    setTermsData(response.data);
                } else {
                    // If no data found, set empty object to trigger static content fallback
                    setTermsData({});
                }
            } catch (err) {
                console.error('Error fetching terms and conditions:', err);
                // If error occurs, set empty object to trigger static content fallback
                setTermsData({});
            } finally {
                setLoading(false);
            }
        };

        fetchTermsAndConditions();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (!termsData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">No terms and conditions available</p>
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
                        {termsData.title || 'Terms and Conditions'}
                    </h1>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-3">
                        {termsData.lastUpdated && (
                            <span>
                                Last updated: {new Date(termsData.lastUpdated).toLocaleDateString()}
                            </span>
                        )}
                        {termsData.effectiveDate && (
                            <span>
                                Effective: {new Date(termsData.effectiveDate).toLocaleDateString()}
                            </span>
                        )}
                        {termsData.version && (
                            <span>Version: {termsData.version}</span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                    {termsData.content ? (
                        <MarkdownRenderer content={termsData.content} />
                    ) : (
                        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Acceptance of Terms</h2>
                                <p>By accessing and using ThinkCyber's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Use of Services</h2>
                                <p>You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use the services in any way that could damage, disable, or impair our systems.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">User Accounts</h2>
                                <p>You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Intellectual Property</h2>
                                <p>The content, features, and functionality of our services are owned by ThinkCyber and are protected by international copyright, trademark, and other intellectual property laws.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Limitation of Liability</h2>
                                <p>In no event shall ThinkCyber be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Termination</h2>
                                <p>We may terminate or suspend your account and access to our services at any time, without prior notice, for conduct that we believe violates these Terms.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Changes to Terms</h2>
                                <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on our website.</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h2>
                                <p>If you have any questions about these Terms and Conditions, please contact us at legal@thinkcyber.com</p>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileTermsAndConditions;
