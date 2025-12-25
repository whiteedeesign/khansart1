
import React, { useState } from 'react';
import { Plus, Layers, Edit2, Trash2, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { SERVICES } from '../../constants';
import { Service } from '../../types';

interface AdminServicesProps {
  onNotify: (msg: string) => void;
}

const AdminServices: React.FC<AdminServicesProps> = ({ onNotify }) => {
  const [servicesList, setServicesList] = useState<Service[]>([...SERVICES]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>(['Наращивание', 'Ламинирование', 'Коррекция']);
  
  const [showForm, setShowForm] = useState<{show: boolean, service?: Service}>({ show: false });
  const [showCatForm, setShowCatForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onNotify("Видимость изменена");
  };

  const handleDelete = () => {
    if (confirmDelete) {
      setServicesList(prev => prev.filter(s => s.id !== confirmDelete));
      setConfirmDelete(null);
      onNotify("Услуга удалена");
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNotify(showForm.service ? "Услуга обновлена" : "Услуга добавлена");
    setShowForm({ show: false });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Каталог услуг</h2>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowCatForm(true)} className="flex items-center space-x-2 bg-white border border-[#E8C4B8] text-[#8B6F5C] px-6 py-3 rounded-2xl font-bold">
            <Layers size={18} />
            <span>Категория</span>
          </button>
          <button onClick={() => setShowForm({ show: true })} className="flex items-center space-x-2 bg-[#8B6F5C] text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
            <Plus size={20} />
            <span>Добавить услугу</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map(s => {
          const isHidden = hiddenIds.has(s.id);
          return (
            <div key={s.id} className={`bg-white p-8 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 hover:border-[#8B6F5C] transition-all relative group ${isHidden ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#4A3728] mb-1">{s.name}</h3>
                  <span className="text-[10px] font-bold text-[#8B6F5C] uppercase bg-[#F5F0E8] px-3 py-1 rounded-full">{s.category}</span>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setShowForm({ show: true, service: s })} className="p-2 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl"><Edit2 size={16} /></button>
                   <button onClick={() => setConfirmDelete(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-sm text-[#4A3728]/60 mb-6 italic">"{s.description}"</p>
              <div className="flex items-center justify-between border-t border-[#F5F0E8] pt-6">
                <span className="text-xl font-rounded font-bold text-[#8B6F5C]">{s.price}</span>
                <button onClick={() => toggleVisibility(s.id)} className={`flex items-center space-x-1 text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl ${isHidden ? 'bg-[#4A3728] text-white' : 'bg-[#F5F0E8] text-[#8B6F5C]'}`}>
                  {isHidden ? <><Eye size={12} /> <span>Показать</span></> : <><EyeOff size={12} /> <span>Скрыть</span></>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">{showForm.service ? 'Редактировать' : 'Новая услуга'}</h3>
                 <button onClick={() => setShowForm({ show: false })}><X size={24} /></button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                 <div className="space-y-4">
                    <input required placeholder="Название" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold" defaultValue={showForm.service?.name} />
                    <div className="grid grid-cols-2 gap-4">
                       <select className="px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold">
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <input required type="number" placeholder="Цена" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold" />
                    </div>
                    <textarea placeholder="Описание..." className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] h-32" defaultValue={showForm.service?.description}></textarea>
                 </div>
                 <button type="submit" className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-lg">Сохранить изменения</button>
              </form>
           </div>
        </div>
      )}

      {showCatForm && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 animate-in zoom-in duration-300">
              <h3 className="text-xl font-bold text-[#4A3728] text-center">Новая категория</h3>
              <form onSubmit={e => { e.preventDefault(); setShowCatForm(false); onNotify("Категория добавлена"); }} className="space-y-4">
                 <input required placeholder="Название..." className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold" />
                 <button type="submit" className="w-full py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold">Добавить</button>
                 <button type="button" onClick={() => setShowCatForm(false)} className="w-full py-4 font-bold text-[#4A3728]">Отмена</button>
              </form>
           </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><AlertCircle size={32} /></div>
              <h3 className="text-xl font-bold text-[#4A3728]">Удалить услугу?</h3>
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

export default AdminServices;
