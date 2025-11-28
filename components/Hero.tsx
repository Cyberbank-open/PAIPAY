import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] md:min-h-[88vh] flex flex-col justify-center overflow-hidden pt-12 md:pt-0">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-100/40 rounded-full blur-[80px] md:blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-cyan-50/60 rounded-full blur-[80px] md:blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8 flex-grow flex flex-col justify-center pb-24 md:pb-20">
        {/* Holographic Card Visual */}
        <div className="mb-8 md:mb-10 flex justify-center scale-90 md:scale-100 transform transition-transform">
          <div className="animate-float relative w-72 h-44 sm:w-96 sm:h-56 glass-card rounded-2xl flex flex-col justify-between p-5 md:p-6 select-none cursor-default hover:shadow-2xl transition-shadow duration-500 group">
            <div className="flex justify-between items-start">
              <span className="text-xl md:text-2xl font-bold text-gray-800 tracking-wider">PAIPAY</span>
              <span className="text-[10px] md:text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">GLOBAL PASS</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-5 md:w-10 md:h-6 bg-yellow-400/20 rounded border border-yellow-400/50"></div>
              <div className="text-gray-300 text-base md:text-lg font-mono">•••• •••• •••• 8842</div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-left">
                <div className="text-[9px] md:text-[10px] text-gray-400 uppercase">Card Holder</div>
                <div className="text-xs md:text-sm font-medium text-gray-700">BUSINESS ELITE</div>
              </div>
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 opacity-50"></div>
            </div>
            {/* Glossy effect overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[length:200%_200%]"></div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6 leading-tight">
          下一代全球<br className="md:hidden" />
          <span className="text-holo">清算网络</span>
        </h1>
        <p className="text-base md:text-xl text-gray-500 max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4">
          基于区块链技术的混合金融架构<br />
          让您的数字资产像呼吸一样自然地流向全球
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-8 md:px-0">
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 hover:shadow-blue-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            开始体验
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-gray-700 border border-gray-200 font-medium text-base hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
            联系企业顾问
          </button>
        </div>

        {/* Social Dock */}
        <div className="mt-10 flex flex-col items-center animate-fade-in-up">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Join Our Community</div>
          <div className="flex items-center gap-6 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-white/60 shadow-sm">
            <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-black transition-colors transform hover:scale-110">
              <i className="ri-twitter-x-line text-xl"></i>
            </a>
            <div className="w-px h-4 bg-gray-300"></div>
            <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110">
              <i className="ri-facebook-circle-fill text-xl"></i>
            </a>
            <div className="w-px h-4 bg-gray-300"></div>
            <a href="#!" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110">
              <i className="ri-telegram-fill text-xl"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Bottom Bar: Ticker */}
      <div className="absolute bottom-0 left-0 w-full glass-bar z-20 h-12 md:h-14 flex items-center">
        <div className="w-full overflow-hidden flex items-center">
          <div className="w-full overflow-hidden whitespace-nowrap mask-linear-fade">
             <div className="inline-block animate-ticker">
                <span className="ticker-segment">
                   <TickerContent />
                   <TickerContent /> 
                </span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TickerContent = () => (
    <div className="inline-flex items-center">
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide text-gray-500 font-semibold">Global Cap: <span className="text-blue-600 font-bold">$3.12T</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide">BTC <span className="text-[#00C853]">$98,420 (+1.2%)</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide">ETH <span className="text-[#FF3D00]">$3,650 (-0.5%)</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide">SOL <span className="text-[#00C853]">$145 (+3.1%)</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide">USD/CNY <span className="text-gray-800">7.24</span></span>
        <span className="text-gray-300">|</span>
        <span className="px-6 text-xs md:text-sm font-mono tracking-wide">Gas: <span className="text-[#00C853]">12 gwei</span></span>
        <span className="text-gray-300 mr-6">|</span>
    </div>
)

export default Hero;