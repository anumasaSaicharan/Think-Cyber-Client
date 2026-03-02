/**
 * Language Detection and Management Utilities
 * Handles automatic language detection, translation, and font consistency
 */

// Supported languages with their configurations
export const SUPPORTED_LANGUAGES = [
  { label: 'English', code: 'en', flag: '🇬🇧', native: 'English', fontFamily: 'Roboto' },
  { label: 'हिंदी (Hindi)', code: 'hi', flag: '🇮🇳', native: 'हिंदी', fontFamily: 'Noto Sans Devanagari' },
  { label: 'తెలుగు (Telugu)', code: 'te', flag: '🇮🇳', native: 'తెలుగు', fontFamily: 'Noto Sans Telugu' },
  { label: 'தமிழ் (Tamil)', code: 'ta', flag: '🇮🇳', native: 'தமிழ்', fontFamily: 'Noto Sans Tamil' },
  { label: 'ಕನ್ನಡ (Kannada)', code: 'kn', flag: '🇮🇳', native: 'ಕನ್ನಡ', fontFamily: 'Noto Sans Kannada' },
  { label: 'മലയാളം (Malayalam)', code: 'ml', flag: '🇮🇳', native: 'മലയാളം', fontFamily: 'Noto Sans Malayalam' },
  { label: 'বাংলা (Bengali)', code: 'bn', flag: '🇮🇳', native: 'বাংলা', fontFamily: 'Noto Sans Bengali' },
  { label: 'ગુજરાતી (Gujarati)', code: 'gu', flag: '🇮🇳', native: 'ગુજરાતી', fontFamily: 'Noto Sans Gujarati' },
  { label: 'मराठी (Marathi)', code: 'mr', flag: '🇮🇳', native: 'मराठी', fontFamily: 'Noto Sans Devanagari' },
  { label: 'ਪੰਜਾਬੀ (Punjabi)', code: 'pa', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ', fontFamily: 'Noto Sans Gurmukhi' },
];

// Country to default language mapping
export const COUNTRY_LANGUAGE_MAP = {
  'IN': 'hi', // India -> Hindi (default)
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'BD': 'bn', // Bangladesh -> Bengali
  'PK': 'pa', // Pakistan -> Punjabi
  'LK': 'ta', // Sri Lanka -> Tamil
};

// Indian state/region to language mapping
export const INDIAN_STATE_LANGUAGE_MAP = {
  // Telugu states
  'Telangana': 'te',
  'Andhra Pradesh': 'te',
  'AP': 'te',
  'TS': 'te',
  'TG': 'te',

  // Tamil states
  'Tamil Nadu': 'ta',
  'TN': 'ta',

  // Kannada states
  'Karnataka': 'kn',
  'KA': 'kn',

  // Malayalam states
  'Kerala': 'ml',
  'KL': 'ml',

  // Bengali states
  'West Bengal': 'bn',
  'WB': 'bn',

  // Gujarati states
  'Gujarat': 'gu',
  'GJ': 'gu',

  // Marathi states
  'Maharashtra': 'mr',
  'MH': 'mr',

  // Punjabi states
  'Punjab': 'pa',
  'PB': 'pa',

  // Hindi states (default for North India)
  'Delhi': 'hi',
  'Uttar Pradesh': 'hi',
  'UP': 'hi',
  'Madhya Pradesh': 'hi',
  'MP': 'hi',
  'Rajasthan': 'hi',
  'RJ': 'hi',
  'Bihar': 'hi',
  'BR': 'hi',
  'Jharkhand': 'hi',
  'JH': 'hi',
  'Uttarakhand': 'hi',
  'UK': 'hi',
  'Haryana': 'hi',
  'HR': 'hi',
  'Himachal Pradesh': 'hi',
  'HP': 'hi',
};

/**
 * Request browser location permission and detect language
 * @returns {Promise<{language: string, permissionDenied: boolean}>}
 */
export async function requestLocationPermission() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     🌍 LOCATION PERMISSION REQUEST STARTED           ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported by browser');
      resolve({ language: 'en', permissionDenied: false });
      return;
    }

    console.log('⏳ Requesting browser location permission...');

    // Request location permission
    navigator.geolocation.getCurrentPosition(
      // Success - permission granted
      async (position) => {
        console.log('✅ ✅ ✅ LOCATION PERMISSION GRANTED! ✅ ✅ ✅');
        console.log('📍 Position:', position.coords);
        localStorage.setItem('locationPermissionStatus', 'granted');

        // Now detect language from IP
        console.log('🔍 Now detecting language from IP...');
        const language = await detectLanguageFromIP();
        console.log('🎯 FINAL RESULT: Language =', language.toUpperCase());
        resolve({ language, permissionDenied: false });
      },
      // Error - permission denied or error
      (error) => {
        console.log('❌ ❌ ❌ LOCATION PERMISSION DENIED! ❌ ❌ ❌');
        console.log('Error:', error.message);
        localStorage.setItem('locationPermissionStatus', 'denied');
        localStorage.setItem('locationDeniedTime', Date.now().toString());

        // Fallback to English
        console.log('➡️ Falling back to ENGLISH');
        resolve({ language: 'en', permissionDenied: true });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Detect user's language based on IP location (without asking permission)
 * @returns {Promise<string>} Language code (e.g., 'hi', 'en')
 */
export async function detectLanguageFromIP() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        🔍 DETECTING LANGUAGE FROM IP                 ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  try {
    // Try ipapi.co first - it provides detailed location info including region
    try {
      console.log('🌍 Fetching location from ipapi.co...');
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code || data.country;
        const region = data.region || data.region_code;
        const city = data.city;

        console.log('📍 RAW LOCATION DATA:', {
          country: countryCode,
          state: region,
          city: city,
          fullData: data
        });
        console.log(`🗺️ DETECTED STATE: "${region}"`);
        console.log(`🏙️ DETECTED CITY: "${city}"`);
        console.log(`🌐 COUNTRY: "${countryCode}"`);

        // If India, check for state-specific language
        if (countryCode === 'IN' && region) {
          console.log('🇮🇳 India detected! Checking state mapping...');

          // Check state mapping
          if (INDIAN_STATE_LANGUAGE_MAP[region]) {
            const language = INDIAN_STATE_LANGUAGE_MAP[region];
            console.log(`✅ STATE MATCH FOUND: "${region}" → Language: ${language.toUpperCase()}`);
            return language;
          } else {
            console.log(`⚠️ STATE "${region}" not found in mapping. Checking city...`);
          }

          // Check if city name helps identify state
          const cityLower = city?.toLowerCase();
          if (cityLower) {
            console.log(`🔍 Checking city: "${cityLower}"`);

            if (cityLower.includes('hyderabad') || cityLower.includes('warangal') || cityLower.includes('nizamabad')) {
              console.log('✅ TELANGANA CITY DETECTED → Setting TELUGU (te)');
              return 'te';
            }
            if (cityLower.includes('vijayawada') || cityLower.includes('visakhapatnam') || cityLower.includes('tirupati')) {
              console.log('✅ ANDHRA PRADESH CITY DETECTED → Setting TELUGU (te)');
              return 'te';
            }
            if (cityLower.includes('chennai') || cityLower.includes('coimbatore') || cityLower.includes('madurai')) {
              console.log('✅ TAMIL NADU CITY DETECTED → Setting TAMIL (ta)');
              return 'ta';
            }
            if (cityLower.includes('bengaluru') || cityLower.includes('bangalore') || cityLower.includes('mysore')) {
              console.log('✅ KARNATAKA CITY DETECTED → Setting KANNADA (kn)');
              return 'kn';
            }
            if (cityLower.includes('mumbai') || cityLower.includes('pune') || cityLower.includes('nagpur')) {
              console.log('✅ MAHARASHTRA CITY DETECTED → Setting MARATHI (mr)');
              return 'mr';
            }
            if (cityLower.includes('kochi') || cityLower.includes('trivandrum') || cityLower.includes('calicut')) {
              console.log('✅ KERALA CITY DETECTED → Setting MALAYALAM (ml)');
              return 'ml';
            }
            if (cityLower.includes('kolkata') || cityLower.includes('howrah')) {
              console.log('✅ WEST BENGAL CITY DETECTED → Setting BENGALI (bn)');
              return 'bn';
            }
            if (cityLower.includes('ahmedabad') || cityLower.includes('surat') || cityLower.includes('vadodara')) {
              console.log('✅ GUJARAT CITY DETECTED → Setting GUJARATI (gu)');
              return 'gu';
            }

            console.log(`⚠️ City "${cityLower}" didn't match any known patterns`);
          }

          console.log('⚠️ No state/city match found. Defaulting to HINDI for India');
        }

        // Fall back to country-level mapping
        if (countryCode && COUNTRY_LANGUAGE_MAP[countryCode]) {
          const language = COUNTRY_LANGUAGE_MAP[countryCode];
          console.log(`✅ COUNTRY MATCH: ${countryCode} → Language: ${language.toUpperCase()}`);
          return language;
        }
      }
    } catch (err) {
      console.error('❌ ipapi.co failed:', err.message);
    }

    // Try other services as fallback
    const fallbackServices = [
      'https://api.country.is/',
      'https://geolocation-db.com/json/'
    ];

    for (const service of fallbackServices) {
      try {
        const response = await fetch(service, { timeout: 3000 });
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code || data.country || data.countryCode;

          if (countryCode && COUNTRY_LANGUAGE_MAP[countryCode]) {
            console.log(`Location detected: ${countryCode}, Language: ${COUNTRY_LANGUAGE_MAP[countryCode]}`);
            return COUNTRY_LANGUAGE_MAP[countryCode];
          }
        }
      } catch (err) {
        console.log(`Service ${service} failed:`, err.message);
        continue;
      }
    }
  } catch (error) {
    console.log('All geolocation services failed:', error);
  }

  // Fallback to English (not browser language)
  return 'en';
}

/**
 * Detect language from browser settings
 * @returns {string} Language code
 */
export function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    const langCode = browserLang.split('-')[0].toLowerCase();

    // Check if we support this language
    if (SUPPORTED_LANGUAGES.find(l => l.code === langCode)) {
      console.log('Using browser language:', langCode);
      return langCode;
    }
  }

  return 'en'; // Always fallback to English
}

/**
 * Check if location permission was denied
 * @returns {boolean}
 */
export function isLocationDenied() {
  return localStorage.getItem('locationPermissionStatus') === 'denied';
}

/**
 * Get instructions for enabling location based on browser
 * @returns {string}
 */
export function getLocationEnableInstructions() {
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isEdge = /Edg/.test(navigator.userAgent);

  if (isChrome || isEdge) {
    return `
      <strong>Chrome/Edge Instructions:</strong>
      <ol style="text-align: left; margin: 10px 0; padding-left: 20px;">
        <li>Click the lock icon 🔒 in the address bar</li>
        <li>Find "Location" in the permissions list</li>
        <li>Change it from "Block" to "Ask" or "Allow"</li>
        <li>Reload this page</li>
      </ol>
    `;
  } else if (isFirefox) {
    return `
      <strong>Firefox Instructions:</strong>
      <ol style="text-align: left; margin: 10px 0; padding-left: 20px;">
        <li>Click the shield or lock icon in the address bar</li>
        <li>Click on "Permissions"</li>
        <li>Find "Access Your Location" and remove the block</li>
        <li>Reload this page</li>
      </ol>
    `;
  } else if (isSafari) {
    return `
      <strong>Safari Instructions:</strong>
      <ol style="text-align: left; margin: 10px 0; padding-left: 20px;">
        <li>Go to Safari → Preferences → Websites</li>
        <li>Click on "Location" in the sidebar</li>
        <li>Find this website and change to "Ask" or "Allow"</li>
        <li>Reload this page</li>
      </ol>
    `;
  }

  return `
    <strong>General Instructions:</strong>
    <ol style="text-align: left; margin: 10px 0; padding-left: 20px;">
      <li>Click the site settings icon in your address bar</li>
      <li>Find location permissions</li>
      <li>Change from "Block" to "Ask" or "Allow"</li>
      <li>Reload this page</li>
    </ol>
  `;
}

