import React from 'react';
import { useLanguage } from './LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="text-white font-bold text-lg">PAIPAY</span>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-white font-bold mb-2 text-sm">{t.footer.ready}</h4>
            <div className="flex gap-4 justify-center md:justify-end text-xs">
              <span className="cursor-pointer hover:text-white transition-colors">App Store</span>
              <span className="cursor-pointer hover:text-white transition-colors">Google Play</span>
              <span className="cursor-pointer hover:text-white transition-colors">Android APK</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
          <p className="text-center md:text-left">&copy; 2025 PAIPAY Financial Technology. {t.footer.rights}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400">{t.footer.privacy}</a>
            <a href="#" className="hover:text-gray-400">{t.footer.terms}</a>
            <a href="#" className="hover:text-gray-400">{t.footer.compliance}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;