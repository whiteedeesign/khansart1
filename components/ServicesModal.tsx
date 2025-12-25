
import React, { useEffect } from 'react';
import { X, Clock, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { SERVICES } from '../constants';

interface ServicesModalProps {
  onClose: () => void;
  onBookService: (id: string) => void;
}

const ServicesModal: React.FC<ServicesModalProps> = ({ onClose, onBookService }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const categories = [
    { name: 'Наращивание', icon: <Sparkles size={20} className="text-[#8B6F5C]" /> },
    { name: 'Ламинирование', icon: <Zap size={20} className="text-[#8B6F5C]" /> },
    { name: 'Коррекция', icon: <RefreshCw size={20} className="text-[#8B6F5C]" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-[#4A3728]/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="bg-[#F5F0E8] w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 md:p-12 flex items-center justify-between border-b border-[#E8C4B8]/50">
          <div>
            <h2 className="text-3xl md:text-4xl font-rounded font-bold text-[#4A3728]">Прайс-лист услуг</h2>
            <p className="text-[#8B6F5C] font-medium mt-1">Выберите процедуру, которая подчеркнет вашу красоту</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-[#E8C4B8] rounded-full text-[#4A3728] transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-16 scrollbar-hide">
          {categories.map(cat => (
            <div key={cat.name} className="space-y-8">
              <div className="flex items-center space-x-3 pb-2 border-b-2 border-[#D4A69A]/30">
                {cat.icon}
                <h3 className="text-xl md:text-2xl font-rounded font-bold text-[#4A3728] uppercase tracking-wider">
                  {cat.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {SERVICES.filter(s => s.category === cat.name).map(service => (
                  <div 
                    key={service.id}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow border border-[#E8C4B8]/30 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors">
                          {service.name}
                        </h4>
                        <div className="flex items-center text-sm text-[#8B6F5C] mt-1 font-bold">
                          <Clock size={14} className="mr-1" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-rounded font-bold text-[#8B6F5C]">{service.price}</p>
                      </div>
                    </div>
                    
                    <p className="text-[#4A3728]/70 text-sm leading-relaxed mb-8">
                      {service.description}
                    </p>

                    <button 
                      onClick={() => onBookService(service.id)}
                      className="w-full py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold hover:bg-[#4A3728] transition-all transform active:scale-[0.98] shadow-lg shadow-[#8B6F5C]/10"
                    >
                      Записаться на процедуру
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Footer Info */}
          <div className="bg-[#E8C4B8]/30 p-8 rounded-[2.5rem] text-center border border-[#E8C4B8]">
            <p className="text-[#4A3728]/70 font-medium">
              Не нашли нужную услугу или возникли вопросы? <br className="hidden md:block" />
              Позвоните нам: <a href="tel:+79991234567" className="text-[#8B6F5C] font-bold hover:underline">+7 (999) 123-45-67</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
