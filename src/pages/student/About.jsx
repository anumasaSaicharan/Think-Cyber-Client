import React, { useEffect, useState } from 'react';
import { homepageService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const resp = await homepageService.getHomepageByLanguage('en');
        setAbout(resp.data.about);
      } catch (err) {
        setError('Failed to load about info');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Layer Image - Right Bottom (Smaller) */}
      <div className="absolute right-0 bottom-0 w-1/4 md:w-1/4 lg:w-1/5 h-auto pointer-events-none">
        <img
          src={assets.bgLayer}
          alt="Background Layer"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28 py-12 md:py-16 lg:py-20">
        {/* Header Section - Left Top */}
        <div className="max-w-4xl mb-8">
          <h2 className="text-3xl md:text-3xl lg:text-3xl font-medium text-gray-600 mb-2">
           {about?.title || 'Find Out More About us,'}
          </h2>
          <h1 className="text-3xl md:text-3xl lg:text-3xl font-bold mb-2">
            <span className="text-blue-500">ThinkCyber</span>{' '}
            <span className="text-gray-800">Insides</span>
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl">
          {/* Left Side - Image Only */}
          <div className="flex flex-col">
            {/* Security Image Card */}
            <div className="">
              <img
                src={about?.image}
                alt="Cybersecurity"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = assets.lockIcon;
                }}
              /> 
            </div>
          </div>

          {/* Right Side - Description Text */}
          <div className="flex flex-col justify-start">
            <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
              <p>
                {about?.content || 
                  'How promotion excellent curiosity yet attempted happiness. Gay prosperous impression had conviction. For every delay in they. Extremely eagerness principle estimable own was man. Men received far his dashwood subjects new.'}
              </p> 
              {/* Features List */}
              {about?.features && about.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Why Choose Us</h3>
                  <ul className="space-y-3">
                    {about.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
