
import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from './LanguageContext';

// --- Download Drawer Component ---
interface DownloadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadDrawer: React.FC<DownloadDrawerProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'select' | 'ios-confirm' | 'android-confirm'>('select');
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) setStep('select');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[80] p-6 pb-10 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] animate-fade-in-up">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{t.nav.download}</h3>
              <p className="text-sm text-gray-500 mt-1">Select your platform</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setStep('ios-confirm')}
                className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-gray-100 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                  <i className="ri-apple-fill text-2xl text-black"></i>
                </div>
                <span className="font-bold text-gray-900">iOS</span>
                <span className="text-[10px] text-gray-400 mt-0.5">App Store</span>
              </button>

              <button 
                onClick={() => setStep('android-confirm')}
                className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-gray-100 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                  <i className="ri-android-fill text-2xl text-[#3DDC84]"></i>
                </div>
                <span className="font-bold text-gray-900">Android</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Play / APK</span>
              </button>
            </div>
          </div>
        )}

        {step === 'ios-confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-300">
                <i className="ri-apple-fill text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">App Store</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed bg-yellow-50 text-yellow-700 p-3 rounded-lg border border-yellow-100">
                <i className="ri-error-warning-fill align-bottom mr-1"></i>
                Tip: If not found in local store, please switch to <strong>Global (US/SG)</strong> region.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('select')} className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">Back</button>
              <a href="#" className="flex-1 flex items-center justify-center py-3.5 rounded-xl bg-black text-white font-bold text-sm shadow-lg shadow-gray-200 active:scale-95 transition-transform">
                Confirm
              </a>
            </div>
          </div>
        )}

        {step === 'android-confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#3DDC84] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
                <i className="ri-android-fill text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Download Options</h3>
              <p className="text-sm text-gray-500 mt-1">Google Play recommended for auto-updates</p>
            </div>
            
            <div className="space-y-3">
               <a href="#" className="w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-xl shadow-sm active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <i className="ri-google-play-fill text-xl text-gray-600"></i>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">Google Play</div>
                      <div className="text-[10px] text-gray-400">Recommended</div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300"></i>
               </a>

               <a href="#" className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 border border-transparent rounded-xl active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <i className="ri-download-cloud-2-line text-xl text-gray-600"></i>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">Direct APK</div>
                      <div className="text-[10px] text-gray-400">v2.4.0 • 45.2 MB</div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300"></i>
               </a>
            </div>
            
            <button onClick={() => setStep('select')} className="w-full py-3 text-gray-400 text-xs font-medium">Back</button>
          </div>
        )}
      </div>
    </>
  );
};


