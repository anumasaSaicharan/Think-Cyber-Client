
import React, { useState } from 'react';
import { assets } from '../../assets/assets';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Background illustration - right bottom corner */}
      <div className="absolute right-0 bottom-0 w-1/4 md:w-1/5 lg:w-1/6 h-auto pointer-events-none">
        <img
          src={assets.bgLayer}
          alt="Background"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl px-10 font-bold text-gray-900">
            We're here to help!
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Illustration */}
            <div className="flex items-start md:w-2/5 lg:w-1/3 p-0 md:p-0 bg-gradient-to-br from-blue-50 to-white">
              <img
                src={assets.contactUsLogo}
                alt="Contact Us"
                className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain"
                onError={(e) => {
                  e.target.src = assets.contactusBanner;
                }}
              />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 p-8 md:p-12 max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Let's talk
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                Please fill out the form and we will get back to you promptly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Your Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Example@gmail.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type here"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
