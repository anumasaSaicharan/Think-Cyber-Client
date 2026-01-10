import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { assets } from '../../assets/assets';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import { homepageService, topicService } from '../../services/apiService';
import Loading from './Loading';
import { toast } from 'react-toastify';
import SearchBar from './SearchBar';

const Hero = () => {
  // console.log('Hero component mounted');
  const navigate = useNavigate();
  const [homepageData, setHomepageData] = useState(null);
  const [topicsData, setTopicsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSlider, setUseSlider] = useState(true);
  const [wishlist, setWishlist] = useState(() => {
    // Load wishlist from localStorage on mount
    const stored = localStorage.getItem('wishlist');
    // console.log('Loaded wishlist from localStorage:', stored);
    return stored ? JSON.parse(stored) : [];
  });
  const [wishlistMsg, setWishlistMsg] = useState('');

  // console.log('Wishlist state:', wishlist);
  // console.log('Wishlist length:', wishlist.length === 0 ? 'Your wishlist is empty' : wishlistMsg);
  // console.log('Topics:', topicsData);
  // Fetch homepage data and categories on component mount
  useEffect(() => {
  // console.log('Hero useEffect running: fetching homepage and topics');
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch homepage data and topics in parallel
        const [homepageResponse, topicsResponse] = await Promise.all([
          homepageService.getHomepageByLanguage('en').catch(() => null),
          topicService.getAllTopics({ limit: 6 }).catch(() => ({ data: [] }))
        ]);

        setHomepageData(homepageResponse);
        setTopicsData(topicsResponse?.data || []);
  // console.log('Homepage response:', homepageResponse);
  // console.log('Topics response:', topicsResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true, 
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: (
    <button className="slick-next slick-arrow absolute top-4 right-4 z-10 bg-white text-black p-2 rounded-full shadow">
    &#8250;
    </button>
    ),
    prevArrow: (
    <button className="slick-prev slick-arrow absolute top-4 right-16 z-10 bg-white text-black p-2 rounded-full shadow">
    &#8249;
    </button>
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          variableWidth: false,
        },
      },
    ],
  };

  // Component to render topics - either as slider or grid
  const TopicsDisplay = ({ topics }) => {
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);
    React.useEffect(() => {
      const handleScroll = () => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          setCanScrollPrev(scrollLeft > 0);
          setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
        }
      };
      const ref = scrollRef.current;
      if (ref) {
        ref.addEventListener('scroll', handleScroll);
        handleScroll();
      }
      return () => {
        if (ref) ref.removeEventListener('scroll', handleScroll);
      };
    }, [topics]);
    const scrollRef = React.useRef(null);
    const CARD_WIDTH = 320; // px, matches w-80
    const scrollByCard = (direction) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: direction === 'next' ? CARD_WIDTH : -CARD_WIDTH,
          behavior: 'smooth',
        });
      }
    };
    // Check if topic is in wishlist
    const isInWishlist = (topicId) => wishlist.some((item) => item.id === topicId);

    // Handle heart click: add/remove topic from wishlist and navigate to Wishlist page
    const handleWishlistClick = (topic) => {
      if (isInWishlist(topic.id)) {
        setWishlist(wishlist.filter((item) => item.id !== topic.id));
      } else {
        setWishlist([...wishlist, topic]);
        toast.warn('Topic added to your wishlist!');
        setTimeout(() => setWishlistMsg(''), 1500);
      }
      // Navigate to wishlist page after click
      navigate(' /wishlist');
    };

    

    const TopicCard = ({ topic }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 m-2 relative min-h-[180px] flex flex-col min-w-[220px] max-w-xs">
        {/* Heart icon top-right (clickable, filled if in wishlist) */}
        <span
          className="absolute top-3 right-3 text-red-500 text-xl cursor-pointer"
          onClick={() => handleWishlistClick(topic)}
          title={isInWishlist(topic.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isInWishlist(topic.id) ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="red" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 17.5l-1.45-1.32C4.4 12.36 1 9.28 1 6.5A4.5 4.5 0 0 1 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2A4.5 4.5 0 0 1 19 6.5c0 2.78-3.4 5.86-7.55 9.68L10 17.5z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 17.5l-1.45-1.32C4.4 12.36 1 9.28 1 6.5A4.5 4.5 0 0 1 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2A4.5 4.5 0 0 1 19 6.5c0 2.78-3.4 5.86-7.55 9.68L10 17.5z" />
            </svg>
          )}
        </span>
        <div className="flex flex-col items-start justify-st</svg>art h-[70px] mb-2">
          <img src={topic.icon} alt={topic.title} className="w-14 h-14 object-contain" />
        </div>
        <div className={`border-l-4 ${topic.borderColor} pl-3 flex-1`}>
          <h3 className={`text-sm w-full font-bold mb-1 ${topic.textColor} leading-tight`}>  {topic.title.length > 50 ? topic.title.slice(0, 15) + '...' : topic.title}</h3>
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
    );
    // Responsive: desktop/tablet = horizontal scroll, mobile = vertical list
    return (
      <div className="w-full relative">
        {/* Desktop/Tablet: horizontal scroll with multiple cards */}
        <div className="absolute right-6 top-[-50px] gap-2 z-10 hidden md:flex">
          <button
            className={`w-12 h-12 flex items-center justify-center border-2 border-gray-400 rounded bg-white text-3xl font-bold transition-colors duration-200 ${!canScrollPrev ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            onClick={() => scrollByCard('prev')}
            aria-label="Previous"
            disabled={!canScrollPrev}
          >
            <span className="text-gray-600 text-4xl">&#8249;</span>
          </button>
          <button
            className={`w-12 h-12 flex items-center justify-center border-2 border-black rounded bg-blue-600 text-3xl font-bold transition-colors duration-200 ${!canScrollNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            onClick={() => scrollByCard('next')}
            aria-label="Next"
            disabled={!canScrollNext}
          >
            <span className="text-white text-4xl">&#8250;</span>
          </button>
        </div>
        {/* Desktop/Tablet: horizontal scroll */}
        <div
          ref={scrollRef}
          className="hidden md:flex overflow-x-auto no-scrollbar py-2"
        >
          {topicsData.map((topic) => (
            <div className="flex-shrink-0 w-80 mr-4" key={topic.id}>
              <TopicCard topic={topic} />
            </div>
          ))}
        </div>
        {/* Mobile: show all cards in a vertical list, one per row */}
        <div className="md:hidden w-full flex flex-col items-center py-2 gap-4">
          {topicsData.map((topic) => (
            <div className="w-full flex justify-center" key={topic.id}>
              <TopicCard topic={topic} />
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Transform topics data for the display
  const topics = topicsData.slice(0, 6).map((topic, index) => ({
    id: topic.id || (index + 1).toString().padStart(2, '0'),
    title: topic.name || topic.title || `Topic ${index + 1}`,
    description: topic.description || `Description for ${topic.name || 'topic'}`,
    icon: topic.icon || (index % 3 === 0 ? assets.basic_security_icon : 
                         index % 3 === 1 ? assets.business_owner_icon : 
                         assets.follower_icon),
    borderColor: index % 3 === 0 ? "border-blue-600" : 
                 index % 3 === 1 ? "border-[#146DA5]" : "border-[#039198]",
    textColor: index % 3 === 0 ? "text-blue-600" : 
               index % 3 === 1 ? "text-[#146DA5]" : "text-[#039198]",
  })); 
  
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log('Homepage Data:', homepageData);

  return (
    <div className="flex flex-col items-center justify-center w-full h-80 px-4 text-center bg-white">
      {/* Centered Search Bar with 60% width */}
      <div className="w-full max-w-none mb-0" style={{ width: '60%' }}>
        <SearchBar data={topicsData} />
      </div>
      
      {/* Centered Title and Subtitle */}
      <div className="w-full text-center max-w-6xl">
        <h1
          className="relative font-bold uppercase mx-auto text-[32px] md:text-[46px] leading-tight md:leading-[54px] font-heebo text-[#24292D] text-center mb-8"
        >
          {homepageData?.data.hero?.title}
        </h1>
        <p className="block text-black mx-auto font-outfit text-[15px] md:text-[18px] font-medium leading-[22px] md:leading-[28px] text-center mb-6 max-w-4xl">
          {homepageData?.data.hero?.description}
        </p>
        <p className="text-black mx-auto font-outfit text-[15px] md:text-[16px] font-medium leading-[22px] md:leading-[28px] text-center max-w-4xl">
          {homepageData?.data.hero?.subtitle}
        </p> 
      </div> 
    </div>
  );
};

export default Hero;
