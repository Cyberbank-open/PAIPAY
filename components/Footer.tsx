import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import DownloadDrawer from './DownloadDrawer';
import { PageView } from '../App';

interface FooterProps {
    onNavigate?: (view: PageView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAdminClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onNavigate) {
          onNavigate('admin_login');
      }
  };

  return (
    <>
      <footer className="bg-white text-gray-600 py-16 border-t border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-0 mb-12 md:mb-16 text-center md:text-left">
            
            {/* 1. Left: Brand Identity */}
            <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">P</div>
                <span className="text-gray-900 font-bold text-2xl tracking-tight">PAIPAY</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Next Generation Global Clearing Network.
              </p>
            </div>

            {/* 2. Right: Primary Actions (Minimalist) */}
            <div className="flex flex-col gap-6 w-full md:w-auto items-center md:items-end">
              <h4 className="text-gray-400 font-bold text-xs tracking-widest uppercase md:hidden mb-1 opacity-70">{t.footer.ready}</h4>
              
              {/* THE BUTTON: Solid Black (High Fashion / Premium Tech Style) */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="w-full md:w-auto group relative flex items-center justify-center gap-3 bg-gray-900 text-white hover:bg-black px-8 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-2xl hover:shadow-gray-300 hover:-translate-y-1 active:scale-[0.98]"
              >
                 <i className="ri-download-cloud-2-fill text-xl"></i>
                 <span className="font-bold text-base tracking-wide">{t.nav.download}</span>
              </button>

              {/* Social Icons Row - Super Clean */}
              <div className="flex items-center gap-4">
                 <button type="button" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black transition-all duration-300">
                    <i className="ri-twitter-x-line text-lg"></i>
                 </button>
                 <button type="button" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] transition-all duration-300">
                    <i className="ri-facebook-fill text-lg"></i>
                 </button>
                 <button type="button" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#24A1DE] transition-all duration-300">
                    <i className="ri-telegram-fill text-lg"></i>
                 </button>
              </div>
            </div>
          </div>

          {/* 3. Bottom Links */}
          <div className="border-t border-gray-100 pt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-6 text-xs font-medium">
            <p className="text-gray-400 text-center md:text-left">&copy; 2025 PAIPAY Financial Technology. {t.footer.rights}</p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <button type="button" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">{t.footer.privacy}</button>
              <button type="button" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">{t.footer.terms}</button>
              <button type="button" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">{t.footer.compliance}</button>
              <a href="/admin" onClick={handleAdminClick} className="hover:text-blue-600 transition-colors">Admin Access</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Functionally Integrated Drawer */}
      <DownloadDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

export default Footer;