
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Plus, ToggleRight, ToggleLeft, Check, Camera, Upload, 
  X, Clock, CalendarDays, Award, Star, Scissors, 
  AlertCircle, Save, User as UserIcon, Edit2
} from 'lucide-react';
import { MASTERS, TIME_SLOTS, MASTER_SCHEDULE } from '../../constants';
import { Master } from '../../types';

interface AdminMastersProps {
  onNotify: (msg: string) => void;
}

const AdminMasters: React.FC<AdminMastersProps> = ({ onNotify }) => {
  const [mastersList, setMastersList] = useState<Master[]>([...MASTERS]);
  const [masterStatuses, setMasterStatuses] = useState<Record<string, boolean>>(
    MASTERS.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );
  
  const [showForm, setShowForm] = useState<{show: boolean, master?: Master}>({ show: false });
  const [viewSchedule, setViewSchedule] = useState<Master | null>(null);
  
  // Form states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  
  // Advanced Schedule State
  const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const [scheduleData, setScheduleData] = useState(DAYS_SHORT.map(day => ({
    day, 
    isWorkDay: !['Сб', 'Вс'].includes(day), 
    startTime: '10:00', 
    endTime: '20:00'
  })));

  // 30-min time options generator
  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 8; h <= 22; h++) {
      options.push(`${h}:00`, `${h}:30`);
    }
    return options;
  }, []);

  useEffect(() => {
    if (showForm.show) {
      setPreviewImg(showForm.master?.image || null);
      // Reset schedule on open (could load from master data in real app)
      setScheduleData(DAYS_SHORT.map(day => ({
        day, 
        isWorkDay: !['Сб', 'Вс'].includes(day), 
        startTime: '10:00', 
        endTime: '20:00'
      })));
    }
  }, [showForm]);

  const toggleStatus = (id: string) => {
    setMasterStatuses(prev => ({ ...prev, [id]: !prev[id] }));
    const isActive = !masterStatuses[id];
    onNotify(`Мастер ${isActive ? 'активирован' : 'деактивирован'}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateDaySchedule = (idx: number, updates: Partial<typeof scheduleData[0]>) => {
    setScheduleData(prev => prev.map((d, i) => i === idx ? { ...d, ...updates } : d));
  };

  const applyPresetSchedule = (start: string, end: string) => {
    setScheduleData(prev => prev.map(d => ({ ...d, startTime: start, endTime: end })));
    onNotify("Применен пресет времени для всех дней");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const masterData = {
      id: showForm.master?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      image: previewImg || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500',
      description: formData.get('description') as string,
      experience: formData.get('experience') as string,
    };

    if (showForm.master) {
      setMastersList(prev => prev.map(m => m.id === masterData.id ? { ...m, ...masterData } : m));
    } else {
      setMastersList(prev => [...prev, { ...masterData, rating: 5.0 }]);
      setMasterStatuses(prev => ({ ...prev, [masterData.id]: true }));
    }

    onNotify(showForm.master ? "Данные мастера обновлены" : "Новый мастер успешно добавлен");
    setShowForm({ show: false });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Управление персоналом</h2>
          <p className="text-[#8B6F5C] font-medium">Команда Khan's Art: {mastersList.length} мастеров</p>
        </div>
        <button 
          onClick={() => setShowForm({ show: true })} 
          className="bg-[#8B6F5C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Добавить мастера</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mastersList.map((m) => {
          const isActive = masterStatuses[m.id];
          return (
            <div key={m.id} className={`bg-white rounded-[3.5rem] p-10 shadow-sm border border-[#E8C4B8]/30 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${!isActive ? 'opacity-60 grayscale' : ''}`}>
              {!isActive && (
                <div className="absolute top-0 right-0 bg-red-100 text-red-500 px-6 py-2 rounded-bl-3xl text-[10px] font-bold uppercase tracking-widest z-10">
                  Неактивен
                </div>
              )}
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-[#F5F0E8] overflow-hidden shadow-lg group-hover:border-[#E8C4B8] transition-colors">
                    <img src={m.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={m.name} />
                  </div>
                  <div className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-white rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">{m.name}</h3>
                  <p className="text-[#8B6F5C] font-bold text-sm uppercase tracking-wide">{m.role}</p>
                  <div className="flex items-center justify-center space-x-4 mt-3">
                    <div className="flex items-center text-xs font-bold text-[#C49A7C]">
                      <Star size={14} className="fill-[#C49A7C] mr-1" /> {m.rating}
                    </div>
                    <div className="flex items-center text-xs font-bold text-[#8B6F5C]">
                      <Award size={14} className="mr-1" /> {m.experience || 'Опытный'}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStatus(m.id)} 
                    className="flex items-center space-x-2 text-[10px] font-bold text-[#8B6F5C] mt-4 mx-auto uppercase tracking-tighter"
                  >
                     {isActive ? <ToggleRight className="text-green-500" size={24} /> : <ToggleLeft size={24} />}
                     <span>{isActive ? 'Активен' : 'Отключен'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => setViewSchedule(m)} 
                  className="w-full py-4 bg-[#F5F0E8] text-[#8B6F5C] rounded-2xl font-bold hover:bg-[#8B6F5C] hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <CalendarDays size={18} />
                  <span>График работы</span>
                </button>
                <button 
                  onClick={() => setShowForm({ show: true, master: m })} 
                  className="w-full py-4 border-2 border-[#E8C4B8] text-[#4A3728] rounded-2xl font-bold hover:bg-[#F5F0E8] transition-all flex items-center justify-center space-x-2"
                >
                  <Edit2 size={18} className="text-[#8B6F5C]" />
                  <span>Редактировать</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: MASTER ADD/EDIT FORM */}
      {showForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300 my-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">{showForm.master ? 'Редактировать профиль' : 'Новый мастер в команду'}</h3>
              <button onClick={() => setShowForm({ show: false })} className="p-3 hover:bg-[#F5F0E8] rounded-full transition-colors"><X size={32} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="flex flex-col items-center space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-48 h-48 rounded-[3rem] bg-[#F5F0E8] border-2 border-dashed border-[#E8C4B8] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-inner"
                  >
                    {previewImg ? (
                      <>
                        <img src={previewImg} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera size={32} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={40} className="text-[#8B6F5C]/40 mb-2" />
                        <span className="text-[10px] font-bold text-[#8B6F5C]/60 uppercase text-center px-8">Загрузить фото</span>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Имя мастера</label>
                    <input required name="name" placeholder="Анна Иванова" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]" defaultValue={showForm.master?.name} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Специализация</label>
                    <input required name="role" placeholder="Lash-стилист / Топ-мастер" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]" defaultValue={showForm.master?.role} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Опыт работы</label>
                    <input required name="experience" placeholder="Более 5 лет" className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]" defaultValue={showForm.master?.experience} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Рейтинг (от 1 до 5)</label>
                    <input required name="rating" type="number" step="0.1" min="1" max="5" defaultValue={showForm.master?.rating || 5.0} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Описание / Достижения</label>
                  <textarea name="description" placeholder="Краткое био мастера..." className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none min-h-[80px] resize-none text-sm leading-relaxed" defaultValue={showForm.master?.description} />
               </div>

               {/* REFINED WORKING HOURS */}
               <div className="space-y-6 pt-6 border-t border-[#F5F0E8]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest flex items-center"><CalendarDays size={14} className="mr-2" /> Настройка графика</label>
                    <div className="flex flex-wrap gap-2">
                       {[
                         { label: '10-20', s: '10:00', e: '20:00' },
                         { label: '9-18', s: '09:00', e: '18:00' },
                         { label: '11-21', s: '11:00', e: '21:00' }
                       ].map(p => (
                         <button 
                           key={p.label} 
                           type="button" 
                           onClick={() => applyPresetSchedule(p.s, p.e)}
                           className="text-[9px] font-bold uppercase bg-[#F5F0E8] text-[#8B6F5C] px-3 py-1.5 rounded-lg hover:bg-[#8B6F5C] hover:text-white transition-all"
                         >
                           {p.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#F5F0E8]/40 p-4 rounded-3xl border border-[#E8C4B8]/20">
                     {scheduleData.map((day, idx) => (
                        <div key={day.day} className="flex items-center justify-between py-2 border-b border-[#F5F0E8] last:border-0">
                           <div className="flex items-center space-x-3 w-20">
                             <div className="w-8 text-sm font-bold text-[#4A3728]">{day.day}</div>
                             <button 
                               type="button"
                               onClick={() => updateDaySchedule(idx, { isWorkDay: !day.isWorkDay })}
                               className={`w-10 h-6 rounded-full relative transition-colors ${day.isWorkDay ? 'bg-[#8B6F5C]' : 'bg-[#C49A7C]/30'}`}
                             >
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.isWorkDay ? 'left-5' : 'left-1'}`} />
                             </button>
                           </div>

                           {day.isWorkDay ? (
                             <div className="flex items-center space-x-2">
                               <select 
                                 value={day.startTime}
                                 onChange={(e) => updateDaySchedule(idx, { startTime: e.target.value })}
                                 className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#4A3728] border border-[#E8C4B8] outline-none"
                               >
                                 {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                               <span className="text-[#8B6F5C]">—</span>
                               <select 
                                 value={day.endTime}
                                 onChange={(e) => updateDaySchedule(idx, { endTime: e.target.value })}
                                 className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#4A3728] border border-[#E8C4B8] outline-none"
                               >
                                 {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                             </div>
                           ) : (
                             <div className="text-[10px] font-bold text-[#C49A7C] uppercase tracking-widest">Выходной</div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex gap-4">
                 <button type="submit" className="flex-1 bg-[#8B6F5C] text-white py-5 rounded-[2rem] font-bold shadow-xl hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-3">
                    <Save size={20} />
                    <span>Сохранить профиль</span>
                 </button>
                 <button type="button" onClick={() => setShowForm({ show: false })} className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-5 rounded-[2rem] font-bold hover:bg-[#E8C4B8] transition-all">
                    Отмена
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MASTER SCHEDULE VIEWER */}
      {viewSchedule && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-4">
                    <img src={viewSchedule.image} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">График: {viewSchedule.name}</h3>
                      <p className="text-[#8B6F5C] font-bold text-sm">Сегодня: {new Date().toLocaleDateString('ru-RU')}</p>
                    </div>
                 </div>
                 <button onClick={() => setViewSchedule(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full"><X size={32} /></button>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                 {MASTER_SCHEDULE.map(entry => (
                   <div key={entry.id} className="flex gap-4 items-center p-6 bg-[#F5F0E8] rounded-[2rem] border border-[#E8C4B8]/30 hover:shadow-inner transition-all group">
                      <div className="w-20 font-bold text-[#8B6F5C] text-lg">{entry.timeStart}</div>
                      <div className="flex-grow">
                         <div className="flex items-center space-x-2">
                           <p className="font-bold text-[#4A3728]">{entry.clientName}</p>
                           <span className="text-[10px] text-[#8B6F5C] font-bold uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full">{entry.service}</span>
                         </div>
                         <p className="text-xs text-[#8B6F5C]">{entry.clientPhone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                          entry.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {entry.status === 'confirmed' ? 'Ок' : 'Ожидает'}
                        </span>
                      </div>
                   </div>
                 ))}
                 {MASTER_SCHEDULE.length === 0 && (
                   <div className="py-20 text-center text-[#8B6F5C]/60 italic font-medium">Нет записей на текущий день</div>
                 )}
              </div>
              <button onClick={() => setViewSchedule(null)} className="w-full py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold">Закрыть</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminMasters;
