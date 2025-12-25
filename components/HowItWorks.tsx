
import React from 'react';
import { BOOKING_STEPS } from '../constants';
import { ChevronRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-[#F5F0E8]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-rounded font-bold text-[#4A3728]">Как записаться</h2>
          <p className="text-[#8B6F5C] font-medium">Всего 4 простых шага до вашего идеального взгляда</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 relative">
          {BOOKING_STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex-1 flex flex-col items-center text-center p-8 bg-white rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 hover:shadow-xl transition-all group relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-[#F5F0E8] flex items-center justify-center text-[#8B6F5C] mb-6 group-hover:bg-[#8B6F5C] group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                  {step.icon}
                </div>
                <div className="absolute top-6 left-6 text-4xl font-rounded font-bold text-[#E8C4B8] opacity-50 group-hover:text-[#D4A69A] transition-colors">
                  0{step.id}
                </div>
                <h3 className="text-xl font-bold text-[#4A3728] mb-3">{step.title}</h3>
                <p className="text-[#4A3728]/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
              
              {idx < BOOKING_STEPS.length - 1 && (
                <div className="hidden lg:flex items-center text-[#D4A69A] animate-pulse">
                  <ChevronRight size={32} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