/**
 * Reset location permission status (for retrying)
 */
export function resetLocationPermission() {
  localStorage.removeItem('locationPermissionStatus');
  localStorage.removeItem('locationDeniedTime');
}

/**
 * Get current language from storage (localStorage or cookies)
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  // Priority: localStorage > cookie > URL param
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && SUPPORTED_LANGUAGES.find(l => l.code === stored)) {
    return stored;
  }

  // Check googtrans cookie
  const googtrans = getCookie('googtrans');
  if (googtrans) {
    const parts = googtrans.split('/');
    if (parts.length >= 3) {
      const langCode = parts[2];
      if (SUPPORTED_LANGUAGES.find(l => l.code === langCode)) {
        return langCode;
      }
    }
  }

  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && SUPPORTED_LANGUAGES.find(l => l.code === urlLang)) {
    return urlLang;
  }

  return 'en';
}

/**
 * Set language preference
 * @param {string} languageCode - Language code to set
 */
export function setLanguagePreference(languageCode) {
  localStorage.setItem('preferredLanguage', languageCode);
  sessionStorage.setItem('preferredLanguage', languageCode);
  setCookie('googtrans', `/auto/${languageCode}`);
  setCookie('preferredLanguage', languageCode);

  // Update HTML lang attribute for better accessibility and SEO
  document.documentElement.lang = languageCode;

  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: languageCode }
  }));
}

