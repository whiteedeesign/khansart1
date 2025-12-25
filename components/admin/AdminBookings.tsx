import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, Filter, CheckCircle, XCircle, Clock, 
  Loader2, RefreshCw, Phone, User, Scissors, Trash2, Eye,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminBookingsProps {
  onNotify: (msg: string) => void;
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
  total_price: number;
  price: number;
  duration: number;
  created_at: string;
  services: { id: string; name: string } | null;
  masters: { id: string; name: string; photo_url: string | null } | null;
}

interface Master {
  id: string;
  name: string;
}

const AdminBookings: React.FC<AdminBookingsProps> = ({ onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [masterFilter, setMasterFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, services(id, name), masters(id, name, photo_url)')
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: true })
        .limit(500);

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Load masters for filter
      const { data: mastersData } = await supabase
        .from('masters')
        .select('id, name')
        .order('name');

      setMasters(mastersData || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      onNotify('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );

      const statusLabels: Record<string, string> = {
        confirmed: 'подтверждена',
        completed: 'выполнена',
        cancelled: 'отменена',
        pending: 'ожидает'
      };

      onNotify(`Запись ${statusLabels[newStatus] || newStatus}`);
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка при обновлении статуса');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Удалить эту запись навсегда?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setViewBooking(null);
      onNotify('Запись удалена');
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка при удалении');
    }
  };

  // Filtering
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

    // Master filter
    if (masterFilter !== 'all' && booking.masters?.id !== masterFilter) return false;

    // Date filter
    if (dateFilter && booking.booking_date !== dateFilter) return false;

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = booking.client_name?.toLowerCase().includes(search);
      const matchesPhone = booking.client_phone?.includes(searchTerm);
      const matchesService = booking.services?.name?.toLowerCase().includes(search);
      if (!matchesName && !matchesPhone && !matchesService) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (time: string) => time?.slice(0, 5) || '';

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      confirmed: 'Подтверждено',
      completed: 'Выполнено',
      cancelled: 'Отменено'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Stats
  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    completed: filteredBookings.filter(b => b.status === 'completed').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка записей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Все записи</h2>
          <p className="text-[#8B6F5C] font-medium">Управление записями клиентов</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl text-[#8B6F5C] hover:bg-[#F5F0E8] border border-[#E8C4B8] font-bold"
        >
          <RefreshCw size={18} />
          <span>Обновить</span>
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl text-center border border-[#E8C4B8]/30">
          <p className="text-2xl font-bold text-[#4A3728]">{stats.total}</p>
          <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Всего</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-[10px] font-bold text-yellow-600 uppercase">Ожидают</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
          <p className="text-[10px] font-bold text-blue-600 uppercase">Подтверждено</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          <p className="text-[10px] font-bold text-green-600 uppercase">Выполнено</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          <p className="text-[10px] font-bold text-red-600 uppercase">Отменено</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-grow relative min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
            <input
              type="text"
              placeholder="Поиск по имени, телефону, услуге..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-medium"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-medium"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-bold text-[#4A3728]"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидают</option>
            <option value="confirmed">Подтверждённые</option>
            <option value="completed">Выполненные</option>
            <option value="cancelled">Отменённые</option>
          </select>

          {/* Master Filter */}
          <select
            value={masterFilter}
            onChange={(e) => { setMasterFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-bold text-[#4A3728]"
          >
            <option value="all">Все мастера</option>
            {masters.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm || dateFilter || statusFilter !== 'all' || masterFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setStatusFilter('all');
                setMasterFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-3 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl font-bold"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#E8C4B8]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F0E8]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#4A3728] uppercase">Дата/Время</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#4A3728] uppercase">Клиент</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#4A3728] uppercase">Услуга</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#4A3728] uppercase">Мастер</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#4A3728] uppercase">Цена</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#4A3728] uppercase">Статус</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#4A3728] uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C4B8]/30">
              {paginatedBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-[#F5F0E8]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#4A3728]">{formatDate(booking.booking_date)}</p>
                    <p className="text-sm text-[#8B6F5C]">{formatTime(booking.booking_time)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#4A3728]">{booking.client_name}</p>
                    <p className="text-sm text-[#8B6F5C]">{booking.client_phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#4A3728] font-medium">{booking.services?.name || '—'}</p>
                    <p className="text-xs text-[#8B6F5C]">{booking.duration || 60} мин</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {booking.masters?.photo_url ? (
                        <img src={booking.masters.photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#8B6F5C] flex items-center justify-center text-white text-xs font-bold">
                          {booking.masters?.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="font-medium text-[#4A3728]">{booking.masters?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#4A3728]">{booking.total_price || booking.price || 0}₽</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => setViewBooking(booking)}
                        className="p-2 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-lg"
                        title="Подробнее"
                      >
                        <Eye size={18} />
                      </button>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Подтвердить"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => updateStatus(booking.id, 'completed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Выполнено"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                          title="Отменить"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedBookings.length === 0 && (
          <div className="p-16 text-center">
            <Calendar className="mx-auto text-[#E8C4B8] mb-4" size={48} />
            <p className="text-[#8B6F5C] font-bold">Записей не найдено</p>
            <p className="text-sm text-[#8B6F5C]/60">Попробуйте изменить фильтры</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8C4B8]/30">
            <p className="text-sm text-[#8B6F5C]">
              Показано {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} из {filteredBookings.length}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-[#F5F0E8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 bg-[#F5F0E8] rounded-lg font-bold text-[#4A3728]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-[#F5F0E8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {viewBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-rounded font-bold text-[#4A3728]">Детали записи</h3>
              <button onClick={() => setViewBooking(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center space-x-4 p-4 bg-[#F5F0E8] rounded-2xl">
                <Calendar className="text-[#8B6F5C]" size={24} />
                <div>
                  <p className="font-bold text-[#4A3728]">{formatDate(viewBooking.booking_date)}</p>
                  <p className="text-sm text-[#8B6F5C]">{formatTime(viewBooking.booking_time)}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(viewBooking.status)}
                </div>
              </div>

              {/* Client */}
              <div className="flex items-center space-x-4 p-4 bg-[#F5F0E8] rounded-2xl">
                <User className="text-[#8B6F5C]" size={24} />
                <div>
                  <p className="font-bold text-[#4A3728]">{viewBooking.client_name}</p>
                  <a href={`tel:${viewBooking.client_phone}`} className="text-sm text-[#8B6F5C] flex items-center">
                    <Phone size={12} className="mr-1" /> {viewBooking.client_phone}
                  </a>
                </div>
              </div>

              {/* Service */}
              <div className="flex items-center space-x-4 p-4 bg-[#F5F0E8] rounded-2xl">
                <Scissors className="text-[#8B6F5C]" size={24} />
                <div>
                  <p className="font-bold text-[#4A3728]">{viewBooking.services?.name || 'Услуга'}</p>
                  <p className="text-sm text-[#8B6F5C]">{viewBooking.duration || 60} мин</p>
                </div>
                <p className="ml-auto font-bold text-[#4A3728] text-lg">
                  {viewBooking.total_price || viewBooking.price}₽
                </p>
              </div>

              {/* Master */}
              <div className="flex items-center space-x-4 p-4 bg-[#F5F0E8] rounded-2xl">
                {viewBooking.masters?.photo_url ? (
                  <img src={viewBooking.masters.photo_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#8B6F5C] flex items-center justify-center text-white font-bold">
                    {viewBooking.masters?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#8B6F5C]">Мастер</p>
                  <p className="font-bold text-[#4A3728]">{viewBooking.masters?.name || '—'}</p>
                </div>
              </div>

              {/* Notes */}
              {viewBooking.notes && (
                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                  <p className="text-sm text-yellow-800">{viewBooking.notes}</p>
                </div>
              )}

              {/* Created */}
              <p className="text-xs text-[#8B6F5C] text-center">
                Создано: {new Date(viewBooking.created_at).toLocaleString('ru-RU')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {viewBooking.status === 'pending' && (
                <button
                  onClick={() => { updateStatus(viewBooking.id, 'confirmed'); setViewBooking(null); }}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
                >
                  Подтвердить
                </button>
              )}
              {viewBooking.status !== 'completed' && viewBooking.status !== 'cancelled' && (
                <button
                  onClick={() => { updateStatus(viewBooking.id, 'completed'); setViewBooking(null); }}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600"
                >
                  Выполнено
                </button>
              )}
              {viewBooking.status !== 'cancelled' && (
                <button
                  onClick={() => { updateStatus(viewBooking.id, 'cancelled'); setViewBooking(null); }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600"
                >
                  Отменить
                </button>
              )}
            </div>

            <button
              onClick={() => setViewBooking(null)}
              className="w-full py-3 bg-[#F5F0E8] text-[#4A3728] rounded-xl font-bold hover:bg-[#E8C4B8]"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
