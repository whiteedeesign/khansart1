import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, Star, Gift, LogOut, ChevronRight, X, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface ClientAccountProps {
  user: any;
  onLogout: () => void;
  onBooking: () => void;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  has_review?: boolean;
  services: { name: string } | null;
  masters: { name: string; photo_url: string; id: string } | null;
}

const ClientAccount: React.FC<ClientAccountProps> = ({ user, onLogout, onBooking }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyStamps, setLoyaltyStamps] = useState(0);
  
  // Состояние для модалки отзыва
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const userEmail = user.email;
      const userPhone = user.user_metadata?.phone;
      const userId = user.id;

      console.log('🔍 Ищем записи для:', { userId, userEmail, userPhone });

      let filters = [];
      if (userId) filters.push(`user_id.eq.${userId}`);
      if (userEmail) filters.push(`client_email.eq.${userEmail}`);
      if (userPhone) filters.push(`client_phone.eq.${userPhone}`);

      if (filters.length === 0) {
        console.log('⚠️ Нет данных для поиска записей');
        setLoading(false);
        return;
      }

      const { data: allBookings, error } = await supabase
        .from('bookings')
        .select(`*, services(name), masters(id, name, photo_url)`)
        .or(filters.join(','))
        .order('booking_date', { ascending: false });

      console.log('📋 Найдено записей:', allBookings?.length, allBookings);

      if (error) {
        console.error('❌ Ошибка загрузки записей:', error);
      } else if (allBookings) {
        const upcoming = allBookings.filter(b => 
          b.booking_date >= today && b.status !== 'cancelled' && b.status !== 'completed'
        );
        const past = allBookings.filter(b => 
          b.booking_date < today || b.status === 'completed' || b.status === 'cancelled'
        );
        
        setUpcomingBookings(upcoming);
        setPastBookings(past);
        
        const completedCount = allBookings.filter(b => b.status === 'completed').length;
        setLoyaltyStamps(completedCount % 5);
        
        console.log('✅ Предстоящие:', upcoming.length, 'История:', past.length);
      }
    } catch (error) {
      console.error('❌ Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  // Открыть модалку отзыва
  const openReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  // Отправить отзыв
  const submitReview = async () => {
    if (!selectedBooking || !selectedBooking.masters) return;
    
    setSubmittingReview(true);
    try {
      // Создаём отзыв
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: selectedBooking.id,
          user_id: user.id,
          master_id: selectedBooking.masters.id,
          service_id: null, // можно добавить если нужно
          rating: reviewRating,
          comment: reviewComment || null,
          is_published: false // модерация
        });

      if (reviewError) throw reviewError;

      // Обновляем запись - отмечаем что отзыв оставлен
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ has_review: true })
        .eq('id', selectedBooking.id);

      if (updateError) throw updateError;

      console.log('✅ Отзыв отправлен!');
      
      // Обновляем локальный стейт
      setPastBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, has_review: true } : b)
      );
      
      setShowReviewModal(false);
      alert('Спасибо за отзыв! После модерации он появится на сайте.');
      
    } catch (error) {
      console.error('❌ Ошибка отправки отзыва:', error);
      alert('Ошибка при отправке отзыва. Попробуйте позже.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { text: string; color: string }> = {
      pending: { text: 'Ожидает', color: 'bg-yellow-100 text-yellow-700' },
      confirmed: { text: 'Подтверждено', color: 'bg-green-100 text-green-700' },
      completed: { text: 'Завершено', color: 'bg-gray-100 text-gray-600' },
      cancelled: { text: 'Отменено', color: 'bg-red-100 text-red-600' },
    };
    const s = statuses[status] || statuses.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>{s.text}</span>;
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-[#E8C4B8]/30 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#D4A69A] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#4A3728]">
                {user.user_metadata?.name || 'Клиент'}
              </h1>
              <p className="text-sm text-[#8B6F5C]">{user.email}</p>
              {user.user_metadata?.phone && (
                <p className="text-sm text-[#8B6F5C]">{user.user_metadata.phone}</p>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-3 text-[#8B6F5C] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Выйти"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Loyalty Card */}
      <div className="bg-gradient-to-r from-[#8B6F5C] to-[#D4A69A] rounded-3xl p-6 md:p-8 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gift size={24} />
            <span className="font-bold text-lg">Карта лояльности</span>
          </div>
          <span className="text-sm opacity-80">{loyaltyStamps}/5 до подарка</span>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((stamp) => (
            <div
              key={stamp}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stamp <= loyaltyStamps
                  ? 'bg-white text-[#8B6F5C]'
                  : 'bg-white/20 text-white/50'
              }`}
            >
              <Star size={20} fill={stamp <= loyaltyStamps ? 'currentColor' : 'none'} />
            </div>
          ))}
        </div>
        <p className="text-sm mt-4 opacity-80">
          Ещё {5 - loyaltyStamps} {5 - loyaltyStamps === 1 ? 'визит' : 'визита'} до бесплатной процедуры!
        </p>
      </div>

      {/* Quick Booking Button */}
      <button
        onClick={onBooking}
        className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold text-lg mb-6 hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2 shadow-lg"
      >
        <Calendar size={20} />
        <span>Записаться на услугу</span>
        <ChevronRight size={20} />
      </button>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-[#8B6F5C] text-white'
              : 'bg-[#F5F0E8] text-[#8B6F5C] hover:bg-[#E8C4B8]'
          }`}
        >
          Предстоящие
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-[#8B6F5C] text-white'
              : 'bg-[#F5F0E8] text-[#8B6F5C] hover:bg-[#E8C4B8]'
          }`}
        >
          История
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#8B6F5C] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-[#8B6F5C]">Загрузка записей...</p>
          </div>
        ) : activeTab === 'upcoming' ? (
          upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-5 shadow-md border border-[#E8C4B8]/30"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-[#4A3728]">
                      {formatDate(booking.booking_date)}, {booking.booking_time}
                    </p>
                    <p className="text-sm text-[#8B6F5C]">
                      {booking.services?.name || 'Услуга'} • {booking.masters?.name || 'Мастер'}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#E8C4B8]/30">
                  <span className="font-bold text-[#8B6F5C]">{booking.total_price}₽</span>
                  <button className="text-sm text-red-500 hover:text-red-700 font-medium">
                    Отменить запись
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-[#F5F0E8] rounded-2xl">
              <Calendar size={48} className="mx-auto text-[#8B6F5C]/30 mb-4" />
              <p className="text-[#8B6F5C]">Нет предстоящих записей</p>
              <button
                onClick={onBooking}
                className="mt-4 text-[#8B6F5C] font-bold hover:text-[#4A3728]"
              >
                Записаться сейчас →
              </button>
            </div>
          )
        ) : pastBookings.length > 0 ? (
          pastBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#F5F0E8] rounded-2xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[#4A3728]">
                    {formatDate(booking.booking_date)}, {booking.booking_time}
                  </p>
                  <p className="text-sm text-[#8B6F5C]">
                    {booking.services?.name || 'Услуга'} • {booking.masters?.name || 'Мастер'}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {/* Кнопка отзыва для завершённых записей */}
                  {booking.status === 'completed' && !booking.has_review && booking.masters && (
                    <button
                      onClick={() => openReviewModal(booking)}
                      className="flex items-center space-x-1 text-sm bg-[#D4A69A] text-white px-3 py-1.5 rounded-lg hover:bg-[#8B6F5C] transition-all"
                    >
                      <MessageSquare size={14} />
                      <span>Оставить отзыв</span>
                    </button>
                  )}
                  {booking.has_review && (
                    <span className="text-xs text-green-600 font-medium flex items-center">
                      <Star size={12} className="mr-1" fill="currentColor" />
                      Отзыв оставлен
                    </span>
                  )}
                  {/* Звёздочки рейтинга */}
                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className="text-[#D4A69A]"
                        fill={booking.has_review ? '#D4A69A' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#F5F0E8] rounded-2xl">
            <Clock size={48} className="mx-auto text-[#8B6F5C]/30 mb-4" />
            <p className="text-[#8B6F5C]">История записей пуста</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4A3728]">Оставить отзыв</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-[#F5F0E8] rounded-full transition-all"
              >
                <X size={20} className="text-[#8B6F5C]" />
              </button>
            </div>

            {/* Info */}
            <div className="bg-[#F5F0E8] rounded-2xl p-4 mb-6">
              <p className="text-sm text-[#8B6F5C]">
                <span className="font-bold">{selectedBooking.services?.name}</span>
                <br />
                Мастер: {selectedBooking.masters?.name}
              </p>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#4A3728] mb-3">
                Ваша оценка
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}
                      fill={star <= reviewRating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#4A3728] mb-2">
                Комментарий (необязательно)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите о вашем опыте..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none resize-none transition-all"
              />
            </div>

            {/* Submit */}
            <button
              onClick={submitReview}
              disabled={submittingReview}
              className="w-full bg-[#8B6F5C] text-white py-4 rounded-xl font-bold hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submittingReview ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Отправить отзыв</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAccount;