/**
 * Apply appropriate font family based on language
 * @param {string} languageCode - Language code
 */
export function applyLanguageFont(languageCode) {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  if (language && language.fontFamily) {
    document.documentElement.style.setProperty('--language-font', language.fontFamily);
  }
}

/**
 * Cookie management utilities
 */
export function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

/**
 * Get language info by code
 * @param {string} code - Language code
 * @returns {Object|null} Language object
 */
export function getLanguageInfo(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || null;
}

/**
 * Check if auto-detection should run
 * @returns {boolean}
 */
export function shouldAutoDetect() {
  // Don't auto-detect if user has already chosen a language
  const hasPreference = localStorage.getItem('preferredLanguage') !== null;
  const hasAutoDetected = sessionStorage.getItem('autoDetected') === 'true';

  return !hasPreference && !hasAutoDetected;
}

/**
 * Mark auto-detection as completed
 */
export function markAutoDetected() {
  sessionStorage.setItem('autoDetected', 'true');
}

/**
 * Reset language preferences (useful for testing)
 */
export function resetLanguagePreferences() {
  console.log('🗑️ Resetting all language preferences...');

  // Clear localStorage
  localStorage.removeItem('preferredLanguage');
  localStorage.removeItem('locationPermissionStatus');
  localStorage.removeItem('locationDeniedTime');

  // Clear sessionStorage
  sessionStorage.removeItem('preferredLanguage');
  sessionStorage.removeItem('autoDetected');
  sessionStorage.removeItem('locationPromptDismissed');

  // Clear ALL cookies
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
  }

  // Reset HTML lang attribute
  document.documentElement.lang = 'en';

  console.log('✅ All language data cleared!');
  console.log('🔄 Reload the page to start fresh');
}
