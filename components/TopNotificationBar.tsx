import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { fetchArticles } from '../utils/articleService';

interface TopNotificationBarProps {
  onNavigate?: () => void;
}

interface NoticeItem {
    icon: string;
    color: string;
    text: string;
}

const TopNotificationBar: React.FC<TopNotificationBarProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const { t } = useLanguage();
  const [displayNotices, setDisplayNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    const loadNotices = async () => {
        // 1. Initial Static Data (Fallback)
        const staticNotices = [
            { icon: 'ri-vip-crown-fill', color: 'text-yellow-400', text: t.notices.n1 },
            { icon: 'ri-briefcase-4-fill', color: 'text-cyan-400', text: t.notices.n2 },
            { icon: 'ri-shield-check-fill', color: 'text-green-400', text: t.notices.n3 }
        ];

        // 2. Fetch Dynamic Data from Supabase ('notice' stream)
        const dynamicArticles = await fetchArticles('notice');
        
        // 3. Transform Dynamic Data to UI format
        const transformedDynamic = dynamicArticles.map((article, idx) => ({
            icon: 'ri-notification-3-fill', // Using notification icon to match "System Announcement" context
            color: 'text-orange-400', // Distinct color for dynamic system notices
            text: `[NEW] ${article.title}`
        }));

        // 4. Merge: Put dynamic items first to ensure they are seen
        const merged = transformedDynamic.length > 0 ? [...transformedDynamic, ...staticNotices] : staticNotices;
        
        // Ensure we don't have too many (limit to 5)
        setDisplayNotices(merged.slice(0, 5));
    };

    loadNotices();
  }, [t.notices]);

  useEffect(() => {
    if (displayNotices.length === 0) return;

    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % displayNotices.length);
        setIsExiting(false);
      }, 500); 
    }, 5000);

    return () => clearInterval(interval);
  }, [displayNotices.length]);

  // Fallback if empty initially
  if (displayNotices.length === 0) return null;

  const currentNotice = displayNotices[currentIndex];
  
  // Requirement: System announcements must flash on the header.
  // We treat all items in this specific notification bar as system notices that trigger the flash effect.
  const isUrgent = true; 

  const handleBarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div id="top-notification-bar" className="fixed top-0 left-0 w-full h-10 bg-gray-900 z-[60] flex items-center justify-center text-white text-xs font-medium border-b border-gray-800 shadow-lg cursor-pointer hover:bg-gray-800 transition-colors" onClick={handleBarClick}>
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-center relative">
        {/* Icon & Label */}
        <div className="absolute left-4 md:left-auto md:relative md:mr-3 flex items-center">
          {/* Flashing Dot Animation for Urgent Notices */}
          <div className={`w-1.5 h-1.5 bg-[#22D3EE] rounded-full relative mr-2 ${isUrgent ? 'animate-ping' : 'animate-pulse-ring'}`}></div>
          <span className={`font-bold tracking-wider uppercase hidden sm:inline transition-colors ${isUrgent ? 'text-orange-400 animate-pulse' : 'text-cyan-400'}`}>
              SYSTEM NOTICE
          </span>
        </div>

        {/* Content Rotator - Clickable Area */}
        <div 
            className="w-full md:w-auto text-center pr-8 md:pr-0 h-10 overflow-hidden relative flex items-center justify-center group"
        >
          <div 
            className={`flex items-center justify-center transition-all duration-500 transform ${
              isExiting ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            <span className={`mr-2 ${currentNotice.color} ${isUrgent ? 'animate-pulse' : ''}`}><i className={currentNotice.icon}></i></span> 
            <span className="truncate max-w-[200px] sm:max-w-none group-hover:text-cyan-200 transition-colors font-sans">{currentNotice.text}</span>
          </div>
        </div>

        {/* Desktop Link */}
        <button className="absolute right-4 text-gray-400 hover:text-white transition-colors hidden sm:block">
          &rarr;
        </button>
      </div>
    </div>
  );
};

export default TopNotificationBar;