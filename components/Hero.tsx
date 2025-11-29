import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import DownloadDrawer from './DownloadDrawer';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const TickerContent = () => (
    <div className="inline-flex items-center">
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-500 font-medium">Global Cap: <span className="text-blue-600 font-bold">$3.12T</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-600">BTC <span className="text-[#059669] font-semibold">$98,420 (+1.2%)</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-600">ETH <span className="text-[#DC2626] font-semibold">$3,650 (-0.5%)</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-600">SOL <span className="text-[#059669] font-semibold">$145 (+3.1%)</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-600">USD/CNY <span className="text-gray-800 font-bold">7.24</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-600">Gas: <span className="text-[#059669] font-semibold">12 gwei</span></span>
        <span className="text-gray-300 mr-6">|</span>
    </div>
  );

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-16 md:pt-0">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-100/40 rounded-full blur-[80px] md:blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-cyan-50/60 rounded-full blur-[80px] md:blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center pb-28 md:pb-20">
        {/* Holographic Card Visual - Adjusted Scale for Mobile */}
        <div className="mb-10 md:mb-12 flex justify-center transform scale-[0.85] md:scale-100 transition-transform origin-center">
          <div className="animate-float relative w-80 h-48 sm:w-96 sm:h-56 glass-card rounded-2xl flex flex-col justify-between p-6 md:p-6 select-none cursor-default shadow-[0_20px_50px_rgba(8,112,184,0.12)] hover:shadow-[0_30px_60px_rgba(8,112,184,0.2)] transition-shadow duration-500 group border border-white/40 overflow-hidden backdrop-blur-xl">
            
            {/* Automatic Shimmer Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
                 <div className="absolute top-0 -left-[150%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-[-15deg] animate-shimmer"></div>
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-2xl font-bold text-gray-800 tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 animate-[shine_3s_ease-in-out_infinite]">PAIPAY</span>
              <span className="text-[10px] md:text-xs text-gray-400 border border-gray-200/50 px-2 py-0.5 rounded-full tracking-wider bg-white/40 backdrop-blur-md">GLOBAL PASS</span>
            </div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-7 bg-gradient-to-br from-yellow-50/80 to-yellow-100/50 rounded border border-yellow-500/20 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                     <div className="w-full h-[1px] bg-yellow-600/50 mb-1"></div>
                     <div className="w-full h-[1px] bg-yellow-600/50"></div>
                </div>
              </div>
              <div className="text-gray-400 text-lg tracking-[0.2em] font-mono group-hover:text-gray-600 transition-colors">•••• 8842</div>
            </div>
            
            <div className="relative z-10 flex justify-between items-end">
              <div className="text-left">
                <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">{t.hero.card_holder}</div>
                <div className="text-sm font-semibold text-gray-700 tracking-wide text-shadow-sm">{t.hero.card_level}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 opacity-60 shadow-inner border border-white/20"></div>
            </div>
            
            {/* Interactive Glossy effect overlay (Hover only) */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[length:200%_200%] z-20"></div>
          </div>
        </div>

        {/* Text Content - Refined Typography */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-[2.5rem] leading-[1.15] md:text-7xl font-bold tracking-tight text-gray-900 text-balance">
            {t.hero.title_line1}<br className="hidden md:block" />
            <span className="text-holo block md:inline mt-2 md:mt-0">{t.hero.title_line2}</span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-500 max-w-xl md:max-w-2xl mx-auto leading-relaxed md:leading-relaxed text-balance px-2">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 pt-8 px-6 md:px-0 w-full sm:w-auto">
            {/* START BUTTON - PURE CLEAN STYLE */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="group relative w-full sm:w-auto"
            >
              <div className="relative w-full sm:w-auto px-9 py-4 rounded-full bg-blue-600 text-white font-bold text-[15px] leading-none flex items-center justify-center gap-2 transition-all duration-300 transform hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)] shadow-[0_4px_14px_rgba(37,99,235,0.3)] active:scale-95">
                  <span className="relative z-10 flex items-center gap-2 tracking-wide">
                     {t.hero.cta_start} 
                     <i className="ri-arrow-right-line text-lg group-hover:translate-x-1 transition-transform duration-300"></i>
                  </span>
              </div>
            </button>
            
            <button className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-gray-600 border border-gray-200 font-semibold text-[15px] hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-300 active:scale-95 shadow-sm">
              {t.hero.cta_contact}
            </button>
          </div>
        </div>

        {/* Social Dock */}
        <div className="mt-16 flex flex-col items-center animate-fade-in-up">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 opacity-80">{t.nav.community}</div>
          <div className="flex items-center gap-8 bg-white/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/50 shadow-sm hover:shadow-md transition-shadow">
            <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-black transition-colors transform hover:scale-110">
              <i className="ri-twitter-x-line text-xl"></i>
            </a>
            <div className="w-px h-4 bg-gray-300/50"></div>
            <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110">
              <i className="ri-facebook-circle-fill text-xl"></i>
            </a>
            <div className="w-px h-4 bg-gray-300/50"></div>
            <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110">
              <i className="ri-telegram-fill text-xl"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Bottom Bar: Ticker */}
      <div className="absolute bottom-0 left-0 w-full glass-bar z-20 h-12 md:h-14 flex items-center border-t border-white/50">
        <div className="w-full overflow-hidden flex items-center">
          <div className="w-full overflow-hidden whitespace-nowrap mask-linear-fade">
             <div className="inline-block animate-ticker">
                {/* Changed span to div to avoid nesting issues */}
                <div className="ticker-segment inline-flex">
                   <TickerContent />
                   <TickerContent /> 
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Integrated Drawer */}
      <DownloadDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </section>
  );
};

export default Hero;