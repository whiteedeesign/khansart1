
import React, { useEffect } from 'react';
import { X, Star, Calendar, Award, Briefcase, ChevronRight, Quote } from 'lucide-react';
import { Master, PortfolioWork, Review } from '../types';
import { MASTER_PORTFOLIO, REVIEWS } from '../constants';

interface MasterDetailModalProps {
  master: Master;
  onClose: () => void;
  onBookClick: (id: string) => void;
}

const MasterDetailModal: React.FC<MasterDetailModalProps> = ({ master, onClose, onBookClick }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const masterWorks = MASTER_PORTFOLIO.filter(work => work.masterName === master.name);
  const masterReviews = REVIEWS.filter(review => review.masterName === master.name);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-10 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-[#4A3728]/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="bg-[#F5F0E8] w-full max-w-6xl h-[95vh] md:h-full max-h-[95vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
        {/* Left Side - Large Photo */}
        <div className="w-full md:w-2/5 relative h-48 sm:h-64 md:h-full shrink-0">
          <img 
            src={master.image} 
            alt={master.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors md:hidden"
          >
            <X size={20} />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A3728]/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 text-white hidden md:block">
            <h2 className="text-4xl font-rounded font-bold mb-2">{master.name}</h2>
            <p className="text-[#E8C4B8] text-xl font-medium">{master.role}</p>
          </div>
          {/* Mobile Overlay Title */}
          <div className="absolute bottom-4 left-4 text-white md:hidden">
            <h2 className="text-xl font-rounded font-bold">{master.name}</h2>
            <p className="text-[#E8C4B8] text-xs font-medium uppercase tracking-wider">{master.role}</p>
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white md:bg-transparent">
          {/* Header Controls (Desktop) */}
          <div className="p-6 md:p-12 md:pb-6 flex justify-between items-start shrink-0 border-b border-[#E8C4B8]/30 md:border-0">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="flex items-center text-[#8B6F5C] font-bold">
                <Star size={20} className="fill-[#8B6F5C] mr-1.5 md:w-6 md:h-6" />
                <span className="text-xl md:text-2xl">{master.rating}</span>
              </div>
              <div className="h-6 md:h-8 w-px bg-[#E8C4B8]" />
              <div className="flex items-center text-[#4A3728] font-bold text-sm md:text-base">
                <Award size={20} className="mr-1.5 text-[#8B6F5C] md:w-6 md:h-6" />
                <span>{master.experience} опыта</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 md:p-3 hover:bg-[#E8C4B8] rounded-full text-[#4A3728] transition-colors hidden md:block"
            >
              <X size={32} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-12 md:pt-0 space-y-8 md:space-y-12 scrollbar-hide">
            {/* Description */}
            <section className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl font-rounded font-bold text-[#4A3728] flex items-center">
                <Briefcase size={18} className="mr-2 text-[#8B6F5C]" /> О мастере
              </h3>
              <p className="text-sm md:text-lg text-[#4A3728]/80 leading-relaxed italic">
                "{master.description}"
              </p>
            </section>

            {/* Portfolio */}
            {masterWorks.length > 0 && (
              <section className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg md:text-xl font-rounded font-bold text-[#4A3728]">Работы мастера</h3>
                  <span className="text-[10px] md:text-sm text-[#8B6F5C] font-bold uppercase tracking-widest">{masterWorks.length} фото</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {masterWorks.map(work => (
                    <div key={work.id} className="aspect-square rounded-xl md:rounded-2xl overflow-hidden group relative border border-[#E8C4B8]/30">
                      <img src={work.imageUrl} alt={work.serviceType} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                        <span className="text-white text-[10px] md:text-xs font-bold">{work.serviceType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {masterReviews.length > 0 && (
              <section className="space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-rounded font-bold text-[#4A3728]">Отзывы</h3>
                <div className="space-y-4">
                  {masterReviews.map(review => (
                    <div key={review.id} className="bg-[#F5F0E8]/50 md:bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-[#E8C4B8]/30 relative">
                      <Quote className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 text-[#E8C4B8] opacity-20" />
                      <div className="flex items-center mb-2 md:mb-3">
                        <div className="flex text-[#C49A7C] mr-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={`md:w-3.5 md:h-3.5 ${i < review.rating ? "fill-current" : "fill-gray-200 text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs md:text-sm font-bold text-[#4A3728]">{review.author}</span>
                      </div>
                      <p className="text-[#4A3728]/70 text-xs md:text-sm italic leading-relaxed">"{review.text}"</p>
                      <p className="text-[9px] md:text-[10px] text-[#8B6F5C] mt-2 md:mt-3 font-bold uppercase tracking-tighter">{review.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="h-4" />
          </div>

          {/* Sticky Booking Button */}
          <div className="p-4 md:p-8 border-t border-[#E8C4B8]/50 bg-white md:bg-[#F5F0E8] sticky bottom-0">
            <button 
              onClick={() => onBookClick(master.id)}
              className="w-full py-4 md:py-5 bg-[#8B6F5C] text-white rounded-xl md:rounded-[2rem] text-lg md:text-xl font-bold hover:bg-[#4A3728] transition-all transform active:scale-95 shadow-xl shadow-[#8B6F5C]/20 flex items-center justify-center"
            >
              <span className="whitespace-nowrap">Записаться к {master.name.split(' ')[0]}</span>
              <ChevronRight size={20} className="ml-2 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDetailModal;
