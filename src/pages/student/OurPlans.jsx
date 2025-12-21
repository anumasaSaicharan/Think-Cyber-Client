import React, { useEffect, useState } from 'react';
import { featuresPlansService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';

const OurPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await featuresPlansService.getActivePlans();
        if (response.success && response.data) {
          setPlans(response.data);
        } else if (Array.isArray(response.data)) {
          setPlans(response.data);
        } else {
          setPlans([]);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Parse features from string to array
  const parseFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    // Split by comma, newline, or semicolon
    return features.split(/[,;\n]+/).map(f => f.trim()).filter(f => f.length > 0);
  };

  // Get plan icon based on type or plan name
  const getPlanIcon = (type, planName = '') => {
    const name = (planName || '').toLowerCase();
    const planType = (type || '').toLowerCase();

    // Rocket icon - for starter/launch plans
    const rocketIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    );

    // Shield icon - for basic/starter/free plans
    const shieldIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    );

    // Crown icon - for premium/pro/gold plans
    const crownIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75l3.5-7 4.25 5 4.25-5 3.5 7M12 4.5l2 4-2 2.5-2-2.5 2-4zM6.5 8l1.25 3.75M17.5 8l-1.25 3.75" />
      </svg>
    );

    // Diamond/Gem icon - for professional plans
    const diamondIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 9l10 13 10-13-10-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 9h20M7 9l5 13 5-13M7 9l5-7 5 7" />
      </svg>
    );

    // Building icon - for enterprise/business plans
    const buildingIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    );

    // Star icon - for standard/regular plans
    const starIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    );

    const bundleIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7.5L12 3 4 7.5M20 7.5l-8 4.5m8-4.5v9L12 21m0-9L4 7.5m8 4.5v9M4 7.5v9l8 4.5"
        />
      </svg>
    );

    const flexibleIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 7h11a4 4 0 014 4v0"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 17H9a4 4 0 01-4-4v0"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 5l3 3-3 3M8 19l-3-3 3-3"
        />
      </svg>
    );


    const freeIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v13m-6-9h12m-6-4h.01M4 11h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V11z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 3c-1.657 0-3 1.343-3 3 0 1.657 1.343 2 3 2s3-.343 3-2c0-1.657-1.343-3-3-3z"
        />
      </svg>
    );



    // Trophy icon - for ultimate/platinum plans
    const trophyIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-3.27.972 6.016 6.016 0 01-3.27-.972" />
      </svg>
    );

    // Academic/Education icon - for student/learner plans
    const academicIcon = (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    );

    // Match by plan name keywords first
    if (name.includes('starter') || name.includes('launch') || name.includes('beginner')) return rocketIcon;
    if (name.includes('basic') || name.includes('free') || name.includes('lite')) return shieldIcon;
    if (name.includes('pro') || name.includes('premium') || name.includes('gold')) return crownIcon;
    if (name.includes('professional') || name.includes('advanced')) return diamondIcon;
    if (name.includes('enterprise') || name.includes('business') || name.includes('corporate')) return buildingIcon;
    if (name.includes('ultimate') || name.includes('platinum') || name.includes('elite')) return trophyIcon;
    if (name.includes('student') || name.includes('learner') || name.includes('education')) return academicIcon;
    if (name.includes('bundle') || name.includes('regular')) return bundleIcon;
    if (name.includes('flexible') || name.includes('regular')) return flexibleIcon;
    if (name.includes('free') || name.includes('free')) return freeIcon;

    // Match by type
    if (planType === 'basic') return shieldIcon;
    if (planType === 'premium') return crownIcon;
    if (planType === 'enterprise') return buildingIcon;
    if (planType === 'bundle') return bundleIcon;
    if (planType === 'flexible') return flexibleIcon;
    if (planType === 'free') return freeIcon;

    // Default to star icon
    return starIcon;
  };

  // Get card gradient based on index/type
  const getCardStyle = (type, index) => {
    const styles = [
      { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'text-blue-500', button: 'bg-blue-500 hover:bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
      { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'text-purple-500', button: 'bg-purple-500 hover:bg-purple-600', badge: 'bg-purple-100 text-purple-700' },
      { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', icon: 'text-emerald-500', button: 'bg-emerald-500 hover:bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
      { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: 'text-orange-500', button: 'bg-orange-500 hover:bg-orange-600', badge: 'bg-orange-100 text-orange-700' },
    ];

    // Try to match by type first
    const typeIndex = ['Basic', 'Premium', 'Enterprise', 'Standard'].indexOf(type);
    if (typeIndex !== -1) return styles[typeIndex];

    // Fallback to index-based
    return styles[index % styles.length];
  };

  if (loading) return <Loading />;

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      {/* Background Layer Image */}
      <div className="absolute right-0 bottom-0 w-1/4 md:w-1/4 lg:w-1/5 h-auto pointer-events-none opacity-50">
        <img
          src={assets.bgLayer}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28 py-12 md:py-16 lg:py-20">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
            🎯 Choose Your Plan
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gray-800">Our </span>
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Plans & Features
            </span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Discover the perfect plan that fits your learning journey.
            Each plan is crafted to provide you with the best cybersecurity education experience.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && plans.length === 0 && (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Plans Available</h3>
            <p className="text-gray-500">Plans are being prepared. Please check back soon!</p>
          </div>
        )}

        {/* Plans Grid */}
        {plans.length > 0 && (
          <div className={`grid gap-6 md:gap-8 ${plans.length === 1 ? 'max-w-md mx-auto' :
              plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
                plans.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' :
                  'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
            {plans.map((plan, index) => {
              const style = getCardStyle(plan.type, index);
              const features = parseFeatures(plan.features);
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id || index}
                  className={`relative bg-gradient-to-br ${style.bg} rounded-2xl border-2 ${style.border} 
                    shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                    ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
                    overflow-hidden group`}
                >
                  {/* Popular Badge (for middle plan) */}
                  {index === 1 && plans.length > 2 && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6 md:p-8 h-full flex flex-col">
                    {/* Icon & Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${style.icon} transform group-hover:scale-110 transition-transform duration-300`}>
                        {getPlanIcon(plan.type, plan.name)}
                      </div>
                      {plan.type && (
                        <span className={`px-3 py-1 ${style.badge} text-xs font-semibold rounded-full`}>
                          {plan.type}
                        </span>
                      )}
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                      {plan.name}
                    </h3>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Features List - grows to fill space */}
                    <div className="mb-6 flex-grow">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        What's Included
                      </h4>
                      <ul className="space-y-3">
                        {features.slice(0, 6).map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start">
                            <svg className={`w-5 h-5 ${style.icon} mr-3 flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                        {features.length > 6 && (
                          <li className="text-gray-500 text-sm italic pl-8">
                            + {features.length - 6} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA Button - always at bottom */}
                    {/* <button 
                      onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
                      className={`w-full py-3 px-6 ${style.button} text-white font-semibold rounded-xl 
                        transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl
                        flex items-center justify-center gap-2 mt-auto`}
                    >
                      <span>Learn More</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button> */}
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-100">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Have questions?</span>
            <a href="/contact" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurPlans;
