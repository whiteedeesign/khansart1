import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, AlertCircle, ArrowUpRight, MessageSquare, 
  Calendar, TrendingUp, Users, DollarSign, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminDashboardProps {
  onTabChange: (tab: any) => void;
}

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  monthRevenue: number;
  totalClients: number;
  newClientsMonth: number;
  pendingReviews: number;
  cancelledToday: number;
}

interface MasterLoad {
  id: string;
  name: string;
  photo_url: string | null;
  bookingsCount: number;
  loadPercent: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTabChange }) => {
  const [loading, setLoading] = useState(true);
  const [dashPeriod, setDashPeriod] = useState('Месяц');
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    monthRevenue: 0,
    totalClients: 0,
    newClientsMonth: 0,
    pendingReviews: 0,
    cancelledToday: 0
  });
  const [masterLoads, setMasterLoads] = useState<MasterLoad[]>([]);
  const [attentionItems, setAttentionItems] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Начало недели (понедельник)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      // Конец недели
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      // Начало месяца
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStartStr = monthStart.toISOString().split('T')[0];

      // 1. Записи на сегодня
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', todayStr)
        .neq('status', 'cancelled');

      // 2. Записи на неделю
      const { data: weekBookings } = await supabase
        .from('bookings')
        .select('id')
        .gte('booking_date', weekStartStr)
        .lte('booking_date', weekEndStr)
        .neq('status', 'cancelled');

      // 3. Записи и выручка за месяц
      const { data: monthBookings } = await supabase
        .from('bookings')
        .select('id, total_price, price, status')
        .gte('booking_date', monthStartStr)
        .neq('status', 'cancelled');

      const monthRevenue = monthBookings?.reduce((sum, b) => {
        if (b.status === 'completed') {
          return sum + (b.total_price || b.price || 0);
        }
        return sum;
      }, 0) || 0;

      // 4. Всего клиентов
      const { count: totalClients } = await supabase
        .from('clients')
        .select('id', { count: 'exact' });

      // 5. Новых клиентов за месяц
      const { count: newClientsMonth } = await supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .gte('created_at', monthStartStr);

      // 6. Отзывы на модерации
      const { data: pendingReviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('status', 'pending');

      // 7. Отменённые сегодня
      const { data: cancelledToday } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', todayStr)
        .eq('status', 'cancelled');

      // 8. Загруженность мастеров (записи на текущую неделю)
      const { data: masters } = await supabase
        .from('masters')
        .select('id, name, photo_url')
        .eq('is_active', true);

      const { data: weekMasterBookings } = await supabase
        .from('bookings')
        .select('master_id')
        .gte('booking_date', weekStartStr)
        .lte('booking_date', weekEndStr)
        .neq('status', 'cancelled');

      // Подсчёт записей по мастерам
      const bookingsByMaster: Record<string, number> = {};
      weekMasterBookings?.forEach(b => {
        bookingsByMaster[b.master_id] = (bookingsByMaster[b.master_id] || 0) + 1;
      });

      // Максимум записей (для расчёта процента)
      const maxBookings = Math.max(...Object.values(bookingsByMaster), 1);

      const masterLoadsData: MasterLoad[] = (masters || []).map(m => ({
        id: m.id,
        name: m.name,
        photo_url: m.photo_url,
        bookingsCount: bookingsByMaster[m.id] || 0,
        loadPercent: Math.round(((bookingsByMaster[m.id] || 0) / maxBookings) * 100)
      })).sort((a, b) => b.bookingsCount - a.bookingsCount);

      // Формируем "Требуют внимания"
      const attention: any[] = [];
      
      if ((pendingReviews?.length || 0) > 0) {
        attention.push({
          id: 'reviews',
          type: 'reviews',
          text: `${pendingReviews?.length} новых отзыва ожидают модерации`,
          icon: <MessageSquare size={16} />
        });
      }
      
      if ((cancelledToday?.length || 0) > 0) {
        attention.push({
          id: 'cancelled',
          type: 'bookings',
          text: `${cancelledToday?.length} записей отменено сегодня`,
          icon: <Calendar size={16} />
        });
      }

      // Записи без подтверждения
      const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'pending')
        .gte('booking_date', todayStr);

      if ((pendingBookings?.length || 0) > 0) {
        attention.push({
          id: 'pending',
          type: 'bookings',
          text: `${pendingBookings?.length} записей ожидают подтверждения`,
          icon: <AlertCircle size={16} />
        });
      }

      setStats({
        todayBookings: todayBookings?.length || 0,
        weekBookings: weekBookings?.length || 0,
        monthBookings: monthBookings?.length || 0,
        monthRevenue,
        totalClients: totalClients || 0,
        newClientsMonth: newClientsMonth || 0,
        pendingReviews: pendingReviews?.length || 0,
        cancelledToday: cancelledToday?.length || 0
      });

      setMasterLoads(masterLoadsData);
      setAttentionItems(attention);

    } catch (error) {
      console.error('Ошибка загрузки дашборда:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStats = () => {
    switch (dashPeriod) {
      case 'День':
        return {
          bookings: stats.todayBookings,
          revenue: Math.round(stats.monthRevenue / 30), // Примерно
          clients: Math.round(stats.newClientsMonth / 30)
        };
      case 'Неделя':
        return {
          bookings: stats.weekBookings,
          revenue: Math.round(stats.monthRevenue / 4),
          clients: Math.round(stats.newClientsMonth / 4)
        };
      default:
        return {
          bookings: stats.monthBookings,
          revenue: stats.monthRevenue,
          clients: stats.newClientsMonth
        };
    }
  };

  const displayStats = getDisplayStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Дашборд</h2>
          <p className="text-[#8B6F5C] font-medium">Обзор ключевых показателей студии</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl text-[#8B6F5C] hover:bg-[#F5F0E8] border border-[#E8C4B8]"
          >
            <RefreshCw size={16} />
            <span className="text-sm font-bold">Обновить</span>
          </button>
          <div className="flex items-center space-x-3 text-sm font-bold bg-white p-2 rounded-2xl shadow-sm border border-[#E8C4B8]">
            <div className="flex bg-[#F5F0E8] p-1 rounded-xl">
              {['День', 'Неделя', 'Месяц'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setDashPeriod(p)}
                  className={`px-4 py-2 rounded-lg transition-all ${dashPeriod === p ? 'bg-white text-[#8B6F5C] shadow-sm' : 'text-[#8B6F5C]/60 hover:text-[#8B6F5C]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Основные метрики */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8B6F5C]">Записей</p>
                <Calendar className="text-[#8B6F5C]" size={20} />
              </div>
              <p className="text-3xl font-rounded font-bold text-[#4A3728]">{displayStats.bookings}</p>
              <p className="text-[10px] font-bold text-green-600">за {dashPeriod.toLowerCase()}</p>
            </div>

            <div className="bg-[#4A3728] text-white p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">Выручка</p>
                <DollarSign className="text-white/60" size={20} />
              </div>
              <p className="text-3xl font-rounded font-bold">
                {displayStats.revenue >= 1000 
                  ? `${Math.round(displayStats.revenue / 1000)}к₽` 
                  : `${displayStats.revenue}₽`}
              </p>
              <p className="text-[10px] font-bold text-[#E8C4B8]">за {dashPeriod.toLowerCase()}</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8B6F5C]">Новых клиентов</p>
                <Users className="text-[#8B6F5C]" size={20} />
              </div>
              <p className="text-3xl font-rounded font-bold text-[#4A3728]">{displayStats.clients}</p>
              <p className="text-[10px] font-bold text-green-600">за {dashPeriod.toLowerCase()}</p>
            </div>
          </div>

          {/* Дополнительные метрики */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8C4B8]/30 text-center">
              <p className="text-2xl font-bold text-[#4A3728]">{stats.totalClients}</p>
              <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Всего клиентов</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8C4B8]/30 text-center">
              <p className="text-2xl font-bold text-[#4A3728]">{stats.todayBookings}</p>
              <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Записей сегодня</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8C4B8]/30 text-center">
              <p className="text-2xl font-bold text-[#4A3728]">{stats.weekBookings}</p>
              <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">На этой неделе</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8C4B8]/30 text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.pendingReviews}</p>
              <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Отзывов на модерации</p>
            </div>
          </div>

          {/* Загруженность мастеров */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30">
            <h3 className="text-xl font-bold text-[#4A3728] mb-8">Загруженность мастеров (неделя)</h3>
            <div className="space-y-6">
              {masterLoads.length > 0 ? masterLoads.map((m) => (
                <div key={m.id} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <div className="flex items-center space-x-3">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#8B6F5C] flex items-center justify-center text-white text-xs font-bold">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-[#4A3728]">{m.name}</span>
                    </div>
                    <span className="text-[#8B6F5C]">{m.bookingsCount} записей</span>
                  </div>
                  <div className="w-full bg-[#F5F0E8] h-2 rounded-full">
                    <div 
                      className="bg-[#8B6F5C] h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${m.loadPercent}%` }} 
                    />
                  </div>
                </div>
              )) : (
                <p className="text-center text-[#8B6F5C] py-8">Нет данных о мастерах</p>
              )}
            </div>
          </div>
        </div>

        {/* Требуют внимания */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 h-fit">
          <h3 className="text-xl font-bold text-[#4A3728] mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2 text-red-400" /> Требуют внимания
          </h3>
          <div className="space-y-4">
            {attentionItems.length > 0 ? attentionItems.map(item => (
              <button 
                key={item.id}
                onClick={() => onTabChange(item.type)}
                className="w-full flex items-start p-4 bg-[#F5F0E8]/50 hover:bg-[#F5F0E8] rounded-2xl transition-all group text-left border border-transparent hover:border-[#E8C4B8]"
              >
                <div className="mt-1 p-2 bg-white rounded-lg text-[#8B6F5C] group-hover:bg-[#8B6F5C] group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors">{item.text}</p>
                  <p className="text-[10px] text-[#8B6F5C] uppercase font-bold mt-1 flex items-center">
                    Перейти <ArrowUpRight size={10} className="ml-1" />
                  </p>
                </div>
              </button>
            )) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-green-500" size={24} />
                </div>
                <p className="text-[#4A3728] font-bold">Всё отлично!</p>
                <p className="text-sm text-[#8B6F5C]">Нет задач требующих внимания</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
