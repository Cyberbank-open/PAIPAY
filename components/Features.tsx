import React from 'react';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">全场景金融解决方案</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">为个人与企业打造的无缝支付体验</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Feature 1 */}
          <div className="glass-card hover:shadow-[0_12px_40px_0_rgba(74,84,241,0.2)] hover:border-blue-500/30 hover:-translate-y-0.5 rounded-2xl p-6 md:p-8 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:scale-110 transition-transform"><i className="ri-earth-line"></i></div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">无界支付</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              打破地理边界。通过全球银行网络，实现资金在150+国家的无障碍流转。支持本地清算系统直连。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card hover:shadow-[0_12px_40px_0_rgba(74,84,241,0.2)] hover:border-blue-500/30 hover:-translate-y-0.5 rounded-2xl p-6 md:p-8 transition-all duration-300 group">
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 text-2xl mb-6 group-hover:scale-110 transition-transform"><i className="ri-exchange-dollar-line"></i></div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">透明汇率</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              智能路由引擎自动寻找最优汇率。拒绝隐形汇损，每一分钱的兑换成本都清晰可见。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card hover:shadow-[0_12px_40px_0_rgba(74,84,241,0.2)] hover:border-blue-500/30 hover:-translate-y-0.5 rounded-2xl p-6 md:p-8 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:scale-110 transition-transform"><i className="ri-safe-2-line"></i></div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">原生安全</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              企业级多签钱包与组织治理架构。私钥分片技术保障资金绝对主权，支持复杂的企业审批流。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;