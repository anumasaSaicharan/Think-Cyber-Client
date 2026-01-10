// UserDropdown.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function UserDropdown({ assets, userData }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Generate dynamic color based on user's name
  const generateAvatarColor = (name) => {
    if (!name) return 'bg-blue-500';

    const colors = [
      'bg-blue-500'
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get first letter of user's name
  const getInitial = () => {
    if (userData?.firstname) {
      return userData.firstname.charAt(0).toUpperCase();
    } else if (userData?.email) {
      return userData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };


  // Close on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center focus:outline-none"
        onClick={() => setOpen(v => !v)}
      >
        {userData ? (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${generateAvatarColor(userData.firstname || userData.email)}`}>
            {getInitial()}
          </div>
        ) : (
          <img src={assets.usernew_icon} alt="User" className="w-12 h-12" />
        )}
      </button>

      {open && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <p className="font-semibold text-gray-800">Profile</p> <span className="text-xs text-gray-500 mb-2">{userData?.email}</span>
          </div>
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/profile')}>
              My Profile
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/my-enrollments')}>
              My Enrollments
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 font-semibold"
              onClick={() => {
                // Clear localStorage/session and redirect to login
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }}>
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
