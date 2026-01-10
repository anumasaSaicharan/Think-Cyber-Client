/**
 * useLanguage Hook
 * React hook for managing language state and translations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentLanguage,
  setLanguagePreference,
  detectLanguageFromLocation,
  shouldAutoDetect,
  markAutoDetected,
  applyLanguageFont,
  SUPPORTED_LANGUAGES,
  getLanguageInfo
} from '../utils/languageUtils';

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState(() => getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  // Auto-detect language on first load
  useEffect(() => {
    if (shouldAutoDetect()) {
      setIsAutoDetecting(true);
      
      // Import the request function
      import('../utils/languageUtils').then(({ requestLocationPermission, markAutoDetected }) => {
        requestLocationPermission()
          .then(({ language, permissionDenied }) => {
            if (language && language !== 'en' && !permissionDenied) {
              console.log('Auto-detected language:', language);
              changeLanguage(language, true);
            } else if (permissionDenied) {
              console.log('Location denied, staying with English');
              // User will see prompt on next visit
            }
            markAutoDetected();
          })
          .catch(err => {
            console.error('Auto-detection failed:', err);
            markAutoDetected();
          })
          .finally(() => {
            setIsAutoDetecting(false);
          });
      });
    }
  }, []);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.language) {
        setCurrentLanguage(event.detail.language);
        applyLanguageFont(event.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Change language function
  const changeLanguage = useCallback(async (languageCode, isAutomatic = false) => {
    if (currentLanguage === languageCode) {
      return;
    }

    setIsLoading(true);

    try {
      // Set preference
      setLanguagePreference(languageCode);
      
      // Apply font
      applyLanguageFont(languageCode);
      
      // Update state
      setCurrentLanguage(languageCode);

      // Try to use Google Translate
      const googleSelect = document.querySelector('.goog-te-combo') || 
                          document.querySelector('#google_translate_element select');
      
      if (googleSelect) {
        googleSelect.value = languageCode;
        googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (!isAutomatic) {
        // If Google Translate not available and not automatic, reload page
        const url = new URL(window.location);
        url.searchParams.set('lang', languageCode);
        
        // Show loading message
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          color: white;
          font-family: Arial, sans-serif;
        `;
        overlay.innerHTML = `
          <div style="text-align: center; background: white; padding: 30px; border-radius: 10px; color: #333;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <p style="margin: 0; font-size: 16px;">Changing language...</p>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
          window.location.href = url.toString();
        }, 800);
      }

      console.log(`Language changed to ${languageCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [currentLanguage]);

  // Get current language info
  const languageInfo = getLanguageInfo(currentLanguage);

  return {
    currentLanguage,
    languageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading,
    isAutoDetecting,
    changeLanguage,
  };
}
