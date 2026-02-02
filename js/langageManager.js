/**
 * Language Manager for handling language selection and content translation
 * Supports French (fr) and Corsican (cor)
 */

export let currentLanguage = 'fr'; // Default to French

/**
 * Initialize the language manager
 */
export async function initLanguageManager() {
  // Always start with French - user can change it when selecting first character
  currentLanguage = 'fr';
  localStorage.setItem('selectedLanguage', 'fr');
  console.log('Language initialized: French (default)');
}

/**
 * Set the current language
 * @param {string} language - 'fr' or 'cor'
 */
export function setLanguage(language) {
  if (language === 'fr' || language === 'cor') {
    currentLanguage = language;
    localStorage.setItem('selectedLanguage', language);
    console.log('Language changed to:', language);
    return true;
  } else {
    console.error('Invalid language:', language);
    return false;
  }
}

/**
 * Get the current language
 * @returns {string} Current language code
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Get translated text from an object with language properties
 * @param {Object} textObject - Object with 'fr' and/or 'cor' properties
 * @param {string} fallbackLanguage - Language to fallback to if current language not available
 * @returns {string} The translated text or empty string
 */
export function getTranslation(textObject, fallbackLanguage = 'fr') {
  if (!textObject) return '';
  
  // If textObject is a string, return it as-is (for backward compatibility)
  if (typeof textObject === 'string') return textObject;
  
  // Try to get the current language text
  if (textObject[currentLanguage] && textObject[currentLanguage].trim() !== '') {
    return textObject[currentLanguage];
  }
  
  // Fallback to specified language
  if (textObject[fallbackLanguage] && textObject[fallbackLanguage].trim() !== '') {
    return textObject[fallbackLanguage];
  }
  
  // If fallback language is 'fr', try 'cor', otherwise try 'fr'
  const otherLanguage = fallbackLanguage === 'fr' ? 'cor' : 'fr';
  if (textObject[otherLanguage] && textObject[otherLanguage].trim() !== '') {
    return textObject[otherLanguage];
  }
  
  // Return empty string if no translation found
  return '';
}

/**
 * Check if a translation exists for the current language
 * @param {Object} textObject - Object with 'fr' and/or 'cor' properties
 * @returns {boolean} True if translation exists
 */
export function hasTranslation(textObject) {
  if (!textObject) return false;
  return textObject[currentLanguage] && textObject[currentLanguage].trim() !== '';
}
