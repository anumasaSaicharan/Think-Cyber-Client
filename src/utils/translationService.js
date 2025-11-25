// Simple translation utility
// This provides a fallback when Google Translate isn't available

export const translationService = {
  // Simple text replacements for common UI elements
  translations: {
    en: {
      // Common UI texts that can be translated
      'Select Language': 'Select Language',
      'Choose Preferred Language': 'Choose Preferred Language',  
      'Current': 'Current',
      'English': 'English',
      'Telugu': 'Telugu',
      'Home': 'Home',
      'About Us': 'About Us',
      'Contact Us': 'Contact Us',
      'Search topics...': 'Search topics...',
      'Favorites': 'Favorites'
    },
    hi: {
      // Hindi translations
      'Select Language': 'भाषा चुनें',
      'Choose Preferred Language': 'पसंदीदा भाषा चुनें',
      'Current': 'वर्तमान',
      'English': 'अंग्रेजी',
      'Hindi': 'हिंदी',
      'Telugu': 'तेलुगु',
      'Home': 'होम',
      'About Us': 'हमारे बारे में',
      'Contact Us': 'संपर्क करें',
      'Search topics...': 'विषय खोजें...',
      'Favorites': 'पसंदीदा'
    },
    te: {
      // Telugu translations
      'Select Language': 'భాష ఎంచుకోండి',
      'Choose Preferred Language': 'ఇష్టపడే భాష ఎంచుకోండి',
      'Current': 'ప్రస్తుత',
      'English': 'ఇంగ్లీష్',
      'Hindi': 'హిందీ',
      'Telugu': 'తెలుగు',
      'Home': 'హోమ్',
      'About Us': 'మా గురించి',
      'Contact Us': 'మాతో సంప్రదించండి',
      'Search topics...': 'విషయాలను వెతకండి...',
      'Favorites': 'ఇష్టమైనవి'
    }
  },

  getCurrentLanguage() {
    return localStorage.getItem('preferredLanguage') || 'en';
  },

  setLanguage(langCode) {
    localStorage.setItem('preferredLanguage', langCode);
    // Trigger a custom event for components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
  },

  translate(text, targetLang = null) {
    const lang = targetLang || this.getCurrentLanguage();
    const translations = this.translations[lang];
    return translations && translations[text] ? translations[text] : text;
  },

  // Apply translations to elements with data-translate attribute
  applyTranslations(container = document) {
    const elementsToTranslate = container.querySelectorAll('[data-translate]');
    const currentLang = this.getCurrentLanguage();
    
    elementsToTranslate.forEach(element => {
      const key = element.getAttribute('data-translate');
      const translated = this.translate(key, currentLang);
      if (element.tagName === 'INPUT' && element.type !== 'submit') {
        element.placeholder = translated;
      } else {
        element.textContent = translated;
      }
    });
  }
};

// Hook for React components
export const useTranslation = () => {
  const [currentLang, setCurrentLang] = React.useState(translationService.getCurrentLanguage());

  React.useEffect(() => {
    const handleLanguageChange = (event) => {
      setCurrentLang(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const t = (text) => translationService.translate(text, currentLang);
  
  return { t, currentLang, setLanguage: translationService.setLanguage };
};