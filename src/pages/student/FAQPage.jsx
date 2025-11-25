import React, { useEffect, useState } from 'react';
import { homepageService } from '../../services/apiService';
import Loading from '../../components/student/Loading';

const FAQ = () => {
    const [faqs, setFAQs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            //debugger;
            try {
                setLoading(true);
                //debugger;
                const resp = await homepageService.getHomepageByLanguage('en');
                setFAQs(resp.data.faqs);
            } catch (err) {
                setError('Failed to load about info');
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    console.log({ loading, error, faqs });
    
  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!faqs) return null;
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
                        <div key={faq.id} className="mb-6 bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h2>
                            <p className="text-gray-700 text-base">{faq.answer}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No FAQs available.</p>
                )}
            </div>
        </div> 
        </div>
       </> 
    );
};

export default FAQ;
