
import React from 'react';

interface HeroProps {
  onBookClick: () => void;
  onScrollTo: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onBookClick, onScrollTo }) => {
  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen flex items-center pt-24 md:pt-20 overflow-hidden scroll-mt-24">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-bl from-[#E8C4B8]/40 via-[#F5F0E8] to-[#F5F0E8] -z-10" />
      <div className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-[#D4A69A]/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6 md:space-y-8 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-rounded font-bold leading-tight text-[#4A3728]">
            Взгляд, который <br /> 
            <span className="text-[#8B6F5C]">покоряет</span>
          </h1>
          <p className="text-lg lg:text-2xl text-[#4A3728]/80 font-light max-w-lg mx-auto md:mx-0">
            Студия наращивания ресниц в Москве. Создаем шедевры, подчеркивая вашу природную красоту.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center md:justify-start pt-2 md:pt-4">
            <button 
              onClick={onBookClick}
              className="bg-[#8B6F5C] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold shadow-2xl shadow-[#8B6F5C]/30 hover:bg-[#4A3728] hover:-translate-y-1 transition-all active:scale-95"
            >
              Записаться онлайн
            </button>
            <button 
              onClick={() => onScrollTo('gallery')}
              className="border-2 border-[#8B6F5C] text-[#8B6F5C] px-8 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-[#8B6F5C] hover:text-white transition-all active:scale-95"
            >
              Наши работы
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 mt-10 md:mt-0 relative flex justify-center px-4">
          <div className="relative w-full max-w-sm md:max-w-lg aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white group">
            <img 
              src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800&h=1000" 
              alt="Beautiful Lashes" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4A3728]/40 to-transparent pointer-events-none" />
            
            {/* Floating Card - Smaller and better positioned on mobile */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E8C4B8] flex items-center justify-center text-[#4A3728] text-sm md:text-base">
                  ✨
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-[#4A3728]">Премиум материалы</p>
                  <p className="text-[10px] md:text-xs text-[#8B6F5C]">Гипоаллергенно & безопасно</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
