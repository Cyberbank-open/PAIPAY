import React from 'react';
import { useLanguage } from './LanguageContext';

const Features: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">{t.features.title}</h2>
          <p className="text-gray-500 text-sm md:text-base tracking-wide max-w-2xl mx-auto text-balance">{t.features.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Feature 1 */}
          <div className="flex flex-col h-full glass-card hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] hover:border-blue-200/50 hover:-translate-y-2 rounded-3xl p-8 md:p-10 transition-all duration-500 group cursor-default relative overflow-hidden bg-white/40">
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 w-16 h-16 bg-blue-50/80 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-500">
              <i className="ri-earth-line"></i>
            </div>
            <h3 className="relative z-10 text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight group-hover:text-blue-700 transition-colors">{t.features.card1_title}</h3>
            <p className="relative z-10 text-gray-500 leading-relaxed text-[15px] flex-grow text-balance group-hover:text-gray-600 transition-colors">
              {t.features.card1_desc}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col h-full glass-card hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.1)] hover:border-cyan-200/50 hover:-translate-y-2 rounded-3xl p-8 md:p-10 transition-all duration-500 group cursor-default relative overflow-hidden bg-white/40">
             <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 w-16 h-16 bg-cyan-50/80 rounded-2xl flex items-center justify-center text-cyan-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-cyan-200 transition-all duration-500">
              <i className="ri-exchange-dollar-line"></i>
            </div>
            <h3 className="relative z-10 text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight group-hover:text-cyan-700 transition-colors">{t.features.card2_title}</h3>
            <p className="relative z-10 text-gray-500 leading-relaxed text-[15px] flex-grow text-balance group-hover:text-gray-600 transition-colors">
              {t.features.card2_desc}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col h-full glass-card hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)] hover:border-indigo-200/50 hover:-translate-y-2 rounded-3xl p-8 md:p-10 transition-all duration-500 group cursor-default relative overflow-hidden bg-white/40">
             <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 w-16 h-16 bg-indigo-50/80 rounded-2xl flex items-center justify-center text-indigo-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-500">
              <i className="ri-safe-2-line"></i>
            </div>
            <h3 className="relative z-10 text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight group-hover:text-indigo-700 transition-colors">{t.features.card3_title}</h3>
            <p className="relative z-10 text-gray-500 leading-relaxed text-[15px] flex-grow text-balance group-hover:text-gray-600 transition-colors">
              {t.features.card3_desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;