const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] = useState(false);
  
  // Use Global Language Context
  const { lang, setLang, t } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    document.body.style.overflow = 'unset';
    setIsMobileMenuOpen(false);
  };

  const openDownload = () => {
    setIsDownloadDrawerOpen(true);
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 140; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    closeMenu();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  };

  const handlePlaceholderClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  
  const handleLangChange = (l: Language) => {
    setLang(l);
    setIsLangDropdownOpen(false);
  };
  
  const languages: { code: Language; label: string }[] = [
    { code: 'CN', label: '简体中文' },
    { code: 'EN', label: 'English' },
    { code: 'VN', label: 'Tiếng Việt' },
    { code: 'TH', label: 'ไทย' },
    { code: 'KH', label: 'ខ្មែរ' },
  ];

  return (
    <>
      <nav className={`fixed top-10 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-white/95 shadow-sm border-gray-100' : 'bg-white/80 border-transparent backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20 transition-all duration-300">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group" 
              onClick={scrollToTop}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-lg group-hover:shadow-blue-300/50 transition-all duration-300 transform group-hover:scale-105">P</div>
              <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">PAIPAY</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10 text-[15px] font-medium text-gray-500">
              {['ecosystem', 'features', 'insights', 'developers', 'faq'].map((item) => (
                <a 
                  key={item}
                  href={`#${item}`} 
                  onClick={(e) => scrollToSection(e, item)} 
                  className="hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full capitalize"
                >
                  {t.nav[item as keyof typeof t.nav]}
                </a>
              ))}
              
              <div className="flex items-center gap-5 pl-6 border-l border-gray-200 relative">
                <div className="flex items-center gap-3">
                   <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-black transition-transform hover:-translate-y-1"><i className="ri-twitter-x-line text-lg"></i></a>
                   <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-blue-600 transition-transform hover:-translate-y-1"><i className="ri-facebook-circle-fill text-lg"></i></a>
                </div>
                
                {/* Desktop Language Switcher (Dropdown) */}
                <div className="relative">
                    <button 
                      onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors py-1 px-2 rounded hover:bg-gray-100"
                    >
                      <i className="ri-global-line text-lg"></i>
                      <span className="text-xs font-bold tracking-wide w-4">{lang}</span>
                    </button>
                    
                    {isLangDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 flex flex-col z-[100] animate-fade-in overflow-hidden">
                            {languages.map((l) => (
                                <button 
                                    key={l.code}
                                    onClick={() => handleLangChange(l.code)}
                                    className={`text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center justify-between transition-colors ${lang === l.code ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}
                                >
                                    <span>{l.label}</span>
                                    {lang === l.code && <i className="ri-check-line text-blue-600"></i>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <button 
                onClick={openDownload}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
              >
                {t.nav.download}
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center md:hidden gap-4">
              <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-900 p-2 focus:outline-none transition-colors relative z-50">
                <i className={`text-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'ri-close-line rotate-90' : 'ri-menu-4-line'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel - Compact & Full Screen */}
      <div 
        className={`md:hidden fixed top-[104px] left-0 w-full bottom-0 bg-white/98 backdrop-blur-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full px-6 pt-4 pb-8">
          
          {/* 1. Language Switcher (5-Grid) - Pure Typography Style */}
          <div className="flex-shrink-0 mb-6">
            <div className="grid grid-cols-5 gap-3">
                {languages.map((l) => (
                    <button 
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center tracking-wide ${
                        lang === l.code 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'text-gray-400 hover:text-gray-800 bg-gray-50 border border-transparent'
                      }`}
                    >
                      {l.code}
                    </button>
                ))}
            </div>
          </div>

          {/* 2. Navigation Links */}
          <div className="flex-grow flex flex-col justify-start space-y-1">
            {[
              { id: 'ecosystem', label: t.nav.ecosystem },
              { id: 'features', label: t.nav.features },
              { id: 'insights', label: t.nav.insights },
              { id: 'developers', label: t.nav.developers },
              { id: 'faq', label: t.nav.faq }
            ].map((item, idx) => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                onClick={(e) => scrollToSection(e, item.id)}
                className={`block py-3 text-[16px] font-semibold text-gray-800 flex items-center justify-between group transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                style={{ transitionDelay: `${idx * 0.04 + 0.1}s` }}
              >
                {item.label}
                <span className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center group-active:translate-x-1 transition-transform">
                  <i className="ri-arrow-right-line text-gray-300 text-lg"></i>
                </span>
              </a>
            ))}
          </div>

          {/* 3. Bottom Action Area */}
          <div className="mt-auto flex-shrink-0 pt-4 pb-32">
             <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{t.nav.community}</span>
             </div>
             
             {/* Micro-textured Social Buttons */}
             <div className="grid grid-cols-3 gap-3 mb-4">
                <a href="#!" onClick={handlePlaceholderClick} className="group flex items-center justify-center h-11 rounded-xl bg-white border border-gray-100 hover:border-gray-900 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] active:scale-95 active:shadow-none">
                    <i className="ri-twitter-x-line text-lg text-gray-500 group-hover:text-black transition-colors"></i>
                </a>
                <a href="#!" onClick={handlePlaceholderClick} className="group flex items-center justify-center h-11 rounded-xl bg-white border border-gray-100 hover:border-blue-500 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] active:scale-95 active:shadow-none">
                    <i className="ri-facebook-circle-fill text-lg text-blue-600/60 group-hover:text-blue-600 transition-colors"></i>
                </a>
                <a href="#!" onClick={handlePlaceholderClick} className="group flex items-center justify-center h-11 rounded-xl bg-white border border-gray-100 hover:border-cyan-500 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] active:scale-95 active:shadow-none">
                    <i className="ri-telegram-fill text-lg text-cyan-500/60 group-hover:text-cyan-500 transition-colors"></i>
                </a>
             </div>

            {/* Primary CTA */}
            <button 
              onClick={openDownload}
              className="w-full bg-gray-900 text-white h-12 rounded-xl text-[15px] font-bold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
               <i className="ri-download-cloud-2-line text-xl mb-0.5"></i>
               <span>{t.nav.download}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mount the Drawer */}
      <DownloadDrawer isOpen={isDownloadDrawerOpen} onClose={() => setIsDownloadDrawerOpen(false)} />
    </>
  );
};

export default Navbar;