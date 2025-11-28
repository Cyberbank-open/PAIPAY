import React from 'react';

const Lifestyle: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6 text-center md:text-left">
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-xs md:text-sm">Lifestyle</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">工作在 Web3<br />生活在现实</h2>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">
            无论您是巴厘岛的数字游民，还是义乌的跨国贸易商，PAIPAY 消除了一切技术冷感。没有复杂的链上操作，只有资金到账时清脆的提示音。
          </p>
          <div className="space-y-3 pt-4 inline-block text-left">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs"><i className="ri-check-line"></i></span>
              <span className="text-sm">法币与加密货币双向无感兑换</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs"><i className="ri-check-line"></i></span>
              <span className="text-sm">支持 Visa/Mastercard 全球消费</span>
            </div>
          </div>
        </div>
        
        {/* Simulated App UI Scenario */}
        <div className="md:w-1/2 flex justify-center relative w-full">
          {/* Notification Bubble */}
          <div className="absolute top-10 right-0 md:right-20 z-20 animate-float" style={{ animationDelay: '1s' }}>
            <div className="bg-white/90 backdrop-blur rounded-xl shadow-xl p-3 md:p-4 border border-white flex items-center gap-3 w-56 md:w-64">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><i className="ri-money-dollar-circle-fill text-xl"></i></div>
              <div>
                <div className="text-xs text-gray-400">刚刚</div>
                <div className="font-semibold text-gray-800 text-sm md:text-base">+ 5,000.00 USDT</div>
                <div className="text-[10px] text-green-600">Payment Received</div>
              </div>
            </div>
          </div>

          {/* Phone Frame Sim */}
          <div className="w-64 md:w-72 h-[450px] md:h-[500px] bg-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-3 shadow-2xl relative border-4 border-gray-800 mx-auto">
            <div className="w-full h-full bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative">
              {/* App Header */}
              <div className="bg-blue-600 h-32 p-6 text-white relative">
                <div className="text-xs opacity-80 mb-1">Total Balance</div>
                <div className="text-3xl font-bold">$ 24,592.80</div>
                <div className="absolute bottom-[-20px] left-4 right-4 h-12 bg-white rounded-lg shadow-lg flex items-center justify-around text-gray-600">
                  <div className="flex flex-col items-center gap-1 text-[10px] cursor-pointer hover:text-blue-600"><i className="ri-download-line text-base"></i>Receive</div>
                  <div className="flex flex-col items-center gap-1 text-[10px] cursor-pointer hover:text-blue-600"><i className="ri-upload-line text-base"></i>Send</div>
                  <div className="flex flex-col items-center gap-1 text-[10px] cursor-pointer hover:text-blue-600"><i className="ri-exchange-line text-base"></i>Swap</div>
                </div>
              </div>
              {/* App Body */}
              <div className="mt-10 px-4 space-y-3 overflow-y-auto h-[calc(100%-8rem)] scrollbar-hide pb-4">
                <div className="text-[10px] font-semibold text-gray-400 uppercase">Recent Activity</div>
                
                {/* List Items */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><i className="ri-btc-fill"></i></div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Bitcoin</div>
                      <div className="text-[10px] text-gray-400">Network Transfer</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-red-500">- 0.05 BTC</div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><i className="ri-eth-fill"></i></div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Ethereum</div>
                      <div className="text-[10px] text-gray-400">Received</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-green-500">+ 1.25 ETH</div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><i className="ri-money-dollar-circle-line"></i></div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Tether (USDT)</div>
                      <div className="text-[10px] text-gray-400">Merchant Pay</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-900">- 250.00 USDT</div>
                </div>
                
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><span className="font-bold text-[10px]">TRX</span></div>
                        <div>
                            <div className="text-xs font-medium text-gray-800">TRON</div>
                            <div className="text-[10px] text-gray-400">Gas Fee</div>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-900">- 15.00 TRX</div>
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