import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/apiService'

const SearchBar = ({ data, apiBaseUrl = '/api' }) => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  
  const debounceTimeout = useRef(null);
  const abortControllerRef = useRef(null);

  const highlightText = (text, query) => {
  if (!text || !query) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safe, "gi");
  
  return text.replace(
    regex,
    (match) =>
      `<mark style="background:#fff176; padding:2px 3px; border-radius:3px; font-weight:bold;">${match}</mark>`
  );
};

  const keywordMappings = {
    'సైబర్': 'cyber',
    'సెక్యూరిటీ': 'security',
    'భద్రత': 'security',
    'కంప్యూటర్': 'computer',
    'ఫిషింగ్': 'phishing',
    'హ్యాకింగ్': 'hacking',
    'పాస్‌వర్డ్': 'password',
    'గుప్తపదం': 'password',
    'గురించి': 'about',
    'విషయం': 'topic',
    'జాగ్రత్త': 'security',
    'साइबर': 'cyber',
    'सुरक्षा': 'security',
    'कंप्यूटर': 'computer',
    'फिशिंग': 'phishing',
    'हैकिंग': 'hacking',
    'पासवर्ड': 'password',
    'के बारे में': 'about',
    'विषय': 'topic',
    'सावधानी': 'security',
    'cyber': 'cyber',
    'security': 'security',
    'gurinchi': 'about',
    'vishayam': 'topic',
    'jagrat': 'security'
  };

  const translateSearchTerm = useCallback((term) => {
    const words = term.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => keywordMappings[word] || word);
    return translatedWords.join(' ');
  }, []);

  const performClientSideSearch = useCallback((searchQuery) => {
    if (!data || !Array.isArray(data)) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const translatedQuery = translateSearchTerm(searchQuery);
    
    const results = data.filter(topic => {
      const title = (topic.title || topic.name || '').toLowerCase();
      const description = (topic.description || '').toLowerCase();
      const category = (topic.categoryName || topic.category_name || '').toLowerCase();
      const subcategory = (topic.subcategoryName || topic.subcategory_name || '').toLowerCase();
      
      return title.includes(searchLower) || 
             description.includes(searchLower) ||
             category.includes(searchLower) ||
             subcategory.includes(searchLower) ||
             title.includes(translatedQuery) ||
             description.includes(translatedQuery);
    });

    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [data, translateSearchTerm]);

  const searchTopicsAPI = useCallback(async (searchQuery) => {
    try {
      setIsLoading(true);
      
      const translatedQuery = translateSearchTerm(searchQuery);
      
      console.log('Searching for:', translatedQuery);
      
      // Fixed: Use authService.searchTopics instead of searchTopics.searchTopics
      const result = await authService.searchTopics(translatedQuery, { limit: 20 });
      console.log('Search result:', result);
    
      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search API error:', error);
      // Fallback to client-side search
      performClientSideSearch(searchQuery);
    } finally {
      setIsLoading(false);
    }
  }, [performClientSideSearch, translateSearchTerm]);

  const debouncedSearch = useCallback((value) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (value.trim().length > 0) {
        searchTopicsAPI(value);
      } else {
        setSearchResults([]);
        setShowResults(false);
        setIsLoading(false);
      }
    }, 500);
  }, [searchTopicsAPI]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      setIsLoading(true);
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = async () => {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      alert('Voice search requires HTTPS.');
      return;
    }

    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      if (timeoutId) clearTimeout(timeoutId);
      
      recognition.onstart = () => {
        setIsListening(true);
        const newTimeoutId = setTimeout(() => {
          recognition.stop();
          setIsListening(false);
        }, 15000);
        setTimeoutId(newTimeoutId);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        if (event.error === 'no-speech') {
          alert('No speech detected.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied.');
        }
      };
      
      recognition.onresult = (event) => {
  let transcript = event.results[0][0].transcript.trim();
  transcript = transcript.replace(/\.$/, "");
  setSearchTerm(transcript);
  setIsListening(false);

  if (timeoutId) {
    clearTimeout(timeoutId);
    setTimeoutId(null);
  }

  if (transcript.length > 0) {
    setIsLoading(true);
    searchTopicsAPI(transcript);
  }
};

      
      recognition.start();
    } else {
      alert('Voice search not supported.');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setIsLoading(false);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsListening(false);
  };

  const handleResultClick = (topic) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/course/${topic.id}`);
  };

  return (
    <>
      {/* Desktop Search Bar */}
      <div className="hidden md:flex items-center bg-white rounded-full px-6 py-3 relative shadow-lg max-w-xl mx-auto border border-gray-400 lg:mt-20">
        <input
          type="text"
          placeholder="Ask Anything"
          className="outline-none text-black placeholder-black/80 flex-grow bg-transparent text-sm"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        
        {isLoading && (
          <div className="ml-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {searchTerm && !isLoading && (
          <button 
            onClick={handleClearSearch} 
            className="ml-2 p-1 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors" 
            title="Clear Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        
        <button 
          onClick={handleVoiceSearch} 
          disabled={isLoading} 
          className={`ml-2 p-1 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 ${isListening ? 'animate-pulse bg-red-500' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
 
        {showResults && searchResults.length > 0 && !isLoading && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto mt-2">
           {searchResults.map(topic => (
  <div 
    key={topic.id} 
    className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors" 
    onMouseDown={() => handleResultClick(topic)}
  >
    {/* Title with highlight */}
    <div 
      className="font-semibold text-blue-600 mb-1"
      dangerouslySetInnerHTML={{
        __html: highlightText(topic.title, searchTerm)
      }}
    ></div>

    {/* Matched text snippet */}
    {topic.matchedValue && (
      <div 
        className="text-xs text-gray-700 mb-1"
        dangerouslySetInnerHTML={{
          __html: highlightText(topic.matchedValue, searchTerm)
        }}
      ></div>
    )}

    {/* Normal description (not highlighted) */}
    {topic.description && (
      <div className="text-gray-600 text-xs line-clamp-2">
        {topic.description}
      </div>
    )}

    {/* Category pills */}
    {(topic.categoryName || topic.subcategoryName) && (
      <div className="flex gap-2 mt-1">
        {topic.categoryName && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {topic.categoryName}
          </span>
        )}
        {topic.subcategoryName && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {topic.subcategoryName}
          </span>
        )}
      </div>
    )}
  </div>
))}

          </div>
        )}

        {showResults && searchResults.length === 0 && !isLoading && searchTerm.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-2 px-4 py-3 text-center text-gray-500">
            No results found for "{searchTerm}"
          </div>
        )}
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden flex items-center bg-white rounded-full px-4 py-3 relative shadow-lg mx-4">
        <input
          type="text"
          placeholder="Ask Anything"
          className="outline-none text-gray-800 placeholder-gray-400 flex-grow bg-transparent text-sm"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        
        {isLoading && (
          <div className="ml-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {searchTerm && !isLoading && (
          <button onClick={handleClearSearch} className="ml-2 p-1 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3 h-3">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        
        <button 
          onClick={handleVoiceSearch} 
          disabled={isLoading} 
          className={`ml-1 p-1 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 relative ${isListening ? 'animate-pulse bg-red-500' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          {isListening && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>}
        </button>

        {showResults && searchResults.length > 0 && !isLoading && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto mt-2">
            {searchResults.map(topic => (
              <div 
                key={topic.id} 
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0" 
                onMouseDown={() => handleResultClick(topic)}
              >
                <div className="font-bold text-blue-600">{topic.title}</div>
                {topic.description && <div className="text-gray-500 text-xs line-clamp-2">{topic.description}</div>}
              </div>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !isLoading && searchTerm.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-2 px-4 py-2 text-center text-gray-500 text-sm">
            No results found
          </div>
        )}
      </div>
    </>
  )
}

export default SearchBar
