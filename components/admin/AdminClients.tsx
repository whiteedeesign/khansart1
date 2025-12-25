import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Phone, Mail, Calendar, Loader2, RefreshCw,
  Eye, X, ShoppingBag, Clock, Star, UserPlus, Trash2, Edit2
} from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminClientsProps {
  onNotify: (msg: string) => void;
}

interface Client {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  notes?: string;
}

interface ClientBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  price: number;
  services: { name: string } | null;
  masters: { name: string } | null;
}

interface ClientStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  lastVisit: string | null;
}

const AdminClients: React.FC<AdminClientsProps> = ({ onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
      onNotify('Ошибка загрузки клиентов');
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (client: Client) => {
    setViewClient(client);
    setLoadingDetails(true);

    try {
      // Load client's bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, booking_date, booking_time, status, total_price, price, services(name), masters(name)')
        .or(`client_phone.eq.${client.phone},client_email.eq.${client.email}`)
        .order('booking_date', { ascending: false })
        .limit(50);

      setClientBookings(bookings || []);

      // Calculate stats
      const stats: ClientStats = {
        totalBookings: bookings?.length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
        cancelledBookings: bookings?.filter(b => b.status === 'cancelled').length || 0,
        totalSpent: bookings?.reduce((sum, b) => {
          if (b.status === 'completed') {
            return sum + (b.total_price || b.price || 0);
          }
          return sum;
        }, 0) || 0,
        lastVisit: bookings?.find(b => b.status === 'completed')?.booking_date || null
      };

      setClientStats(stats);
    } catch (error) {
      console.error('Ошибка загрузки деталей:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('Удалить этого клиента? Это действие нельзя отменить.')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== clientId));
      setViewClient(null);
      onNotify('Клиент удалён');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      onNotify('Ошибка при удалении клиента');
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(search) ||
      client.phone?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      confirmed: 'Подтв.',
      completed: 'Выполнено',
      cancelled: 'Отменено'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка клиентов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Клиенты</h2>
          <p className="text-[#8B6F5C] font-medium">База клиентов: {clients.length} человек</p>
        </div>
        <button
          onClick={loadClients}
          className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl text-[#8B6F5C] hover:bg-[#F5F0E8] border border-[#E8C4B8] font-bold"
        >
          <RefreshCw size={18} />
          <span>Обновить</span>
        </button>
      </header>

      {/* Search */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={20} />
          <input
            type="text"
            placeholder="Поиск по имени, телефону или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-medium text-lg"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => loadClientDetails(client)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-[#F5F0E8] rounded-full flex items-center justify-center text-[#8B6F5C] font-bold text-xl group-hover:bg-[#8B6F5C] group-hover:text-white transition-colors">
                  {client.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-[#4A3728] text-lg">{client.name || 'Без имени'}</h3>
                  <p className="text-xs text-[#8B6F5C]">
                    Клиент с {formatDate(client.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {client.phone && (
                <div className="flex items-center text-sm text-[#8B6F5C]">
                  <Phone size={14} className="mr-2" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center text-sm text-[#8B6F5C]">
                  <Mail size={14} className="mr-2" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E8C4B8]/30 flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); loadClientDetails(client); }}
                className="flex items-center space-x-1 text-sm text-[#8B6F5C] hover:text-[#4A3728] font-bold"
              >
                <Eye size={14} />
                <span>Подробнее</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-16">
          <Users className="mx-auto text-[#E8C4B8] mb-4" size={48} />
          <p className="text-[#8B6F5C] font-bold">Клиентов не найдено</p>
          <p className="text-sm text-[#8B6F5C]/60">Попробуйте изменить поисковый запрос</p>
        </div>
      )}

      {/* Client Details Modal */}
      {viewClient && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300 my-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#8B6F5C] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {viewClient.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">{viewClient.name}</h3>
                  <p className="text-sm text-[#8B6F5C]">Клиент с {formatDate(viewClient.created_at)}</p>
                </div>
              </div>
              <button onClick={() => setViewClient(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              {viewClient.phone && (
                <a
                  href={`tel:${viewClient.phone}`}
                  className="flex items-center space-x-3 p-4 bg-[#F5F0E8] rounded-xl hover:bg-[#E8C4B8] transition-colors"
                >
                  <Phone className="text-[#8B6F5C]" size={20} />
                  <span className="font-bold text-[#4A3728]">{viewClient.phone}</span>
                </a>
              )}
              {viewClient.email && (
                <a
                  href={`mailto:${viewClient.email}`}
                  className="flex items-center space-x-3 p-4 bg-[#F5F0E8] rounded-xl hover:bg-[#E8C4B8] transition-colors"
                >
                  <Mail className="text-[#8B6F5C]" size={20} />
                  <span className="font-bold text-[#4A3728] truncate">{viewClient.email}</span>
                </a>
              )}
            </div>

            {/* Stats */}
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-[#8B6F5C]" size={32} />
              </div>
            ) : clientStats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#F5F0E8] p-4 rounded-xl text-center">
                    <ShoppingBag className="mx-auto text-[#8B6F5C] mb-2" size={24} />
                    <p className="text-2xl font-bold text-[#4A3728]">{clientStats.totalBookings}</p>
                    <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Всего записей</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <Star className="mx-auto text-green-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-green-700">{clientStats.completedBookings}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase">Выполнено</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl text-center">
                    <X className="mx-auto text-red-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-red-600">{clientStats.cancelledBookings}</p>
                    <p className="text-[10px] font-bold text-red-500 uppercase">Отменено</p>
                  </div>
                  <div className="bg-[#4A3728] p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{clientStats.totalSpent.toLocaleString()}₽</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase">Потрачено</p>
                  </div>
                </div>

                {clientStats.lastVisit && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-[#8B6F5C]">
                    <Clock size={14} />
                    <span>Последний визит: {formatDate(clientStats.lastVisit)}</span>
                  </div>
                )}

                {/* Booking History */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#4A3728]">История записей</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {clientBookings.length > 0 ? clientBookings.map(booking => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-[#F5F0E8]/50 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-bold text-[#4A3728]">{formatDate(booking.booking_date)}</p>
                            <p className="text-xs text-[#8B6F5C]">{formatTime(booking.booking_time)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-[#4A3728]">{booking.services?.name || 'Услуга'}</p>
                            <p className="text-xs text-[#8B6F5C]">{booking.masters?.name || 'Мастер'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#4A3728]">{booking.total_price || booking.price}₽</p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-[#8B6F5C] py-8">Нет записей</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-[#E8C4B8]/30">
              <button
                onClick={() => deleteClient(viewClient.id)}
                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>Удалить клиента</span>
              </button>
              <button
                onClick={() => setViewClient(null)}
                className="flex-1 py-3 bg-[#8B6F5C] text-white rounded-xl font-bold hover:bg-[#4A3728]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
