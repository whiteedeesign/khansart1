
import React, { useState, useMemo } from 'react';
import { 
  Calendar, LayoutGrid, Users, Image as ImageIcon, BarChart3, Settings, LogOut, 
  ChevronLeft, ChevronRight, Phone, MessageSquare, Check, X, Plus, 
  Search, Camera, Trash2, Clock, Star, CircleCheck, AlertTriangle, Save, Edit2
} from 'lucide-react';
import { MASTERS, MASTER_SCHEDULE, MASTER_PORTFOLIO, ADMIN_CLIENTS, SERVICES, TIME_SLOTS } from '../constants';
import { MasterClient, ScheduleEntry, PortfolioWork, Service } from '../types';

interface MasterAccountProps {
  onHomeClick: () => void;
}

const MasterAccount: React.FC<MasterAccountProps> = ({ onHomeClick }) => {
  const [activeTab, setActiveTab] = useState<string>('schedule');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Notification system
  const [notification, setNotification] = useState<string | null>(null);
  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- SCHEDULE TAB STATE ---
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [scheduleView, setScheduleView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [mySchedule, setMySchedule] = useState<ScheduleEntry[]>([...MASTER_SCHEDULE]);

  const handleDateChange = (direction: number) => {
    const newDate = new Date(scheduleDate);
    if (scheduleView === 'day') newDate.setDate(newDate.getDate() + direction);
    if (scheduleView === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
    if (scheduleView === 'month') newDate.setMonth(newDate.getMonth() + direction);
    setScheduleDate(newDate);
  };

  const formatDateLabel = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    if (scheduleView === 'day') return scheduleDate.toLocaleDateString('ru-RU', options);
    if (scheduleView === 'week') {
      const end = new Date(scheduleDate);
      end.setDate(end.getDate() + 6);
      return `${scheduleDate.getDate()} - ${end.getDate()} ${scheduleDate.toLocaleDateString('ru-RU', { month: 'long' })}`;
    }
    return scheduleDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  // Edit / Cancel Actions
  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEntry) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedEntry: ScheduleEntry = {
      ...selectedEntry,
      service: formData.get('service') as string,
      timeStart: formData.get('time') as string,
      // In a real app we'd handle the date too
    };

    setMySchedule(prev => prev.map(s => s.id === selectedEntry.id ? updatedEntry : s));
    setIsEditingEntry(false);
    setSelectedEntry(null);
    showNotify("Запись успешно изменена");
  };

  const handleConfirmCancel = () => {
    if (!selectedEntry) return;
    setMySchedule(prev => prev.filter(s => s.id !== selectedEntry.id));
    setIsConfirmingCancel(false);
    setSelectedEntry(null);
    showNotify("Запись отменена");
  };

  // --- TODAY'S APPOINTMENTS STATE ---
  const handleUpdateStatus = (id: string, status: ScheduleEntry['status']) => {
    setMySchedule(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    showNotify(status === 'completed' ? "Клиент отмечен как пришедший" : "Отмечена неявка");
  };

  // --- CLIENTS TAB STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<MasterClient | null>(null);
  const filteredClients = ADMIN_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  // --- PORTFOLIO TAB STATE ---
  const [portfolio, setPortfolio] = useState<PortfolioWork[]>([...MASTER_PORTFOLIO]);
  const [showAddWork, setShowAddWork] = useState(false);
  const [confirmDeleteWork, setConfirmDeleteWork] = useState<string | null>(null);

  const handleAddWork = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWork: PortfolioWork = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400&h=400',
      serviceType: formData.get('service') as string,
      description: formData.get('desc') as string,
      masterName: MASTERS[0].name
    };
    setPortfolio([newWork, ...portfolio]);
    setShowAddWork(false);
    showNotify("Работа добавлена в портфолио");
  };

  const handleDeleteWork = (id: string) => {
    setPortfolio(prev => prev.filter(w => w.id !== id));
    setConfirmDeleteWork(null);
    showNotify("Работа удалена");
  };

  // --- STATS TAB STATE ---
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'year'>('month');
  const statsData = useMemo(() => {
    if (statsPeriod === 'week') return { entries: 12, rev: '35к', cancels: 1, attendance: '95%' };
    if (statsPeriod === 'year') return { entries: 480, rev: '1.4М', cancels: 24, attendance: '92%' };
    return { entries: 42, rev: '114к', cancels: 4, attendance: '90%' };
  }, [statsPeriod]);

  // --- SETTINGS TAB STATE ---
  const [workingHours, setWorkingHours] = useState(
    ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map(day => ({
      day,
      hours: '10:00 - 20:00',
      active: day !== 'Воскресенье'
    }))
  );

  const currentMaster = MASTERS[0];

  const menuItems = [
    { id: 'schedule', label: 'Моё расписание', icon: <Calendar size={20} /> },
    { id: 'today', label: 'Записи на сегодня', icon: <LayoutGrid size={20} /> },
    { id: 'clients', label: 'Мои клиенты', icon: <Users size={20} /> },
    { id: 'portfolio', label: 'Мои работы', icon: <ImageIcon size={20} /> },
    { id: 'stats', label: 'Статистика', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Настройки', icon: <Settings size={20} /> },
  ];

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
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center space-x-3">
            <img src={currentMaster.image} alt="Avatar" className="w-10 h-10 rounded-full border border-[#E8C4B8]" />
            <span className="font-bold text-[#4A3728]">{currentMaster.name}</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#8B6F5C] font-bold">Меню</button>
        </div>

        {/* SIDEBAR */}
        <aside className={`${isMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-4 shrink-0`}>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E8C4B8]/30">
            <div className="flex flex-col items-center text-center mb-8">
              <button 
                onClick={onHomeClick}
                className="mb-4 text-2xl font-rounded font-bold text-[#4A3728] hover:opacity-80 transition-opacity outline-none"
              >
                Khan's Art
              </button>
              <div className="relative mb-4 group cursor-pointer">
                <img src={currentMaster.image} alt="Profile" className="w-24 h-24 rounded-full border-4 border-[#F5F0E8] object-cover" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#4A3728]">{currentMaster.name}</h2>
              <p className="text-sm text-[#8B6F5C]">{currentMaster.role}</p>
              <div className="mt-2 flex items-center space-x-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>В сети</span>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                  className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-[#4A3728] text-white shadow-lg shadow-[#4A3728]/20' 
                    : 'text-[#4A3728] hover:bg-[#F5F0E8] hover:text-[#8B6F5C]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button 
                onClick={onHomeClick}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-[#D4A69A] hover:bg-[#F5F0E8] transition-all mt-4 border-t border-[#F5F0E8] pt-6"
              >
                <LogOut size={20} />
                <span>Выйти</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-grow space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TAB: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Моё расписание</h3>
                <div className="flex bg-[#F5F0E8] p-1 rounded-2xl shadow-inner">
                  {['day', 'week', 'month'].map(v => (
                    <button
                      key={v}
                      onClick={() => setScheduleView(v as any)}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                        scheduleView === v ? 'bg-white text-[#8B6F5C] shadow-sm' : 'text-[#4A3728]/60 hover:text-[#4A3728]'
                      }`}
                    >
                      {v === 'day' ? 'День' : v === 'week' ? 'Неделя' : 'Месяц'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E8C4B8]/30 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors border border-[#E8C4B8]/30 shadow-sm"><ChevronLeft size={24} /></button>
                  <h4 className="text-xl font-bold text-[#4A3728]">{formatDateLabel()}</h4>
                  <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors border border-[#E8C4B8]/30 shadow-sm"><ChevronRight size={24} /></button>
                </div>

                <div className="space-y-4">
                  {mySchedule.map(entry => (
                    <div key={entry.id} className="flex gap-4 group">
                      <div className="w-20 text-right py-4 text-sm font-bold text-[#8B6F5C]">
                        {entry.timeStart}
                      </div>
                      <div className="relative flex-grow">
                        <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-[#F5F0E8] group-last:bg-transparent" />
                        <div 
                          onClick={() => setSelectedEntry(entry)}
                          className={`ml-4 p-5 rounded-3xl border-l-4 transition-all hover:translate-x-1 cursor-pointer shadow-sm ${
                          entry.status === 'confirmed' ? 'bg-[#F5F0E8]/50 border-[#8B6F5C]' : 
                          entry.status === 'pending' ? 'bg-orange-50 border-orange-300' : 
                          entry.status === 'completed' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-[#4A3728]">{entry.service} — {entry.clientName}</h5>
                              <p className="text-xs text-[#8B6F5C] mt-1 flex items-center">
                                <Clock size={12} className="mr-1" /> {entry.timeStart} - {entry.timeEnd}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#4A3728]">{entry.price}</span>
                              <div className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${
                                entry.status === 'confirmed' ? 'text-blue-500' : 
                                entry.status === 'completed' ? 'text-green-600' : 'text-orange-500'
                              }`}>
                                {entry.status === 'confirmed' ? 'Подтверждена' : entry.status === 'completed' ? 'Завершена' : 'Ожидает'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-5 border-2 border-dashed border-[#E8C4B8] rounded-[2rem] text-[#8B6F5C] font-bold hover:bg-[#F5F0E8] transition-all flex items-center justify-center space-x-2">
                    <Plus size={18} />
                    <span>Добавить запись вручную</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TODAY */}
          {activeTab === 'today' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Записи на сегодня ({new Date().toLocaleDateString('ru-RU')})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mySchedule.filter(s => s.price !== '0₽').map(entry => (
                  <div key={entry.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 space-y-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="bg-[#8B6F5C] text-white px-4 py-2 rounded-2xl text-lg font-bold">
                          {entry.timeStart}
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                          entry.status === 'confirmed' ? 'bg-blue-50 text-blue-500' :
                          entry.status === 'completed' ? 'bg-green-50 text-green-600' :
                          entry.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                        }`}>
                          {entry.status === 'confirmed' ? 'Подтверждена' :
                           entry.status === 'completed' ? 'Пришёл' :
                           entry.status === 'cancelled' ? 'Не пришёл' : 'Ожидает'}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-2xl font-bold text-[#4A3728]">{entry.clientName}</h4>
                          <a href={`tel:${entry.clientPhone}`} className="text-[#8B6F5C] font-medium flex items-center mt-1 hover:underline">
                            <Phone size={14} className="mr-2" /> {entry.clientPhone}
                          </a>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#8B6F5C] font-bold uppercase tracking-wider">Услуга</p>
                          <p className="font-bold text-[#4A3728]">{entry.service}</p>
                          <p className="text-sm font-bold text-[#8B6F5C]">{entry.price}</p>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="bg-[#F5F0E8] p-4 rounded-2xl text-sm text-[#4A3728]/70 italic mt-4">
                          Заметка: {entry.notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-3 border-t border-[#F5F0E8]">
                      <button 
                        onClick={() => handleUpdateStatus(entry.id, 'completed')}
                        className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                          entry.status === 'completed' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        <Check size={18} />
                        <span>Клиент пришёл</span>
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(entry.id, 'cancelled')}
                        className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                          entry.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <X size={18} />
                        <span>Не пришёл</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CLIENTS */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Мои клиенты</h3>
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={20} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по имени или телефону" 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-[#E8C4B8] outline-none focus:border-[#8B6F5C] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-[#E8C4B8]/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F0E8] text-[#8B6F5C] text-[10px] font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Клиент</th>
                        <th className="px-8 py-5">Визитов</th>
                        <th className="px-8 py-5">Последний визит</th>
                        <th className="px-8 py-5">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8C4B8]/30">
                      {filteredClients.map(client => (
                        <tr key={client.id} className="hover:bg-[#F5F0E8]/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#E8C4B8] flex items-center justify-center text-[#8B6F5C] font-bold shadow-inner">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-[#4A3728]">{client.name}</p>
                                <p className="text-xs text-[#8B6F5C] font-medium">{client.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-[#4A3728]">{client.visits}</td>
                          <td className="px-8 py-6 text-[#4A3728]/70 text-sm">{client.lastVisit}</td>
                          <td className="px-8 py-6">
                            <button 
                              onClick={() => setSelectedClient(client)}
                              className="text-[#8B6F5C] font-bold hover:underline py-1 px-3 bg-[#F5F0E8] rounded-lg"
                            >
                              Подробнее
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredClients.length === 0 && (
                    <div className="p-12 text-center text-[#4A3728]/60 font-medium">Клиенты не найдены</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Мои работы</h3>
                <button 
                  onClick={() => setShowAddWork(true)}
                  className="bg-[#8B6F5C] text-white px-8 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg hover:bg-[#4A3728] transition-all"
                >
                  <Plus size={20} />
                  <span>Добавить работу</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {portfolio.map(work => (
                  <div key={work.id} className="group relative aspect-square rounded-[2.5rem] overflow-hidden shadow-sm border border-[#E8C4B8]/30">
                    <img src={work.imageUrl} alt={work.serviceType} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end text-white backdrop-blur-[2px]">
                      <p className="font-bold text-xl mb-1">{work.serviceType}</p>
                      <p className="text-xs text-white/70 mb-6">{work.description}</p>
                      <button 
                        onClick={() => setConfirmDeleteWork(work.id)}
                        className="text-red-400 p-3 bg-white/10 hover:bg-white/20 rounded-2xl self-start transition-colors"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Статистика</h3>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-[#E8C4B8]">
                  {(['week', 'month', 'year'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setStatsPeriod(p)}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                        statsPeriod === p ? 'bg-[#8B6F5C] text-white shadow-md' : 'text-[#4A3728]/60 hover:text-[#4A3728]'
                      }`}
                    >
                      {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30">
                  <p className="text-sm font-bold text-[#8B6F5C] uppercase mb-1">Записей</p>
                  <p className="text-4xl font-rounded font-bold text-[#4A3728]">{statsData.entries}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30">
                  <p className="text-sm font-bold text-[#8B6F5C] uppercase mb-1">Посещаемость</p>
                  <p className="text-4xl font-rounded font-bold text-[#4A3728]">{statsData.attendance}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30">
                  <p className="text-sm font-bold text-[#8B6F5C] uppercase mb-1">Отмены</p>
                  <p className="text-4xl font-rounded font-bold text-red-400">{statsData.cancels}</p>
                </div>
                <div className="bg-[#4A3728] p-8 rounded-[2.5rem] shadow-lg text-white">
                  <p className="text-sm font-bold text-white/60 uppercase mb-1">Выручка</p>
                  <p className="text-4xl font-rounded font-bold">{statsData.rev}₽</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-12 text-center">Настройки профиля</h3>
                
                <div className="space-y-10">
                  <div className="flex flex-col items-center">
                     <div className="relative group cursor-pointer">
                        <img src={currentMaster.image} className="w-32 h-32 rounded-full border-4 border-[#F5F0E8] object-cover" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={28} />
                        </div>
                        <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md text-[#8B6F5C] border border-[#E8C4B8]"><Plus size={16} /></button>
                     </div>
                     <p className="text-xs font-bold text-[#8B6F5C] uppercase mt-4">Сменить фото профиля</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2 tracking-widest">Имя мастера</label>
                      <input type="text" defaultValue={currentMaster.name} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2 tracking-widest">Телефон</label>
                      <input type="tel" defaultValue="+7 (911) 555-55-55" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium" />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#F5F0E8]">
                    <h4 className="font-bold text-[#4A3728] mb-6 flex items-center"><Clock size={18} className="mr-2 text-[#8B6F5C]" /> График работы</h4>
                    <div className="space-y-3">
                      {workingHours.map((item, idx) => (
                        <div key={item.day} className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-2xl transition-all hover:bg-[#E8C4B8]/30">
                          <span className="font-bold text-[#4A3728] text-sm">{item.day}</span>
                          <div className="flex items-center space-x-4">
                            <input 
                              type="text" 
                              value={item.hours} 
                              onChange={(e) => {
                                const newHours = [...workingHours];
                                newHours[idx].hours = e.target.value;
                                setWorkingHours(newHours);
                              }}
                              className="w-36 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-[#8B6F5C] bg-white shadow-inner" 
                            />
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={item.active} 
                                onChange={(e) => {
                                  const newHours = [...workingHours];
                                  newHours[idx].active = e.target.checked;
                                  setWorkingHours(newHours);
                                }}
                                className="w-5 h-5 rounded-md text-[#8B6F5C] focus:ring-[#8B6F5C] border-none bg-white shadow-inner" 
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => showNotify("Настройки мастера сохранены")}
                    className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-3"
                  >
                    <Save size={20} />
                    <span>Сохранить всё</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* Entry Details Modal (View / Edit / Cancel) */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button 
              onClick={() => {
                setSelectedEntry(null);
                setIsEditingEntry(false);
                setIsConfirmingCancel(false);
              }} 
              className="absolute top-6 right-6 p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {isConfirmingCancel ? (
              <div className="text-center space-y-6 pt-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Вы уверены?</h3>
                <p className="text-[#4A3728]/70">Запись клиента {selectedEntry.clientName} будет отменена.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleConfirmCancel} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Да, отменить</button>
                  <button onClick={() => setIsConfirmingCancel(false)} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Нет, оставить</button>
                </div>
              </div>
            ) : isEditingEntry ? (
              <form onSubmit={handleSaveEdit} className="space-y-6">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-8">Изменение записи</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Услуга</label>
                    <select name="service" defaultValue={selectedEntry.service} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none border-none">
                      {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Время</label>
                    <select name="time" defaultValue={selectedEntry.timeStart} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none border-none">
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold">Сохранить</button>
                  <button type="button" onClick={() => setIsEditingEntry(false)} className="flex-1 py-4 border border-[#E8C4B8] text-[#4A3728] rounded-2xl font-bold">Отмена</button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 pt-4">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] text-center">Детали записи</h3>
                <div className="space-y-4">
                  <div className="bg-[#F5F0E8] p-6 rounded-[2rem] border border-[#E8C4B8]/30">
                     <p className="text-[10px] font-bold text-[#8B6F5C] uppercase mb-1">Клиент</p>
                     <p className="font-bold text-lg text-[#4A3728]">{selectedEntry.clientName}</p>
                     <p className="text-sm font-medium text-[#8B6F5C]">{selectedEntry.clientPhone}</p>
                  </div>
                  <div className="bg-[#F5F0E8] p-6 rounded-[2rem] border border-[#E8C4B8]/30">
                     <p className="text-[10px] font-bold text-[#8B6F5C] uppercase mb-1">Услуга</p>
                     <p className="font-bold text-lg text-[#4A3728]">{selectedEntry.service}</p>
                     <p className="text-sm font-medium text-[#8B6F5C]">{selectedEntry.price} • {selectedEntry.timeStart} - {selectedEntry.timeEnd}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditingEntry(true)}
                    className="flex-1 py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2"
                  >
                    <Edit2 size={18} />
                    <span>Изменить</span>
                  </button>
                  <button 
                    onClick={() => setIsConfirmingCancel(true)}
                    className="flex-1 py-4 border border-[#E8C4B8] text-red-400 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>Отменить</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#F5F0E8] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-3xl bg-[#8B6F5C] text-white flex items-center justify-center text-3xl font-bold">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#4A3728]">{selectedClient.name}</h3>
                    <p className="text-[#8B6F5C] font-bold">{selectedClient.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-[#E8C4B8] rounded-full transition-colors"><X size={28} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                  <p className="text-[10px] text-[#8B6F5C] font-bold uppercase mb-1">Всего визитов</p>
                  <p className="text-2xl font-bold text-[#4A3728]">{selectedClient.visits}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                  <p className="text-[10px] text-[#8B6F5C] font-bold uppercase mb-1">Последний раз</p>
                  <p className="text-xl font-bold text-[#4A3728]">{selectedClient.lastVisit}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-[#4A3728] flex items-center">
                  <MessageSquare size={18} className="mr-2 text-[#8B6F5C]" /> Приметки о клиенте
                </h4>
                <textarea 
                  defaultValue={selectedClient.notes}
                  className="w-full p-6 bg-white rounded-[2rem] text-[#4A3728]/80 text-sm italic leading-relaxed shadow-inner outline-none focus:ring-2 focus:ring-[#8B6F5C] min-h-[100px]"
                />
                <button 
                  onClick={() => showNotify("Заметки о клиенте обновлены")}
                  className="flex items-center space-x-2 text-[#8B6F5C] font-bold hover:underline px-2"
                >
                  <Check size={16} />
                  <span>Сохранить заметку</span>
                </button>
              </div>

              <div className="pt-6 border-t border-[#E8C4B8]">
                <h4 className="text-lg font-bold text-[#4A3728] mb-4">История посещений у меня</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center text-sm p-4 bg-white/50 rounded-2xl border border-white">
                      <span className="font-bold">1{i} Марта 2024</span>
                      <span className="text-[#8B6F5C] font-bold">3D Объём — 3500₽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Work Modal */}
      {showAddWork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setShowAddWork(false)} className="absolute top-6 right-6 p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"><X size={24} /></button>
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-8 text-center">Новая работа</h3>
            <form onSubmit={handleAddWork} className="space-y-6">
              <div className="w-full aspect-video bg-[#F5F0E8] rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-[#E8C4B8] cursor-pointer hover:bg-[#E8C4B8]/20 transition-all">
                <Camera size={40} className="text-[#8B6F5C]/50 mb-2" />
                <p className="text-xs font-bold text-[#8B6F5C] uppercase tracking-wider">Загрузить фото</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Тип услуги</label>
                <select name="service" required className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold">
                   {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Описание (опционально)</label>
                <input name="desc" type="text" placeholder="Например: Изгиб С, 2D" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-medium" />
              </div>
              <button type="submit" className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-lg shadow-[#8B6F5C]/10">Опубликовать</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Work Confirmation */}
      {confirmDeleteWork && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2rem] p-10 text-center shadow-2xl relative animate-in zoom-in duration-300">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
             <h3 className="text-xl font-bold text-[#4A3728] mb-4">Удалить эту работу?</h3>
             <div className="flex flex-col gap-3">
               <button onClick={() => handleDeleteWork(confirmDeleteWork)} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold">Да, удалить</button>
               <button onClick={() => setConfirmDeleteWork(null)} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-xl font-bold">Отмена</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MasterAccount;
