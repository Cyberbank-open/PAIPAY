import React from 'react';
import { useLanguage } from './LanguageContext';

const partners = [
  { name: 'Citi', url: 'https://www.citigroup.com' },
  { name: 'J.P. Morgan', url: 'https://www.jpmorgan.com' },
  { name: 'HSBC', url: 'https://www.hsbc.com' },
  { name: 'Barclays', url: 'https://home.barclays' },
  { name: 'DBS', url: 'https://www.dbs.com' },
  { name: 'Mizuho', url: 'https://www.mizuhogroup.com' },
  { name: 'ICBC', url: 'http://www.icbc.com.cn' },
  { name: 'ABA Bank', url: 'https://www.ababank.com' },
  { name: 'ACLEDA', url: 'https://www.acledabank.com.kh' },
  { name: 'Wing', url: 'https://www.wingbank.com.kh' },
  { name: 'Visa', url: 'https://www.visa.com' },
  { name: 'Mastercard', url: 'https://www.mastercard.com' },
  { name: 'UnionPay', url: 'https://www.unionpayintl.com' },
  { name: 'SWIFT', url: 'https://www.swift.com' },
  { name: 'Bakong', url: 'https://bakong.nbc.org.kh' }
];

const Ecosystem: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="ecosystem" className="py-20 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.ecosystem.title}</h3>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t.ecosystem.description}
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 md:gap-12 items-center justify-items-center opacity-90">
          {partners.map((partner, index) => (
            <a 
              key={index} 
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative text-lg md:text-xl font-bold cursor-pointer transition-all duration-300 text-[#8E9BAE] hover:text-[#333333] hover:scale-105
                ${partner.name === 'Citi' ? 'font-serif' : ''}
                ${partner.name === 'HSBC' ? 'font-serif tracking-wide' : ''}
                ${partner.name === 'Visa' ? 'italic text-xl md:text-2xl' : ''}
                ${partner.name === 'SWIFT' ? 'font-mono tracking-widest text-base md:text-lg' : ''}
                ${partner.name === 'Barclays' ? 'text-blue-900/40' : ''}
              `}
            >
              <span className="relative z-10 flex items-center gap-1">
                {partner.name}
                {/* Micro-interaction: External Link Icon fades in and moves up-right */}
                <i className="ri-arrow-right-up-line text-[10px] opacity-0 -translate-y-1 translate-x-0 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:translate-x-1 transition-all duration-300 text-blue-600 absolute -right-3 top-0"></i>
              </span>
              
              {/* Subtle Glow on Hover */}
              <span className="absolute -inset-4 bg-gray-50/0 rounded-lg group-hover:bg-gray-50/80 -z-10 transition-colors duration-300"></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;