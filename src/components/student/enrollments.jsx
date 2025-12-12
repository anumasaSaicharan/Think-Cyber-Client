import React, { useContext, useState, useRef, useEffect } from 'react'; 
import { AppContext } from '../../context/AppContext';
import { topicService } from '../../services/apiService';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

export default function Enrollments() {
  const { userData } = useContext(AppContext); 
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Calculate expiry date (1 year from enrollment date)
  const getExpiryDate = (enrollmentDate) => {
    const date = new Date(enrollmentDate);
    date.setFullYear(date.getFullYear() + 1);
    return date;
  };

  // Check if subscription is expired
  const isExpired = (enrollmentDate) => {
    const expiryDate = getExpiryDate(enrollmentDate);
    return new Date() > expiryDate;
  };

  // Get days remaining
  const getDaysRemaining = (enrollmentDate) => {
    const expiryDate = getExpiryDate(enrollmentDate);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  useEffect(() => {
    const fetchEnrollments = async () => {
      debugger;
        if (!userData) {
            setLoading(false);
            return;
        }
        
        if (!userData.id) {
            setLoading(false);
            setError('User ID not found');
            return;
        }
        
        try {
            setLoading(true);
            setError(null); 
            const response = await topicService.getUserEnrolledTopics(userData.id); 
            const enrollmentsWithIcons = (response || []).map((topic, index) => ({
              ...topic,
              icon: topic.icon || (index % 3 === 0
                ? assets.basic_security_icon
                : index % 3 === 1
                  ? assets.business_owner_icon
                  : assets.follower_icon),
              borderColor: index % 3 === 0 ? "border-blue-600" : 
                          index % 3 === 1 ? "border-[#146DA5]" : "border-[#039198]",
              textColor: index % 3 === 0 ? "text-blue-600" : 
                        index % 3 === 1 ? "text-[#146DA5]" : "text-[#039198]"
            }));
            setEnrollments(enrollmentsWithIcons); 
            setError(null);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            setError(error.response?.data?.message || error.message || 'Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };
    
    fetchEnrollments(); 
  }, [userData]);
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Enrollments</h1>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>Subscription Validity:</strong> Each course subscription is valid for one year from the date of enrollment.
          </p>
        </div>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading your enrollments...</p>
      ) : error ? (
        <div className="text-red-500">
          <p>Error: {error}</p>
          <p className="text-sm text-gray-500 mt-2">Please check the console for more details.</p>
        </div>
      ) : !userData ? (
        <p className="text-gray-500">Please log in to view your enrollments.</p>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-500">You are not enrolled in any courses.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((topic) => {
            const enrolledDate = new Date(topic.enrolled_at || topic.enrolledAt || topic.created_at);
            const expiryDate = getExpiryDate(enrolledDate);
            const expired = isExpired(enrolledDate);
            const daysLeft = getDaysRemaining(enrolledDate);
            
            return (
            <div key={topic.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col min-h-[280px]">
              <div className="flex flex-col items-start justify-start h-[70px] mb-2">
                <img src={topic.icon} alt={topic.title} className="w-14 h-14 object-contain" />
              </div>
              <div className={`border-l-4 ${topic.borderColor} pl-3 flex-1`}>
                <h3 className={`text-lg w-full font-bold mb-1 ${topic.textColor} leading-tight`}>{topic.title}</h3>
                <p className="text-base text-gray-600 mb-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {topic.description}
                </p>
                
                {/* Validity Information */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs space-y-1">
                    <p className="text-gray-600">
                      <strong>Enrolled:</strong> {enrolledDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className={expired ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      <strong>Valid until:</strong> {expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {!expired ? (
                      <p className={`font-medium ${daysLeft < 30 ? 'text-orange-600' : 'text-green-600'}`}>
                        {daysLeft} days remaining
                      </p>
                    ) : (
                      <p className="text-red-600 font-semibold">
                        Expired
                      </p>
                    )}
                  </div>
                </div>
              </div>
            <div className="flex justify-end mt-4">
            <button
            className="text-white font-bold px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm shadow"
            onClick={() => navigate(`/course/${topic.id}`)}
            >
            View more
            </button>
            </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}