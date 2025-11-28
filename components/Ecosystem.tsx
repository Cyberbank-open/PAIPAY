import React from 'react';

const partners = [
  'Citi', 'J.P. Morgan', 'HSBC', 'Barclays',
  'DBS', 'Mizuho', 'ICBC',
  'ABA Bank', 'ACLEDA', 'Wing',
  'Visa', 'Mastercard', 'UnionPay', 'SWIFT', 'Bakong'
];

const Ecosystem: React.FC = () => {
  return (
    <section id="ecosystem" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">由全球顶级金融机构提供流动性支持</h3>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
            连接国际一级银行、本地清算巨头与卡组织，构建稳如磐石的支付网络。
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-6 md:gap-12 items-center justify-items-center opacity-90">
          {partners.map((name, index) => (
            <div 
              key={index} 
              className={`text-lg md:text-xl font-bold cursor-default transition-all duration-300 text-[#8E9BAE] hover:text-[#333333] hover:drop-shadow-[0_0_15px_rgba(74,84,241,0.3)]
                ${name === 'Citi' ? 'font-serif' : ''}
                ${name === 'HSBC' ? 'font-serif tracking-wide' : ''}
                ${name === 'Visa' ? 'italic text-xl md:text-2xl' : ''}
                ${name === 'SWIFT' ? 'font-mono tracking-widest text-base md:text-lg' : ''}
                ${name === 'Barclays' ? 'text-blue-900/40' : ''}
              `}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;