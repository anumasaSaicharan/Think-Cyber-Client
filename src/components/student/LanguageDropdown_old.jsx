// LanguageDropdown.jsx
import React, { useEffect, useRef, useState } from 'react';

// Only include the 2 languages you want
const LANGS = [
  { label: 'English', code: 'en' },
  { label: 'Telugu', code: 'te' },
];

// Simple cookie functions
function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Get current language from cookie
function getCurrentLanguage() {
  const googtrans = getCookie('googtrans');
  if (googtrans) {
    const parts = googtrans.split('/');
    if (parts.length >= 3) {
      return parts[2]; // The target language
    }
  }
  return 'en'; // Default to English
}

// Global state to track Google Translate
let googleTranslateInitialized = false;
let isChanging = false;
let useFlexibleFallback = false;

// Initialize Google Translate with better error handling and fallback
function initializeGoogleTranslate() {
  return new Promise((resolve, reject) => {
    if (googleTranslateInitialized) {
      resolve();
      return;
    }

    console.log('Attempting to load Google Translate...');

    // Create Google Translate element container
    let translateDiv = document.getElementById('google_translate_element');
    if (!translateDiv) {
      translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.cssText = 'position: fixed; left: -9999px; top: -9999px; visibility: hidden;';
      document.body.appendChild(translateDiv);
    }

    // Define the initialization function
    window.googleTranslateElementInit = function() {
      try {
        console.log('Initializing Google Translate...');
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,te',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
        googleTranslateInitialized = true;
        console.log('Google Translate initialized successfully');
        resolve();
      } catch (error) {
        console.error('Google Translate initialization failed:', error);
        reject(error);
      }
    };

    // Set a timeout for the script loading
    const timeout = setTimeout(() => {
      console.error('Google Translate script loading timed out');
      reject(new Error('Script loading timeout'));
    }, 10000); // 10 second timeout

    // Load the Google Translate script if not already loaded
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.onload = () => {
        console.log('Google Translate script loaded successfully');
        clearTimeout(timeout);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Translate script:', error);
        clearTimeout(timeout);
        reject(new Error('Failed to load Google Translate script'));
      };
      document.head.appendChild(script);
    } else if (window.google && window.google.translate) {
      clearTimeout(timeout);
      // Script already loaded, just initialize
      window.googleTranslateElementInit();
    } else {
      clearTimeout(timeout);
      reject(new Error('Google Translate not available'));
    }
  });
}

// Fallback method using different approaches
function changeLanguageFlexible(targetCode) {
  if (isChanging) {
    console.log('Language change already in progress...');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    isChanging = true;
    console.log(`Using flexible approach to change language to: ${targetCode}`);
    
    // Set the language preference in localStorage for persistence
    localStorage.setItem('preferredLanguage', targetCode);
    
    // Method 1: Try Google Translate if available
    const select = document.querySelector('.goog-te-combo');
    if (select && !useFlexibleFallback) {
      console.log('Using Google Translate method');
      setCookie('googtrans', `/auto/${targetCode}`);
      select.value = targetCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      
      setTimeout(() => {
        isChanging = false;
        resolve();
      }, 2000);
      return;
    }
    
    // Method 2: Force page reload with language parameter
    console.log('Using page reload method for translation');
    setCookie('googtrans', `/auto/${targetCode}`);
    
    // Add a language parameter to URL and reload
    const url = new URL(window.location);
    url.searchParams.set('lang', targetCode);
    
    // Show loading indication before reload
    setTimeout(() => {
      window.location.href = url.toString();
    }, 500);
    
    setTimeout(() => {
      isChanging = false;
      resolve();
    }, 1000);
  });
}

// Original change language function
function changeLanguage(targetCode) {
  if (isChanging) {
    console.log('Language change already in progress...');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    isChanging = true;
    console.log(`Changing language to: ${targetCode}`);
    
    // Set the cookie first
    setCookie('googtrans', `/auto/${targetCode}`);
    
    // Wait a bit then find and trigger the Google Translate select
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        console.log(`Found Google Translate select, current value: ${select.value}, setting to: ${targetCode}`);
        if (select.value !== targetCode) {
          select.value = targetCode;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('Language change event dispatched');
        }
      } else {
        console.warn('Google Translate select element not found');
      }
      
      // Reset the flag after translation completes
      setTimeout(() => {
        isChanging = false;
        resolve();
      }, 2000);
    }, 500);
  });
}

