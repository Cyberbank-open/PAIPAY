import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Smooth scroll handler to prevent default anchor behavior which causes errors in some environments
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

  // Helper to prevent default for placeholder links
  const handlePlaceholderClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <nav className={`fixed top-10 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 shadow-sm border-gray-100' : 'bg-white/90 border-transparent backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={scrollToTop}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-md">P</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">PAIPAY</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-500">
            <a href="#ecosystem" onClick={(e) => scrollToSection(e, 'ecosystem')} className="hover:text-blue-600 transition-colors">生态网络</a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-blue-600 transition-colors">解决方案</a>
            <a href="#insights" onClick={(e) => scrollToSection(e, 'insights')} className="hover:text-blue-600 transition-colors">市场脉动</a>
            <a href="#developers" onClick={(e) => scrollToSection(e, 'developers')} className="hover:text-blue-600 transition-colors">开发者</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-blue-600 transition-colors">常见问题</a>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-black transition-transform hover:-translate-y-1"><i className="ri-twitter-x-line text-lg"></i></a>
              <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-blue-600 transition-transform hover:-translate-y-1"><i className="ri-facebook-circle-fill text-lg"></i></a>
              <a href="#!" onClick={handlePlaceholderClick} className="text-gray-400 hover:text-blue-400 transition-transform hover:-translate-y-1"><i className="ri-telegram-fill text-lg"></i></a>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              下载 App
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-900 p-2 focus:outline-none">
              <i className={`text-2xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-4-line'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full border-b border-gray-100 shadow-xl bg-white/95 backdrop-blur-xl h-[calc(100vh-80px)] overflow-y-auto z-40">
          <div className="px-4 pt-4 pb-20 space-y-2">
            {[
              { id: 'ecosystem', label: '生态网络' },
              { id: 'features', label: '解决方案' },
              { id: 'insights', label: '市场脉动' },
              { id: 'developers', label: '开发者' },
              { id: 'faq', label: '常见问题' }
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                onClick={(e) => scrollToSection(e, item.id)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors capitalize"
              >
                {item.label}
              </a>
            ))}

            <div className="flex items-center justify-start gap-6 px-3 py-4 mt-4 border-t border-gray-100">
              <a href="#!" onClick={handlePlaceholderClick} className="flex items-center gap-2 text-gray-500 hover:text-black">
                <i className="ri-twitter-x-line text-xl"></i>
                <span className="text-xs">X</span>
              </a>
              <a href="#!" onClick={handlePlaceholderClick} className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
                <i className="ri-facebook-circle-fill text-xl"></i>
                <span className="text-xs">Facebook</span>
              </a>
              <a href="#!" onClick={handlePlaceholderClick} className="flex items-center gap-2 text-gray-500 hover:text-blue-400">
                <i className="ri-telegram-fill text-xl"></i>
                <span className="text-xs">Telegram</span>
              </a>
            </div>

            <div className="mt-4 px-3">
              <button className="w-full bg-blue-600 text-white px-5 py-3 rounded-full text-base font-medium hover:bg-blue-700 shadow-md">
                立即下载 App
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;