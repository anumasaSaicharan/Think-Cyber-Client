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
    if (!faqs) return null;
    return (
        <>
            <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center py-10 px-2 md:px-0">
                <div className="w-full max-w-6xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-2 md:mt-8">
                        Frequently Asked Questions
                    </h1>
                    <div className="w-full mx-auto">
                        {/* Combine API FAQs with Static FAQs */}
                        {(() => {
                            const allFaqs = [
                                ...(faqs || []),
                                {
                                    id: 'static-1',
                                    question: 'How do I create an account?',
                                    answer: 'To create an account, click on the **"Profile"** icon in the top right corner and select **"Sign Up"**. Enter your **First Name**, **Last Name**, and **Email Address**. You will receive an OTP (One-Time Password) on your email to verify and complete your registration.'
                                },
                                {
                                    id: 'static-2',
                                    question: 'How do I log in?',
                                    answer: 'We use a secure **OTP-based login**. Click on the **"Profile"** icon, enter your registered email address, and click "Login". A verification code will be sent to your email. Enter the code to access your dashboard. No password required!'
                                },
                                {
                                    id: 'static-4',
                                    question: 'How do I enroll in a course?',
                                    answer: 'Browse our **"Topics"** page to find a course you like. Click on the course card to view details. You can choose to enroll in a **Bundle** (saving money) or an **Individual Topic**. Click "Enroll Now" and complete the secure payment process.'
                                },
                                {
                                    id: 'static-5',
                                    question: 'What is the difference between a Bundle and an Individual Topic?',
                                    answer: '- **Bundle:** A collection of related topics offered at a discounted price. It serves as a complete learning path.\n- **Individual Topic:** A single specific course that you can buy separately if you don\'t need the full bundle.'
                                },
                                {
                                    id: 'static-6',
                                    question: 'How long is my subscription valid?',
                                    answer: 'All course and bundle subscriptions are valid for **1 year (365 days)** from the date of enrollment. You can view your validity status in the "My Enrollments" section.'
                                },
                                {
                                    id: 'static-7',
                                    question: 'What happens when my subscription expires?',
                                    answer: 'Once your 1-year subscription expires, you will lose access to the course content. To regain access, you will need to re-enroll in the course or bundle.'
                                },
                                {
                                    id: 'static-8',
                                    question: 'Is my payment information secure?',
                                    answer: 'Yes! We use **Razorpay**, a trusted and secure payment gateway. We do not store your card or banking details on our servers.'
                                },
                                {
                                    id: 'static-11',
                                    question: 'How do I edit my profile?',
                                    answer: 'Currently, you can view your profile details (Name, Email, Phone) in the **"My Profile"** section. To update your details, please contact our support team at the email provided in the footer.'
                                },
                                {
                                    id: 'static-12',
                                    question: 'Can I delete my account?',
                                    answer: 'Yes, you can request account deletion from the **"My Profile"** section under the "Danger Zone". Please note that this action is irreversible and will remove all your enrollment data.'
                                },
                                {
                                    id: 'static-10',
                                    question: 'Do you offer certificates?',
                                    answer: 'Yes, upon successfully completing a course, you can earn a certificate of completion to showcase your skills.'
                                }
                            ];

                            return allFaqs.length > 0 ? (
                                allFaqs.map((faq) => (
                                    <div key={faq.id} className="mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-shadow hover:shadow-lg">
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">{renderQuestionWithBold(faq.question)}</h2>
                                        <div className="text-gray-700 text-base leading-relaxed">
                                            <MarkdownRenderer content={faq.answer} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 text-center">No FAQs available at the moment.</p>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQ;
