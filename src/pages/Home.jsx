import React, { useRef, useState } from 'react';
import { FaMicrophone, FaPlus } from 'react-icons/fa';
import Hero from '../components/student/Hero'; 
 
const tabs = [
  'All',
  'Popular',
  'Recent',
  'AI',
  'Security',
  'Courses',
];

import { topicService } from '../services/apiService';

const StudentHome = () => {
  const inputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [topics, setTopics] = useState([]);
   const [homepageData, setHomepageData] = useState(null);
  const [topicsData, setTopicsData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch homepage data and categories on component mount
    useEffect(() => {
    console.log('Hero useEffect running: fetching homepage and topics');
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
    console.log('Homepage response:', homepageResponse);
    console.log('Topics response:', topicsResponse);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load content');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  // Fetch topics from API on mount
  React.useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const response = await topicService.getAllTopics({ limit: 6 });
        setTopics(response?.data || []);
      } catch (err) {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // Voice search handler
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        setSearch(event.results[0][0].transcript);
      };
      recognition.start();
    } else {
      alert('Voice search not supported in this browser.');
    }
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
        toast.success('Topic added to your wishlist!');
        setTimeout(() => setWishlistMsg(''), 1500);
      } 
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
          {topics.map((topic) => (
            <div className="flex-shrink-0 w-80 mr-4" key={topic.id}>
              <TopicCard topic={topic} />
            </div>
          ))}
        </div>
        {/* Mobile: show all cards in a vertical list, one per row */}
        <div className="md:hidden w-full flex flex-col items-center py-2 gap-4">
          {topics.map((topic) => (
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

  return (
    
    <div className="chatgpt-home-layout w-full "  style={{ minHeight: '100vh', background: '#f7f7f8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
       <section className="hero" style={{ marginTop: 60, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 500, marginBottom: 32 }}>What can I help with?</h1>
        <div className="center-search" style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: '12px 24px', width: 500, maxWidth: '90vw', margin: '0 auto' }}>
          <FaPlus style={{ fontSize: '1.2rem', marginRight: 16, color: '#888' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '1.1rem', width: '100%', background: 'transparent' }}
          />
          <FaMicrophone style={{ fontSize: '1.2rem', marginLeft: 16, color: '#888', cursor: 'pointer' }} onClick={handleVoiceSearch} />
          <button onClick={handleVoiceSearch} style={{ background: '#f3f3f3', border: 'none', borderRadius: '50%', width: 36, height: 36, marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem' }}>🎙️</span>
          </button>
        </div>
      </section>
      {/* Tabs below search bar */}
      <div className="tabs" style={{ display: 'flex', gap: 12, marginTop: 32, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 18px',
              borderRadius: 20,
              border: 'none',
              background: activeTab === tab ? '#222' : '#eaeaea',
              color: activeTab === tab ? '#fff' : '#222',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Search topics below tabs */}
      <div className="topics" style={{ width: 500, maxWidth: '90vw', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: '1rem' }}>Loading topics...</div>
        ) : (
          topics.map(topic => (
            <div key={topic.id || topic.name} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', fontSize: '1rem', color: '#222' }}>
              {topic.name || topic.title}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentHome;
