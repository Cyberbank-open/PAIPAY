import React, { useState } from 'react';
import { useLanguage, NoticeCategory } from './LanguageContext';
import { PageView } from '../App';

interface NoticeHubProps {
  onNavigate: (view: PageView, articleId?: string, articleType?: 'market' | 'notice') => void;
}

const NoticeHub: React.FC<NoticeHubProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<NoticeCategory>('all');

  const filteredItems = activeCategory === 'all' 
    ? t.insights.notice_items 
    : t.insights.notice_items.filter(item => item.category === activeCategory);

  const categories: NoticeCategory[] = ['all', 'system', 'maintenance', 'feature'];

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Dark Header Section */}
      <div className="bg-gray-900 border-b border-gray-800 py-16 md:py-20 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
           {/* Breadcrumb / Mode Switcher */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate('home')}>{t.nav.back_home}</span>
                <span>/</span>
                <span className="text-cyan-400">{t.insights.tab_notice}</span>
            </div>

            {/* Hub Switcher Pill (Dark Mode Version) */}
            <div className="flex p-1 bg-gray-800 rounded-lg self-start md:self-auto border border-gray-700">
                <button 
                    onClick={() => onNavigate('market_hub')}
                    className="px-4 py-1.5 rounded-md text-gray-400 hover:text-white text-xs font-medium transition-all"
                >
                    {t.insights.tab_market}
                </button>
                <button 
                    className="px-4 py-1.5 rounded-md bg-gray-700 text-white shadow-sm text-xs font-bold transition-all"
                >
                    {t.insights.tab_notice}
                </button>
            </div>
          </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">{t.insights.notice_title}</h1>
            <p className="text-gray-400 max-w-xl text-lg leading-relaxed">{t.insights.notice_description}</p>
        </div>
      </div>

       {/* Filter Bar (Sticky) */}
       <div className="sticky top-16 z-20 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-3 min-w-max">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden md:inline-block">Filter by:</span>
                  {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${
                            activeCategory === cat 
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
                        }`}
                      >
                          {t.insights.categories.notice[cat]}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
         {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <p>No notices found in this category.</p>
            </div>
         ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 md:ml-0 pl-8 md:pl-12 space-y-12">
                {filteredItems.map((item) => (
                    <div key={item.id} className="relative group cursor-pointer" onClick={() => onNavigate('article_detail', item.id, 'notice')}>
                        {/* Timeline Dot */}
                        <div className="absolute -left-[43px] md:-left-[59px] top-6 w-6 h-6 rounded-full bg-white border-4 border-gray-100 group-hover:border-blue-200 transition-colors z-10 flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${item.category === 'maintenance' ? 'bg-orange-400' : (item.category === 'feature' ? 'bg-green-500' : 'bg-blue-500')}`}></div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                                <div className="flex gap-2">
                                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wide">
                                        {t.insights.categories.notice[item.category as NoticeCategory]}
                                    </span>
                                    {item.tag && (
                                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wide border ${item.category === 'maintenance' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {item.tag}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                    <i className="ri-time-line"></i> {item.date}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {item.summary}
                            </p>
                            <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
                                {t.insights.read_more} <i className="ri-arrow-right-line ml-2"></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default NoticeHub;