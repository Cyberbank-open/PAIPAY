
import React, { useState, useEffect } from 'react';
import { useLanguage, MarketCategory, Article } from './LanguageContext';
import { PageView } from '../App';
import { fetchArticles } from '../utils/articleService';

interface MarketHubProps {
  onNavigate: (view: PageView, articleId?: string, articleType?: 'market' | 'notice') => void;
}

const MarketHub: React.FC<MarketHubProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('all');
  const [dbArticles, setDbArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch articles on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchArticles('market');
      setDbArticles(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Combine DB articles with static content
  // DB articles come first
  const allArticles = [...dbArticles, ...t.insights.market_items];

  const filteredItems = activeCategory === 'all' 
    ? allArticles 
    : allArticles.filter(item => item.category === activeCategory);

  const categories: MarketCategory[] = ['all', 'analysis', 'trend', 'report'];

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Header Section */}
      <div className="bg-gray-50 border-b border-gray-100 py-16 md:py-20 relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb / Mode Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => onNavigate('home')}>{t.nav.back_home}</span>
                <span>/</span>
                <span className="text-blue-600">{t.insights.tab_market}</span>
            </div>

            {/* Hub Switcher Pill */}
            <div className="flex p-1 bg-gray-200/50 rounded-lg self-start md:self-auto">
                <button 
                    className="px-4 py-1.5 rounded-md bg-white text-gray-900 shadow-sm text-xs font-bold transition-all"
                >
                    {t.insights.tab_market}
                </button>
                <button 
                    onClick={() => onNavigate('notice_hub')}
                    className="px-4 py-1.5 rounded-md text-gray-500 hover:text-gray-900 text-xs font-medium transition-all"
                >
                    {t.insights.tab_notice}
                </button>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">{t.insights.title}</h1>
          <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">{t.insights.description}</p>
        </div>
      </div>

      {/* Filter Bar (Sticky) */}
      <div className="sticky top-16 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
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
                          {/* Try to translate category, fallback to raw string for dynamic categories */}
                          {t.insights.categories.market[cat] || cat}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {isLoading ? (
           <div className="flex justify-center py-20">
               <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
           </div>
        ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <p>No articles found in this category.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
                <div 
                key={item.id} 
                onClick={() => onNavigate('article_detail', item.id, 'market')}
                className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl transition-all duration-500 hover:-translate-y-1"
                >
                <div className="aspect-[16/10] bg-gray-100 rounded-2xl mb-6 relative overflow-hidden shadow-sm">
                    {item.image_url ? (
                        <>
                            {item.image_url.includes('.mp4') || item.image_url.includes('googleusercontent') ? (
                                <video 
                                    src={item.image_url} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    muted 
                                    loop 
                                    autoPlay 
                                    playsInline
                                />
                            ) : (
                                <img 
                                    src={item.image_url} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            )}
                        </>
                    ) : (
                         /* Abstract placeholder visual if no image */
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-gray-100 group-hover:scale-105 transition-transform duration-700"></div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-gray-900 rounded-full border border-gray-100 shadow-sm uppercase tracking-wide">
                             {/* Try to translate category, fallback to raw string for dynamic categories */}
                            {t.insights.categories.market[item.category as MarketCategory] || item.category}
                        </span>
                    </div>

                    {/* Tag Badge */}
                    <div className="absolute bottom-4 left-4">
                         <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">
                             #{item.tag}
                         </span>
                    </div>
                </div>
                
                <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {item.summary}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-gray-900 group-hover:text-blue-600 transition-colors">{t.insights.read_more}</span>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <i className="ri-arrow-right-line"></i>
                        </div>
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

export default MarketHub;
