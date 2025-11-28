import React from 'react';

const stats = [
  { value: '150', suffix: '+', label: '覆盖国家/地区' },
  { value: 'T+0', suffix: '', label: '毫秒级清算标准' },
  { value: '100', suffix: '+', label: '原生币种账户' },
];

const TrustStats: React.FC = () => {
  return (
    <section className="py-12 md:py-16 border-b border-gray-50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="py-6 md:py-0 group">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {stat.value}<span className="text-2xl align-top">{stat.suffix}</span>
              </div>
              <div className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStats;