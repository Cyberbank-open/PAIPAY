import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<'CN' | 'EN'>('CN');

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

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
                  {item === 'faq' ? '常见问题' : item === 'ecosystem' ? '生态网络' : item === 'features' ? '解决方案' : item === 'insights' ? '市场脉动' : '开发者'}
                </a>
              ))}
              
              <div className="flex items-center gap-5 pl-6 border-l border-gray-200">
                <div className="flex items-center gap-3">
                   <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-black transition-transform hover:-translate-y-1"><i className="ri-twitter-x-line text-lg"></i></a>
                   <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-blue-600 transition-transform hover:-translate-y-1"><i className="ri-facebook-circle-fill text-lg"></i></a>
                </div>
                
                {/* Desktop Language Switcher */}
                <button 
                  onClick={() => setLang(lang === 'CN' ? 'EN' : 'CN')}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors py-1 px-2 rounded hover:bg-gray-100"
                >
                  <i className="ri-global-line text-lg"></i>
                  <span className="text-xs font-bold tracking-wide">{lang}</span>
                </button>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95">
                下载 App
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

      {/* Mobile Menu Panel - Fixed Full Screen */}
      <div 
        className={`md:hidden fixed top-[104px] left-0 w-full h-[calc(100vh-104px)] bg-white/98 backdrop-blur-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto pb-10">
          <div className="px-6 py-6 space-y-6">
            
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between p-1 bg-gray-50 rounded-xl border border-gray-100">
               <button 
                 onClick={() => setLang('CN')}
                 className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${lang === 'CN' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400'}`}
               >
                 中文
               </button>
               <button 
                 onClick={() => setLang('EN')}
                 className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${lang === 'EN' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400'}`}
               >
                 English
               </button>
            </div>

            <div className="space-y-1">
              {[
                { id: 'ecosystem', label: '生态网络' },
                { id: 'features', label: '解决方案' },
                { id: 'insights', label: '市场脉动' },
                { id: 'developers', label: '开发者' },
                { id: 'faq', label: '常见问题' }
              ].map((item, idx) => (
                <a 
                  key={item.id}
                  href={`#${item.id}`} 
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`block py-5 text-xl font-medium text-gray-800 border-b border-gray-50 flex items-center justify-between group transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                  style={{ transitionDelay: `${idx * 0.05 + 0.1}s` }}
                >
                  {item.label}
                  <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-active:bg-blue-50 transition-colors">
                    <i className="ri-arrow-right-line text-gray-400 group-active:text-blue-600 text-lg"></i>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-auto px-6 space-y-6">
             <div className="flex items-center justify-center gap-12 py-4">
                <a href="#!" onClick={handlePlaceholderClick} className="text-gray-300 hover:text-black transition-colors p-2"><i className="ri-twitter-x-line text-2xl"></i></a>
                <a href="#!" onClick={handlePlaceholderClick} className="text-gray-300 hover:text-blue-600 transition-colors p-2"><i className="ri-facebook-circle-fill text-2xl"></i></a>
                <a href="#!" onClick={handlePlaceholderClick} className="text-gray-300 hover:text-blue-400 transition-colors p-2"><i className="ri-telegram-fill text-2xl"></i></a>
            </div>

            <button className="w-full bg-gray-900 text-white px-5 py-4 rounded-2xl text-base font-bold shadow-xl shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
               <i className="ri-apple-fill text-xl"></i>
               <span>App Store</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;