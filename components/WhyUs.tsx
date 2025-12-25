
import React from 'react';
import { FEATURES, COLORS } from '../constants';

const WhyUs: React.FC = () => {
  return (
    <section className="py-24 bg-[#F5F0E8]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-rounded font-bold text-[#4A3728]">Почему выбирают Khan's Art</h2>
          <div className="w-24 h-1 bg-[#C49A7C] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group border border-transparent hover:border-[#E8C4B8]"
            >
              <div className="bg-[#F5F0E8] w-16 h-16 rounded-2xl flex items-center justify-center text-[#8B6F5C] mb-6 group-hover:bg-[#E8C4B8] group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#4A3728] mb-3">{feature.title}</h3>
              <p className="text-[#4A3728]/70 leading-relaxed">
                Мы заботимся о вашем комфорте и результате на каждом этапе процедуры.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
