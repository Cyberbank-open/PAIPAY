import React from 'react';

const Developers: React.FC = () => {
  return (
    <section id="developers" className="py-20 md:py-32 bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/80">几行代码，连接世界</h2>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12 text-balance leading-relaxed">
          为开发者设计的极简 API，无论是电商结账还是批量发薪，5分钟即可完成集成
        </p>
        
        <div className="bg-[#0F172A]/80 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-2xl mx-auto text-left font-mono text-xs md:text-sm shadow-2xl border border-gray-800/50 overflow-x-auto relative group hover:border-blue-500/30 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
          
          <div className="flex gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <pre className="font-mono leading-relaxed relative z-10">
            <span className="text-blue-400">const</span> <span className="text-white">paipay</span> = <span className="text-blue-400">require</span>(<span className="text-green-400">'paipay-sdk'</span>);{'\n\n'}
            <span className="text-gray-500">// Initialize Transaction</span>{'\n'}
            <span className="text-purple-400">await</span> paipay.transfer({'{'}{'\n'}
            {'  '}amount: <span className="text-orange-400">1000</span>,{'\n'}
            {'  '}currency: <span className="text-green-400">'USD'</span>,{'\n'}
            {'  '}recipient: <span className="text-green-400">'user_123'</span>,{'\n'}
            {'  '}method: <span className="text-green-400">'instant'</span>{'\n'}
            {'}'});
          </pre>
        </div>
        
        <div className="mt-14">
          <button className="relative group px-8 py-3 bg-white text-gray-900 rounded-lg text-sm font-bold tracking-wide overflow-hidden transition-all hover:text-blue-700">
             <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
             <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
             <span className="relative z-10 flex items-center gap-2">
                查看 API 文档
                <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
             </span>
             {/* Glow effect */}
             <div className="absolute -inset-2 bg-white/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Developers;