export default function LanguageDropdown({ assets }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Google Translate and wait for it to be ready
  useEffect(() => {
    const setupGoogleTranslate = async () => {
      try {
        console.log('Setting up Google Translate...');
        await initializeGoogleTranslate();
        
        // Wait for the select element to appear
        let attempts = 0;
        const maxAttempts = 20; // 20 * 500ms = 10 seconds max wait

        const checkReady = () => {
          const select = document.querySelector('.goog-te-combo');
          if (select) {
            console.log('Google Translate is ready!');
            setReady(true);
            setCurrentLang(getCurrentLanguage());
            
            // Hide any visible Google Translate UI
            const gadget = document.querySelector('.goog-te-gadget');
            if (gadget) {
              gadget.style.display = 'none';
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkReady, 500);
          } else {
            console.warn('Google Translate not ready after waiting - switching to fallback mode');
            // Enable fallback mode and mark as ready
            useFlexibleFallback = true;
            setReady(true);
            
            // Get language from localStorage or cookie
            const storedLang = localStorage.getItem('preferredLanguage') || getCurrentLanguage();
            setCurrentLang(storedLang);
          }
        };

        // Start checking after a short delay
        setTimeout(checkReady, 1000);
        
      } catch (error) {
        console.error('Failed to initialize Google Translate, using fallback mode:', error);
        // Enable fallback mode
        useFlexibleFallback = true;
        setReady(true);
        
        // Get language from localStorage if available
        const storedLang = localStorage.getItem('preferredLanguage') || 'en';
        setCurrentLang(storedLang);
      }
    };

    setupGoogleTranslate();
  }, []);

  // Sync current language periodically
  useEffect(() => {
    if (!ready) return;

    const syncLanguage = () => {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    };

    const interval = setInterval(syncLanguage, 2000);
    return () => clearInterval(interval);
  }, [ready, currentLang]);

  // Handle language selection
  const handleLanguageSelect = async (lang) => {
    setOpen(false);
    
    if (!ready || isLoading || lang.code === currentLang) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (useFlexibleFallback) {
        await changeLanguageFlexible(lang.code);
      } else {
        await changeLanguage(lang.code);
      }
      setCurrentLang(lang.code);
      console.log(`Successfully changed language to ${lang.label}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const getCurrentLangLabel = () => {
    const lang = LANGS.find(l => l.code === currentLang);
    return lang ? lang.label : 'English';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center focus:outline-none transition-opacity ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
        }`}
        onClick={() => !isLoading && setOpen(!open)}
        aria-label={`Select Language - Current: ${getCurrentLangLabel()}`}
        title={`Current Language: ${getCurrentLangLabel()}`}
        disabled={isLoading}
      >
        <img src={assets.language_icon} alt="Language" className="w-12 h-12" />
        {isLoading && (
          <div className="ml-1 w-3 h-3 border border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
        )}
      </button>

      {open && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <p className="font-semibold text-gray-800">Select Language</p>
            <p className="text-xs text-gray-500 mb-2">
              Current: <span className="font-medium text-blue-600">{getCurrentLangLabel()}</span>
            </p>
            {!ready && (
              <p className="text-xs text-orange-500">
                🔄 Loading translator...
              </p>
            )}
            {ready && useFlexibleFallback && (
              <p className="text-xs text-amber-600">
                📄 Basic translation mode
              </p>
            )}
            {isLoading && (
              <p className="text-xs text-blue-500">
                ⏳ Changing language...
              </p>
            )}
          </div>
          <ul className="py-2">
            {LANGS.map((lang) => (
              <li
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  lang.code === currentLang 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700'
                } ${!ready || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span>{lang.label}</span>
                  {lang.code === currentLang && (
                    <span className="text-blue-500 font-bold">✓</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}