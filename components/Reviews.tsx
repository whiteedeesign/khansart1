import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { REVIEWS as FALLBACK_REVIEWS } from '../constants';
import { Review } from '../types';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            masters(name),
            bookings(client_name, client_email)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        console.log('📝 Загрузка отзывов:', { data, error });

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted: Review[] = data.map(r => {
            // Получаем имя клиента из bookings или формируем из email
            const clientName = r.bookings?.client_name || 
                              r.bookings?.client_email?.split('@')[0] || 
                              'Клиент';
            
            return {
              id: r.id,
              author: clientName,
              rating: r.rating,
              text: r.comment || '',
              date: new Date(r.created_at).toLocaleDateString('ru-RU'),
              masterName: r.masters?.name || '',
              status: 'published' as const
            };
          });
          setReviews(formatted);
          console.log('✅ Отзывы загружены из Supabase:', formatted.length);
        } else {
          console.log('⚠️ Нет опубликованных отзывов, используем fallback');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки отзывов:', error);
        console.log('⚠️ Используем локальные данные для отзывов');
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <section id="reviews" className="py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-rounded font-bold text-[#4A3728] mb-4">Отзывы клиентов</h2>
          <p className="text-lg md:text-xl text-[#8B6F5C] max-w-2xl mx-auto">
            Что говорят наши клиенты о своём опыте
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#8B6F5C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div 
                key={review.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={i < review.rating ? 'text-amber-400' : 'text-gray-200'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#4A3728] mb-4 line-clamp-4">
                  {review.text || 'Отличный сервис!'}
                </p>
                <div className="border-t border-[#E8C4B8] pt-4">
                  <p className="font-semibold text-[#4A3728]">{review.author}</p>
                  <div className="flex items-center justify-between mt-1">
                    {review.masterName && (
                      <p className="text-sm text-[#8B6F5C]">Мастер: {review.masterName}</p>
                    )}
                    <p className="text-sm text-[#4A3728]/50">{review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Если нет отзывов совсем */}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8B6F5C]">Пока нет отзывов. Будьте первым!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
