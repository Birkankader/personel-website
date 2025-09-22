import React from 'react';
import { Heart, Code2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-12 bg-gray-900 dark:bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Birkan Kader
            </span>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-gray-400 mb-2">
              © {currentYear} Sifa Birkan KADER. {t('footer.allRightsReserved')}
            </p>
            <p className="text-gray-500 text-sm flex items-center justify-center">
              {t('footer.madeWith')} <Heart size={14} className="mx-1 text-red-500" /> {t('footer.using')}
            </p>
          </div>
          
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
