
import React from 'react';
import { SERVICES, COLORS } from '../constants';

interface ServicesProps {
  onServiceClick?: (id: string) => void;
  onShowAllClick?: () => void;
}

const Services: React.FC<ServicesProps> = ({ onServiceClick, onShowAllClick }) => {
  // Show only first 4 services on the landing page
  const previewServices = SERVICES.slice(0, 4);

  return (
    <section id="services" className="py-16 md:py-24 bg-white rounded-[2rem] md:rounded-[4rem] mx-2 sm:mx-4 md:mx-10 my-8 md:my-12 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div className="space-y-2 md:space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-rounded font-bold text-[#4A3728]">Наши услуги</h2>
            <p className="text-lg md:text-xl text-[#8B6F5C] max-w-md mx-auto md:mx-0">Выбирайте свой идеальный образ — от естественного взгляда до голливудского объема.</p>
          </div>
          <button 
            onClick={onShowAllClick}
            className="hidden md:block text-[#8B6F5C] font-bold border-b-2 border-[#8B6F5C] hover:text-[#4A3728] hover:border-[#4A3728] transition-all py-1"
          >
            Все услуги
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {previewServices.map((service, index) => (
            <div 
              key={service.id} 
              onClick={() => onServiceClick?.(service.id)}
              className={`p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#E8C4B8] flex items-center justify-between group cursor-pointer transition-all hover:bg-[#F5F0E8] hover:shadow-lg ${
                index % 2 === 1 ? 'md:translate-y-6' : ''
              }`}
            >
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs md:text-sm text-[#4A3728]/60">Длительность: {service.duration}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl md:text-2xl font-rounded font-bold text-[#8B6F5C]">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <button 
            onClick={onShowAllClick}
            className="bg-[#8B6F5C] text-white w-full sm:w-auto px-10 py-4 rounded-xl font-bold shadow-lg shadow-[#8B6F5C]/20"
          >
            Смотреть все услуги
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
