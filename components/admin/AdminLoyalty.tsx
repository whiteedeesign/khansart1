
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Search, Plus, Minus, History, Settings, 
  CircleCheck, X, Users, TrendingUp, Info, Save, ToggleRight, ToggleLeft
} from 'lucide-react';
import { ADMIN_CLIENTS } from '../../constants';

interface BonusHistoryEntry {
  id: string;
  date: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
}

interface ClientBonusData {
  clientId: string;
  accumulated: number;
  spent: number;
  history: BonusHistoryEntry[];
}

const AdminLoyalty: React.FC = () => {
  // Global Settings
  const [isActive, setIsActive] = useState(true);
  const [rubPerBonus, setRubPerBonus] = useState(100);
  const [bonusPerRub, setBonusPerRub] = useState(10);
  
  // Search
  const [search, setSearch] = useState('');
  
  // Mocking bonus data for clients since it's not in the shared constants
  const [clientBonuses, setClientBonuses] = useState<Record<string, ClientBonusData>>(
    ADMIN_CLIENTS.reduce((acc, c) => ({
      ...acc,
      [c.id]: {
        clientId: c.id,
        accumulated: Math.floor(Math.random() * 1000) + 500,
        spent: Math.floor(Math.random() * 200),
        history: [
          { id: 'h1', date: '10.05.2024', amount: 150, type: 'earn', description: 'Визит (2D Объём)' },
          { id: 'h2', date: '01.06.2024', amount: 50, type: 'spend', description: 'Скидка на снятие' }
        ]
      }
    }), {})
  );

  // Modals
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'add' | 'spend' | 'history' | 'addAll' | null>(null);
  const [bonusInput, setBonusInput] = useState('');
  const [notify, setNotify] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotify(msg);
    setTimeout(() => setNotify(null), 3000);
  };

  const filteredClients = useMemo(() => {
    const s = search.toLowerCase();
    return ADMIN_CLIENTS.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s));
  }, [search]);

  const handleUpdateBonuses = (clientId: string, amount: number, type: 'earn' | 'spend') => {
    const amountVal = Math.abs(amount);
    setClientBonuses(prev => {
      const current = prev[clientId];
      const newBalance = type === 'earn' ? current.accumulated + amountVal : current.accumulated;
      const newSpent = type === 'spend' ? current.spent + amountVal : current.spent;
      
      const newEntry: BonusHistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('ru-RU'),
        amount: amountVal,
        type,
        description: type === 'earn' ? 'Ручное начисление админом' : 'Ручное списание админом'
      };

      return {
        ...prev,
        [clientId]: {
          ...current,
          accumulated: type === 'earn' ? newBalance : current.accumulated,
          spent: type === 'spend' ? newSpent : current.spent,
          history: [newEntry, ...current.history]
        }
      };
    });
    setModalType(null);
    setBonusInput('');
    showNotify(type === 'earn' ? "Бонусы начислены" : "Бонусы списаны");
  };

  const handleAddAll = () => {
    const amount = parseInt(bonusInput);
    if (isNaN(amount)) return;
    
    setClientBonuses(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        const entry: BonusHistoryEntry = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString('ru-RU'),
          amount: amount,
          type: 'earn',
          description: 'Массовая акция от студии'
        };
        next[id] = {
          ...next[id],
          accumulated: next[id].accumulated + amount,
          history: [entry, ...next[id].history]
        };
      });
      return next;
    });
    setModalType(null);
    setBonusInput('');
    showNotify(`Начислено по ${amount} бонусов всем клиентам`);
  };

  const getBalance = (id: string) => {
    const data = clientBonuses[id];
    return data ? data.accumulated - data.spent : 0;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Toast Notification */}
      {notify && (
        <div className="fixed top-6 right-6 z-[200] bg-[#4A3728] text-[#F5F0E8] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notify}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Бонусная программа</h2>
          <p className="text-[#8B6F5C] font-medium">Управление лояльностью и баллами клиентов</p>
        </div>
        <button 
          onClick={() => setModalType('addAll')}
          className="flex items-center space-x-2 bg-[#4A3728] text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
        >
          <TrendingUp size={20} />
          <span>Начислить всем</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SETTINGS CARD */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 h-fit">
          <h3 className="text-xl font-bold text-[#4A3728] mb-6 flex items-center">
            <Settings size={20} className="mr-2 text-[#8B6F5C]" /> Настройки программы
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-2xl">
              <span className="font-bold text-[#4A3728] text-sm">Программа активна</span>
              <button onClick={() => { setIsActive(!isActive); showNotify(isActive ? "Программа отключена" : "Программа активирована"); }}>
                {isActive ? <ToggleRight className="text-green-500" size={32} /> : <ToggleLeft className="text-[#8B6F5C]/40" size={32} />}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2 mb-1 block">Курс начисления</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="number" 
                    value={rubPerBonus} 
                    onChange={e => setRubPerBonus(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-sm" 
                  />
                  <span className="text-[#4A3728] text-xs font-bold shrink-0">руб = 1 бонус</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2 mb-1 block">Курс списания</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="number" 
                    value={bonusPerRub} 
                    onChange={e => setBonusPerRub(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-sm" 
                  />
                  <span className="text-[#4A3728] text-xs font-bold shrink-0">бонусов = 1 руб</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => showNotify("Настройки успешно сохранены")}
              className="w-full py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold shadow-md hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Сохранить настройки</span>
            </button>
          </div>
        </div>

        {/* CLIENTS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 overflow-hidden">
          <div className="p-8 border-b border-[#F5F0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-[#4A3728] flex items-center">
              <Users size={20} className="mr-2 text-[#8B6F5C]" /> Баланс клиентов
            </h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={18} />
              <input 
                type="text" 
                placeholder="Имя или телефон..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#F5F0E8] text-sm outline-none focus:ring-2 focus:ring-[#8B6F5C]/20 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F5F0E8]/50 text-[#8B6F5C] text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Клиент</th>
                  <th className="px-8 py-5 text-center">Накоплено</th>
                  <th className="px-8 py-5 text-center">Потрачено</th>
                  <th className="px-8 py-5 text-right">Текущий баланс</th>
                  <th className="px-8 py-5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C4B8]/20">
                {filteredClients.map(c => (
                  <tr key={c.id} className="hover:bg-[#F5F0E8]/20 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-[#4A3728]">{c.name}</p>
                      <p className="text-xs text-[#8B6F5C]">{c.phone}</p>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-[#4A3728]">{clientBonuses[c.id].accumulated}</td>
                    <td className="px-8 py-6 text-center font-bold text-[#8B6F5C]/60">{clientBonuses[c.id].spent}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="bg-[#F5F0E8] px-4 py-2 rounded-xl font-bold text-[#8B6F5C]">
                        {getBalance(c.id)} B
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => { setSelectedClientId(c.id); setModalType('add'); }}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Начислить"
                        >
                          <Plus size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedClientId(c.id); setModalType('spend'); }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="Списать"
                        >
                          <Minus size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedClientId(c.id); setModalType('history'); }}
                          className="p-2 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-lg" title="История"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">
                {modalType === 'add' ? 'Начислить бонусы' : 
                 modalType === 'spend' ? 'Списать бонусы' : 
                 modalType === 'addAll' ? 'Бонусы всем' : 'История бонусов'}
              </h3>
              <button onClick={() => { setModalType(null); setSelectedClientId(null); setBonusInput(''); }}><X size={24} /></button>
            </div>

            {modalType === 'history' && selectedClientId ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {clientBonuses[selectedClientId].history.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-[#F5F0E8]/50 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-[#4A3728]">{h.description}</p>
                      <p className="text-[10px] text-[#8B6F5C] uppercase font-bold">{h.date}</p>
                    </div>
                    <span className={`font-bold ${h.type === 'earn' ? 'text-green-500' : 'text-red-400'}`}>
                      {h.type === 'earn' ? '+' : '-'}{h.amount} B
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Количество бонусов</label>
                  <input 
                    type="number" 
                    placeholder="Например: 100" 
                    value={bonusInput}
                    onChange={e => setBonusInput(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold outline-none" 
                  />
                  {modalType === 'spend' && selectedClientId && (
                    <p className="text-xs text-red-400 font-bold ml-2">Доступно для списания: {getBalance(selectedClientId)} B</p>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    if (modalType === 'addAll') handleAddAll();
                    else if (selectedClientId) handleUpdateBonuses(selectedClientId, parseInt(bonusInput), modalType as 'earn' | 'spend');
                  }}
                  disabled={!bonusInput || parseInt(bonusInput) <= 0}
                  className={`w-full py-5 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-30 ${
                    modalType === 'spend' ? 'bg-red-400 hover:bg-red-500' : 'bg-[#8B6F5C] hover:bg-[#4A3728]'
                  } text-white`}
                >
                  {modalType === 'spend' ? 'Списать' : 'Начислить'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoyalty;
