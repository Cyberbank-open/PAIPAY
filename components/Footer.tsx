import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import DownloadDrawer from './DownloadDrawer';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);

  return (
    <>
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12">
            
            {/* Left: Brand */}
            <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-900/50">P</div>
                <span className="text-white font-bold text-xl tracking-tight">PAIPAY</span>
              </div>
              <p className="text-xs text-gray-500 max-w-xs text-center md:text-left leading-relaxed">
                Next Generation Global Clearing Network.
              </p>
            </div>

            {/* Right: Actions (Download + Social) */}
            <div className="flex flex-col items-center md:items-end gap-5 w-full md:w-auto">
              <h4 className="text-white font-bold text-sm tracking-wide hidden md:block">{t.footer.ready}</h4>
              
              {/* Unified Download Button */}
              <button 
                onClick={openDrawer}
                className="group relative flex items-center gap-3 bg-white/10 hover:bg-white text-white hover:text-gray-900 px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white shadow-lg active:scale-95 w-full md:w-auto justify-center"
              >
                 <i className="ri-download-cloud-2-fill text-lg"></i>
                 <span className="font-bold text-sm">{t.nav.download}</span>
                 <span className="absolute -inset-2 bg-white/20 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></span>
              </button>

              {/* Integrated Social Icons */}
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                 <a href="#" className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 hover:bg-black transition-all duration-300">
                    <i className="ri-twitter-x-line text-sm"></i>
                 </a>
                 <a href="#" className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-600 hover:bg-blue-600 transition-all duration-300">
                    <i className="ri-facebook-fill text-sm"></i>
                 </a>
                 <a href="#" className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-500 transition-all duration-300">
                    <i className="ri-telegram-fill text-sm"></i>
                 </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-6">
            <p className="text-center md:text-left text-gray-500">&copy; 2025 PAIPAY Financial Technology. <br className="md:hidden"/>{t.footer.rights}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-gray-300 transition-colors">{t.footer.terms}</a>
              <a href="#" className="hover:text-gray-300 transition-colors">{t.footer.compliance}</a>
            </div>
          </div>
        </div>
      </footer>
      
      <DownloadDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

export default Footer;