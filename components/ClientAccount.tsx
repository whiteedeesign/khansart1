import React, { useState, useEffect } from 'react';
import { 
  Calendar, CreditCard, History, MessageSquare, Settings, LogOut, 
  Star, Trash2, Camera, Plus, X, AlertTriangle, CircleCheck, Loader2, User, Send
} from 'lucide-react';
import { supabase } from '../src/lib/supabase';

type Tab = 'bookings' | 'loyalty' | 'history' | 'reviews' | 'settings';

interface ClientAccountProps {
  onHomeClick: () => void;
  onBookClick: () => void;
  user?: any;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  price: number;
  total_price: number;
  has_review?: boolean;
  service_id?: string;
  master_id?: string;
  services?: { name: string };
  masters?: { id: string; name: string; photo_url?: string };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  is_published: boolean;
  masters?: { name: string };
  services?: { name: string };
}

const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const ClientAccount: React.FC<ClientAccountProps> = ({ onHomeClick, onBookClick, user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [loyaltyStamps, setLoyaltyStamps] = useState(0);
  
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  
  const [modal, setModal] = useState<{
    type: 'reschedule' | 'cancel' | 'review' | 'deleteAccount' | null,
    data?: any
  }>({ type: null });
  
  const [notification, setNotification] = useState<string | null>(null);
  
  // Состояние для отзыва
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      loadClientData();
      loadBookings();
      loadMyReviews();
    }
  }, [user]);

  const loadClientData = async () => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single();

      if (client) {
        setClientData(client);
        setAvatarUrl(client.avatar_url || null);
        setSettingsForm({
          name: client.name || user.user_metadata?.name || '',
          phone: client.phone || user.user_metadata?.phone || '',
          email: client.email || user.email || ''
        });
        setLoyaltyStamps(client.bonus_points || 0);
      } else {
        setSettingsForm({
          name: user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || '',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных клиента:', error);
      setSettingsForm({
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || ''
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      showNotify("Файл слишком большой (макс. 2MB)");
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('clients')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          name: settingsForm.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Пользователь',
          email: user.email
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      showNotify("Аватар обновлён!");

    } catch (error: any) {
      console.error('Ошибка загрузки аватара:', error);
      showNotify("Ошибка загрузки аватара");
    } finally {
      setUploadingAvatar(false);
    }
  };

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

  const loadMyReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`*, masters(name), services(name)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyReviews(data || []);
      console.log('📝 Мои отзывы:', data?.length);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  };

  // Открыть модалку отзыва
  const openReviewModal = (booking: Booking) => {
    setReviewRating(5);
    setReviewComment('');
    setModal({ type: 'review', data: booking });
  };

  // Отправить отзыв
  const submitReview = async () => {
    const booking = modal.data as Booking;
    if (!booking) return;
    
    const masterId = booking.masters?.id || booking.master_id;
    if (!masterId) {
      showNotify("Ошибка: мастер не найден");
      return;
    }
    
    setSubmittingReview(true);
    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: booking.id,
          user_id: user.id,
          master_id: masterId,
          service_id: booking.service_id || null,
          rating: reviewRating,
          comment: reviewComment || null,
          is_published: false
        });

      if (reviewError) throw reviewError;

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ has_review: true })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      console.log('✅ Отзыв отправлен!');
      
      setPastBookings(prev => 
        prev.map(b => b.id === booking.id ? { ...b, has_review: true } : b)
      );
      
      loadMyReviews();
      setModal({ type: null });
      showNotify('Спасибо за отзыв!');
      
    } catch (error: any) {
      console.error('❌ Ошибка отправки отзыва:', error);
      showNotify('Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  const menuItems = [
    { id: 'bookings', label: 'Мои записи', icon: <Calendar size={20} /> },
    { id: 'loyalty', label: 'Карта лояльности', icon: <CreditCard size={20} /> },
    { id: 'history', label: 'История посещений', icon: <History size={20} /> },
    { id: 'reviews', label: 'Мои отзывы', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'Настройки профиля', icon: <Settings size={20} /> },
  ];

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      setUpcomingBookings(prev => prev.filter(b => b.id !== id));
      setModal({ type: null });
      showNotify("Запись отменена");
    } catch (error) {
      console.error('Ошибка отмены:', error);
      showNotify("Ошибка при отмене записи");
    }
  };

  const handleReschedule = async (id: string, newDate: string, newTime: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_date: newDate, booking_time: newTime })
        .eq('id', id);

      if (error) throw error;

      setUpcomingBookings(prev => prev.map(b => 
        b.id === id ? { ...b, booking_date: newDate, booking_time: newTime } : b
      ));
      setModal({ type: null });
      showNotify("Дата записи успешно изменена");
    } catch (error) {
      console.error('Ошибка переноса:', error);
      showNotify("Ошибка при переносе записи");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .upsert({
          id: user.id,
          name: settingsForm.name,
          phone: settingsForm.phone,
          email: settingsForm.email
        });

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { name: settingsForm.name, phone: settingsForm.phone }
      });

      showNotify("Настройки профиля сохранены");
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showNotify("Ошибка сохранения настроек");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onHomeClick();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return { day: date.getDate().toString(), month: months[date.getMonth()] };
  };

  const userName = settingsForm.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Пользователь';
  const userPhone = settingsForm.phone || user?.user_metadata?.phone || '';
  const userEmail = settingsForm.email || user?.email || '';

  return (
    <div className="pt-32 pb-24 container mx-auto px-6">
      {/* Notifications */}
      {notification && (
        <div className="fixed top-24 right-6 z-[110] bg-[#4A3728] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* MOBILE MENU TOGGLE */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#E8C4B8]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#8B6F5C] flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-[#4A3728]">{userName}</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#8B6F5C] font-bold">Меню</button>
        </div>

        {/* SIDEBAR */}
        <aside className={`${isMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-4 shrink-0`}>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E8C4B8]/30">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4 group">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <label htmlFor="avatar-upload" className="cursor-pointer block">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#F5F0E8]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#8B6F5C] flex items-center justify-center text-white text-3xl font-bold border-4 border-[#F5F0E8]">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 className="text-white animate-spin" size={24} />
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                  </div>
                </label>
              </div>
              <h2 className="text-xl font-bold text-[#4A3728]">{userName}</h2>
              <p className="text-sm text-[#8B6F5C]">{userPhone || userEmail}</p>
            </div>

            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as Tab); setIsMenuOpen(false); }}
                  className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-[#8B6F5C] text-white shadow-lg shadow-[#8B6F5C]/20' 
                    : 'text-[#4A3728] hover:bg-[#F5F0E8] hover:text-[#8B6F5C]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-[#D4A69A] hover:bg-[#F5F0E8] transition-all"
              >
                <LogOut size={20} />
                <span>Выйти</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-grow space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#8B6F5C]" size={48} />
            </div>
          )}

          {!loading && activeTab === 'bookings' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-6">Предстоящие записи</h3>
                {upcomingBookings.length > 0 ? (
                  <div className="grid gap-6">
                    {upcomingBookings.map(b => {
                      const dateInfo = formatDateShort(b.booking_date);
                      return (
                        <div key={b.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center space-x-6">
                            <div className="bg-[#F5F0E8] p-4 rounded-3xl text-center min-w-[100px]">
                              <p className="text-xs text-[#8B6F5C] font-bold uppercase mb-1">{dateInfo.month}</p>
                              <p className="text-3xl font-rounded font-bold text-[#4A3728]">{dateInfo.day}</p>
                              <p className="text-sm font-bold text-[#8B6F5C]">{b.booking_time}</p>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#4A3728] mb-1">{b.services?.name || 'Услуга'}</h4>
                              <p className="text-[#8B6F5C] font-medium mb-2">{b.total_price || b.price || 0}₽</p>
                              <div className="flex items-center space-x-2 text-sm text-[#4A3728]/60">
                                {b.masters?.photo_url ? (
                                  <img src={b.masters.photo_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-[#E8C4B8] flex items-center justify-center">
                                    <User size={12} />
                                  </div>
                                )}
                                <span>Мастер: {b.masters?.name || 'Любой'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={() => setModal({ type: 'reschedule', data: b })}
                              className="px-6 py-2 border border-[#E8C4B8] text-[#4A3728] rounded-xl font-bold hover:bg-[#F5F0E8] transition-all"
                            >
                              Перенести
                            </button>
                            <button 
                              onClick={() => setModal({ type: 'cancel', data: b })}
                              className="px-6 py-2 border border-[#E8C4B8] text-red-400 rounded-xl font-bold hover:bg-red-50 transition-all"
                            >
                              Отменить
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-[#E8C4B8]">
                    <p className="text-[#4A3728]/60 mb-6">У вас пока нет предстоящих записей</p>
                    <button onClick={onBookClick} className="bg-[#8B6F5C] text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Записаться</button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-6">Прошедшие записи</h3>
                {pastBookings.length > 0 ? (
                  <div className="grid gap-4 mt-6">
                    {pastBookings.map(b => (
                      <div key={b.id} className="bg-white/60 p-6 rounded-3xl border border-[#E8C4B8]/20 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#4A3728]">{formatDate(b.booking_date)}, {b.booking_time}</p>
                          <p className="text-xs text-[#8B6F5C]">{b.services?.name || 'Услуга'} • {b.masters?.name || 'Мастер'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {/* Кнопка отзыва */}
                          {b.status === 'completed' && !b.has_review && b.masters && (
                            <button
                              onClick={() => openReviewModal(b)}
                              className="flex items-center space-x-1 text-xs bg-[#D4A69A] text-white px-3 py-1.5 rounded-lg hover:bg-[#8B6F5C] transition-all"
                            >
                              <MessageSquare size={12} />
                              <span>Отзыв</span>
                            </button>
                          )}
                          {b.has_review && (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <Star size={12} className="mr-1" fill="currentColor" />
                              Отзыв оставлен
                            </span>
                          )}
                          <div className="flex text-[#C49A7C]">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12} className={b.has_review ? "fill-[#C49A7C]" : ""} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#4A3728]/60 text-center py-8">История посещений пуста</p>
                )}
              </section>
            </div>
          )}

          {!loading && activeTab === 'loyalty' && (
            <div className="space-y-12">
              <div className="bg-[#D4A69A] p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Star size={300} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h3 className="text-3xl font-rounded font-bold mb-1">Khan's Art Loyalty</h3>
                      <p className="text-white/60 text-sm">Карта лояльности</p>
                    </div>
                    <div className="text-4xl font-rounded">K'A</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-rounded font-bold tracking-widest">{userName}</p>
                    <p className="text-sm text-white/60">Клиент с {new Date(user?.created_at || Date.now()).getFullYear()} года</p>
                  </div>
                </div>
              </div>
              
              <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30">
                <h3 className="text-2xl font-bold text-[#4A3728] text-center mb-10">Ваш прогресс</h3>
                <div className="flex justify-center items-center space-x-4 md:space-x-8 mb-10">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 ${
                      i <= loyaltyStamps ? 'bg-[#8B6F5C] border-[#8B6F5C] text-white' : 'bg-white border-[#E8C4B8] text-[#E8C4B8]'
                    }`}>
                      {i <= loyaltyStamps ? <CircleCheck size={32} /> : i}
                    </div>
                  ))}
                </div>
                <p className="text-xl text-[#4A3728] text-center">
                  {loyaltyStamps >= 5 
                    ? <span className="text-[#8B6F5C] font-bold">🎉 Поздравляем! Следующая процедура бесплатно!</span>
                    : <>Осталось <span className="font-bold text-[#8B6F5C]">{5 - loyaltyStamps} визита</span> до бесплатной процедуры!</>
                  }
                </p>
              </section>
            </div>
          )}

          {!loading && activeTab === 'history' && (
            <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-[#E8C4B8]/30">
              {pastBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8B6F5C] uppercase text-xs font-bold">
                      <tr>
                        <th className="px-8 py-5">Дата</th>
                        <th className="px-8 py-5">Услуга</th>
                        <th className="px-8 py-5">Мастер</th>
                        <th className="px-8 py-5">Сумма</th>
                        <th className="px-8 py-5">Статус</th>
                        <th className="px-8 py-5">Отзыв</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8C4B8]/30">
                      {pastBookings.map(b => (
                        <tr key={b.id} className="hover:bg-[#F5F0E8]/30 transition-colors">
                          <td className="px-8 py-6 font-bold text-[#4A3728]">{formatDate(b.booking_date)}</td>
                          <td className="px-8 py-6 text-[#4A3728]/80">{b.services?.name || 'Услуга'}</td>
                          <td className="px-8 py-6 text-[#4A3728]/80">{b.masters?.name || '-'}</td>
                          <td className="px-8 py-6 font-bold text-[#8B6F5C]">{b.total_price || b.price || 0}₽</td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                              b.status === 'completed' ? 'bg-green-100 text-green-600' :
                              b.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {b.status === 'completed' ? 'Завершено' : b.status === 'cancelled' ? 'Отменено' : 'Ожидает'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            {b.status === 'completed' && !b.has_review && b.masters ? (
                              <button
                                onClick={() => openReviewModal(b)}
                                className="text-xs bg-[#D4A69A] text-white px-3 py-1 rounded-lg hover:bg-[#8B6F5C]"
                              >
                                Оставить
                              </button>
                            ) : b.has_review ? (
                              <span className="text-xs text-green-600">✓ Оставлен</span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-[#4A3728]/60">История посещений пуста</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'reviews' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Мои отзывы</h3>
              
              {myReviews.length > 0 ? (
                <div className="grid gap-4">
                  {myReviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-[#4A3728]">{review.masters?.name || 'Мастер'}</p>
                          <p className="text-xs text-[#8B6F5C]">{review.services?.name || ''}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star 
                                key={s} 
                                size={16} 
                                className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            review.is_published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {review.is_published ? 'Опубликован' : 'На модерации'}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-[#4A3728]/70 mt-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-[#8B6F5C]/60 mt-3">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-[#E8C4B8]">
                  <MessageSquare size={48} className="mx-auto text-[#E8C4B8] mb-4" />
                  <p className="text-[#4A3728]/60 mb-2">У вас пока нет отзывов</p>
                  <p className="text-sm text-[#8B6F5C]">Оставьте отзыв после завершённого визита</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'settings' && (
            <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 max-w-2xl mx-auto">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-10 text-center">Настройки профиля</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2">Имя</label>
                    <input 
                      type="text" 
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none focus:ring-2 focus:ring-[#8B6F5C]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2">Телефон</label>
                    <input 
                      type="tel" 
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none focus:ring-2 focus:ring-[#8B6F5C]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2">Email</label>
                  <input 
                    type="email" 
                    value={settingsForm.email}
                    disabled
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none opacity-60 cursor-not-allowed" 
                  />
                  <p className="text-xs text-[#8B6F5C] ml-2">Email нельзя изменить</p>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4A3728] transition-all"
                >
                  Сохранить изменения
                </button>
                <button 
                  onClick={() => setModal({ type: 'deleteAccount' })}
                  className="w-full flex items-center justify-center space-x-2 text-red-400 py-4 hover:bg-red-50 rounded-2xl transition-all font-bold"
                >
                  <Trash2 size={18} /><span>Удалить аккаунт</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {modal.type === 'cancel' && (
        <Modal onClose={() => setModal({ type: null })}>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Вы уверены?</h3>
            <p className="text-[#4A3728]/70">Запись на {formatDate(modal.data?.booking_date)}, {modal.data?.booking_time} будет отменена.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleCancelBooking(modal.data.id)} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Да, отменить</button>
              <button onClick={() => setModal({ type: null })} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Оставить запись</button>
            </div>
          </div>
        </Modal>
      )}

      {modal.type === 'deleteAccount' && (
        <Modal onClose={() => setModal({ type: null })}>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Удалить аккаунт?</h3>
            <p className="text-[#4A3728]/70">Все ваши данные будут удалены навсегда.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Подтверждаю удаление</button>
              <button onClick={() => setModal({ type: null })} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Отмена</button>
            </div>
          </div>
        </Modal>
      )}

      {modal.type === 'reschedule' && (
        <Modal onClose={() => setModal({ type: null })}>
          <RescheduleForm onSave={(date, time) => handleReschedule(modal.data.id, date, time)} onCancel={() => setModal({ type: null })} />
        </Modal>
      )}

      {/* REVIEW MODAL */}
      {modal.type === 'review' && modal.data && (
        <Modal onClose={() => setModal({ type: null })}>
          <div className="space-y-6">
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728] text-center">Оставить отзыв</h3>
            
            <div className="bg-[#F5F0E8] rounded-2xl p-4">
              <p className="text-sm text-[#8B6F5C]">
                <span className="font-bold">{modal.data.services?.name}</span>
                <br />
                Мастер: {modal.data.masters?.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#4A3728] mb-3 text-center">Ваша оценка</label>
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

            <div>
              <label className="block text-sm font-bold text-[#4A3728] mb-2">Комментарий (необязательно)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите о вашем опыте..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none resize-none"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={submittingReview}
              className="w-full bg-[#8B6F5C] text-white py-4 rounded-xl font-bold hover:bg-[#4A3728] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submittingReview ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
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
        </Modal>
      )}
    </div>
  );
};

export default ClientAccount;

const Modal: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"><X size={24} /></button>
      {children}
    </div>
  </div>
);

const RescheduleForm: React.FC<{ onSave: (date: string, time: string) => void, onCancel: () => void }> = ({ onSave }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Новое время записи</h3>
      <div className="space-y-4">
        <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-[#F5F0E8] rounded-2xl outline-none" />
        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-[#F5F0E8] rounded-2xl outline-none">
          <option value="">Выберите время</option>
          {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button onClick={() => onSave(date, time)} disabled={!date || !time} className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold disabled:opacity-50">Перенести</button>
    </div>
  );
};
