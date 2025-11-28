import React from 'react';

const Lifestyle: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
        <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-12">
        {/* Text Section */}
        <div className="md:w-1/2 space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-xs">Lifestyle Integration</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-gray-900 leading-[1.2] tracking-tight text-balance">
              工作在 Web3<br />生活在现实
            </h2>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed text-balance pt-2">
              无论您是巴厘岛的数字游民，还是义乌的跨国贸易商，PAIPAY 消除了一切技术冷感。没有复杂的链上操作，只有资金到账时清脆的提示音。
            </p>
          </div>
          
          <div className="space-y-4 pt-2 inline-block text-left">
            <div className="flex items-center gap-3 text-gray-700 bg-white/50 px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0"><i className="ri-check-line"></i></span>
              <span className="text-sm font-medium">法币与加密货币双向无感兑换</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 bg-white/50 px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0"><i className="ri-check-line"></i></span>
              <span className="text-sm font-medium">支持 Visa/Mastercard 全球消费</span>
            </div>
          </div>
        </div>
        
        {/* Simulated App UI Scenario */}
        <div className="md:w-1/2 flex justify-center relative w-full mt-8 md:mt-0">
          {/* Notification Bubble - Optimized Position */}
          <div className="absolute top-8 md:top-10 -right-2 md:right-12 z-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3 md:p-4 border border-white flex items-center gap-3 w-60 md:w-64">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-inner"><i className="ri-money-dollar-circle-fill text-xl"></i></div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium">刚刚</div>
                <div className="font-bold text-gray-800 text-sm md:text-base tracking-tight">+ 5,000.00 USDT</div>
                <div className="text-[10px] text-green-600 font-medium">Payment Received</div>
              </div>
            </div>
          </div>

          {/* Phone Frame Sim */}
          <div className="w-[280px] md:w-[320px] h-[500px] md:h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl relative border-[6px] border-gray-800 mx-auto ring-1 ring-gray-950/50">
            {/* Side Buttons */}
            <div className="absolute top-24 -right-2 w-1 h-12 bg-gray-800 rounded-r-lg"></div>
            <div className="absolute top-24 -left-2 w-1 h-8 bg-gray-800 rounded-l-lg"></div>
            <div className="absolute top-36 -left-2 w-1 h-12 bg-gray-800 rounded-l-lg"></div>

            <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative flex flex-col">
              {/* App Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 h-36 p-6 text-white relative flex-shrink-0">
                <div className="text-xs opacity-80 mb-2 font-medium tracking-wide">Total Balance</div>
                <div className="text-3xl font-bold tracking-tight">$ 24,592.80</div>
                
                {/* Action Bar */}
                <div className="absolute bottom-[-24px] left-5 right-5 h-14 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-around text-gray-600 z-10">
                  <div className="flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer hover:text-blue-600 transition-colors group">
                    <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors"><i className="ri-download-line text-sm"></i></div>
                    Receive
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer hover:text-blue-600 transition-colors group">
                     <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors"><i className="ri-upload-line text-sm"></i></div>
                    Send
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[10px] font-medium cursor-pointer hover:text-blue-600 transition-colors group">
                     <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors"><i className="ri-exchange-line text-sm"></i></div>
                    Swap
                  </div>
                </div>
              </div>

              {/* App Body */}
              <div className="mt-10 px-5 flex-grow overflow-y-auto scrollbar-hide pb-6 pt-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Activity</div>
                
                <div className="space-y-3">
                    {/* Bitcoin Item */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm"><i className="ri-btc-fill text-lg"></i></div>
                        <div>
                        <div className="text-sm font-bold text-gray-800">Bitcoin</div>
                        <div className="text-[10px] text-gray-500">Network Transfer</div>
                        </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">- 0.05 BTC</div>
                    </div>

                    {/* Ethereum Item */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm"><i className="ri-eth-fill text-lg"></i></div>
                        <div>
                        <div className="text-sm font-bold text-gray-800">Ethereum</div>
                        <div className="text-[10px] text-gray-500">Received</div>
                        </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">+ 1.25 ETH</div>
                    </div>

                    {/* USDT Item */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-sm"><i className="ri-money-dollar-circle-line text-lg"></i></div>
                        <div>
                        <div className="text-sm font-bold text-gray-800">Tether</div>
                        <div className="text-[10px] text-gray-500">Merchant Pay</div>
                        </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">- 250.00 USDT</div>
                    </div>
                    
                    {/* TRX Item */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-sm"><span className="font-bold text-[10px]">TRX</span></div>
                            <div>
                                <div className="text-sm font-bold text-gray-800">TRON</div>
                                <div className="text-[10px] text-gray-500">Gas Fee</div>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">- 15.00 TRX</div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Lifestyle;