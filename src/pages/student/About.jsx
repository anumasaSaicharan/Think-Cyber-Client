import React, { useEffect, useState } from 'react';
import { homepageService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import Footer from '../../components/student/Footer';

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
    
      try {
        setLoading(true);
        debugger;
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

  console.log({ loading, error, about });

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!about) return null;

  return (
    <>
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center py-10 px-2 md:px-0">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-2 md:mt-8">
            {about.title},<br />
            <span className="text-blue-600 inline-block font-extrabold text-3xl md:text-4xl" style={{textShadow:'0 2px 8px #e0e7ef'}}>ThinkCyber <span className="text-gray-800 font-bold">Insides</span></span>
          </h1>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {about.image && (
              <img
                src={about.image}
                alt="About"
                className="w-full md:w-1/2 max-w-md rounded-lg shadow-md object-cover"
                style={{minHeight:'220px', background:'#f4f8fc'}}
              />
            )}
            <div className="flex-1 text-gray-700 text-lg leading-relaxed">
              {about.content && (
                <div className="mb-4 whitespace-pre-line">{about.content}</div>
              )}
              {about.features && about.features.length > 0 && (
                <ul className="list-disc pl-6 mb-2">
                  {about.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
