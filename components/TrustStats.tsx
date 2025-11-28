import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from './LanguageContext';

const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || end === 0) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      setCount(Math.floor(easeOutQuart(progress) * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration, start]);

  return { count, elementRef, isVisible };
};

const StatItem: React.FC<{ item: any }> = ({ item }) => {
  const { count, elementRef, isVisible } = useCountUp(item.target);

  return (
    <div ref={elementRef} className="pt-8 md:pt-0 first:pt-0 group relative">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-100/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
        
        <div className="relative text-5xl md:text-6xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tighter">
            {item.manual ? (
                <span className={`opacity-0 translate-y-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>{item.manual}</span>
            ) : (
                <span>{count}</span>
            )}
            <span className="text-3xl align-top ml-1 text-gray-300 group-hover:text-blue-400 transition-colors font-light">{item.suffix}</span>
        </div>
        <div className="text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
            {item.label}
        </div>
    </div>
  );
};

const TrustStats: React.FC = () => {
  const { t } = useLanguage();
  
  const stats = [
    { target: 150, suffix: '+', label: t.stats.coverage },
    { target: 0, manual: 'T+0', suffix: '', label: t.stats.clearance },
    { target: 100, suffix: '+', label: t.stats.accounts },
  ];

  return (
    <section className="py-20 md:py-32 border-b border-gray-50 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {stats.map((stat, idx) => (
            <StatItem key={idx} item={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStats;