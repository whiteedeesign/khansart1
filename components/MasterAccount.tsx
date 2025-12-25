import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, CheckCircle, XCircle, 
  Phone, Mail, MessageSquare, TrendingUp, Users, Scissors, LogOut, Loader2,
  CircleCheck, AlertTriangle, RefreshCw
} from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface MasterAccountProps {
  onHomeClick: () => void;
  user: any;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  notes?: string;
  price: number;
  total_price: number;
  duration: number;
  services?: { name: string };
}

interface MasterProfile {
  id: string;
  name: string;
  specialization: string;
  photo_url?: string;
  experience?: string;
  bio?: string;
  email?: string;
  phone?: string;
}

const MasterAccount: React.FC<MasterAccountProps> = ({ onHomeClick, user }) => {
  const [loading, setLoading] = useState(true);
  const [masterProfile, setMasterProfile] = useState<MasterProfile | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'stats'>('today');
  const [notification, setNotification] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalToday: 0,
    completedToday: 0,
    totalWeek: 0,
    totalMonth: 0,
    revenue: 0
  });

  useEffect(() => {
    if (user) {
      loadMasterData();
    }
  }, [user]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Ищем мастера для user_id:', user.id);

      // 1. Получаем связь мастера с аккаунтом
      const { data: masterAccount, error: accountError } = await supabase
        .from('master_accounts')
        .select('master_id')
        .eq('user_id', user.id)
        .single();

      if (accountError) {
        console.log('⚠️ Связь не найдена:', accountError.message);
        
        // Попробуем найти мастера по email
        const { data: masterByEmail } = await supabase
          .from('masters')
          .select('*')
          .eq('email', user.email)
          .single();

        if (masterByEmail) {
          console.log('✅ Найден мастер по email:', masterByEmail.name);
          
          // Создаём связь автоматически
          await supabase
            .from('master_accounts')
            .insert({ user_id: user.id, master_id: masterByEmail.id });

          setMasterProfile(masterByEmail);
          await loadBookings(masterByEmail.id);
        } else {
          console.log('❌ Мастер не найден');
          setLoading(false);
          return;
        }
      } else if (masterAccount) {
        // 2. Загружаем профиль мастера
        const { data: master } = await supabase
          .from('masters')
          .select('*')
          .eq('id', masterAccount.master_id)
          .single();

        if (master) {
          console.log('✅ Загружен мастер:', master.name);
          setMasterProfile(master);
          await loadBookings(master.id);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных мастера:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (masterId: string) => {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Загружаем записи для мастера:', masterId, 'на', today);

    // Записи на сегодня
    const { data: todayData, error: todayError } = await supabase
      .from('bookings')
      .select('*, services(name)')
      .eq('master_id', masterId)
      .eq('booking_date', today)
      .neq('status', 'cancelled')
      .order('booking_time', { ascending: true });

    if (todayError) {
      console.error('Ошибка загрузки записей на сегодня:', todayError);
    } else if (todayData) {
      console.log('📋 Записей на сегодня:', todayData.length);
      setTodayBookings(todayData);
      setStats(prev => ({
        ...prev,
        totalToday: todayData.length,
        completedToday: todayData.filter(b => b.status === 'completed').length
      }));
    }

    // Записи на неделю
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data: weekData } = await supabase
      .from('bookings')
      .select('*, services(name)')
      .eq('master_id', masterId)
      .gte('booking_date', today)
      .lte('booking_date', weekEnd.toISOString().split('T')[0])
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (weekData) {
      console.log('📋 Записей на неделю:', weekData.length);
      setWeekBookings(weekData);
      setStats(prev => ({ ...prev, totalWeek: weekData.length }));
    }

    // Статистика за месяц
    const monthStart = new Date();
    monthStart.setDate(1);

    const { data: monthData } = await supabase
      .from('bookings')
      .select('total_price, price, status')
      .eq('master_id', masterId)
      .gte('booking_date', monthStart.toISOString().split('T')[0])
      .eq('status', 'completed');

    if (monthData) {
      const revenue = monthData.reduce((sum, b) => sum + (b.total_price || b.price || 0), 0);
      setStats(prev => ({
        ...prev,
        totalMonth: monthData.length,
        revenue
      }));
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const markAsCompleted = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      setTodayBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'completed' } : b
      ));
      setStats(prev => ({ ...prev, completedToday: prev.completedToday + 1 }));
      showNotify('✅ Запись выполнена');
    } catch (error) {
      console.error('Ошибка:', error);
      showNotify('Ошибка при обновлении');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Отменить эту запись?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      setTodayBookings(prev => prev.filter(b => b.id !== bookingId));
      setWeekBookings(prev => prev.filter(b => b.id !== bookingId));
      setStats(prev => ({ ...prev, totalToday: prev.totalToday - 1 }));
      showNotify('Запись отменена');
    } catch (error) {
      console.error('Ошибка:', error);
      showNotify('Ошибка при отмене');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onHomeClick();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Форматирование времени (убираем секунды: "11:00:00" -> "11:00")
  const formatTime = (time: string) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка кабинета мастера...</p>
        </div>
      </div>
    );
  }

  // Мастер не привязан
  if (!masterProfile) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-6">
        <div className="max-w-lg mx-auto bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-[#E8C4B8]">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-yellow-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#4A3728] mb-4">Аккаунт не привязан</h2>
          <p className="text-[#8B6F5C] mb-4">
            Ваш аккаунт ({user.email}) не связан с профилем мастера.
          </p>
          <p className="text-sm text-[#8B6F5C]/70 mb-8">
            Обратитесь к администратору для настройки или убедитесь, что email в профиле мастера совпадает с вашим.
          </p>
          <div className="space-y-3">
            <button
              onClick={onHomeClick}
              className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold"
            >
              На главную
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-[#8B6F5C] py-4 rounded-2xl font-bold hover:bg-[#F5F0E8]"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-[110] bg-[#4A3728] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E8C4B8]/30 lg:sticky lg:top-32">
            {/* Profile */}
            <div className="flex flex-col items-center text-center mb-8">
              {masterProfile.photo_url ? (
                <img
                  src={masterProfile.photo_url}
                  alt={masterProfile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#F5F0E8] mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#8B6F5C] flex items-center justify-center text-white text-3xl font-bold border-4 border-[#F5F0E8] mb-4">
                  {masterProfile.name.charAt(0)}
                </div>
              )}
              <h2 className="text-xl font-bold text-[#4A3728]">{masterProfile.name}</h2>
              <p className="text-sm text-[#8B6F5C]">{masterProfile.specialization || 'Мастер'}</p>
              {masterProfile.experience && (
                <p className="text-xs text-[#8B6F5C]/60 mt-1">Опыт: {masterProfile.experience}</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#F5F0E8] p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-[#4A3728]">{stats.totalToday}</p>
                <p className="text-[10px] text-[#8B6F5C] uppercase font-bold">Сегодня</p>
              </div>
              <div className="bg-[#F5F0E8] p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-[#4A3728]">{stats.totalWeek}</p>
                <p className="text-[10px] text-[#8B6F5C] uppercase font-bold">На неделе</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('today')}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'today'
                    ? 'bg-[#8B6F5C] text-white'
                    : 'text-[#4A3728] hover:bg-[#F5F0E8]'
                }`}
              >
                <Calendar size={20} />
                <span>Сегодня</span>
              </button>
              <button
                onClick={() => setActiveTab('week')}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'week'
                    ? 'bg-[#8B6F5C] text-white'
                    : 'text-[#4A3728] hover:bg-[#F5F0E8]'
                }`}
              >
                <Clock size={20} />
                <span>Расписание</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'stats'
                    ? 'bg-[#8B6F5C] text-white'
                    : 'text-[#4A3728] hover:bg-[#F5F0E8]'
                }`}
              >
                <TrendingUp size={20} />
                <span>Статистика</span>
              </button>
              <button
                onClick={() => loadMasterData()}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-[#8B6F5C] hover:bg-[#F5F0E8]"
              >
                <RefreshCw size={20} />
                <span>Обновить</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-[#D4A69A] hover:bg-[#F5F0E8]"
              >
                <LogOut size={20} />
                <span>Выйти</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {/* TODAY TAB */}
          {activeTab === 'today' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-rounded font-bold text-[#4A3728]">
                  Записи на сегодня
                </h2>
                <span className="text-sm text-[#8B6F5C]">
                  {new Date().toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>

              {/* Progress */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#8B6F5C]">Выполнено</span>
                  <span className="font-bold text-[#4A3728]">
                    {stats.completedToday} из {stats.totalToday}
                  </span>
                </div>
                <div className="h-3 bg-[#F5F0E8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8B6F5C] rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalToday ? (stats.completedToday / stats.totalToday) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Bookings */}
              {todayBookings.length > 0 ? (
                <div className="space-y-4">
                  {todayBookings.map(booking => (
                    <div
                      key={booking.id}
                      className={`bg-white p-6 rounded-[2rem] border transition-all ${
                        booking.status === 'completed'
                          ? 'border-green-200 bg-green-50/30'
                          : 'border-[#E8C4B8]/30 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className={`p-4 rounded-2xl text-center min-w-[80px] ${
                            booking.status === 'completed' ? 'bg-green-100' : 'bg-[#F5F0E8]'
                          }`}>
                            <p className="text-xl font-bold text-[#4A3728]">{formatTime(booking.booking_time)}</p>
                            <p className="text-[10px] text-[#8B6F5C]">{booking.duration || 60} мин</p>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-bold text-[#4A3728] text-lg">
                              {booking.services?.name || 'Услуга'}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-[#8B6F5C]">
                              <User size={14} />
                              <span>{booking.client_name}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-[#8B6F5C]/70">
                              <a href={`tel:${booking.client_phone}`} className="flex items-center space-x-1 hover:text-[#8B6F5C]">
                                <Phone size={12} />
                                <span>{booking.client_phone}</span>
                              </a>
                            </div>
                            {booking.notes && (
                              <p className="text-xs text-[#8B6F5C]/60 italic mt-2">
                                <MessageSquare size={12} className="inline mr-1" />
                                {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#8B6F5C] mr-4">
                            {booking.total_price || booking.price}₽
                          </span>
                          {booking.status === 'completed' ? (
                            <span className="flex items-center space-x-1 text-green-600 font-bold text-sm">
                              <CheckCircle size={18} />
                              <span>Выполнено</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => markAsCompleted(booking.id)}
                                className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200"
                                title="Выполнено"
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button
                                onClick={() => cancelBooking(booking.id)}
                                className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100"
                                title="Отменить"
                              >
                                <XCircle size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-[#E8C4B8]">
                  <Calendar className="mx-auto text-[#E8C4B8] mb-4" size={48} />
                  <p className="text-[#4A3728]/60 text-lg">На сегодня записей нет</p>
                  <p className="text-sm text-[#8B6F5C]/60 mt-2">Проверьте расписание на неделю</p>
                </div>
              )}
            </div>
          )}

          {/* WEEK TAB */}
          {activeTab === 'week' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-rounded font-bold text-[#4A3728]">
                Расписание на неделю
              </h2>

              {weekBookings.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(
                    weekBookings.reduce((groups: { [key: string]: Booking[] }, booking) => {
                      const date = booking.booking_date;
                      if (!groups[date]) groups[date] = [];
                      groups[date].push(booking);
                      return groups;
                    }, {})
                  ).map(([date, bookings]) => (
                    <div key={date} className="bg-white rounded-[2rem] overflow-hidden border border-[#E8C4B8]/30">
                      <div className="bg-[#F5F0E8] px-6 py-4 border-b border-[#E8C4B8]/30">
                        <h3 className="font-bold text-[#4A3728]">{formatDate(date)}</h3>
                        <p className="text-xs text-[#8B6F5C]">{bookings.length} записей</p>
                      </div>
                      <div className="divide-y divide-[#E8C4B8]/20">
                        {bookings.map(booking => (
                          <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-[#F5F0E8]/30">
                            <div className="flex items-center space-x-4">
                              <span className="font-bold text-[#4A3728] w-16">{formatTime(booking.booking_time)}</span>
                              <div>
                                <p className="font-medium text-[#4A3728]">{booking.services?.name}</p>
                                <p className="text-xs text-[#8B6F5C]">{booking.client_name} • {booking.client_phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-[#8B6F5C]">{booking.total_price || booking.price}₽</span>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {booking.status === 'completed' ? 'Готово' :
                                 booking.status === 'confirmed' ? 'Подтв.' : 'Ожидает'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-[#E8C4B8]">
                  <p className="text-[#4A3728]/60">На этой неделе записей нет</p>
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-rounded font-bold text-[#4A3728]">Статистика</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-[#E8C4B8]/30 text-center">
                  <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="text-[#8B6F5C]" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-[#4A3728]">{stats.totalMonth}</p>
                  <p className="text-sm text-[#8B6F5C]">Клиентов за месяц</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-[#E8C4B8]/30 text-center">
                  <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Scissors className="text-[#8B6F5C]" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-[#4A3728]">{stats.totalWeek}</p>
                  <p className="text-sm text-[#8B6F5C]">Записей на неделе</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-[#E8C4B8]/30 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-green-600" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.revenue.toLocaleString()}₽</p>
                  <p className="text-sm text-[#8B6F5C]">Доход за месяц</p>
                </div>
              </div>

              <div className="bg-[#D4A69A] p-8 rounded-[2rem] text-white">
                <h3 className="text-xl font-bold mb-2">💡 Подсказка</h3>
                <p className="text-white/80">
                  Отмечайте записи как выполненные — это влияет на вашу статистику и рейтинг!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MasterAccount;
