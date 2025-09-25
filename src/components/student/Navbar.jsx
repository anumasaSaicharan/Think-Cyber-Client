import React, { useContext, useState, useRef, useEffect } from 'react'; 
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { topicService } from '../../services/apiService';
import LoginModal from './LoginModal';
import UserDropdown from './UserDropdown';

// Custom LanguageDropdown component
function LanguageDropdown({ assets }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);
  const dropdownRef = useRef(null);
  const translateTimeoutRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Initialize Google Translate only once
    if (window._googleTranslateInitialized) return;

    window.googleTranslateElementInit = function () {
      if (window._googleTranslateInitialized) return;
      
      try {
        // Clear any existing translate element first
        const existingElement = document.getElementById('google_translate_element');
        if (existingElement) {
          existingElement.innerHTML = '';
        }

        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,te',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          'google_translate_element'
        );
        
        window._googleTranslateInitialized = true;
        console.log('Google Translate initialized successfully');
        
        // Wait longer for the element to be fully created and monitor it
        const waitForTranslateElement = (attempts = 0) => {
          const maxAttempts = 20;
          const selectors = [
            '.goog-te-combo',
            'select.goog-te-combo',
            '#google_translate_element select',
            '.goog-te-gadget select'
          ];
          
          let found = false;
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              console.log(`Google Translate element found with selector: ${selector}`);
              found = true;
              // Store reference for later use
              window._gtElement = element;
              break;
            }
          }
          
          if (!found && attempts < maxAttempts) {
            setTimeout(() => waitForTranslateElement(attempts + 1), 500);
          } else if (found) {
            // Hide the visible gadget
            const gtGadget = document.querySelector('.goog-te-gadget');
            if (gtGadget) {
              gtGadget.style.display = 'none';
            }
          } else {
            console.warn('Google Translate elements not found after waiting');
          }
        };
        
        // Start monitoring for elements
        setTimeout(() => waitForTranslateElement(), 1000);
        
      } catch (error) {
        console.error('Google Translate initialization failed:', error);
        // Reset flag to allow retry
        window._googleTranslateInitialized = false;
      }
    };

    // Load script only if not already loaded
    if (!document.getElementById('google-translate-script') && !window.google?.translate) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Failed to load Google Translate script');
        // Remove failed script to allow retry
        const failedScript = document.getElementById('google-translate-script');
        if (failedScript) {
          failedScript.remove();
        }
        window._googleTranslateInitialized = false;
      };
      script.onload = () => {
        console.log('Google Translate script loaded successfully');
      };
      document.head.appendChild(script);
    } else if (window.google?.translate && !window._googleTranslateInitialized) {
      // If Google Translate is already loaded but not initialized
      setTimeout(() => {
        window.googleTranslateElementInit();
      }, 100);
    }

    return () => {
      if (translateTimeoutRef.current) {
        clearTimeout(translateTimeoutRef.current);
      }
    };
  }, []);

  // Debounced language change handler
  const handleLanguageChange = (lang) => {
    setSelected(lang);
    setOpen(false);
    
    // Clear any pending translation
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current);
    }

    setIsTranslating(true);

    // Map language names to Google Translate codes
    const languageMap = {
      'English': 'en',
      'Hindi': 'hi',
      'Telugu': 'te'
    };

    const googleLang = languageMap[lang] || 'en';

    // If trying to translate to English, we can reset to original
    if (googleLang === 'en') {
      // Force page reload to restore original content
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Debounce rapid language changes
    translateTimeoutRef.current = setTimeout(() => {
      try {
        // Check if Google Translate is available
        if (!window.google || !window.google.translate) {
          console.warn('Google Translate service not loaded yet. Retrying...');
          setTranslateError(true);
          // Retry after a delay
          setTimeout(() => {
            setTranslateError(false);
            handleLanguageChange(lang);
          }, 3000);
          setIsTranslating(false);
          return;
        }

        // First try to use the stored element
        let select = window._gtElement;
        
        if (!select || !select.isConnected) {
          // If stored element doesn't exist or is disconnected, search for it
          console.log('Searching for Google Translate element...');
          
          const selectors = [
            '.goog-te-combo',
            'select.goog-te-combo', 
            '#google_translate_element select',
            '.goog-te-gadget select',
            '.goog-te-gadget-simple .goog-te-combo',
            'iframe[id^="goog-te-"] + .goog-te-combo'
          ];
          
          for (const selector of selectors) {
            select = document.querySelector(selector);
            if (select) {
              console.log(`Found Google Translate element with: ${selector}`);
              window._gtElement = select; // Store for next time
              break;
            }
          }
        }
        
        if (select) {
          console.log(`Current language: ${select.value}, Target: ${googleLang}`);
          
          if (select.value !== googleLang) {
            // Found the select element and it's different from current language
            select.value = googleLang;
            console.log(`Set language to: ${googleLang}`);
            
            // Try multiple event types to ensure translation triggers
            const events = [
              { type: 'change', init: { bubbles: true, cancelable: true } },
              { type: 'input', init: { bubbles: true, cancelable: true } },
              { type: 'click', init: { bubbles: true, cancelable: true } }
            ];
            
            events.forEach(({ type, init }) => {
              const event = new Event(type, init);
              select.dispatchEvent(event);
            });
            
            // Also try MouseEvent for better compatibility
            const mouseEvent = new MouseEvent('change', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            select.dispatchEvent(mouseEvent);
            
            console.log('Translation events dispatched');
            
            // Monitor translation completion
            setTimeout(() => {
              setIsTranslating(false);
              console.log('Translation process completed');
            }, 2000); // Longer timeout for translation to complete
            
          } else {
            // Already in the target language
            console.log('Already in target language');
            setIsTranslating(false);
          }
          
        } else {
          // Element not found, try reinitializing
          console.warn('Google Translate element not found, reinitializing...');
          setTranslateError(true);
          
          // Try to reinitialize Google Translate
          window._googleTranslateInitialized = false;
          delete window._gtElement;
          
          setTimeout(() => {
            setTranslateError(false);
            if (window.googleTranslateElementInit) {
              console.log('Reinitializing Google Translate...');
              window.googleTranslateElementInit();
              // Retry translation after reinitializing
              setTimeout(() => {
                handleLanguageChange(lang);
              }, 3000);
            }
          }, 1000);
          
          setIsTranslating(false);
        }
        
      } catch (error) {
        console.error('Translation failed:', error);
        setIsTranslating(false);
        setTranslateError(true);
        // Clear error after some time
        setTimeout(() => setTranslateError(false), 5000);
      }
    }, 300); // 300ms debounce
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center focus:outline-none transition-opacity ${isTranslating ? 'opacity-50' : 'opacity-100'}`}
        onClick={() => {
          setOpen((prev) => !prev);
          if (translateError) setTranslateError(false); // Clear error when opening
        }}
        aria-label="Select Language"
        disabled={isTranslating}
      >
        <img src={assets.language_icon} alt="Language" className="w-12 h-12" />
        {isTranslating && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        )}
      </button>
      {open && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <p className="font-semibold text-gray-800">Select Language</p>
            <p className="text-xs text-gray-500 mb-2">Choose Preferred Language</p>
            {isTranslating && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Translating...
              </div>
            )}
            {translateError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                <span>⚠️</span>
                Translation service temporarily unavailable
              </div>
            )}
          </div>
          <ul className="py-2">
            {['English', 'Telugu', 'Hindi'].map((lang) => (
              <li
                key={lang}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  selected === lang ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'
                } ${isTranslating ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !isTranslating && handleLanguageChange(lang)}
              >
                <div className="flex items-center justify-between">
                  <span>{lang}</span>
                  {selected === lang && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Google Translate container (hidden but accessible) */}
      <div 
        id="google_translate_element" 
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      ></div>
    </div>
  );
}
const Navbar = () => {
  const { userData } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = React.useState(false);
  const [wishlist, setWishlist] = React.useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });
  const [topics, setTopics] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [showResults, setShowResults] = React.useState(false);
  // Fetch topics from your API on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await topicService.getAllTopics({ limit: 100 });
        setTopics(response?.data || []);
      } catch {
        setTopics([]);
      }
    };
    fetchTopics();
  }, []);
   // Sync wishlist from localStorage on storage change (for multi-tab)
  useEffect(() => {
    const handleStorage = () => {
      debugger;
      const stored = localStorage.getItem('wishlist');
      setWishlist(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  console.log('Wishlist:', wishlist);
  if(userData && userData.isVerified) {
    setShowLogin(true);
  }

  return (
    <div className="flex items-center justify-between px-4 sm:px-10 md:px-10 lg:px-24 border-b border-gray-300 py-4 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <a href="/ThinkCyber/web/">
          <img src={assets.logo} alt="Logo" className="w-36 lg:w-56 cursor-pointer" />
        </a>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-12 text-[#747579] font-semibold">
        <a href="/ThinkCyber/web/" className="hover:text-blue-600">Home</a>
        <a href="/ThinkCyber/web/about" className="hover:text-blue-600">About Us</a>
        <a href="/ThinkCyber/web/contact" className="hover:text-blue-600">Contact Us</a>
      </div>

      {/* Search Bar with topic search */}
      <div className="hidden md:flex items-center border border-gray-300 rounded-md bg-[#F5F7F9] px-4 py-3 relative">
        <input
          type="text"
          placeholder="Search topics..."
          className="outline-none text-sm text-gray-600 flex-grow bg-[#F5F7F9]"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            if (e.target.value.length > 0) {
              const results = topics.filter(topic =>
                (topic.name || topic.title || '').toLowerCase().includes(e.target.value.toLowerCase()) ||
                (topic.description || '').toLowerCase().includes(e.target.value.toLowerCase())
              );
              setSearchResults(results);
              setShowResults(true);
            } else {
              setSearchResults([]);
              setShowResults(false);
            }
          }}
          onFocus={() => searchTerm && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        <button onClick={() => setShowResults(true)}>
          <img src={assets.search_icon} alt="Search" className="w-5 h-5" />
        </button>
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.map(topic => (
              <div
                key={topic.id}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                onMouseDown={() => {
                  setShowResults(false);
                  setSearchTerm('');
                  navigate(`/course/${topic.id}`);
                }}
              >
                <div className="font-bold text-blue-600">{topic.name || topic.title}</div>
                <div className="text-gray-500 text-xs">{topic.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4">
        {wishlist.length === 0 ? (
          <button>
            <img src={assets.favorite_icon} alt="Favorites" className="w-12 h-12" />
          </button>
        ) : (
          <Link to="/wishlist">
            <img src={assets.favorite_icon} alt="Favorites" className="w-12 h-12" />
          </Link>
        )}

        {/* Language Dropdown */}
        <LanguageDropdown assets={assets} />

        {/* User Dropdown */}
        {userData ? (
          <UserDropdown assets={assets} userData={userData} />
        ) : (
          <button onClick={() => setShowLogin(true)}>
            <img src={assets.usernew_icon} alt="User" className="w-12 h-12" />
          </button>
        )}
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Navbar;
