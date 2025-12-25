import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_percent: number | null;
  discount_amount: number | null;
  promo_code: string | null;
  start_date: string;
  end_date: string;
}

interface PromotionsProps {
  onPromoClick?: (promoCode?: string) => void;
}

const Promotions: React.FC<PromotionsProps> = ({ onPromoClick }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPromotions() {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', today)
          .gte('end_date', today)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setPromotions(data);
          console.log('✅ Акции загружены из Supabase:', data.length);
        }
      } catch (error) {
        console.log('⚠️ Ошибка загрузки акций:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPromotions();
  }, []);

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_percent) return `-${promo.discount_percent}%`;
    if (promo.discount_amount) return `-${promo.discount_amount}₽`;
    return 'Акция';
  };

  const formatEndDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <section id="promotions" className="py-16 md:py-24 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#8B6F5C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (promotions.length === 0) {
    return null; // Не показываем раздел если нет акций
  }

  return (
    <section id="promotions" className="py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-rounded font-bold text-[#4A3728] mb-4">
            Акции и спецпредложения
          </h2>
          <p className="text-lg md:text-xl text-[#8B6F5C] max-w-2xl mx-auto">
            Выгодные предложения для наших клиентов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div 
              key={promo.id}
              className="bg-gradient-to-br from-[#F5F0E8] to-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E8C4B8]"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="bg-[#8B6F5C] text-white px-4 py-2 rounded-full text-sm font-bold">
                  {formatDiscount(promo)}
                </span>
                {promo.promo_code && (
                  <span className="bg-[#4A3728] text-white px-3 py-1 rounded-lg text-xs font-mono">
                    {promo.promo_code}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-[#4A3728] mb-3">{promo.name}</h3>
              <p className="text-[#8B6F5C] mb-4 line-clamp-2">{promo.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#E8C4B8]">
                <span className="text-sm text-[#4A3728]/60">
                  до {formatEndDate(promo.end_date)}
                </span>
                <button 
                  onClick={() => onPromoClick?.(promo.promo_code || undefined)}
                  className="bg-[#8B6F5C] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#4A3728] transition-colors"
                >
                  Применить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;
