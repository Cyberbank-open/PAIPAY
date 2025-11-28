import React from 'react';
import { useLanguage } from './LanguageContext';

const Compliance: React.FC = () => {
  const { t } = useLanguage();

  const badges = [
    { icon: 'ri-shield-check-line', label: t.compliance.certified, value: 'ISO 27001', url: 'https://www.iso.org/isoiec-27001-information-security.html' },
    { icon: 'ri-global-line', label: t.compliance.standard, value: 'ISO 20022', url: 'https://www.iso20022.org/' },
    { icon: 'ri-lock-password-line', label: t.compliance.security, value: 'PCI-DSS L1', url: 'https://www.pcisecuritystandards.org/' },
    { icon: 'ri-government-line', label: t.compliance.license, value: 'US MSB', url: 'https://www.fincen.gov/money-services-business-definition' },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F9FAFB] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-gray-900">{t.compliance.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{t.compliance.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
            {badges.map((badge, idx) => (
              <a 
                key={idx} 
                href={badge.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative h-full min-h-[64px] w-full bg-white border border-gray-200/60 px-4 py-3 rounded-lg flex items-center justify-start gap-3 cursor-pointer group shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:border-green-500/30 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Hover Highlight Effect */}
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                <i className={`${badge.icon} text-xl text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0 relative z-10`}></i>
                <div className="text-left leading-none flex-grow relative z-10">
                  <div className="text-[10px] uppercase text-gray-400 font-medium group-hover:text-green-600 transition-colors mb-1 tracking-wide">{badge.label}</div>
                  <div className="text-sm font-bold text-gray-700 whitespace-nowrap">{badge.value}</div>
                </div>

                {/* Animated Arrow for CTA */}
                <div className="absolute top-2 right-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <i className="ri-arrow-right-up-line text-xs text-green-500"></i>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Compliance;