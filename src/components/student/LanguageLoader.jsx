import React from 'react';

const LanguageLoader = ({ message = 'Loading content...' }) => {
  return (
    <div className="fixed inset-0 bg-white z-[10000] flex flex-col items-center justify-center">
      {/* Logo or Branding */}
      <div className="mb-8">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold text-gray-800">ThinkCyber</h2>
      </div>

      {/* Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      {/* Message */}
      <p className="text-gray-600 text-lg font-medium animate-pulse">{message}</p>
      
      {/* Sub-message */}
      <p className="text-gray-400 text-sm mt-2">Please wait...</p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LanguageLoader;
