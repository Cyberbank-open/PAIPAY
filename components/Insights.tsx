import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage, Article } from './LanguageContext';
import { PageView } from '../App';
import { fetchArticles } from '../utils/articleService';

const data = [
  { month: 'Jan', value: 1.8 },
  { month: 'Feb', value: 2.1 },
  { month: 'Mar', value: 2.4 },
  { month: 'Apr', value: 2.3 },
  { month: 'May', value: 2.5 },
  { month: 'Jun', value: 2.4 },
  { month: 'Jul', value: 2.6 },
  { month: 'Aug', value: 2.8 },
  { month: 'Sep', value: 2.9 },
  { month: 'Oct', value: 3.0 },
  { month: 'Nov', value: 3.12 },
  { month: 'Dec', value: 3.25 },
];

interface InsightsProps {
  onNavigate: (view: PageView, articleId?: string, articleType?: 'market' | 'notice') => void;
}

const Insights: React.FC<InsightsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'notice'>('market');
  const { t } = useLanguage();
  
  // State for dynamic content
  const [displayMarket, setDisplayMarket] = useState<Article[]>([]);
  const [displayNotices, setDisplayNotices] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        // Fetch dynamic content from Supabase
        const marketData = await fetchArticles('market');
        const noticeData = await fetchArticles('notice');

        // Merge with static data (Dynamic first)
        // Ensure that if fetch fails (returns empty), static data is still used.
        const combinedMarket = [...marketData, ...t.insights.market_items];
        const combinedNotices = [...noticeData, ...t.insights.notice_items];

        // Slice for display (Market: 2 items, Notice: 3 items)
        setDisplayMarket(combinedMarket.slice(0, 2));
        setDisplayNotices(combinedNotices.slice(0, 3));
        setLoading(false);
    };
    loadData();
  }, [t.insights.market_items, t.insights.notice_items]);

  return (
    <section id="insights" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.insights.title}</h2>
          <p className="text-sm md:text-base text-gray-500 mt-2">{t.insights.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Interactive Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button 
              onClick={() => setActiveTab('market')} 
              className={`px-5 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'market' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.insights.tab_market}
            </button>
            <button 
              onClick={() => setActiveTab('notice')} 
              className={`px-5 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'notice' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.insights.tab_notice}
            </button>
          </div>
        </div>

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm md:text-base">{t.insights.chart_title}</h4>
                  <div className="text-[10px] text-gray-400">Source: CoinGecko API Integration</div>
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">$3.12 T</div>
                  <div className="text-xs text-green-500">▲ 2.4% (24h)</div>
                </div>
              </div>
              
              <div className="w-full h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4A54F1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4A54F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                      itemStyle={{ color: '#4A54F1' }}
                      formatter={(value: number) => [`$${value} T`, 'Cap']}
                    />
                    <XAxis dataKey="month" hide />
                    <YAxis hide domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4A54F1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Reports Column - Dynamic */}
            <div className="flex flex-col gap-4">
              {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
              ) : (
                displayMarket.map((item) => (
                    <div 
                    key={item.id}
                    onClick={() => onNavigate('article_detail', item.id, 'market')}
                    className="glass-card p-4 md:p-5 rounded-xl border-l-4 border-transparent hover:border-blue-500 cursor-pointer transition-all flex-1"
                    >
                    <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{item.tag}</div>
                        {/* Flash dot for recent items (assuming id length > 5 indicates DB item) */}
                        {item.id.length > 5 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>}
                    </div>
                    <h5 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{item.title}</h5>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
                    </div>
                ))
              )}
              
              <button 
                onClick={() => onNavigate('market_hub')}
                className="mt-auto w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                {t.insights.view_all}
              </button>
            </div>
          </div>
        )}

        {/* Notice Tab */}
        {activeTab === 'notice' && (
          <div className="animate-fade-in">
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayNotices.map((item, index) => {
                    const colors = [
                    { border: 'bg-blue-500', bg: 'bg-blue-50/50', badge_bg: 'bg-blue-100', badge_text: 'text-blue-700' },
                    { border: 'bg-orange-400', bg: 'bg-gray-50/50', badge_bg: 'bg-orange-100', badge_text: 'text-orange-700' },
                    { border: 'bg-green-500', bg: 'bg-gray-50/50', badge_bg: 'bg-green-100', badge_text: 'text-green-700' },
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                    <div 
                        key={item.id}
                        onClick={() => onNavigate('article_detail', item.id, 'notice')}
                        className={`${color.bg} p-6 rounded-xl border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer`}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.border}`}></div>
                        <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 ${color.badge_bg} ${color.badge_text} text-[10px] font-bold rounded`}>{item.tag}</span>
                        <span className="text-xs text-gray-400">{item.date}</span>
                        </div>
                        <h5 className="font-bold text-gray-800 mb-2 text-sm line-clamp-1">{item.title}</h5>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{item.summary}</p>
                    </div>
                    );
                })}
                </div>
            )}
            
            <div className="flex justify-center">
               <button 
                  onClick={() => onNavigate('notice_hub')}
                  className="px-8 py-3 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-bold shadow-sm hover:shadow-md hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  {t.insights.view_all}
                </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Insights;