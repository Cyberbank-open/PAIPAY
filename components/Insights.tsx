import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const Insights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'notice'>('market');

  return (
    <section id="insights" className="pt-12 pb-20 md:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">市场情报与深度洞察</h2>
          <p className="text-sm md:text-base text-gray-500 mt-2">掌握全球加密资产与外汇流动趋势。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Interactive Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button 
              onClick={() => setActiveTab('market')} 
              className={`px-5 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'market' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              市场数据
            </button>
            <button 
              onClick={() => setActiveTab('notice')} 
              className={`px-5 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'notice' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              系统公告
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
                  <h4 className="font-bold text-gray-800 text-sm md:text-base">全球数字货币总市值 (Global Crypto Cap)</h4>
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
            
            {/* Reports Column */}
            <div className="space-y-4">
              <div className="glass-card p-4 md:p-5 rounded-xl border-l-4 border-transparent hover:border-blue-500 cursor-pointer transition-all">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">INSIGHT</div>
                <h5 className="font-bold text-gray-800 text-sm mb-1">2025 跨境支付白皮书</h5>
                <p className="text-xs text-gray-500 line-clamp-2">深度解析混合金融架构如何重塑东南亚支付走廊，以及混合金融的崛起...</p>
              </div>
              <div className="glass-card p-4 md:p-5 rounded-xl border-l-4 border-transparent hover:border-blue-500 cursor-pointer transition-all">
                <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wide mb-1">MARKET</div>
                <h5 className="font-bold text-gray-800 text-sm mb-1">汇率周报：美元指数波动分析</h5>
                <p className="text-xs text-gray-500 line-clamp-2">本周 DXY 震荡上行，建议出口型企业锁定远期汇率以规避风险...</p>
              </div>
            </div>
          </div>
        )}

        {/* Notice Tab */}
        {activeTab === 'notice' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">SYSTEM</span>
                <span className="text-xs text-gray-400">2h ago</span>
              </div>
              <h5 className="font-bold text-gray-800 mb-2 text-sm">新增 PromptPay 泰国秒付通道</h5>
              <p className="text-xs text-gray-600 leading-relaxed">系统已完成与泰国国家支付网关的对接升级，现在支持 THB 单笔最高 200万 实时到账。</p>
            </div>
             <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">MAINTENANCE</span>
                <span className="text-xs text-gray-400">1d ago</span>
              </div>
              <h5 className="font-bold text-gray-800 mb-2 text-sm">Solana 节点升级公告</h5>
              <p className="text-xs text-gray-600 leading-relaxed">预计于 2025-05-20 UTC 02:00 进行节点升级，期间 SOL 链上充提将暂停约 30 分钟。</p>
            </div>
             <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">FEATURE</span>
                <span className="text-xs text-gray-400">3d ago</span>
              </div>
              <h5 className="font-bold text-gray-800 mb-2 text-sm">API V2.1 现已可用</h5>
              <p className="text-xs text-gray-600 leading-relaxed">新增了批量转账查询接口与 Webhook 重试机制，请开发者及时查阅最新文档。</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Insights;