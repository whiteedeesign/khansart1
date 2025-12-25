
import React, { useState } from 'react';
import { LayoutDashboard, AlertCircle, ArrowUpRight, MessageSquare, Calendar } from 'lucide-react';
import { MASTERS } from '../../constants';

interface AdminDashboardProps {
  onTabChange: (tab: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTabChange }) => {
  const [dashPeriod, setDashPeriod] = useState('Месяц');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const attentionItems = [
    { id: 'att1', type: 'reviews', text: '3 новых отзыва ожидают модерации', icon: <MessageSquare size={16} /> },
    { id: 'att2', type: 'blacklist', text: 'Клиент Татьяна К. снова пытается записаться', icon: <AlertCircle size={16} /> },
    { id: 'att3', type: 'bookings', text: '2 записи отменены за последние 2 часа', icon: <Calendar size={16} /> },
  ];

  const handlePeriodChange = (p: string) => {
    setDashPeriod(p);
    if (p !== 'Свой') {
      setCustomRange({ from: '', to: '' });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Дашборд</h2>
          <p className="text-[#8B6F5C] font-medium">Обзор ключевых показателей студии</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {dashPeriod === 'Свой' && (
            <div className="flex items-center space-x-2 animate-in slide-in-from-right-2">
              <input 
                type="date" 
                value={customRange.from} 
                onChange={(e) => setCustomRange({...customRange, from: e.target.value})}
                className="px-3 py-2 rounded-xl bg-white border border-[#E8C4B8] text-xs font-bold outline-none" 
              />
              <span className="text-[#8B6F5C]">—</span>
              <input 
                type="date" 
                value={customRange.to} 
                onChange={(e) => setCustomRange({...customRange, to: e.target.value})}
                className="px-3 py-2 rounded-xl bg-white border border-[#E8C4B8] text-xs font-bold outline-none" 
              />
            </div>
          )}
          <div className="flex items-center space-x-3 text-sm font-bold bg-white p-2 rounded-2xl shadow-sm border border-[#E8C4B8]">
            <div className="flex bg-[#F5F0E8] p-1 rounded-xl">
              {['День', 'Неделя', 'Месяц', 'Свой'].map(p => (
                <button 
                  key={p} 
                  onClick={() => handlePeriodChange(p)}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Записей', val: dashPeriod === 'День' ? '12' : '186', up: '+2', color: 'bg-white' },
              { label: 'Выручка', val: dashPeriod === 'День' ? '32к' : '482к', up: '+15%', color: 'bg-[#4A3728] text-white' },
              { label: 'Новых клиентов', val: dashPeriod === 'День' ? '2' : '34', up: '+4', color: 'bg-white' },
            ].map((m, i) => (
              <div key={i} className={`${m.color} p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col justify-between h-40`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${m.color.includes('white') ? 'text-[#8B6F5C]' : 'text-white/60'}`}>{m.label}</p>
                <p className="text-3xl font-rounded font-bold">{m.val}{m.val.includes('к') ? '₽' : ''}</p>
                <p className={`text-[10px] font-bold ${m.color.includes('white') ? 'text-green-600' : 'text-[#E8C4B8]'}`}>{m.up} к периоду</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30">
            <h3 className="text-xl font-bold text-[#4A3728] mb-8">Загруженность мастеров</h3>
            <div className="space-y-6">
              {MASTERS.map((m, idx) => (
                <div key={m.id} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-[#4A3728]">{m.name}</span>
                    <span className="text-[#8B6F5C]">{idx === 0 ? '92%' : idx === 1 ? '78%' : '65%'}</span>
                  </div>
                  <div className="w-full bg-[#F5F0E8] h-1.5 rounded-full">
                    <div className="bg-[#8B6F5C] h-full transition-all duration-1000" style={{ width: idx === 0 ? '92%' : idx === 1 ? '78%' : '65%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 h-full">
          <h3 className="text-xl font-bold text-[#4A3728] mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2 text-red-400" /> Требуют внимания
          </h3>
          <div className="space-y-4">
            {attentionItems.map(item => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
