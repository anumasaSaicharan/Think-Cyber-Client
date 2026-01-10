import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { categoriesService, topicService, certificateService } from '../../services/apiService'
import Loading from '../../components/student/Loading';
import { FiAward, FiBookOpen, FiDownload, FiExternalLink } from 'react-icons/fi';

const MyEnrollments = () => {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();
    const [enrolledBundles, setEnrolledBundles] = useState([]);
    const [enrolledTopics, setEnrolledTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [activeTab, setActiveTab] = useState('enrollments');

    // Fetch enrolled bundles and individual topics
    useEffect(() => {
        const fetchEnrollments = async () => {
            if (!userData || !userData.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch all categories WITH subcategories
                const categoriesResponse = await categoriesService.getAllCategories().catch(() => ({
                    data: []
                }));
                const categoriesData = categoriesResponse?.data || [];
                setCategories(categoriesData);

                // Fetch bundle enrollments
                try {
                    const bundleRes = await topicService.getUserBundles(userData.id);
                    let bundles = [];
                    // Handle various possible response structures
                    if (bundleRes?.bundles && Array.isArray(bundleRes.bundles)) {
                        bundles = bundleRes.bundles;
                    } else if (bundleRes?.data?.bundles && Array.isArray(bundleRes.data.bundles)) {
                        bundles = bundleRes.data.bundles;
                    } else if (bundleRes?.data && Array.isArray(bundleRes.data)) {
                        bundles = bundleRes.data;
                    }
                    setEnrolledBundles(bundles);
                } catch (bundleErr) {
                    console.error('Bundle fetch error:', bundleErr);
                }

                // Fetch individual topic enrollments
                try {
                    const topicsRes = await topicService.getUserEnrolledTopics(userData.id);
                    let topics = [];
                    // Handle standardized API response { success: true, data: [...] }
                    if (topicsRes?.data && Array.isArray(topicsRes.data)) {
                        topics = topicsRes.data;
                    } else if (Array.isArray(topicsRes)) {
                        topics = topicsRes;
                    }

                    // Map API key names to component expectations
                    // The API returns 'topic_title' but component expects 'title'
                    const mappedTopics = topics.map(t => ({
                        ...t,
                        title: t.topic_title || t.title || t.name,
                        description: t.topic_description || t.description,
                        created_at: t.topic_created_at || t.created_at,
                        // Ensure we have a valid ID since the API returns both row id and topic_id
                        // We keep 'id' as enrollment ID for keys, but ensure topic_id is available
                    }));

                    setEnrolledTopics(mappedTopics);
                } catch (topicsErr) {
                    console.error('Topics fetch error:', topicsErr);
                }

                // Fetch user certificates
                try {
                    const certsRes = await certificateService.getUserCertificates(userData.id);
                    if (certsRes?.success && Array.isArray(certsRes.data)) {
                        setCertificates(certsRes.data);
                    }
                } catch (certsErr) {
                    console.error('Certificates fetch error:', certsErr);
                }

            } catch (err) {
                console.error('Error in fetchEnrollments:', err);
            } finally {
                setLoading(false);
            }
        };

        if (userData?.id) {
            fetchEnrollments();
        }
    }, [userData?.id]);

    // Show all enrolled topics
    const getIndividualTopics = () => {
        return enrolledTopics;
    };

    // Get category details
    const getCategoryDetails = (categoryId) => {
        return categories.find(cat => Number(cat.id) === Number(categoryId));
    };

    // Get plan type badge styling
    const getPlanTypeBadge = (planType) => {
        switch (planType) {
            case 'BUNDLE':
                return { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-500', icon: '📦' };
            case 'FLEXIBLE':
                return { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-500', icon: '🔧' };
            case 'INDIVIDUAL':
                return { bg: 'bg-purple-100', text: 'text-purple-800', badge: 'bg-purple-500', icon: '📖' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-500', icon: '📚' };
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate days remaining (1 year from enrollment)
    const getDaysRemaining = (enrolledAt) => {
        const enrolled = new Date(enrolledAt);
        const expiry = new Date(enrolled);
        expiry.setFullYear(expiry.getFullYear() + 1);

        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { days: diffDays, expiryDate: expiry };
    };


    if (loading) {
        return <Loading />;
    }

    const individualTopics = getIndividualTopics();
    const totalEnrollments = enrolledBundles.length + individualTopics.length;

    return (
        <div className='min-h-screen bg-gray-50 py-10'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                {/* Header */}
                <div className='mb-10'>
                    <h1 className='text-4xl font-bold text-gray-900 mb-2'>My Enrollments</h1>
                    <p className='text-gray-600'>
                        {totalEnrollments > 0
                            ? `You have ${enrolledBundles.length} bundle${enrolledBundles.length !== 1 ? 's' : ''} and ${individualTopics.length} individual topic${individualTopics.length !== 1 ? 's' : ''} enrolled`
                            : 'You have no enrollments yet'
                        }
                    </p>

                    {/* Subscription Validity Info */}
                    <div className='mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded'>
                        <p className='text-sm text-blue-800'>
                            <strong>Subscription Validity:</strong> Each course subscription is valid for one year from the date of enrollment.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className='mb-8 flex border-b border-gray-200'>
                    <button
                        onClick={() => setActiveTab('enrollments')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                            activeTab === 'enrollments'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiBookOpen className='w-5 h-5' />
                        Enrollments ({totalEnrollments})
                    </button>
                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                            activeTab === 'certificates'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiAward className='w-5 h-5' />
                        Certificates ({certificates.length})
                    </button>
                </div>

                {/* Main Content */}
                {activeTab === 'enrollments' && (
                    <>
                        {totalEnrollments > 0 ? (
                            <div>
                        {/* Bundle Enrollments Section */}
                        {enrolledBundles.length > 0 && (
                            <div className='mb-12'>
                                <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
                                    <span>📦</span> Bundle Plans ({enrolledBundles.length})
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {enrolledBundles.map((bundle) => {
                                        // Try to find category details from the fetched categories list as a fallback
                                        const categoryDetails = getCategoryDetails(bundle.category_id) || {};

                                        // Category data now comes from the bundle directly, but fallback to looked-up details
                                        const category = {
                                            id: bundle.category_id,
                                            name: bundle.category_name || categoryDetails.name || `Bundle #${bundle.category_id}`,
                                            emoji: bundle.emoji || categoryDetails.emoji,
                                            bundle_price: bundle.bundle_price !== undefined ? bundle.bundle_price : categoryDetails.price,
                                            plan_type: bundle.plan_type || categoryDetails.plan_type,
                                            description: bundle.description || categoryDetails.description
                                        };
                                        const styles = getPlanTypeBadge(category?.plan_type || 'BUNDLE');

                                        // Calculate expiry
                                        const { days, expiryDate } = getDaysRemaining(bundle.enrolled_at);
                                        const isExpiring = days <= 30;
                                        const isExpired = days < 0;

                                        return (
                                            <div
                                                key={bundle.id}
                                                className={`${styles.bg} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4`}
                                                style={{ borderLeftColor: 'currentColor' }}
                                            >
                                                {/* Header */}
                                                <div className='flex items-start justify-between mb-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='text-3xl'>{category?.emoji || styles.icon}</div>
                                                        <div className='flex-1'>
                                                            <h3 className='text-lg font-bold text-gray-900'>{category?.name}</h3>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Plan Type Badge */}
                                                <div className='mb-4'>
                                                    <span className={`${styles.badge} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                                                        {styles.icon} {category?.plan_type}
                                                    </span>
                                                </div>

                                                {/* Stats */}
                                                <div className='grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-300'>
                                                    <div>
                                                        <p className='text-xs text-gray-600 font-semibold'>TOPICS</p>
                                                        <p className={`text-2xl font-bold ${styles.text}`}>
                                                            {bundle.accessible_topics_count || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className='text-xs text-gray-600 font-semibold'>PRICE</p>
                                                        <p className={`text-2xl font-bold ${styles.text}`}>
                                                            ₹{category?.bundle_price || 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className='space-y-2 mb-4 text-sm'>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Enrolled:</span>
                                                        <span className='text-gray-900 font-medium'>{formatDate(bundle.enrolled_at)}</span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Valid Until:</span>
                                                        <span className={`font-bold ${isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-green-600'}`}>
                                                            {formatDate(expiryDate)}
                                                        </span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Status:</span>
                                                        <span className={`font-bold ${isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-green-600'}`}>
                                                            {isExpired ? 'Expired' : days > 0 ? `${days} days left` : 'Expires today'}
                                                        </span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Future Topics:</span>
                                                        <span className={`font-bold ${bundle.future_topics_included ? 'text-green-600' : 'text-red-600'}`}>
                                                            {bundle.future_topics_included ? '✅ Included' : '🔒 Not Included'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Subcategories/Topics */}
                                                {category?.subcategories && category.subcategories.length > 0 && (
                                                    <div className='mb-4'>
                                                        <p className='text-xs font-bold text-gray-700 mb-2'>SUBCATEGORIES:</p>
                                                        <div className='flex flex-wrap gap-1'>
                                                            {category.subcategories.slice(0, 3).map((sub) => (
                                                                <span key={sub.id} className='text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded'>
                                                                    {sub.name}
                                                                </span>
                                                            ))}
                                                            {category.subcategories.length > 3 && (
                                                                <span className='text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded'>
                                                                    +{category.subcategories.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <button
                                                    className={`w-full ${isExpired ? 'bg-gray-400 cursor-not-allowed' : styles.badge + ' hover:opacity-90'} text-white py-2 rounded-lg font-semibold text-sm transition-opacity`}
                                                    onClick={() => {
                                                        if (!isExpired) {
                                                            window.location.href = `/topics?category=${bundle.category_id}`;
                                                        }
                                                    }}
                                                    disabled={isExpired}
                                                >
                                                    {isExpired ? 'Subscription Expired' : 'View Topics'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Topics Section */}
                        {individualTopics.length > 0 && (
                            <div>
                                <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
                                    <span>📚</span> Enrolled Topics ({individualTopics.length})
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {individualTopics.map((topic) => {
                                        const styles = getPlanTypeBadge('INDIVIDUAL');
                                        const { days, expiryDate } = getDaysRemaining(topic.enrolled_at);
                                        const isExpiring = days <= 30;
                                        const isExpired = days < 0;

                                        return (
                                            <div
                                                key={topic.id}
                                                className={`${styles.bg} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4`}
                                                style={{ borderLeftColor: 'currentColor' }}
                                            >
                                                {/* Header */}
                                                <div className='flex items-start gap-3 mb-4'>
                                                    <div className='text-3xl flex-shrink-0'>{topic.emoji || '📖'}</div>
                                                    <div className='flex-1 min-w-0'>
                                                        <h3 className='text-lg font-bold text-gray-900 line-clamp-2'>{topic.title}</h3>
                                                    </div>
                                                </div>

                                                {/* Plan Type Badge */}
                                                <div className='mb-4'>
                                                    <span className={`${styles.badge} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                                                        {styles.icon} INDIVIDUAL
                                                    </span>
                                                </div>

                                                {/* Price & Duration */}
                                                <div className='grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-300'>
                                                    <div>
                                                        <p className='text-xs text-gray-600 font-semibold'>PRICE</p>
                                                        <p className={`text-2xl font-bold ${!topic.price || parseFloat(topic.price) === 0 ? 'text-green-600' : styles.text}`}>
                                                            {!topic.price || parseFloat(topic.price) === 0 ? 'Free' : `₹${parseFloat(topic.price).toFixed(2)}`}
                                                        </p>
                                                    </div>
                                                    {/* <div>
                                                        <p className='text-xs text-gray-600 font-semibold'>DURATION</p>
                                                        <p className={`text-2xl font-bold ${styles.text}`}>
                                                            {topic.duration_minutes ? `${Math.round(topic.duration_minutes / 60)}h` : '—'}
                                                        </p>
                                                    </div> */}
                                                </div>

                                                {/* Enrollment & Validity Info */}
                                                <div className='space-y-2 mb-4 text-sm'>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Enrolled:</span>
                                                        <span className='text-gray-900 font-medium'>{formatDate(topic.enrolled_at)}</span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Valid Until:</span>
                                                        <span className={`font-bold ${isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-green-600'}`}>
                                                            {formatDate(expiryDate)}
                                                        </span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span className='text-gray-700'>Status:</span>
                                                        <span className={`font-bold ${isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-green-600'}`}>
                                                            {isExpired ? 'Expired' : days > 0 ? `${days} days left` : 'Expires today'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className='text-sm text-gray-700 mb-4 line-clamp-2'>
                                                    {topic.description || 'No description available'}
                                                </p>

                                                {/* Action Button */}
                                                <button
                                                    className={`w-full ${isExpired ? 'bg-gray-400 cursor-not-allowed' : styles.badge + ' hover:opacity-90'} text-white py-2 rounded-lg font-semibold text-sm transition-opacity`}
                                                    onClick={() => {
                                                        if (!isExpired) {
                                                            window.location.href = `/course/${topic.topic_id}`;
                                                        }
                                                    }}
                                                    disabled={isExpired}
                                                >
                                                    {isExpired ? 'Subscription Expired' : 'Learn Now'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='text-center py-16'>
                        <div className='text-6xl mb-4'>📚</div>
                        <h3 className='text-2xl font-bold text-gray-900 mb-2'>No Enrollments Yet</h3>
                        <p className='text-gray-600 mb-8'>You haven't enrolled in any plans yet. Start learning today!</p>
                        <button
                            className='bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
                            onClick={() => {
                                window.location.href = '/topics';
                            }}
                        >
                            Browse Categories
                        </button>
                    </div>
                )}
                    </>
                )}

                {/* Certificates Tab Content */}
                {activeTab === 'certificates' && (
                    <div>
                        {certificates.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {certificates.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow'
                                    >
                                        {/* Certificate Header */}
                                        <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white'>
                                            <div className='flex items-center gap-3'>
                                                <FiAward className='w-10 h-10' />
                                                <div>
                                                    <h3 className='font-bold text-lg'>Certificate of Completion</h3>
                                                    <p className='text-sm opacity-90'>{cert.category_name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Certificate Body */}
                                        <div className='p-6'>
                                            {/* Score */}
                                            <div className='flex justify-center mb-4'>
                                                <div className='text-center'>
                                                    <p className='text-4xl font-bold text-green-600'>{cert.score_percentage}%</p>
                                                    <p className='text-sm text-gray-500'>Score Achieved</p>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className='space-y-2 text-sm mb-6'>
                                                <div className='flex justify-between'>
                                                    <span className='text-gray-500'>Certificate ID</span>
                                                    <span className='font-mono text-gray-700 text-xs'>{cert.certificate_number}</span>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span className='text-gray-500'>Issued On</span>
                                                    <span className='text-gray-700'>{formatDate(cert.issued_at)}</span>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span className='text-gray-500'>Questions</span>
                                                    <span className='text-gray-700'>{cert.correct_answers}/{cert.total_questions}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className='flex gap-3'>
                                                <button
                                                    onClick={() => navigate(`/certificate/${cert.certificate_number}`)}
                                                    className='flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm'
                                                >
                                                    <FiExternalLink className='w-4 h-4' />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/certificate/${cert.certificate_number}`)}
                                                    className='flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold text-sm'
                                                >
                                                    <FiDownload className='w-4 h-4' />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center py-16'>
                                <FiAward className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                                <h3 className='text-2xl font-bold text-gray-900 mb-2'>No Certificates Yet</h3>
                                <p className='text-gray-600 mb-8'>
                                    Complete assessments to earn certificates. Browse your enrolled courses and take assessments!
                                </p>
                                <button
                                    className='bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
                                    onClick={() => setActiveTab('enrollments')}
                                >
                                    View Enrollments
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEnrollments;