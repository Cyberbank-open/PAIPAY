import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLanguage();

  const faqs = [
    { question: t.faq.q1, answer: t.faq.a1 },
    { question: t.faq.q2, answer: t.faq.a2 },
    { question: t.faq.q3, answer: t.faq.a3 },
    { question: t.faq.q4, answer: t.faq.a4 },
    { question: t.faq.q5, answer: t.faq.a5 },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-white border-t border-gray-50">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t.faq.title}</h2>
          <p className="text-gray-500 mt-3 text-sm md:text-base tracking-wide">{t.faq.description}</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                openIndex === index 
                  ? 'border-blue-200 bg-blue-50/20 shadow-md ring-1 ring-blue-100' 
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none select-none group"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`font-semibold pr-4 text-[15px] md:text-base transition-colors ${openIndex === index ? 'text-blue-700' : 'text-gray-800 group-hover:text-black'}`}>
                  {faq.question}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${openIndex === index ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                  <i className="ri-arrow-down-s-line text-lg"></i>
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                  openIndex === index ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 md:p-6 pt-0 text-sm md:text-base text-gray-600 leading-7 text-balance border-t border-transparent">
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