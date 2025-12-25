
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Download, UserMinus, X, Calendar, 
  MessageSquare, History, CreditCard, ShieldAlert, AlertTriangle, Check, Edit2
} from 'lucide-react';
import { ADMIN_CLIENTS, PAST_BOOKINGS } from '../../constants';
import { MasterClient } from '../../types';

interface AdminClientsProps {
  onNotify: (msg: string) => void;
}

const AdminClients: React.FC<AdminClientsProps> = ({ onNotify }) => {
  const [clients, setClients] = useState<MasterClient[]>([...ADMIN_CLIENTS]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<MasterClient | null>(null);
  const [editingClient, setEditingClient] = useState<MasterClient | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [blacklistingClient, setBlacklistingClient] = useState<MasterClient | null>(null);
  const [blacklistReason, setBlacklistReason] = useState('');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(s) || 
      c.phone.includes(s) || 
      (c.email && c.email.toLowerCase().includes(s))
    );
  }, [search, clients]);

  const handleExport = () => {
    onNotify("База клиентов экспортирована в CSV");
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: MasterClient = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      visits: 0,
      totalSpent: '0₽',
      lastVisit: 'Нет визитов',
      loyaltyStamps: 0,
      notes: formData.get('notes') as string,
    };
    setClients(prev => [newClient, ...prev]);
    setShowAddForm(false);
    onNotify("Клиент добавлен в базу");
  };

  const handleEditClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;
    const formData = new FormData(e.currentTarget);
    const updatedClient = {
      ...editingClient,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      notes: formData.get('notes') as string,
    };
    setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c));
    setEditingClient(null);
    onNotify("Данные клиента обновлены");
  };

  const handleBlacklistSubmit = () => {
    if (!blacklistingClient) return;
    setClients(prev => prev.map(c => 
      c.id === blacklistingClient.id ? { ...c, isBlacklisted: true, notes: `${c.notes}\n[ЧС: ${blacklistReason}]` } : c
    ));
    setBlacklistingClient(null);
    setBlacklistReason('');
    onNotify("Клиент добавлен в чёрный список");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">База клиентов</h2>
          <p className="text-[#8B6F5C] font-medium">Всего в базе: {clients.length} чел.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-grow min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={20} />
            <input 
              type="text" 
              placeholder="Поиск по имени, тел. или email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-[#E8C4B8] outline-none text-sm font-medium focus:border-[#8B6F5C] transition-all" 
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#8B6F5C] text-white p-3.5 rounded-2xl shadow-lg hover:bg-[#4A3728] transition-all"
            title="Добавить клиента"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={handleExport}
            className="bg-white border border-[#E8C4B8] text-[#8B6F5C] p-3.5 rounded-2xl hover:bg-[#F5F0E8] transition-all"
            title="Экспорт базы"
          >
            <Download size={24} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-[#E8C4B8]/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F0E8] text-[#8B6F5C] text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Клиент</th>
                <th className="px-8 py-5 text-center">Визитов</th>
                <th className="px-8 py-5">Последний визит</th>
                <th className="px-8 py-5">Сумма покупок</th>
                <th className="px-8 py-5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C4B8]/30">
              {filtered.map(c => (
                <tr key={c.id} className={`hover:bg-[#F5F0E8]/30 transition-colors ${c.isBlacklisted ? 'bg-red-50/30 opacity-70' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner ${c.isBlacklisted ? 'bg-red-100 text-red-500' : 'bg-[#E8C4B8] text-[#8B6F5C]'}`}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-[#4A3728]">{c.name}</p>
                          {c.isBlacklisted && <ShieldAlert size={14} className="text-red-500" />}
                        </div>
                        <p className="text-xs text-[#8B6F5C] font-medium">{c.phone}</p>
                        {c.email && <p className="text-[10px] text-[#8B6F5C]/60">{c.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-[#4A3728] text-center">
                    <div className="inline-flex items-center space-x-1 px-3 py-1 bg-[#F5F0E8] rounded-full text-xs">
                      <span>{c.visits}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-[#4A3728]/70 font-medium">{c.lastVisit}</td>
                  <td className="px-8 py-6 font-bold text-[#8B6F5C]">{c.totalSpent}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setEditingClient(c)}
                        className="p-2 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl transition-colors"
                        title="Редактировать клиента"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedClient(c)}
                        className="text-xs font-bold text-[#8B6F5C] px-4 py-2 rounded-xl bg-[#F5F0E8] hover:bg-[#8B6F5C] hover:text-white transition-all"
                      >
                        Подробнее
                      </button>
                      {!c.isBlacklisted && (
                        <button 
                          onClick={() => setBlacklistingClient(c)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                          title="В чёрный список"
                        >
                          <UserMinus size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <Search className="mx-auto text-[#E8C4B8]" size={40} />
              <p className="text-[#8B6F5C] font-bold">Ничего не найдено по вашему запросу</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: EDIT CLIENT */}
      {editingClient && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Редактировать клиента</h3>
              <button onClick={() => setEditingClient(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={28} /></button>
            </div>
            <form onSubmit={handleEditClient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Имя</label>
                  <input required name="name" defaultValue={editingClient.name} type="text" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Телефон</label>
                  <input required name="phone" defaultValue={editingClient.phone} type="tel" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Email</label>
                <input name="email" defaultValue={editingClient.email} type="email" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Заметки о клиенте</label>
                <textarea name="notes" defaultValue={editingClient.notes} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none min-h-[100px] resize-none" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#4A3728] transition-all">Сохранить</button>
                <button type="button" onClick={() => setEditingClient(null)} className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-5 rounded-2xl font-bold hover:bg-[#E8C4B8] transition-all">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLIENT DETAIL */}
      {selectedClient && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#F5F0E8] w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-[#8B6F5C] text-white flex items-center justify-center text-4xl font-bold shadow-xl">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-rounded font-bold text-[#4A3728]">{selectedClient.name}</h3>
                    <p className="text-xl font-bold text-[#8B6F5C]">{selectedClient.phone}</p>
                    {selectedClient.email && <p className="text-[#8B6F5C]/70">{selectedClient.email}</p>}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)} 
                  className="p-3 hover:bg-[#E8C4B8] rounded-full transition-colors text-[#4A3728]"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm border border-[#E8C4B8]/20">
                  <CreditCard className="mx-auto mb-2 text-[#8B6F5C]" size={20} />
                  <p className="text-[10px] text-[#8B6F5C] font-bold uppercase mb-1">Всего потрачено</p>
                  <p className="text-2xl font-bold text-[#4A3728]">{selectedClient.totalSpent}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm border border-[#E8C4B8]/20">
                  <History className="mx-auto mb-2 text-[#8B6F5C]" size={20} />
                  <p className="text-[10px] text-[#8B6F5C] font-bold uppercase mb-1">Кол-во визитов</p>
                  <p className="text-2xl font-bold text-[#4A3728]">{selectedClient.visits}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm border border-[#E8C4B8]/20">
                  <Calendar className="mx-auto mb-2 text-[#8B6F5C]" size={20} />
                  <p className="text-[10px] text-[#8B6F5C] font-bold uppercase mb-1">Последний визит</p>
                  <p className="text-xl font-bold text-[#4A3728]">{selectedClient.lastVisit}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-4">
                <h4 className="text-lg font-bold text-[#4A3728] flex items-center">
                  <MessageSquare size={18} className="mr-2 text-[#8B6F5C]" /> Заметки и история
                </h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-4 scrollbar-hide">
                  <div className="p-4 bg-[#F5F0E8] rounded-2xl italic text-sm text-[#4A3728]/70 whitespace-pre-wrap">
                    {selectedClient.notes || "Нет дополнительных заметок о клиенте"}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#8B6F5C] uppercase tracking-wider border-b border-[#F5F0E8] pb-2">История визитов</p>
                    {PAST_BOOKINGS.filter(b => b.clientName?.includes(selectedClient.name.split(' ')[0])).map(visit => (
                      <div key={visit.id} className="flex justify-between items-center text-sm py-2">
                        <div>
                          <p className="font-bold text-[#4A3728]">{visit.date}</p>
                          <p className="text-xs text-[#8B6F5C]">{visit.service} • {visit.master}</p>
                        </div>
                        <p className="font-bold text-[#4A3728]">{visit.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showAddForm && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Новый клиент</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={28} /></button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Имя</label>
                  <input required name="name" type="text" placeholder="Ирина Сергеевна" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Телефон</label>
                  <input required name="phone" type="tel" placeholder="+7 (900) 000-00-00" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Email</label>
                <input name="email" type="email" placeholder="example@mail.ru" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Заметки</label>
                <textarea name="notes" placeholder="Особенности, предпочтения..." className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none min-h-[100px] resize-none" />
              </div>
              <button type="submit" className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#4A3728] transition-all">Добавить клиента</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BLACKLIST REASON */}
      {blacklistingClient && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#4A3728]">В чёрный список?</h3>
              <p className="text-sm text-[#8B6F5C] mt-2">Клиент: <b>{blacklistingClient.name}</b></p>
            </div>
            <textarea 
              placeholder="Укажите причину блокировки..." 
              value={blacklistReason}
              onChange={e => setBlacklistReason(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none text-sm min-h-[80px] resize-none"
            />
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleBlacklistSubmit}
                disabled={!blacklistReason}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                Подтвердить блок
              </button>
              <button onClick={() => setBlacklistingClient(null)} className="w-full py-4 font-bold text-[#4A3728]">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
