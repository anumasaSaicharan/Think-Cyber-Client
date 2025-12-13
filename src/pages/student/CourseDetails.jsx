import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { topicService } from '../../services/apiService';
import { AppContext } from '../../context/AppContext';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const CourseDetails = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [modalVideo, setModalVideo] = useState(null);
  const { id } = useParams();
  const { userData, currency } = useContext(AppContext);
  const [courseData, setCourseData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCourseData = async () => {
    try {
      const response = await topicService.getTopicById(id);
      if (response && response.data) {
        console.log('Course Data:', response.data);
        setCourseData(response.data);
      } else {
        toast.error('Topic not found');
      }
    } catch (error) {
      toast.error('Failed to fetch topic details');
    }
  };

  const goBack = () => {
    // Prefer location.state, fall back to sessionStorage if user refreshed the page
    let fromCategory;
    let fromSubCategory;
    let appliedFilters;

    if (location.state) {
      ({ fromCategory, fromSubCategory, appliedFilters } = location.state);
      console.log('goBack -> using location.state:', {
        fromCategory,
        fromSubCategory,
        appliedFilters,
      });
    } else {
      const savedCategory = sessionStorage.getItem('fromCategory') || '';
      const savedSubCategory = sessionStorage.getItem('fromSubCategory') || '';
      const savedFilters = sessionStorage.getItem('appliedFilters');

      fromCategory = savedCategory || undefined;
      fromSubCategory = savedSubCategory || undefined;

      try {
        appliedFilters = savedFilters ? JSON.parse(savedFilters) : {};
      } catch (e) {
        console.error('goBack -> failed to parse appliedFilters from sessionStorage:', savedFilters, e);
        appliedFilters = {};
      }

      console.log('goBack -> using sessionStorage:', {
        fromCategory,
        fromSubCategory,
        appliedFilters,
      });
    }

    const hasState =
      (fromCategory !== undefined && fromCategory !== '') ||
      (fromSubCategory !== undefined && fromSubCategory !== '') ||
      (appliedFilters && Object.keys(appliedFilters).length > 0);

    if (hasState) {
      // Keep sessionStorage in sync
      sessionStorage.setItem('fromCategory', fromCategory ?? '');
      sessionStorage.setItem('fromSubCategory', fromSubCategory ?? '');
      sessionStorage.setItem('appliedFilters', JSON.stringify(appliedFilters || {}));

      navigate('/topics', {
        state: {
          fromCategory,
          fromSubCategory,
          appliedFilters,
        },
      });
    } else {
      console.log('goBack -> no state found, navigating to /topics without filters');
      navigate('/topics');
    }
  };

  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const enrollCourse = async () => {
    // Check if user is logged in
    if (!userData || !userData.id) {
      toast.error('Please log in to enroll in the topic');
      return;
    }

    console.log('Enrolling in course:', {
      topicId: courseData.id,
      price: courseData.price,
      isFree: courseData.isFree
    });

    // Check if course is free
    if (courseData.isFree || courseData.price === 0 || courseData.price === null) {
      // Free course - enroll directly
      try {
        const response = await topicService.enrollInTopic({
          userId: userData.id,
          topicId: courseData.id,
          email: userData.email,
          currency: currency === '₹' ? 'INR' : 'USD',
        });

        console.log('Free enrollment response:', response);

        if (response && response.success) {
          toast.success('Successfully enrolled in the free course!');
          setIsAlreadyEnrolled(true);
        } else {
          const errorMsg = response?.error || 'Failed to enroll in the course';
          console.error('Free enrollment failed:', errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error('Free enrollment error:', error);
        const errorMsg = error?.response?.data?.error || error?.message || 'Failed to enroll in the course';
        toast.error(errorMsg);
      }
    } else {
      // Paid course - use Razorpay
      try {
        const currencyCode = currency === '₹' ? 'INR' : 'USD';
        console.log('Initiating paid enrollment with Razorpay');

        const response = await topicService.enrollInTopic({
          userId: userData.id,
          topicId: courseData.id,
          email: userData.email,
          currency: currencyCode,
        });

        console.log('Paid enrollment response:', response);

        if (response.success && response.requiresPayment) {
          // Initialize Razorpay checkout
          const options = {
            key: response.keyId,
            amount: response.amount,
            currency: response.currency,
            name: 'ThinkCyber',
            description: courseData.title,
            order_id: response.orderId,
            handler: async function (razorpayResponse) {
              try {
                // Verify payment on backend
                const verifyResponse = await fetch('http://localhost:8081/api/enrollments/verify-payment', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                    userId: userData.id,
                    topicId: courseData.id,
                  }),
                });

                const verifyData = await verifyResponse.json();

                if (verifyData.success) {
                  toast.success('Payment successful! You are now enrolled.');
                  setIsAlreadyEnrolled(true);
                } else {
                  toast.error('Payment verification failed');
                }
              } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Payment verification failed');
              }
            },
            prefill: {
              name: userData.name || '',
              email: userData.email || '',
              contact: userData.phone || '',
            },
            theme: {
              color: '#2563eb',
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } else if (response.success) {
          // Fallback in case backend returns success without payment
          toast.success('Successfully enrolled in the course!');
          setIsAlreadyEnrolled(true);
        } else {
          const errorMsg = response.error || 'Failed to enroll in the course';
          console.error('Paid enrollment failed:', errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        console.error('Enrollment error:', err);
        const errorMsg = err?.response?.data?.error || err?.message || 'Enrollment failed';
        toast.error(errorMsg);
      }
    }
  };

  // Example usage, adjust as per your actual API
  const checkEnrollment = async () => {
    if (!userData || !userData.id) {
      console.log('checkEnrollment: No user data');
      return false;
    }
    try {
      const res = await topicService.checkUserEnrollment(userData.id, id);
      console.log('checkEnrollment response:', {
        userId: userData.id,
        topicId: id,
        response: res,
        enrolled: res?.enrolled,
        paymentStatus: res?.payment_status
      });
      return res?.enrolled || false;
    } catch (error) {
      console.error('checkEnrollment error:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchCourseData();
      if (userData && id) {
        console.log('Checking enrollment for:', { userId: userData.id, topicId: id });
        const enrolled = await checkEnrollment();
        console.log('Setting isAlreadyEnrolled to:', enrolled);
        setIsAlreadyEnrolled(enrolled);
      }
    };
    fetchAll();
  }, [id, userData, location.search]);

  // Redirect from payment success with topicId in query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('enrolled') === '1') {
      // Re-check enrollment after payment
      checkEnrollment().then(setIsAlreadyEnrolled);
    }
  }, [location.search]);

  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }

    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });

    return Math.floor(totalRating / course.courseRatings.length);
  };

  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    if (Array.isArray(course.modules)) {
      course.modules.forEach((module) => {
        if (Array.isArray(module.sections)) {
          totalLectures += module.sections.length;
        }
      });
    }
    return totalLectures;
  };

  useEffect(() => {
    if (courseData && courseData.modules && courseData.modules.length > 0) {
      // Only first accordion open
      const initialState = {};
      courseData.modules.forEach((_, idx) => {
        initialState[idx] = idx === 0;
      });
      setOpenSections(initialState);
    }
  }, [courseData]);

  const handleVideoClick = (video) => {
    setModalVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setModalVideo(null);
  };

  return courseData ? (
    <>
      <div className="bg-gradient-to-b from-[#457AEE] to-[#83AAFF] flex flex-col md:flex-row gap-10 relative items-start justify-between md:px-36 px-2 md:pt-20 pt-4 text-left w-full">
        {/* Left Content */}
        <div className="text-white w-full md:max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black w-full">
            {courseData.title}
          </h1>
          <p className="text-sm md:text-base mb-5 w-full text-white">
            {courseData.description && courseData.description.replace(/<[^>]*>/g, '').length > 200
              ? courseData.description.replace(/<[^>]*>/g, '').slice(0, 200) + '...'
              : courseData.description.replace(/<[^>]*>/g, '')}
          </p>
          <p className="text-md text-white w-full">
            <span className="mr-4">
              <strong>Difficulty:</strong> {courseData.difficulty || 'N/A'}
            </span>
            <span className="mr-4">
              <strong>Duration:</strong>{' '}
              {courseData.duration ? `${courseData.duration} hours` : 'N/A'}
            </span>
            <span>
              <strong>Last Updated:</strong>{' '}
              {courseData.updatedAt
                ? new Date(courseData.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                : 'N/A'}
            </span>
          </p>
        </div>
        {/* Right Image */}
        <div className="w-full md:max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-0">
          <img
            src={courseData.thumbnail || assets.BasicSecurityImage}
            alt="Course Illustration"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = assets.BasicSecurityImage;
            }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 relative items-start justify-between md:px-36 px-2 text-left w-full">
        <div className="z-10 text-gray-500 w-full md:w-2/3">
          <div className="pt-8 text-gray-800 w-full">
            {courseData.description && courseData.description.trim() && (
              <div className="mb-6 w-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this Course</h2>

              </div>
            )}

            {courseData.learningObjectives &&
              courseData.learningObjectives.trim() &&
              courseData.learningObjectives !== '<p><br></p>' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded overflow-x-auto w-full">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">
                    What you'll learn
                  </h2>
                  <div className="text-gray-700 text-sm w-full">
                    <div
                      className="w-full border border-gray-300 text-left p-4 rounded"
                      dangerouslySetInnerHTML={{
                        __html: courseData.learningObjectives,
                      }}
                    />
                  </div>
                </div>
              )}

            <h2 className="text-xl font-semibold w-full">Topic content</h2>
            <p className="text-gray-600 text-sm w-full">
              {courseData.modules?.length || 0} Sections&nbsp;-&nbsp;
              {(() => {
                let videoCount = 0;
                if (Array.isArray(courseData.modules)) {
                  courseData.modules.forEach((module) => {
                    if (Array.isArray(module.videos)) {
                      videoCount += module.videos.length;
                    }
                  });
                }
                return `${videoCount} Videos`;
              })()}
            </p>

            <div className="pt-5 w-full">
              {courseData.modules && courseData.modules.length > 0 ? (
                courseData.modules.map((module, moduleIdx) => {
                  const isLocked = !isAlreadyEnrolled && moduleIdx > 0;
                  return (
                    <div
                      key={moduleIdx}
                      className={`border border-gray-300 bg-white mb-2 rounded w-full ${isLocked ? 'opacity-60 pointer-events-none' : ''
                        }`}
                    >
                      <div
                        className={`flex items-center justify-between px-4 py-3 select-none bg-[#F7F9FD] w-full ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        onClick={() => !isLocked && toggleSection(moduleIdx)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <img
                            src={assets.down_arrow_icon}
                            alt="arrow icon"
                            className={`transform transition-transform ${openSections[moduleIdx] ? 'rotate-180' : ''
                              }`}
                          />
                          <p className="font-medium md:text-base text-sm w-full">
                            {module.title ||
                              module.name ||
                              `Module ${moduleIdx + 1}`}
                          </p>
                          {isLocked && (
                            <span className="ml-2 text-red-500 text-xs flex items-center gap-1">
                              <img
                                src={assets.lockIcon}
                                alt="Locked"
                                className="w-4 h-4 inline"
                              />{' '}
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-sm md:text-default">
                          {module.duration ? `${module.duration} min` : ''}
                        </p>
                      </div>

                      <div
                        className={`overflow-y-auto scrollbar-visible transition-all duration-300 ${openSections[moduleIdx] ? 'max-h-96' : 'max-h-0'
                          }`}
                        style={{
                          display: openSections[moduleIdx] ? 'block' : 'none',
                        }}
                      >
                        {module.description && (
                          <div className="px-4 py-2 text-gray-700 text-sm border-t border-gray-200 w-full">
                            {module.description}
                          </div>
                        )}

                        {Array.isArray(module.videos) &&
                          module.videos.length > 0 && (
                            <div className="px-4 py-2 w-full">
                              <h3 className="text-base font-semibold mb-2">
                                Videos
                              </h3>
                              <div className="flex flex-col gap-2 w-full">
                                {module.videos.map((video, vidx) => (
                                  <div
                                    key={vidx}
                                    className="flex items-center gap-3 cursor-pointer py-2 px-2 rounded hover:bg-gray-100 transition-all w-full"
                                    onClick={() => handleVideoClick(video)}
                                    title={video.title || 'Watch Video'}
                                  >
                                    <img
                                      src={assets.play_icon}
                                      alt="Play"
                                      className="w-6 h-6"
                                    />
                                    <span className="text-gray-800 text-base font-medium w-full">
                                      {video.title || 'Watch Video'}
                                    </span>
                                    {video.duration && (
                                      <span className="ml-2 text-gray-500 text-sm font-normal">
                                        {video.duration} mins
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        <div className="border-t border-gray-300 w-full">
                          {module.sections &&
                            module.sections.map((section, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-all w-full"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <button
                                    className="focus:outline-none"
                                    onClick={() =>
                                      handleVideoClick({
                                        videoUrl: section.video,
                                        title: section.title,
                                      })
                                    }
                                    title="Play Video"
                                  >
                                    <img
                                      src={assets.play_icon}
                                      alt="Play"
                                      className="w-6 h-6"
                                    />
                                  </button>
                                  <span className="text-gray-800 text-base font-medium w-full">
                                    {section.title ||
                                      section.name ||
                                      section}
                                  </span>
                                </div>
                                <span className="text-gray-700 text-sm font-normal">
                                  {section.duration
                                    ? `${section.duration} mins`
                                    : ''}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No course content available yet.</p>
                </div>
              )}
            </div>
          </div>

          {courseData.description &&
            courseData.description.trim() &&
            courseData.description !== '<p><br></p>' && (
              <div className="pt-8 pb-8 w-full">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">
                  Description
                </h2>
                <div className="px-0 py-2 text-gray-700 text-sm border-t border-gray-200 w-full">
                  <div
                    className="w-full border border-gray-300 text-left p-4"
                    dangerouslySetInnerHTML={{
                      __html: courseData.description,
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        <div className="w-full md:max-w-course-card z-10 shadow-custom-card overflow-hidden bg-white min-w-0">
          <div className="p-5 w-full">
            {isAlreadyEnrolled && (
              <div className="md:mt-6 mt-4 w-full py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium text-center mb-6">
                Enrolled
              </div>
            )}
            {!isAlreadyEnrolled && (
              <button
                onClick={enrollCourse}
                className="md:mt-6 mt-4 w-full py-4 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6"
              >
                Enroll Now
              </button>
            )}

            <div className="pt-6 w-full">
              {courseData.prerequisites &&
                (Array.isArray(courseData.prerequisites)
                  ? courseData.prerequisites.length > 0
                  : courseData.prerequisites.trim()) && (
                  <div className="mt-4 w-full">
                    <p className="font-semibold text-gray-800 mb-1">
                      Prerequisites
                    </p>
                    <ul className="list-disc ml-5 text-sm text-gray-600 w-full">
                      {Array.isArray(courseData.prerequisites)
                        ? courseData.prerequisites
                          .filter((pre) => pre && pre.trim())
                          .map((pre, idx) => <li key={idx}>{pre}</li>)
                        : <li>{courseData.prerequisites}</li>}
                    </ul>
                  </div>
                )}

              <div className="mt-6 border-t pt-4 w-full">
                <p className="font-semibold text-gray-800 mb-4 text-lg">
                  Topic Details
                </p>
                <div className="p-0 w-full">
                  {courseData.targetAudience &&
                    (Array.isArray(courseData.targetAudience)
                      ? courseData.targetAudience.length > 0
                      : courseData.targetAudience.trim()) && (
                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-2 w-full">
                        <span className="font-semibold">Target:</span>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(courseData.targetAudience) ? (
                            courseData.targetAudience
                              .filter((aud) => aud && aud.trim())
                              .map((aud, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1"
                                >
                                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />
                                  <span>{aud}</span>
                                </div>
                              ))
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />
                              <span>{courseData.targetAudience}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2 w-full">
                    <span className="font-semibold">Audience:</span>
                    <span>🧒 Children, 🧑‍🏫 Educators</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 w-full">
                    <span className="font-semibold">Created:</span>
                    <span>
                      {courseData.createdAt
                        ? new Date(courseData.createdAt).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )
                        : 'N/A'}
                    </span>
                  </div>

                  {courseData.isFeatured ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700 mt-4 w-full">
                      <span className="font-bold text-lg">Price:</span>
                      <span>
                        {courseData.price ? `₹${courseData.price}` : 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-700 w-full">
                      <span className="font-semibold">Free:</span>
                      <span>{courseData.isFree ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVideoModal && modalVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-xl w-full">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl font-bold"
              onClick={closeVideoModal}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {modalVideo.title || 'Video'}
            </h3>
            <div className="flex items-center justify-center">
              {modalVideo.videoUrl &&
                (modalVideo.videoUrl.includes('youtube.com') ||
                  modalVideo.videoUrl.includes('youtu.be') ? (
                  <iframe
                    width="420"
                    height="240"
                    src={`https://www.youtube.com/embed/${modalVideo.videoUrl.split('v=')[1] ||
                      modalVideo.videoUrl.split('/').pop()
                      }`}
                    title={modalVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls width="420">
                    <source src={modalVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;
