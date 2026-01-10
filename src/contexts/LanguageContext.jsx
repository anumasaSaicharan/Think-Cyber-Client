import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentLanguage } from '../utils/languageUtils';

const LanguageContext = createContext();

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Get current language
        const lang = getCurrentLanguage();
        console.log('📦 Current language from storage:', lang);
        setCurrentLanguage(lang);

        // If not English, wait for Google Translate to load
        if (lang !== 'en') {
          console.log('🌍 Non-English language detected:', lang);
          await waitForGoogleTranslate(lang);
          console.log('✅ Translation complete!');
        }
      } catch (error) {
        console.error('❌ Language initialization error:', error);
      }
    };

    initLanguage();

    // Listen for language changes
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.language) {
        setCurrentLanguage(event.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Function to wait for Google Translate to be ready
  const waitForGoogleTranslate = (targetLang) => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 30;

      const checkTranslate = () => {
        const select = document.querySelector('.goog-te-combo') || 
                      document.querySelector('#google_translate_element select');
        
        if (select) {
          console.log('✅ Google Translate widget found!');
          
          try {
            if (select.value !== targetLang) {
              console.log('🔄 Setting language to:', targetLang);
              select.value = targetLang;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } catch (e) {
            console.warn('⚠️ Could not set language:', e);
          }
          
          // Wait a bit for translation to apply
          setTimeout(resolve, 1500);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkTranslate, 500);
          } else {
            console.log('⚠️ Google Translate not available after waiting');
            resolve();
          }
        }
      };

      checkTranslate();
    });
  };

  const value = {
    currentLanguage,
    setCurrentLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
