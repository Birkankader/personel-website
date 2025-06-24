import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'en' : 'tr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
      aria-label={`Switch to ${language === 'en' ? 'English' : 'Turkish'}`}
    >
      <Languages size={18} />
      <span className="text-sm font-medium">
        {language === 'en' ? 'EN' : 'TR'}
      </span>
    </button>
  );
};

export default LanguageToggle;
