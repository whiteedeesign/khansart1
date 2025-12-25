
import React, { useState, useMemo, useRef } from 'react';
import { 
  ImageIcon, Plus, Filter, ChevronDown, Edit2, Trash2, 
  Eye, EyeOff, X, Upload, Camera, Search, ArrowUpDown,
  Maximize2, CircleCheck, AlertCircle
} from 'lucide-react';
import { MASTER_PORTFOLIO, MASTERS, SERVICES } from '../../constants';
import { PortfolioWork } from '../../types';

const AdminGallery: React.FC = () => {
  const [works, setWorks] = useState<PortfolioWork[]>([...MASTER_PORTFOLIO]);
  
  // Filters
  const [masterFilter, setMasterFilter] = useState('Все мастера');
  const [serviceFilter, setServiceFilter] = useState('Все услуги');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modals / Overlays
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWork, setEditingWork] = useState<PortfolioWork | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  // Local State for Add Form
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notify, setNotify] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotify(msg);
    setTimeout(() => setNotify(null), 3000);
  };

  const filteredWorks = useMemo(() => {
    let result = works.filter(w => {
      const matchMaster = masterFilter === 'Все мастера' || w.masterName === masterFilter;
      const matchService = serviceFilter === 'Все услуги' || w.serviceType === serviceFilter;
      return matchMaster && matchService;
    });

    if (sortOrder === 'oldest') {
      return [...result].reverse(); // Mock reversing as we don't have actual timestamps
    }
    return result;
  }, [works, masterFilter, serviceFilter, sortOrder]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddWork = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWork: PortfolioWork = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: previewUrl || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600',
      serviceType: formData.get('service') as string,
      masterName: formData.get('master') as string,
      description: formData.get('description') as string,
      status: 'published'
    };
    setWorks([newWork, ...works]);
    setShowAddModal(false);
    setPreviewUrl(null);
    showNotify("Работа добавлена в галерею");
  };

  const handleEditWork = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingWork) return;
    const formData = new FormData(e.currentTarget);
    const updated = {
      ...editingWork,
      serviceType: formData.get('service') as string,
      description: formData.get('description') as string,
    };
    setWorks(prev => prev.map(w => w.id === editingWork.id ? updated : w));
    setEditingWork(null);
    showNotify("Данные работы обновлены");
  };

  const toggleVisibility = (id: string) => {
    setWorks(prev => prev.map(w => 
      w.id === id ? { ...w, status: w.status === 'hidden' ? 'published' : 'hidden' } : w
    ));
    showNotify("Статус видимости изменен");
  };

  const handleDelete = () => {
    if (confirmDelete) {
      setWorks(prev => prev.filter(w => w.id !== confirmDelete));
      setConfirmDelete(null);
      showNotify("Работа удалена из портфолио");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Notification */}
      {notify && (
        <div className="fixed top-6 right-6 z-[200] bg-[#4A3728] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notify}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Галерея работ</h2>
          <p className="text-[#8B6F5C] font-medium">Управляйте портфолио и примерами работ на сайте</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-[#8B6F5C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4A3728] transition-all transform active:scale-95 shrink-0"
        >
          <Plus size={20} />
          <span>Добавить фото</span>
        </button>
      </header>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Мастер</label>
          <select 
            value={masterFilter} 
            onChange={e => setMasterFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none border-none"
          >
            <option>Все мастера</option>
            {MASTERS.map(m => <option key={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Услуга</label>
          <select 
            value={serviceFilter} 
            onChange={e => setServiceFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none border-none"
          >
            <option>Все услуги</option>
            {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Сортировка</label>
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none border-none"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <button 
            onClick={() => { setMasterFilter('Все мастера'); setServiceFilter('Все услуги'); setSortOrder('newest'); }}
            className="w-full py-3 text-xs font-bold text-[#8B6F5C] hover:text-[#4A3728] transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWorks.map((work) => (
          <div 
            key={work.id} 
            className={`group relative aspect-square rounded-[2.5rem] overflow-hidden shadow-sm border border-[#E8C4B8]/30 transition-all ${
              work.status === 'hidden' ? 'opacity-50 grayscale' : ''
            }`}
          >
            <img 
              src={work.imageUrl} 
              alt={work.serviceType} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
              onClick={() => setLightboxImg(work.imageUrl)}
            />
            
            {/* Top Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-[#4A3728] uppercase shadow-sm">
                {work.serviceType}
              </span>
              {work.status === 'hidden' && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase shadow-sm">
                  Скрыто
                </span>
              )}
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => toggleVisibility(work.id)}
                  className="p-3 bg-white rounded-2xl text-[#4A3728] hover:bg-[#8B6F5C] hover:text-white transition-all shadow-lg"
                  title={work.status === 'hidden' ? "Показать" : "Скрыть"}
                >
                  {work.status === 'hidden' ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => setEditingWork(work)}
                  className="p-3 bg-white rounded-2xl text-[#4A3728] hover:bg-[#8B6F5C] hover:text-white transition-all shadow-lg"
                  title="Редактировать"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setConfirmDelete(work.id)}
                  className="p-3 bg-white rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                  title="Удалить"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="text-white space-y-1">
                <p className="font-bold text-lg">{work.masterName}</p>
                <p className="text-xs text-white/80 italic line-clamp-2">{work.description || "Без описания"}</p>
                <button 
                  onClick={() => setLightboxImg(work.imageUrl)}
                  className="flex items-center text-[10px] font-bold uppercase tracking-widest pt-2 hover:underline"
                >
                  <Maximize2 size={12} className="mr-1" /> Увеличить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWorks.length === 0 && (
        <div className="py-32 text-center space-y-6 bg-white rounded-[4rem] border border-dashed border-[#E8C4B8]">
          <ImageIcon className="mx-auto text-[#E8C4B8]" size={64} strokeWidth={1} />
          <div className="space-y-2">
            <p className="text-xl font-bold text-[#4A3728]">Фотографии не найдены</p>
            <p className="text-[#8B6F5C]">Попробуйте изменить параметры фильтрации или добавить новые работы</p>
          </div>
        </div>
      )}

      {/* MODAL: ADD PHOTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Добавить работу</h3>
              <button onClick={() => { setShowAddModal(false); setPreviewUrl(null); }} className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleAddWork} className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-[#F5F0E8] rounded-[2rem] border-2 border-dashed border-[#E8C4B8] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="text-white" size={40} />
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="text-[#8B6F5C]/40 mb-2" size={40} />
                    <span className="text-sm font-bold text-[#8B6F5C]/60 uppercase tracking-widest">Выбрать файл</span>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Мастер</label>
                  <select name="master" required className="w-full px-5 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none font-bold">
                    {MASTERS.map(m => <option key={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Услуга</label>
                  <select name="service" required className="w-full px-5 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none font-bold">
                    {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Описание</label>
                <textarea name="description" placeholder="Например: Изгиб С, 2D эффект..." className="w-full px-5 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none font-medium h-24 resize-none" />
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#4A3728] transition-all">Загрузить</button>
                <button type="button" onClick={() => { setShowAddModal(false); setPreviewUrl(null); }} className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-5 rounded-2xl font-bold">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PHOTO */}
      {editingWork && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Редактировать работу</h3>
              <button onClick={() => setEditingWork(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleEditWork} className="space-y-6">
              <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto shadow-md">
                <img src={editingWork.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Услуга</label>
                <select name="service" defaultValue={editingWork.serviceType} className="w-full px-5 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none font-bold">
                  {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Описание</label>
                <textarea name="description" defaultValue={editingWork.description} className="w-full px-5 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none font-medium h-24 resize-none" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold">Сохранить</button>
                <button type="button" onClick={() => setEditingWork(null)} className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><AlertCircle size={32} /></div>
              <h3 className="text-xl font-bold text-[#4A3728]">Удалить фото из галереи?</h3>
              <p className="text-sm text-[#8B6F5C]">Это действие нельзя отменить.</p>
              <div className="flex flex-col gap-2">
                 <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg">Да, удалить</button>
                 <button onClick={() => setConfirmDelete(null)} className="w-full py-4 font-bold text-[#4A3728]">Отмена</button>
              </div>
           </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-20 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-10 right-10 text-white hover:text-[#E8C4B8] transition-colors"><X size={48} /></button>
          <img src={lightboxImg} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-in zoom-in duration-500" alt="Full view" />
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
