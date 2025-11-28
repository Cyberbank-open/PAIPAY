import React from 'react';

const Developers: React.FC = () => {
  return (
    <section id="developers" className="py-16 md:py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">几行代码，连接世界。</h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-10">
          为开发者设计的极简 API。无论是电商结账还是批量发薪，5分钟即可完成集成。
        </p>
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto text-left font-mono text-xs shadow-2xl border border-gray-700 overflow-x-auto">
          <div className="flex gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <pre className="text-xs font-mono">
            <span className="text-blue-400">const</span> <span className="text-white">paipay</span> = <span className="text-blue-400">require</span>(<span className="text-green-400">'paipay-sdk'</span>);{'\n\n'}
            <span className="text-gray-400">// Initialize Transaction</span>{'\n'}
            <span className="text-purple-400">await</span> paipay.transfer({'{'}{'\n'}
            {'  '}amount: <span className="text-orange-400">1000</span>,{'\n'}
            {'  '}currency: <span className="text-green-400">'USD'</span>,{'\n'}
            {'  '}recipient: <span className="text-green-400">'user_123'</span>,{'\n'}
            {'  '}method: <span className="text-green-400">'instant'</span>{'\n'}
            {'}'});
          </pre>
        </div>
        <div className="mt-10">
          <button className="text-white border border-gray-600 px-6 py-2 rounded hover:bg-white hover:text-gray-900 transition-colors text-sm">
            查看 API 文档
          </button>
        </div>
      </div>
    </section>
  );
};

export default Developers;