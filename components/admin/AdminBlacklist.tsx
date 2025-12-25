
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Search, UserPlus, X, Trash2, 
  Edit2, Check, AlertCircle, UserMinus, Info
} from 'lucide-react';
import { BLACKLIST } from '../../constants';
import { BlacklistEntry } from '../../types';

interface AdminBlacklistProps {
  onNotify: (msg: string) => void;
}

const AdminBlacklist: React.FC<AdminBlacklistProps> = ({ onNotify }) => {
  const [list, setList] = useState<BlacklistEntry[]>([...BLACKLIST]);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<BlacklistEntry | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return list.filter(item => 
      item.name.toLowerCase().includes(s) || 
      item.phone.includes(s)
    );
  }, [search, list]);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEntry: BlacklistEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      reason: formData.get('reason') as string,
      date: new Date().toLocaleDateString('ru-RU'),
      addedBy: 'Администратор'
    };
    setList(prev => [newEntry, ...prev]);
    setShowAddForm(false);
    onNotify("Клиент добавлен в чёрный список");
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEntry) return;
    const formData = new FormData(e.currentTarget);
    const updated = {
      ...editingEntry,
      reason: formData.get('reason') as string,
    };
    setList(prev => prev.map(item => item.id === editingEntry.id ? updated : item));
    setEditingEntry(null);
    onNotify("Причина блокировки обновлена");
  };

  const handleUnblock = () => {
    if (!confirmUnblock) return;
    setList(prev => prev.filter(item => item.id !== confirmUnblock.id));
    setConfirmUnblock(null);
    onNotify("Клиент разблокирован");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Чёрный список</h2>
          <p className="text-[#8B6F5C] font-medium">Управление доступом недобросовестных клиентов</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all transform active:scale-95 shrink-0"
        >
          <UserPlus size={20} />
          <span>Заблокировать клиента</span>
        </button>
      </header>

      {/* INFO BANNER */}
      <div className="bg-[#D4A69A]/10 border border-[#D4A69A]/30 p-6 rounded-[2rem] flex items-start space-x-4">
        <div className="bg-[#D4A69A] p-2 rounded-xl text-white">
          <Info size={20} />
        </div>
        <div>
          <p className="font-bold text-[#4A3728]">Важная информация</p>
          <p className="text-sm text-[#8B6F5C]">Клиенты из чёрного списка не могут записаться онлайн через сайт. При попытке записи система уведомит их о необходимости связаться с администратором лично.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-[#E8C4B8]/30">
        <div className="p-8 border-b border-[#F5F0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={20} />
            <input 
              type="text" 
              placeholder="Поиск по имени или телефону..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8]/50 border border-transparent outline-none text-sm font-medium focus:bg-white focus:border-[#8B6F5C] transition-all" 
            />
          </div>
          <p className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest">
            Записей в списке: {list.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F0E8] text-[#8B6F5C] text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Клиент</th>
                <th className="px-8 py-5">Причина блокировки</th>
                <th className="px-8 py-5">Дата добавления</th>
                <th className="px-8 py-5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C4B8]/20">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-[#4A3728]">{item.name}</p>
                    <p className="text-xs text-[#8B6F5C] font-medium">{item.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-xs">
                      <p className="text-sm text-[#4A3728] font-medium line-clamp-2">{item.reason}</p>
                      <p className="text-[9px] text-[#8B6F5C] uppercase font-bold mt-1">Добавил: {item.addedBy}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-[#4A3728]/70 font-medium">{item.date}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setEditingEntry(item)}
                        className="p-2 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl transition-colors"
                        title="Редактировать причину"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setConfirmUnblock(item)}
                        className="text-xs font-bold text-green-600 px-4 py-2 rounded-xl bg-green-50 hover:bg-green-100 transition-all flex items-center space-x-1"
                      >
                        <Check size={14} />
                        <span>Разблокировать</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-24 text-center space-y-3">
              <ShieldAlert className="mx-auto text-[#E8C4B8]" size={48} strokeWidth={1} />
              <p className="text-[#8B6F5C] font-bold">В чёрном списке никого не найдено</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD TO BLACKLIST */}
      {showAddForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Добавить в чёрный список</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={28} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Имя клиента</label>
                  <input required name="name" type="text" placeholder="Иван Иванов" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Телефон</label>
                  <input required name="phone" type="tel" placeholder="+7 (___) ___-__-__" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Причина блокировки</label>
                <textarea required name="reason" placeholder="Например: 3 неявки без предупреждения..." className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none min-h-[120px] resize-none font-medium" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-red-500 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-red-600 transition-all">Заблокировать</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-5 rounded-2xl font-bold">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT REASON */}
      {editingEntry && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Редактировать запись</h3>
              <button onClick={() => setEditingEntry(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={28} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="bg-red-50 p-6 rounded-2xl">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Клиент</p>
                <p className="font-bold text-[#4A3728]">{editingEntry.name}</p>
                <p className="text-sm text-[#8B6F5C]">{editingEntry.phone}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Причина блокировки</label>
                <textarea required name="reason" defaultValue={editingEntry.reason} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none min-h-[120px] resize-none font-medium" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-xl">Сохранить</button>
                <button type="button" onClick={() => setEditingEntry(null)} className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-5 rounded-2xl font-bold">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM UNBLOCK */}
      {confirmUnblock && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <UserMinus size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#4A3728]">Разблокировать?</h3>
                <p className="text-sm text-[#8B6F5C] mt-2">Клиент <b>{confirmUnblock.name}</b> снова сможет записываться на услуги через сайт.</p>
              </div>
              <div className="flex flex-col gap-2">
                 <button onClick={handleUnblock} className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg hover:bg-green-600 transition-all">Подтвердить разблокировку</button>
                 <button onClick={() => setConfirmUnblock(null)} className="w-full py-4 font-bold text-[#4A3728]">Отмена</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlacklist;
