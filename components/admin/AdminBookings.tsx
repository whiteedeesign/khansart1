
import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Download, Check, Edit2, X, Clock, AlertCircle } from 'lucide-react';
import { PAST_BOOKINGS, MASTERS, SERVICES, TIME_SLOTS } from '../../constants';
import { PastBooking } from '../../types';

interface AdminBookingsProps {
  onNotify: (msg: string) => void;
}

const AdminBookings: React.FC<AdminBookingsProps> = ({ onNotify }) => {
  const [allBookings, setAllBookings] = useState<PastBooking[]>([...PAST_BOOKINGS]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    master: 'Все мастера',
    service: 'Любая услуга',
    status: 'Все статусы'
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<PastBooking | null>(null);

  const filtered = useMemo(() => {
    return allBookings.filter(b => {
      // Very simple string parsing for mock dates like "10 мая, 12:00"
      // In a real app we'd use proper ISO dates or libraries like dayjs
      const matchMaster = filters.master === 'Все мастера' || b.master === filters.master;
      const matchService = filters.service === 'Любая услуга' || b.service === filters.service;
      const matchStatus = filters.status === 'Все статусы' || 
        (filters.status === 'Завершена' && b.status === 'completed') ||
        (filters.status === 'Отменена' && b.status === 'cancelled') ||
        (filters.status === 'Подтверждена' && b.status === 'confirmed') ||
        (filters.status === 'Ожидает' && b.status === 'pending');
      
      // Date filtering logic (basic mock version)
      // Since mock dates are strings like "10 мая", we skip deep logic here, 
      // but provided the structure for real date range filtering.
      return matchMaster && matchService && matchStatus;
    });
  }, [allBookings, filters]);

  const handleUpdateStatus = (id: string, status: PastBooking['status']) => {
    setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    const statusLabel = status === 'confirmed' ? 'подтверждена' : 'отменена';
    onNotify(`Запись ${statusLabel}`);
  };

  const handleExport = () => {
    onNotify("Список записей экспортирован в CSV");
  };

  const handleManualBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBooking: PastBooking = {
      id: Math.random().toString(36).substr(2, 9),
      date: `${formData.get('date')}, ${formData.get('time')}`,
      clientName: formData.get('name') as string,
      clientPhone: formData.get('phone') as string,
      service: formData.get('service') as string,
      master: formData.get('master') as string,
      price: '2500₽', // Mock price
      status: 'confirmed'
    };
    setAllBookings(prev => [newBooking, ...prev]);
    setShowAddForm(false);
    onNotify("Запись добавлена вручную");
  };

  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBooking) return;
    const formData = new FormData(e.currentTarget);
    const updated: PastBooking = {
      ...editingBooking,
      date: `${formData.get('date')}, ${formData.get('time')}`,
      service: formData.get('service') as string,
      master: formData.get('master') as string,
    };
    setAllBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    setEditingBooking(null);
    onNotify("Запись успешно изменена");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Все записи</h2>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-[#8B6F5C] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#4A3728] transition-all shadow-lg"
          >
            <Plus size={20} />
            <span>Добавить запись</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white border border-[#E8C4B8] text-[#8B6F5C] px-6 py-3 rounded-2xl font-bold hover:bg-[#F5F0E8] transition-all"
          >
            <Download size={20} />
            <span>Экспорт</span>
          </button>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Дата от</label>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] outline-none text-sm font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Дата до</label>
            <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] outline-none text-sm font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Мастер</label>
            <select value={filters.master} onChange={e => setFilters({...filters, master: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none">
              <option>Все мастера</option>
              {MASTERS.map(m => <option key={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Услуга</label>
            <select value={filters.service} onChange={e => setFilters({...filters, service: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none">
              <option>Любая услуга</option>
              {SERVICES.map(s => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Статус</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none">
              <option>Все статусы</option>
              <option>Подтверждена</option>
              <option>Завершена</option>
              <option>Отменена</option>
              <option>Ожидает</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F0E8]/50 text-[#8B6F5C] text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Дата и время</th>
                <th className="px-6 py-4">Клиент</th>
                <th className="px-6 py-4">Мастер</th>
                <th className="px-6 py-4">Услуга</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C4B8]/20">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-[#F5F0E8]/20 transition-colors">
                  <td className="px-6 py-5 font-bold text-[#4A3728] text-sm">{b.date}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-[#4A3728]">{b.clientName}</p>
                    <p className="text-xs text-[#8B6F5C]">{b.clientPhone}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium">{b.master}</td>
                  <td className="px-6 py-5 text-sm">{b.service}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                      b.status === 'completed' ? 'bg-green-100 text-green-600' :
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {b.status === 'completed' ? 'Завершена' :
                       b.status === 'confirmed' ? 'Подтверждена' :
                       b.status === 'cancelled' ? 'Отменена' : 'Ожидает'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                       {b.status === 'pending' && (
                         <button 
                           onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                           className="p-2 text-green-500 hover:bg-green-50 rounded-xl" title="Подтвердить"
                         >
                           <Check size={18} />
                         </button>
                       )}
                       <button 
                         onClick={() => setEditingBooking(b)}
                         className="p-2 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl" title="Редактировать"
                       >
                         <Edit2 size={18} />
                       </button>
                       {b.status !== 'cancelled' && (
                         <button 
                           onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                           className="p-2 text-red-400 hover:bg-red-50 rounded-xl" title="Отменить"
                         >
                           <X size={18} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-2">
              <AlertCircle className="mx-auto text-[#8B6F5C]/40" size={40} />
              <p className="text-[#8B6F5C] font-bold">Записей не найдено</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Booking Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Новая запись вручную</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={24} /></button>
             </div>
             <form onSubmit={handleManualBooking} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input required name="name" placeholder="Имя клиента" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none" />
                  <input required name="phone" placeholder="Телефон" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required name="date" type="date" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none" />
                  <select required name="time" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none">
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select name="master" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none">
                    {MASTERS.map(m => <option key={m.id}>{m.name}</option>)}
                  </select>
                  <select name="service" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none">
                    {SERVICES.map(s => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-lg">Создать запись</button>
             </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Редактирование записи</h3>
                <button onClick={() => setEditingBooking(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={24} /></button>
             </div>
             <form onSubmit={handleEditSave} className="space-y-6">
                <p className="text-sm font-bold text-[#8B6F5C]">Клиент: {editingBooking.clientName}</p>
                <div className="grid grid-cols-2 gap-4">
                  <input required name="date" type="date" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none" />
                  <select required name="time" className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none">
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select name="master" defaultValue={editingBooking.master} className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none">
                    {MASTERS.map(m => <option key={m.id}>{m.name}</option>)}
                  </select>
                  <select name="service" defaultValue={editingBooking.service} className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none">
                    {SERVICES.map(s => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-lg">Сохранить изменения</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
