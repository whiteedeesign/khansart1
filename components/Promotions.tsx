import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  promo_code: string | null;
  start_date: string | null;
  end_date: string | null;
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
        // Загружаем ВСЕ активные акции без фильтра по датам
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        console.log('📦 Загружены акции из БД:', data, error);

        if (error) throw error;

        if (data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Фильтруем по датам на клиенте
          const activePromos = data.filter(promo => {
            // Проверяем start_date (если указана)
            if (promo.start_date) {
              const startDate = new Date(promo.start_date);
              if (startDate > today) {
                console.log(`⏳ Акция "${promo.name}" ещё не началась`);
                return false;
              }
            }
            
            // Проверяем end_date (если указана)
            if (promo.end_date) {
              const endDate = new Date(promo.end_date);
              if (endDate < today) {
                console.log(`⌛ Акция "${promo.name}" уже закончилась`);
                return false;
              }
            }
            
            console.log(`✅ Акция "${promo.name}" активна`);
            return true;
          });
          
          setPromotions(activePromos);
          console.log('🎯 Показываем акций:', activePromos.length);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки акций:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPromotions();
  }, []);

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_percent) return `-${promo.discount_percent}%`;
    if (promo.discount_amount) return `-${promo.discount_amount}₽`;
    return '🎁';
  };

  const formatEndDate = (date: string | null) => {
    if (!date) return 'Бессрочно';
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
    return null;
  }

  return (
    <section id="promotions" className="py-16 md:py-24 scroll-mt-24 bg-gradient-to-b from-transparent to-[#F5F0E8]/30">
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
              className="bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E8C4B8]/50 hover:border-[#E8C4B8]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <span className="bg-gradient-to-r from-[#8B6F5C] to-[#4A3728] text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                  {formatDiscount(promo)}
                </span>
                {promo.promo_code && (
                  <span className="bg-[#F5F0E8] text-[#4A3728] px-3 py-1 rounded-lg text-xs font-mono font-bold border border-[#E8C4B8]">
                    {promo.promo_code}
                  </span>
                )}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-[#4A3728] mb-3">{promo.name}</h3>
              <p className="text-[#8B6F5C] mb-4 line-clamp-2 min-h-[48px]">
                {promo.description || 'Специальное предложение'}
              </p>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8C4B8]/50">
                <span className="text-sm text-[#4A3728]/60">
                  {promo.end_date ? `до ${formatEndDate(promo.end_date)}` : '♾️ Бессрочно'}
                </span>
                <button 
                  onClick={() => onPromoClick?.(promo.promo_code || undefined)}
                  className="bg-[#8B6F5C] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#4A3728] transition-colors shadow-md hover:shadow-lg"
                >
                  Записаться
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
