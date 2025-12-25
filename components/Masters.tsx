
import React from 'react';
import { MASTERS, COLORS } from '../constants';
import { Master } from '../types';

interface MastersProps {
  onMasterClick?: (id: string) => void;
  onViewDetail?: (master: Master) => void;
}

const Masters: React.FC<MastersProps> = ({ onMasterClick, onViewDetail }) => {
  return (
    <section id="masters" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-rounded font-bold text-[#4A3728] mb-16">Наши мастера</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {MASTERS.map((master) => (
            <div key={master.id} className="group">
              <div 
                className="relative mb-6 overflow-hidden rounded-[3rem] aspect-[4/5] shadow-lg cursor-pointer bg-[#E8C4B8]"
                onClick={() => onViewDetail?.(master)}
              >
                <img 
                  src={master.image} 
                  alt={master.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#8B6F5C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                  <button 
                    className="bg-white text-[#4A3728] px-8 py-3 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-[#8B6F5C] hover:text-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMasterClick?.(master.id);
                    }}
                  >
                    Записаться к мастеру
                  </button>
                </div>
              </div>
              <div 
                className="cursor-pointer space-y-1"
                onClick={() => onViewDetail?.(master)}
              >
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors">{master.name}</h3>
                <p className="text-[#8B6F5C] font-medium">{master.role}</p>
                {master.rating && (
                  <div className="flex justify-center items-center text-[#C49A7C] text-sm font-bold">
                    <span className="mr-1">{master.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < Math.floor(master.rating || 0) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => onMasterClick?.('any')}
          className="mt-16 bg-[#F5F0E8] border-2 border-[#8B6F5C] text-[#8B6F5C] px-10 py-4 rounded-2xl font-bold hover:bg-[#8B6F5C] hover:text-white transition-all shadow-sm"
        >
          Познакомиться со всеми мастерами
        </button>
      </div>
    </section>
  );
};

export default Masters;