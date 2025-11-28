import React, { useState } from 'react';

const faqs = [
  {
    question: "PAIPAY 支持哪些国家和货币？",
    answer: "PAIPAY 目前覆盖全球 150+ 个国家和地区，支持 100+ 种原生法币账户以及主流加密货币（如 BTC, ETH, USDT 等）的实时清算。"
  },
  {
    question: "资金安全如何保障？",
    answer: "我们采用银行级安全标准，持有 ISO 27001 认证及 PCI-DSS L1 牌照。核心资产通过多签钱包与私钥分片技术进行管理，确保资金绝对主权。"
  },
  {
    question: "企业接入 API 需要多久？",
    answer: "我们的 API 设计极简，通常开发者可在 1-3 天内完成沙箱测试与生产环境部署。您可以查看我们的开发者文档获取详细的 SDK 指引。"
  },
  {
    question: "跨境转账的费率是多少？",
    answer: "我们采用透明汇率机制，智能路由引擎会自动寻找最优汇率。基础费率极具竞争力，无任何隐形汇损。具体费率请联系企业顾问获取定制方案。"
  },
  {
    question: "是否支持个人用户注册？",
    answer: "是的，PAIPAY 同时服务于个人与企业用户。个人用户可以通过下载 App 体验无界支付与全球转账功能。"
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-white border-t border-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">常见问题</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">关于产品、安全与集成的解答</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-xl transition-all duration-300 ${openIndex === index ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'border-gray-100 hover:border-blue-100'}`}
            >
              <button
                className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`font-medium ${openIndex === index ? 'text-blue-700' : 'text-gray-800'}`}>
                  {faq.question}
                </span>
                <span className={`transform transition-transform duration-300 text-gray-400 ${openIndex === index ? 'rotate-180 text-blue-500' : ''}`}>
                  <i className="ri-arrow-down-s-line text-xl"></i>
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-4 md:p-5 pt-0 text-sm md:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;