// LanguageDropdown.jsx - Reliable version with multiple fallback options
import React, { useEffect, useRef, useState } from 'react';
import { useLanguageContext } from '../../contexts/LanguageContext';

// Include multiple regional languages with English as default
const LANGS = [
  { label: 'English', code: 'en', flag: '🇬🇧' },
  { label: 'हिंदी (Hindi)', code: 'hi', flag: '🇮🇳' },
  { label: 'తెలుగు (Telugu)', code: 'te', flag: '🇮🇳' },
  { label: 'தமிழ் (Tamil)', code: 'ta', flag: '🇮🇳' },
  { label: 'ಕನ್ನಡ (Kannada)', code: 'kn', flag: '🇮🇳' },
  { label: 'മലയാളം (Malayalam)', code: 'ml', flag: '🇮🇳' },
  { label: 'বাংলা (Bengali)', code: 'bn', flag: '🇮🇳' },
  { label: 'ગુજરાતી (Gujarati)', code: 'gu', flag: '🇮🇳' },
  { label: 'मराठी (Marathi)', code: 'mr', flag: '🇮🇳' },
  { label: 'ਪੰਜਾਬੀ (Punjabi)', code: 'pa', flag: '🇮🇳' },
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

// Language mapping based on location/country
const COUNTRY_TO_LANGUAGE = {
  'IN': 'hi', // India -> Hindi (default Indian language)
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'BD': 'bn', // Bangladesh -> Bengali
  'PK': 'pa', // Pakistan -> Punjabi
};

// Detect language based on user's location
async function detectLanguageFromLocation() {
  try {
    // Try to get location from IP using ipapi
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code;
      console.log('Detected country:', countryCode);
      
      // Return language based on country, or try browser language
      if (COUNTRY_TO_LANGUAGE[countryCode]) {
        return COUNTRY_TO_LANGUAGE[countryCode];
      }
    }
  } catch (error) {
    console.log('Location detection failed:', error);
  }
  
  // Fallback to browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    const langCode = browserLang.split('-')[0];
    // Check if we support this language
    if (LANGS.find(l => l.code === langCode)) {
      console.log('Using browser language:', langCode);
      return langCode;
    }
  }
  
  return 'en'; // Default to English
}

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
    // Helper to find the google select element using multiple selectors
    const findGoogleSelect = () => {
      return (
        document.querySelector('.goog-te-combo') ||
        document.querySelector('#google_translate_element select') ||
        document.querySelector('.goog-te-gadget select')
      );
    };

    let attempts = 0;
    const maxAttempts = 6; // try for a few times before giving up

    const attemptChange = () => {
      const select = findGoogleSelect();
      if (!select) {
        attempts++;
        if (attempts <= maxAttempts) {
          console.log('Google select not found, retrying...', attempts);
          setTimeout(attemptChange, 500);
          return;
        }

        // If select is not available after retries, fallback by setting cookie and rejecting
        console.log('Google Translate select not found after retries');
        // Set cookie explicitly as fallback
        try {
          setCookie('googtrans', `/auto/${targetCode}`);
          // also set with domain attribute to maximize chance
          try {
            document.cookie = `googtrans=/auto/${targetCode}; domain=${window.location.hostname}; path=/; max-age=31536000; SameSite=Lax`;
          } catch (e) {
            // ignore domain-setting errors
          }
        } catch (e) {
          // ignore
        }

        reject(new Error('Google Translate select not available'));
        return;
      }

      console.log(`Using Google Translate method for language: ${targetCode}`);

      // Set cookie first
      setCookie('googtrans', `/auto/${targetCode}`);
      // Also try a second cookie write
      try {
        document.cookie = `googtrans=/auto/${targetCode}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {}

      // Change select value and trigger events
      try {
        if (select.value !== targetCode) {
          console.log(`Changing Google Translate from ${select.value} to ${targetCode}`);
          select.value = targetCode;
          select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          select.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(() => { try { select.click(); } catch (e) {} }, 100);
        } else {
          console.log(`Already at target language: ${targetCode}`);
        }
      } catch (e) {
        console.warn('Error interacting with Google select:', e);
      }

      // Wait a bit to allow translation to apply
      setTimeout(() => resolve(), 2200);
    };

    attemptChange();
  });
}

// Method 2: Page reload with URL parameter
function tryPageReload(targetCode) {
  return new Promise((resolve) => {
    console.log(`Using page reload method for language: ${targetCode}`);
    
    // Store preference in multiple locations for reliability
    localStorage.setItem('preferredLanguage', targetCode);
    sessionStorage.setItem('preferredLanguage', targetCode);
    setCookie('googtrans', `/auto/${targetCode}`);
    setCookie('preferredLanguage', targetCode);
    
    // Show user feedback
    const body = document.body;
    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          color: #333;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          "></div>
          <p style="margin: 0; font-size: 16px;">Changing language...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    body.appendChild(overlay);
    
    // Add language parameter to URL and reload
    const url = new URL(window.location);
    url.searchParams.set('lang', targetCode);
    
    setTimeout(() => {
      window.location.href = url.toString();
    }, 800);
    
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

          // Verify the change worked by polling the select value
          const verifyChange = () => new Promise((res) => {
            let checks = 0;
            const maxChecks = 6;
            const interval = setInterval(() => {
              const select = document.querySelector('.goog-te-combo') || document.querySelector('#google_translate_element select');
              if (select && select.value === targetCode) {
                clearInterval(interval);
                console.log('Google Translate change verified successfully');
                res(true);
                return;
              }
              checks++;
              if (checks >= maxChecks) {
                clearInterval(interval);
                res(false);
              }
            }, 500);
          });

          const ok = await verifyChange();
          if (!ok) {
            console.log('Google Translate verification failed, trying page reload...');
            translationMode = TRANSLATION_MODES.PAGE_RELOAD;
            await tryPageReload(targetCode);
          }

          break;
        } catch (error) {
          console.log('Google Translate failed:', error.message, 'trying page reload...');
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
        console.log('Unknown translation mode, using manual method');
        await tryManualTranslation(targetCode);
    }
  } catch (error) {
    console.error('All translation methods failed:', error);
    // Last resort - store preference and try page reload
    localStorage.setItem('preferredLanguage', targetCode);
    setCookie('googtrans', `/auto/${targetCode}`);
    
    // Force page reload as final fallback
    if (confirm(`Translation system error. Reload page to apply ${targetCode.toUpperCase()} language?`)) {
      window.location.reload();
    }
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
                includedLanguages: 'en,hi,te,ta,kn,ml,bn,gu,mr,pa',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
                multilanguagePage: true
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
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
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

  // Check for location permission denial and show prompt
  useEffect(() => {
    const locationStatus = localStorage.getItem('locationPermissionStatus');
    const deniedTime = localStorage.getItem('locationDeniedTime');
    const promptDismissed = sessionStorage.getItem('locationPromptDismissed');
    
    console.log('📊 Current state:', {
      locationStatus,
      deniedTime,
      promptDismissed,
      currentLang,
      cookies: document.cookie
    });
    
    // Show prompt if location was denied and user hasn't dismissed it this session
    if (locationStatus === 'denied' && !promptDismissed) {
      // Show prompt after a short delay
      setTimeout(() => {
        setShowLocationPrompt(true);
      }, 1000);
    }
  }, []);

  // Initialize (non-blocking)
  useEffect(() => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   🚀 LANGUAGE DROPDOWN COMPONENT MOUNTED              ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    // Always mark as ready - we have fallbacks
    setReady(true);
    
    // Check if user has already selected a language
    const savedLang = getCurrentLanguage();
    console.log('📦 Saved language preference:', savedLang || 'NONE');
    console.log('💾 localStorage preferredLanguage:', localStorage.getItem('preferredLanguage') || 'NONE');
    console.log('🔐 locationPermissionStatus:', localStorage.getItem('locationPermissionStatus') || 'NONE');
    
    // If no language preference exists, request location permission
    if (savedLang === 'en' && !localStorage.getItem('preferredLanguage')) {
      console.log('✨ No language preference found!');
      console.log('🎯 Starting location-based detection...');
      console.log('════════════════════════════════════════════════════════');
      
      // Request location permission
      if (navigator.geolocation && !localStorage.getItem('locationPermissionStatus')) {
        console.log('📍 Geolocation API available, requesting permission...');
        
        navigator.geolocation.getCurrentPosition(
          // Success
          async (position) => {
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ ✅ ✅ LOCATION PERMISSION GRANTED! ✅ ✅ ✅');
            console.log('═══════════════════════════════════════════════════════');
            console.log('📍 Browser Position:', position.coords);
            localStorage.setItem('locationPermissionStatus', 'granted');
            
            // Detect language from IP with state detection
            try {
              console.log('🌍 Starting IP-based location detection...');
              const response = await fetch('https://ipapi.co/json/');
              if (response.ok) {
                const data = await response.json();
                const countryCode = data.country_code;
                const region = data.region || data.region_code;
                const city = data.city;
                
                console.log('═══════════════════════════════════');
                console.log('📍 LOCATION DETECTION DETAILS');
                console.log('═══════════════════════════════════');
                console.log('🗺️  State/Region:', region);
                console.log('🏙️  City:', city);
                console.log('🌐 Country Code:', countryCode);
                console.log('📦 Full Data:', data);
                console.log('═══════════════════════════════════');
                
                let detectedLang = 'en';
                
                // If India, detect state/city for regional language
                if (countryCode === 'IN') {
                  console.log('🇮🇳 INDIA DETECTED - Checking regional language...');
                  
                  // State mapping
                  const stateMap = {
                    'Telangana': 'te', 'TS': 'te', 'TG': 'te',
                    'Andhra Pradesh': 'te', 'AP': 'te',
                    'Tamil Nadu': 'ta', 'TN': 'ta',
                    'Karnataka': 'kn', 'KA': 'kn',
                    'Kerala': 'ml', 'KL': 'ml',
                    'West Bengal': 'bn', 'WB': 'bn',
                    'Gujarat': 'gu', 'GJ': 'gu',
                    'Maharashtra': 'mr', 'MH': 'mr',
                    'Punjab': 'pa', 'PB': 'pa'
                  };
                  
                  console.log('🔍 Checking state mapping for:', region);
                  
                  if (region && stateMap[region]) {
                    detectedLang = stateMap[region];
                    console.log(`✅ STATE MATCHED: "${region}" → ${detectedLang.toUpperCase()}`);
                  } else {
                    console.log(`⚠️  State "${region}" not in mapping, trying city detection...`);
                    
                    if (city) {
                      const cityLower = city.toLowerCase();
                      console.log('🔍 Checking city name:', cityLower);
                      
                      if (cityLower.includes('hyderabad') || cityLower.includes('warangal') || cityLower.includes('nizamabad')) {
                        detectedLang = 'te';
                        console.log('✅ TELANGANA CITY → TELUGU (te)');
                      } else if (cityLower.includes('vijayawada') || cityLower.includes('visakhapatnam')) {
                        detectedLang = 'te';
                        console.log('✅ ANDHRA PRADESH CITY → TELUGU (te)');
                      } else if (cityLower.includes('chennai') || cityLower.includes('madurai')) {
                        detectedLang = 'ta';
                        console.log('✅ TAMIL NADU CITY → TAMIL (ta)');
                      } else if (cityLower.includes('bengaluru') || cityLower.includes('bangalore')) {
                        detectedLang = 'kn';
                        console.log('✅ KARNATAKA CITY → KANNADA (kn)');
                      } else if (cityLower.includes('mumbai') || cityLower.includes('pune')) {
                        detectedLang = 'mr';
                        console.log('✅ MAHARASHTRA CITY → MARATHI (mr)');
                      } else if (cityLower.includes('kochi') || cityLower.includes('trivandrum')) {
                        detectedLang = 'ml';
                        console.log('✅ KERALA CITY → MALAYALAM (ml)');
                      } else if (cityLower.includes('kolkata')) {
                        detectedLang = 'bn';
                        console.log('✅ WEST BENGAL CITY → BENGALI (bn)');
                      } else if (cityLower.includes('ahmedabad') || cityLower.includes('surat')) {
                        detectedLang = 'gu';
                        console.log('✅ GUJARAT CITY → GUJARATI (gu)');
                      } else {
                        detectedLang = 'hi';
                        console.log('⚠️  City not matched, defaulting to HINDI (hi)');
                      }
                    } else {
                      detectedLang = 'hi';
                      console.log('⚠️  No city data, defaulting to HINDI (hi)');
                    }
                  }
                } else {
                  console.log('🌏 NON-INDIA COUNTRY');
                  // Other countries
                  const countryMap = {
                    'BD': 'bn',
                    'PK': 'pa',
                    'LK': 'ta'
                  };
                  detectedLang = countryMap[countryCode] || 'en';
                  console.log(`Mapped to language: ${detectedLang}`);
                }
                
                console.log('═══════════════════════════════════');
                console.log('🎯 FINAL DETECTED LANGUAGE:', detectedLang.toUpperCase());
                console.log('═══════════════════════════════════');
                
                if (detectedLang !== 'en') {
                  localStorage.setItem('preferredLanguage', detectedLang);
                  setCurrentLang(detectedLang);
                  setCookie('googtrans', `/auto/${detectedLang}`);
                  
                  setTimeout(() => {
                    changeLanguage(detectedLang);
                  }, 2000);
                }
              }
            } catch (err) {
              console.log('IP detection failed:', err);
            }
          },
          // Error
          (error) => {
            console.log('Location permission denied:', error.message);
            localStorage.setItem('locationPermissionStatus', 'denied');
            localStorage.setItem('locationDeniedTime', Date.now().toString());
            // Stay with English
            setCurrentLang('en');
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        if (!navigator.geolocation) {
          console.log('❌ Geolocation API not available in this browser');
        } else if (localStorage.getItem('locationPermissionStatus')) {
          console.log('ℹ️ Location permission already handled:', localStorage.getItem('locationPermissionStatus'));
        }
      }
    } else {
      console.log('ℹ️ Language preference already exists:', savedLang);
      console.log('⏭️ Skipping auto-detection');
      setCurrentLang(savedLang);
    }
    
    // Try to set up Google Translate in the background
    initializeGoogleTranslate().then(() => {
      // Check multiple times for Google Translate availability with longer timeout
      let attempts = 0;
      const maxAttempts = 20;

      const findGoogleSelect = () => {
        return (
          document.querySelector('.goog-te-combo') ||
          document.querySelector('#google_translate_element select') ||
          document.querySelector('.goog-te-gadget select')
        );
      };

      const checkGoogleTranslate = () => {
        const select = findGoogleSelect();
        if (select) {
          console.log('Google Translate is available - select element found');
          translationMode = TRANSLATION_MODES.GOOGLE_TRANSLATE;

          // Hide the Google UI
          const gadget = document.querySelector('.goog-te-gadget');
          if (gadget) gadget.style.display = 'none';

          // Apply current language if not English
          const currentLangLocal = getCurrentLanguage();
          if (currentLangLocal !== 'en') {
            setTimeout(() => {
              try {
                select.value = currentLangLocal;
                select.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (e) {
                console.warn('Failed to set google select value:', e);
              }
            }, 500);
          }
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkGoogleTranslate, 700);
          } else {
            console.log('Google Translate not available after multiple attempts, using fallback methods');
            translationMode = TRANSLATION_MODES.PAGE_RELOAD;
          }
        }
      };

      // Start checking after initial delay
      setTimeout(checkGoogleTranslate, 1500);
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
      
      // Wait for translation to apply
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  const handleDismissLocationPrompt = () => {
    setShowLocationPrompt(false);
    sessionStorage.setItem('locationPromptDismissed', 'true');
  };

  const handleRetryLocation = () => {
    localStorage.removeItem('locationPermissionStatus');
    localStorage.removeItem('locationDeniedTime');
    sessionStorage.removeItem('locationPromptDismissed');
    setShowLocationPrompt(false);
    window.location.reload();
  };

  const getLocationInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);

    if (isChrome || isEdge) {
      return (
        <ol className="text-left text-sm space-y-2 mt-3">
          <li>1. Click the lock icon 🔒 in the address bar</li>
          <li>2. Find "Location" in the permissions list</li>
          <li>3. Change it from "Block" to "Ask" or "Allow"</li>
          <li>4. Click "Retry" button below</li>
        </ol>
      );
    } else if (isFirefox) {
      return (
        <ol className="text-left text-sm space-y-2 mt-3">
          <li>1. Click the shield or lock icon in address bar</li>
          <li>2. Click on "Permissions"</li>
          <li>3. Find "Access Your Location" and unblock</li>
          <li>4. Click "Retry" button below</li>
        </ol>
      );
    } else if (isSafari) {
      return (
        <ol className="text-left text-sm space-y-2 mt-3">
          <li>1. Go to Safari → Preferences → Websites</li>
          <li>2. Click on "Location" in the sidebar</li>
          <li>3. Find this website and change to "Allow"</li>
          <li>4. Click "Retry" button below</li>
        </ol>
      );
    }

    return (
      <ol className="text-left text-sm space-y-2 mt-3">
        <li>1. Click the site settings icon in address bar</li>
        <li>2. Find location permissions</li>
        <li>3. Change from "Block" to "Allow"</li>
        <li>4. Click "Retry" button below</li>
      </ol>
    );
  };

  return (
    <>
      {/* Location Permission Denied Prompt */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            <button
              onClick={handleDismissLocationPrompt}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Location Access Denied
              </h3>
              <p className="text-gray-600 text-sm">
                We use your location to show content in your regional language automatically.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                ✨ Why we need location?
              </p>
              <p className="text-xs text-blue-800">
                To automatically detect your region and show content in your preferred language (Hindi, Telugu, Tamil, etc.). You can always change it manually using the language switcher.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-1 text-sm">
                How to enable location access:
              </p>
              {getLocationInstructions()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDismissLocationPrompt}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Stay with English
              </button>
              <button
                onClick={handleRetryLocation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="absolute top-14 left-1/2 -translate-x-1/2 min-w-[260px] max-w-[320px] bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-base">🌍 Select Language</p>
            <p className="text-xs text-gray-500 mb-2">
              Current: <span className="font-medium text-blue-600">{getCurrentLangLabel()}</span>
            </p>
            <p className="text-xs text-green-600">
              {getStatusMessage()}
            </p>
          </div>
          <ul className="py-2 max-h-[400px] overflow-y-auto scrollbar-visible">
            {LANGS.map((lang) => (
              <li
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  lang.code === currentLang 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700'
                } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-[14px] leading-tight">{lang.label}</span>
                  </div>
                  {lang.code === currentLang && (
                    <span className="text-blue-500 font-bold text-lg">✓</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </>
  );
}