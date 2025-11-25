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
      <h1 className="text-3xl font-bold mb-6">My Enrollments</h1> 
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
          {enrollments.map((topic) => (
            <div key={topic.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col min-h-[220px]">
              <div className="flex flex-col items-start justify-start h-[70px] mb-2">
                <img src={topic.icon} alt={topic.title} className="w-14 h-14 object-contain" />
              </div>
              <div className={`border-l-4 ${topic.borderColor} pl-3 flex-1`}>
                <h3 className={`text-lg w-full font-bold mb-1 ${topic.textColor} leading-tight`}>{topic.title}</h3>
                <p className="text-base text-gray-600 mb-0 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {topic.description}
                </p>
              </div>
            <div className="flex justify-end mt-4">
            <button
            className="text-white font-bold px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm shadow"
            onClick={() => navigate(`/course/${topic.id}`)}
            >
            View more
            </button>
            {/* <a
              href={`/course/${topic.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm shadow">
              View more
            </a> */}
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}