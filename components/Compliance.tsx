import React from 'react';

const badges = [
  { icon: 'ri-shield-check-line', label: 'Certified', value: 'ISO 27001' },
  { icon: 'ri-global-line', label: 'Standard', value: 'ISO 20022' },
  { icon: 'ri-lock-password-line', label: 'Security', value: 'PCI-DSS L1' },
  { icon: 'ri-government-line', label: 'License', value: 'US MSB' },
];

const Compliance: React.FC = () => {
  return (
    <section className="py-12 bg-[#F9FAFB] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-gray-900">全球标准，原生合规</h4>
            <p className="text-sm text-gray-500 mt-1">每一笔交易都受到最高级别的合规审计与安全保护。</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="bg-gradient-to-br from-[#F3F4F6] to-[#FFFFFF] border border-[#E5E7EB] text-[#9CA3AF] px-3 py-2 md:px-4 rounded-md text-xs font-semibold flex items-center gap-2 cursor-help group shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)] hover:border-[#10B981] hover:text-[#374151] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300">
                <i className={`${badge.icon} text-lg`}></i>
                <div>
                  <div className="text-[10px] uppercase text-gray-400 group-hover:text-green-600 transition-colors">{badge.label}</div>
                  {badge.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Compliance;