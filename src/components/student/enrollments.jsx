import React, { useContext, useState, useRef, useEffect } from 'react'; 
import { AppContext } from '../../context/AppContext';
import apiClient from '../../services/apiService';
import API_ENDPOINTS from '../../constants/urlConstants';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

export default function Enrollments() {
  const { userData } = useContext(AppContext); 
  const [enrollments, setEnrollments] = useState([]); // Placeholder for enrollment items
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch user's enrollments from backend API
    const fetchEnrollments = async () => {
        debugger;
        try {
            debugger;
            const response = await apiClient.get(API_ENDPOINTS.USER_ENROLLS(userData.id)); 
            const enrollmentsWithIcons = (response || []).map((topic, index) => ({
              ...topic,
              icon: topic.icon || (index % 3 === 0
                ? assets.basic_security_icon
                : index % 3 === 1
                  ? assets.business_owner_icon
                  : assets.follower_icon)
            }));
            setEnrollments(enrollmentsWithIcons); 
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        }
    };
    fetchEnrollments(); 
  }, []);
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Enrollments</h1>
      {enrollments.length === 0 ? (
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
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}