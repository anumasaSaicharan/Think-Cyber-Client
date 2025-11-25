// LanguageDropdown.jsx - Reliable version with multiple fallback options
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

// Translation modes
const TRANSLATION_MODES = {
  GOOGLE_TRANSLATE: 'google',
  PAGE_RELOAD: 'reload',
  MANUAL: 'manual'
};

// Global state
let translationMode = TRANSLATION_MODES.GOOGLE_TRANSLATE;
let isChanging = false;

// Get current language from multiple sources
function getCurrentLanguage() {
  // Priority: localStorage > cookie > URL param > default
  const stored = localStorage.getItem('preferredLanguage');
  if (stored) return stored;
  
  const googtrans = getCookie('googtrans');
  if (googtrans) {
    const parts = googtrans.split('/');
    if (parts.length >= 3) return parts[2];
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang) return urlLang;
  
  return 'en';
}

// Method 1: Google Translate (preferred)
function tryGoogleTranslate(targetCode) {
  return new Promise((resolve, reject) => {
    const select = document.querySelector('.goog-te-combo');
    if (!select) {
      reject(new Error('Google Translate not available'));
      return;
    }

    console.log('Using Google Translate method');
    setCookie('googtrans', `/auto/${targetCode}`);
    select.value = targetCode;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => resolve(), 2000);
  });
}

// Method 2: Page reload with URL parameter
function tryPageReload(targetCode) {
  return new Promise((resolve) => {
    console.log('Using page reload method');
    
    // Store preference
    localStorage.setItem('preferredLanguage', targetCode);
    setCookie('googtrans', `/auto/${targetCode}`);
    
    // Add language parameter and reload
    const url = new URL(window.location);
    url.searchParams.set('lang', targetCode);
    
    setTimeout(() => {
      window.location.href = url.toString();
    }, 500);
    
    resolve();
  });
}

// Method 3: Manual state management (fallback)
function tryManualTranslation(targetCode) {
  return new Promise((resolve) => {
    console.log('Using manual translation method');
    
    // Store the language preference
    localStorage.setItem('preferredLanguage', targetCode);
    setCookie('googtrans', `/auto/${targetCode}`);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: targetCode } 
    }));
    
    resolve();
  });
}

// Main language change function with fallbacks
async function changeLanguage(targetCode) {
  if (isChanging) {
    console.log('Language change already in progress...');
    return;
  }

  isChanging = true;
  console.log(`Changing language to: ${targetCode} using mode: ${translationMode}`);

  try {
    switch (translationMode) {
      case TRANSLATION_MODES.GOOGLE_TRANSLATE:
        try {
          await tryGoogleTranslate(targetCode);
          break;
        } catch (error) {
          console.log('Google Translate failed, trying page reload...');
          translationMode = TRANSLATION_MODES.PAGE_RELOAD;
          await tryPageReload(targetCode);
          break;
        }
        
      case TRANSLATION_MODES.PAGE_RELOAD:
        await tryPageReload(targetCode);
        break;
        
      case TRANSLATION_MODES.MANUAL:
        await tryManualTranslation(targetCode);
        break;
        
      default:
        await tryManualTranslation(targetCode);
    }
  } catch (error) {
    console.error('All translation methods failed:', error);
    // Last resort - just store the preference
    localStorage.setItem('preferredLanguage', targetCode);
  } finally {
    setTimeout(() => {
      isChanging = false;
    }, 1000);
  }
}

// Initialize Google Translate (best effort, non-blocking)
function initializeGoogleTranslate() {
  return new Promise((resolve) => {
    // Don't block on this - it's just a nice-to-have
    setTimeout(() => {
      try {
        // Create hidden container
        let translateDiv = document.getElementById('google_translate_element');
        if (!translateDiv) {
          translateDiv = document.createElement('div');
          translateDiv.id = 'google_translate_element';
          translateDiv.style.cssText = 'position: fixed; left: -9999px; top: -9999px; visibility: hidden;';
          document.body.appendChild(translateDiv);
        }

        // Define initialization
        window.googleTranslateElementInit = function() {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'en,te',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              },
              'google_translate_element'
            );
            console.log('Google Translate initialized successfully');
          } catch (error) {
            console.log('Google Translate initialization failed:', error);
          }
        };

        // Try to load script (non-blocking)
        if (!document.querySelector('script[src*="translate.google.com"]')) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          script.onload = () => console.log('Google Translate script loaded');
          script.onerror = () => {
            console.log('Google Translate script failed to load');
            translationMode = TRANSLATION_MODES.PAGE_RELOAD;
          };
          document.head.appendChild(script);
        }
        
        resolve();
      } catch (error) {
        console.log('Google Translate setup failed:', error);
        translationMode = TRANSLATION_MODES.PAGE_RELOAD;
        resolve();
      }
    }, 1000);
  });
}

export default function LanguageDropdown({ assets }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => getCurrentLanguage());
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

  // Initialize (non-blocking)
  useEffect(() => {
    // Always mark as ready - we have fallbacks
    setReady(true);
    setCurrentLang(getCurrentLanguage());
    
    // Try to set up Google Translate in the background
    initializeGoogleTranslate().then(() => {
      // Check if Google Translate is available after some time
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          console.log('Google Translate is available');
          translationMode = TRANSLATION_MODES.GOOGLE_TRANSLATE;
          
          // Hide the Google UI
          const gadget = document.querySelector('.goog-te-gadget');
          if (gadget) gadget.style.display = 'none';
        } else {
          console.log('Google Translate not available, using fallback methods');
          translationMode = TRANSLATION_MODES.PAGE_RELOAD;
        }
      }, 3000);
    });

    // Listen for language changes from other sources
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.language) {
        setCurrentLang(event.detail.language);
      }
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Handle language selection
  const handleLanguageSelect = async (lang) => {
    setOpen(false);
    
    if (isLoading || lang.code === currentLang) {
      return;
    }

    setIsLoading(true);
    
    try {
      await changeLanguage(lang.code);
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

  const getStatusMessage = () => {
    if (isLoading) return "⏳ Changing language...";
    
    switch (translationMode) {
      case TRANSLATION_MODES.GOOGLE_TRANSLATE:
        return "🌐 Google Translate active";
      case TRANSLATION_MODES.PAGE_RELOAD:
        return "📄 Page refresh mode";
      case TRANSLATION_MODES.MANUAL:
        return "⚙️ Manual mode";
      default:
        return "✅ Ready";
    }
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
            <p className="text-xs text-green-600">
              {getStatusMessage()}
            </p>
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
                } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
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