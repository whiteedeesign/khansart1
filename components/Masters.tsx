import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { MASTERS as FALLBACK_MASTERS } from '../constants';
import { Master } from '../types';

interface MastersProps {
  onMasterClick?: (id: string) => void;
  onViewDetail?: (master: Master) => void;
}

const Masters: React.FC<MastersProps> = ({ onMasterClick, onViewDetail }) => {
  const [masters, setMasters] = useState<Master[]>(FALLBACK_MASTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMasters() {
      try {
        const { data, error } = await supabase
          .from('masters')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted: Master[] = data.map(m => ({
            id: m.id,
            name: m.name,
            role: m.specialization || 'Мастер',
            image: m.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500',
            experience: m.experience || '',
            description: m.bio || '',
            rating: 5.0
          }));
          setMasters(formatted);
          console.log('✅ Мастера загружены из Supabase:', formatted.length);
        }
      } catch (error) {
        console.log('⚠️ Используем локальные данные для мастеров');
      } finally {
        setLoading(false);
      }
    }
    loadMasters();
  }, []);

  return (
    <section id="masters" className="py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-rounded font-bold text-[#4A3728] mb-4">Наши мастера</h2>
          <p className="text-lg md:text-xl text-[#8B6F5C] max-w-2xl mx-auto">
            Профессионалы с многолетним опытом, которые создадут для вас идеальный образ
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#8B6F5C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {masters.map((master) => (
              <div 
                key={master.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => onViewDetail?.(master)}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src={master.image} 
                    alt={master.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#4A3728] mb-1">{master.name}</h3>
                  <p className="text-[#8B6F5C] mb-3">{master.role}</p>
                  {master.experience && (
                    <p className="text-sm text-[#4A3728]/60 mb-4">Опыт: {master.experience}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span className="font-semibold text-[#4A3728]">{master.rating}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMasterClick?.(master.id);
                      }}
                      className="bg-[#8B6F5C] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4A3728] transition-colors"
                    >
                      Записаться
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Masters;
