
import React from 'react';
import { Gift } from 'lucide-react';

interface PromotionsProps {
  onPromoClick?: () => void;
}

const Promotions: React.FC<PromotionsProps> = ({ onPromoClick }) => {
  return (
    <section className="py-8 md:py-12 container mx-auto px-4 sm:px-6">
      <div className="bg-[#D4A69A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 pointer-events-none">
          <Gift size={200} className="md:w-[300px] md:h-[300px]" strokeWidth={1} />
        </div>
        
        <div className="w-full md:w-2/3 space-y-4 md:space-y-6 relative z-10 text-center md:text-left">
          <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest">Акция месяца</span>
          <h2 className="text-3xl md:text-6xl font-rounded font-bold leading-tight">Каждая 5-я процедура <br className="hidden md:block" /> в подарок!</h2>
          <p className="text-lg md:text-xl text-white/80 font-light max-w-lg mx-auto md:mx-0">
            Мы ценим наших постоянных клиентов. Копите визиты и получайте бесплатное наращивание или уход.
          </p>
          <div className="pt-4 flex justify-center md:justify-start">
            <button 
              onClick={onPromoClick}
              className="bg-[#4A3728] text-white w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all transform active:scale-95"
            >
              Участвовать в акции
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/3 mt-8 md:mt-0 flex justify-center relative z-10">
          <div 
            onClick={onPromoClick}
            className="w-40 h-40 md:w-64 md:h-64 rounded-full border-4 border-white/30 flex flex-col items-center justify-center text-center p-4 md:p-6 transform md:rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer"
          >
            <span className="text-4xl md:text-5xl font-rounded font-bold">0₽</span>
            <span className="text-sm md:text-lg font-medium">за 5-й визит</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Promotions;
