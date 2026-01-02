import React, { useEffect, useState } from 'react';
import { homepageService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const FAQ = () => {
    const [faqs, setFAQs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                setLoading(true);
                // The backend does not have a dedicated GET /homepage/faqs endpoint.
                // We fetch the entire homepage content for 'en' which includes FAQs.
                const resp = await homepageService.getHomepageByLanguage('en');
                if (resp && resp.data && resp.data.faqs) {
                    setFAQs(resp.data.faqs);
                } else {
                    setFAQs([]);
                }
            } catch (err) {
                console.error("Failed to fetch FAQs", err);
                setError('Failed to load FAQs');
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    const renderQuestionWithBold = (text) => {
        if (!text) return text;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={index} className="font-bold">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    console.log({ loading, error, faqs });

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    return (
        <>
            <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center py-10 px-2 md:px-0">
                <div className="w-full max-w-6xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-2 md:mt-8">
                        Frequently Asked Questions
                    </h1>
                    <div className="w-full mx-auto">
                        {faqs && faqs.length > 0 ? (
                            faqs.map((faq) => (
                                <div key={faq.id || faq._id} className="mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-shadow hover:shadow-lg">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">{renderQuestionWithBold(faq.question)}</h2>
                                    <div className="text-gray-700 text-base leading-relaxed">
                                        <MarkdownRenderer content={faq.answer} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-center">No FAQs available at the moment.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQ;
