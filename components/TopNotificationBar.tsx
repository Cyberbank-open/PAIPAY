import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const TopNotificationBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const { t } = useLanguage();

  const notices = [
    { icon: 'ri-vip-crown-fill', color: 'text-yellow-400', text: t.notices.n1 },
    { icon: 'ri-briefcase-4-fill', color: 'text-cyan-400', text: t.notices.n2 },
    { icon: 'ri-shield-check-fill', color: 'text-green-400', text: t.notices.n3 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notices.length);
        setIsExiting(false);
      }, 500); 
    }, 5000);

    return () => clearInterval(interval);
  }, [notices.length]);

  const currentNotice = notices[currentIndex];

  const scrollToInsights = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('insights');
    if (element) {
      const offset = 140; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="top-notification-bar" className="fixed top-0 left-0 w-full h-10 bg-gray-900 z-[60] flex items-center justify-center text-white text-xs font-medium border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-center relative">
        {/* Icon & Label */}
        <div className="absolute left-4 md:left-auto md:relative md:mr-3 flex items-center">
          <div className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full relative animate-pulse-ring mr-2"></div>
          <span className="text-cyan-400 font-bold tracking-wider uppercase hidden sm:inline">ANNOUNCEMENT</span>
        </div>

        {/* Content Rotator */}
        <div className="w-full md:w-auto text-center pr-8 md:pr-0 h-10 overflow-hidden relative flex items-center justify-center">
          <div 
            className={`flex items-center justify-center transition-all duration-500 transform ${
              isExiting ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            <span className={`mr-2 ${currentNotice.color}`}><i className={currentNotice.icon}></i></span> 
            <span className="truncate max-w-[200px] sm:max-w-none">{currentNotice.text}</span>
          </div>
        </div>

        {/* Desktop Link */}
        <a href="#insights" onClick={scrollToInsights} className="absolute right-4 text-gray-400 hover:text-white transition-colors hidden sm:block">
          &rarr;
        </a>
      </div>
    </div>
  );
};

export default TopNotificationBar;