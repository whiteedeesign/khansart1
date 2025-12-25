import React, { useEffect, useState } from 'react';
import { X, Clock, Sparkles, Zap, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface ServicesModalProps {
  onClose: () => void;
  onBookService: (id: string) => void;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  category_name: string;
}

interface Category {
  id: string;
  name: string;
}

const ServicesModal: React.FC<ServicesModalProps> = ({ onClose, onBookService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load services and categories from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        // Load categories
        const { data: catsData } = await supabase
          .from('categories')
          .select('id, name')
          .order('sort_order');

        if (catsData) {
          setCategories(catsData);
        }

        // Load services with category name
        const { data: servicesData, error } = await supabase
          .from('services')
          .select('id, name, price, duration, description, categories(name)')
          .eq('is_active', true)
          .order('category_id')
          .order('name');

        if (error) throw error;

        if (servicesData) {
          const formatted = servicesData.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
            description: s.description,
            category_name: (s.categories as any)?.name || 'Другое'
          }));
          setServices(formatted);
        }
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} ч. ${mins} мин.` : `${hours} ч.`;
    }
    return `${minutes} мин.`;
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'наращивание':
      case 'ресницы':
        return <Sparkles size={20} className="text-[#8B6F5C]" />;
      case 'ламинирование':
        return <Zap size={20} className="text-[#8B6F5C]" />;
      case 'коррекция':
        return <RefreshCw size={20} className="text-[#8B6F5C]" />;
      default:
        return <Sparkles size={20} className="text-[#8B6F5C]" />;
    }
  };

  // Group services by category
  const servicesByCategory = categories.map(cat => ({
    category: cat,
    services: services.filter(s => s.category_name === cat.name)
  })).filter(group => group.services.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-[#4A3728]/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="bg-[#F5F0E8] w-full max-w-5xl h-full max-h-[90vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 md:p-12 flex items-center justify-between border-b border-[#E8C4B8]/50">
          <div>
            <h2 className="text-2xl md:text-4xl font-rounded font-bold text-[#4A3728]">Прайс-лист услуг</h2>
            <p className="text-[#8B6F5C] font-medium mt-1 text-sm md:text-base">Выберите процедуру, которая подчеркнет вашу красоту</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 md:p-3 hover:bg-[#E8C4B8] rounded-full text-[#4A3728] transition-colors"
          >
            <X size={28} className="md:w-8 md:h-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 md:p-12 space-y-12 md:space-y-16 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#8B6F5C]" size={48} />
            </div>
          ) : servicesByCategory.length > 0 ? (
            servicesByCategory.map(({ category, services: catServices }) => (
              <div key={category.id} className="space-y-6 md:space-y-8">
                <div className="flex items-center space-x-3 pb-2 border-b-2 border-[#D4A69A]/30">
                  {getCategoryIcon(category.name)}
                  <h3 className="text-lg md:text-2xl font-rounded font-bold text-[#4A3728] uppercase tracking-wider">
                    {category.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {catServices.map(service => (
                    <div 
                      key={service.id}
                      className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow border border-[#E8C4B8]/30 group"
                    >
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors">
                            {service.name}
                          </h4>
                          <div className="flex items-center text-xs md:text-sm text-[#8B6F5C] mt-1 font-bold">
                            <Clock size={14} className="mr-1" />
                            <span>{formatDuration(service.duration)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl md:text-2xl font-rounded font-bold text-[#8B6F5C]">от {service.price}₽</p>
                        </div>
                      </div>
                      
                      {service.description && (
                        <p className="text-[#4A3728]/70 text-sm leading-relaxed mb-6 md:mb-8">
                          {service.description}
                        </p>
                      )}

                      <button 
                        onClick={() => onBookService(service.id)}
                        className="w-full py-3 md:py-4 bg-[#8B6F5C] text-white rounded-xl md:rounded-2xl font-bold hover:bg-[#4A3728] transition-all transform active:scale-[0.98] shadow-lg shadow-[#8B6F5C]/10"
                      >
                        Записаться на процедуру
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-[#8B6F5C]">Услуги не найдены</p>
            </div>
          )}
          
          {/* Footer Info */}
          <div className="bg-[#E8C4B8]/30 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] text-center border border-[#E8C4B8]">
            <p className="text-[#4A3728]/70 font-medium text-sm md:text-base">
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
