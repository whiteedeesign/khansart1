
import React, { useState } from 'react';
import { Plus, Gift, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { PROMOTIONS } from '../../constants';
import { Promotion } from '../../types';

interface AdminPromotionsProps {
  onNotify: (msg: string) => void;
}

const AdminPromotions: React.FC<AdminPromotionsProps> = ({ onNotify }) => {
  const [promos, setPromos] = useState<Promotion[]>([...PROMOTIONS]);
  const [showForm, setShowForm] = useState<{show: boolean, promo?: Promotion}>({ show: false });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify(showForm.promo ? "Акция обновлена" : "Акция создана");
    setShowForm({ show: false });
  };

  const handleDelete = () => {
    if (confirmDelete) {
      setPromos(prev => prev.filter(p => p.id !== confirmDelete));
      setConfirmDelete(null);
      onNotify("Акция удалена");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Акции и скидки</h2>
        <button onClick={() => setShowForm({ show: true })} className="bg-[#8B6F5C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center space-x-2">
          <Plus size={20} />
          <span>Новая акция</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {promos.map(p => (
          <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col md:flex-row gap-8 relative group overflow-hidden">
            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-[2rem] text-[10px] font-bold uppercase tracking-widest ${p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {p.status === 'active' ? 'Активна' : 'Черновик'}
            </div>
            <div className="w-24 h-24 bg-[#F5F0E8] rounded-[2rem] flex items-center justify-center text-[#8B6F5C] shrink-0">
              <Gift size={40} />
            </div>
            <div className="flex-grow space-y-4">
              <h3 className="text-2xl font-bold text-[#4A3728]">{p.title}</h3>
              <p className="text-[#4A3728]/60 text-sm leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-6 pt-4 border-t border-[#F5F0E8]">
                <div><p className="text-[9px] font-bold text-[#8B6F5C] uppercase">Скидка</p><p className="font-bold text-[#4A3728]">{p.discount}</p></div>
                <div><p className="text-[9px] font-bold text-[#8B6F5C] uppercase">Код</p><p className="font-bold text-[#4A3728]">{p.promoCode || '—'}</p></div>
                <div><p className="text-[9px] font-bold text-[#8B6F5C] uppercase">Срок</p><p className="font-bold text-[#4A3728]">{p.expiryDate}</p></div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-[#F5F0E8]/50">
                 <button onClick={() => setShowForm({ show: true, promo: p })} className="flex items-center space-x-1 text-xs font-bold text-[#8B6F5C] hover:underline"><Edit2 size={14} /> <span>Редактировать</span></button>
                 <button onClick={() => setConfirmDelete(p.id)} className="flex items-center space-x-1 text-xs font-bold text-red-400 hover:underline"><Trash2 size={14} /> <span>Удалить</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">{showForm.promo ? 'Редактировать' : 'Новая акция'}</h3>
                 <button onClick={() => setShowForm({ show: false })}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-4">
                    <input required placeholder="Название акции" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold" defaultValue={showForm.promo?.title} />
                    <textarea required placeholder="Описание..." className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] h-24" defaultValue={showForm.promo?.description}></textarea>
                    <div className="grid grid-cols-2 gap-4">
                       <input required placeholder="Скидка (напр. 15%)" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold" defaultValue={showForm.promo?.discount} />
                       <input placeholder="Промокод (если есть)" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold uppercase" defaultValue={showForm.promo?.promoCode} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input required placeholder="Действует до" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold" defaultValue={showForm.promo?.expiryDate} />
                       <select className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold">
                          <option value="active">Активна</option>
                          <option value="draft">Черновик</option>
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-lg">Опубликовать</button>
              </form>
           </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><AlertCircle size={32} /></div>
              <h3 className="text-xl font-bold text-[#4A3728]">Удалить акцию?</h3>
              <div className="flex flex-col gap-2">
                 <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold">Да, удалить</button>
                 <button onClick={() => setConfirmDelete(null)} className="w-full py-4 font-bold">Отмена</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
