import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Plus, ToggleRight, ToggleLeft, Camera, Upload, 
  X, CalendarDays, Award, Star, Save, Edit2, Loader2, Trash2, Phone, Mail
} from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminMastersProps {
  onNotify: (msg: string) => void;
}

interface Master {
  id: string;
  name: string;
  specialization: string;
  photo_url: string | null;
  experience: string | null;
  bio: string | null;
  rating: number;
  is_active: boolean;
  phone: string | null;
  email: string | null;
}

interface MasterSchedule {
  day: string;
  isWorkDay: boolean;
  startTime: string;
  endTime: string;
}

interface TodayBooking {
  id: string;
  booking_time: string;
  client_name: string;
  client_phone: string;
  status: string;
  services: { name: string } | null;
}

const AdminMasters: React.FC<AdminMastersProps> = ({ onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [mastersList, setMastersList] = useState<Master[]>([]);
  const [showForm, setShowForm] = useState<{ show: boolean; master?: Master }>({ show: false });
  const [viewSchedule, setViewSchedule] = useState<Master | null>(null);
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Schedule State
  const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const [scheduleData, setScheduleData] = useState<MasterSchedule[]>(
    DAYS_SHORT.map(day => ({
      day,
      isWorkDay: !['Сб', 'Вс'].includes(day),
      startTime: '10:00',
      endTime: '20:00'
    }))
  );

  // Time options
  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 8; h <= 22; h++) {
      options.push(`${h.toString().padStart(2, '0')}:00`);
      options.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return options;
  }, []);

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    if (showForm.show) {
      setPreviewImg(showForm.master?.photo_url || null);
      // Load schedule from master or reset
      setScheduleData(DAYS_SHORT.map(day => ({
        day,
        isWorkDay: !['Сб', 'Вс'].includes(day),
        startTime: '10:00',
        endTime: '20:00'
      })));
    }
  }, [showForm]);

  const loadMasters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .order('name');

      if (error) throw error;
      setMastersList(data || []);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
      onNotify('Ошибка загрузки мастеров');
    } finally {
      setLoading(false);
    }
  };

  const loadMasterSchedule = async (master: Master) => {
    setViewSchedule(master);
    
    // Load today's bookings for this master
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('bookings')
      .select('id, booking_time, client_name, client_phone, status, services(name)')
      .eq('master_id', master.id)
      .eq('booking_date', today)
      .neq('status', 'cancelled')
      .order('booking_time');

    setTodayBookings(data || []);
  };

  const toggleStatus = async (master: Master) => {
    try {
      const newStatus = !master.is_active;
      const { error } = await supabase
        .from('masters')
        .update({ is_active: newStatus })
        .eq('id', master.id);

      if (error) throw error;

      setMastersList(prev =>
        prev.map(m => m.id === master.id ? { ...m, is_active: newStatus } : m)
      );
      onNotify(`Мастер ${newStatus ? 'активирован' : 'деактивирован'}`);
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка при обновлении статуса');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `master-${Date.now()}.${fileExt}`;
      const filePath = `masters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('gallery').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      return null;
    }
  };

  const updateDaySchedule = (idx: number, updates: Partial<MasterSchedule>) => {
    setScheduleData(prev => prev.map((d, i) => i === idx ? { ...d, ...updates } : d));
  };

  const applyPresetSchedule = (start: string, end: string) => {
    setScheduleData(prev => prev.map(d => ({ ...d, startTime: start, endTime: end })));
    onNotify('Применён пресет времени для всех дней');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      let photoUrl = showForm.master?.photo_url || null;

      // Upload photo if new one selected
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        setUploadingPhoto(true);
        const uploadedUrl = await uploadPhoto(fileInput.files[0]);
        if (uploadedUrl) photoUrl = uploadedUrl;
        setUploadingPhoto(false);
      }

      const masterData = {
        name: formData.get('name') as string,
        specialization: formData.get('specialization') as string,
        experience: formData.get('experience') as string,
        bio: formData.get('bio') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        rating: parseFloat(formData.get('rating') as string) || 5.0,
        photo_url: photoUrl,
        is_active: true
      };

      if (showForm.master) {
        // Update
        const { error } = await supabase
          .from('masters')
          .update(masterData)
          .eq('id', showForm.master.id);

        if (error) throw error;

        setMastersList(prev =>
          prev.map(m => m.id === showForm.master!.id ? { ...m, ...masterData } : m)
        );
        onNotify('Данные мастера обновлены');
      } else {
        // Create
        const { data, error } = await supabase
          .from('masters')
          .insert(masterData)
          .select()
          .single();

        if (error) throw error;

        setMastersList(prev => [...prev, data]);
        onNotify('Новый мастер добавлен');
      }

      setShowForm({ show: false });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      onNotify('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const deleteMaster = async (master: Master) => {
    if (!confirm(`Удалить мастера "${master.name}"? Это действие нельзя отменить.`)) return;

    setDeleting(master.id);
    try {
      const { error } = await supabase
        .from('masters')
        .delete()
        .eq('id', master.id);

      if (error) throw error;

      setMastersList(prev => prev.filter(m => m.id !== master.id));
      onNotify('Мастер удалён');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      onNotify('Ошибка при удалении мастера');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (time: string) => time?.slice(0, 5) || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка мастеров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Управление мастерами</h2>
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

      {/* Masters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mastersList.map((master) => (
          <div
            key={master.id}
            className={`bg-white rounded-[3rem] p-8 shadow-sm border border-[#E8C4B8]/30 group hover:shadow-xl transition-all duration-500 relative overflow-hidden ${
              !master.is_active ? 'opacity-60 grayscale' : ''
            }`}
          >
            {!master.is_active && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-500 px-6 py-2 rounded-bl-3xl text-[10px] font-bold uppercase tracking-widest z-10">
                Неактивен
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-[#F5F0E8] overflow-hidden shadow-lg group-hover:border-[#E8C4B8] transition-colors">
                  {master.photo_url ? (
                    <img
                      src={master.photo_url}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                      alt={master.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#8B6F5C] flex items-center justify-center text-white text-3xl font-bold">
                      {master.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div
                  className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-white rounded-full ${
                    master.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>

              <div>
                <h3 className="text-xl font-rounded font-bold text-[#4A3728]">{master.name}</h3>
                <p className="text-[#8B6F5C] font-bold text-sm uppercase tracking-wide">
                  {master.specialization || 'Мастер'}
                </p>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <div className="flex items-center text-xs font-bold text-[#C49A7C]">
                    <Star size={14} className="fill-[#C49A7C] mr-1" /> {master.rating || 5.0}
                  </div>
                  {master.experience && (
                    <div className="flex items-center text-xs font-bold text-[#8B6F5C]">
                      <Award size={14} className="mr-1" /> {master.experience}
                    </div>
                  )}
                </div>

                {(master.phone || master.email) && (
                  <div className="flex items-center justify-center space-x-3 mt-2 text-xs text-[#8B6F5C]">
                    {master.phone && (
                      <span className="flex items-center">
                        <Phone size={12} className="mr-1" /> {master.phone}
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => toggleStatus(master)}
                  className="flex items-center space-x-2 text-[10px] font-bold text-[#8B6F5C] mt-3 mx-auto uppercase tracking-tighter"
                >
                  {master.is_active ? (
                    <ToggleRight className="text-green-500" size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                  <span>{master.is_active ? 'Активен' : 'Отключен'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => loadMasterSchedule(master)}
                className="w-full py-3 bg-[#F5F0E8] text-[#8B6F5C] rounded-xl font-bold hover:bg-[#8B6F5C] hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <CalendarDays size={16} />
                <span>График на сегодня</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowForm({ show: true, master })}
                  className="py-3 border-2 border-[#E8C4B8] text-[#4A3728] rounded-xl font-bold hover:bg-[#F5F0E8] transition-all flex items-center justify-center space-x-1"
                >
                  <Edit2 size={14} />
                  <span>Изменить</span>
                </button>
                <button
                  onClick={() => deleteMaster(master)}
                  disabled={deleting === master.id}
                  className="py-3 border-2 border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  {deleting === master.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {mastersList.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-[#8B6F5C]" size={32} />
            </div>
            <p className="text-[#4A3728] font-bold text-lg">Нет мастеров</p>
            <p className="text-[#8B6F5C] text-sm">Добавьте первого мастера</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD/EDIT MASTER */}
      {showForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">
                {showForm.master ? 'Редактировать мастера' : 'Новый мастер'}
              </h3>
              <button
                onClick={() => setShowForm({ show: false })}
                className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 rounded-full bg-[#F5F0E8] border-2 border-dashed border-[#E8C4B8] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-inner"
                >
                  {previewImg ? (
                    <>
                      <img src={previewImg} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={28} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-[#8B6F5C]/40 mb-1" />
                      <span className="text-[9px] font-bold text-[#8B6F5C]/60 uppercase">Фото</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Имя мастера *
                  </label>
                  <input
                    required
                    name="name"
                    placeholder="Анна Иванова"
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                    defaultValue={showForm.master?.name}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Специализация *
                  </label>
                  <input
                    required
                    name="specialization"
                    placeholder="Brow-мастер"
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                    defaultValue={showForm.master?.specialization}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Опыт работы
                  </label>
                  <input
                    name="experience"
                    placeholder="5 лет"
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                    defaultValue={showForm.master?.experience || ''}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Рейтинг (1-5)
                  </label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    defaultValue={showForm.master?.rating || 5.0}
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Телефон
                  </label>
                  <input
                    name="phone"
                    placeholder="+7 (777) 123-45-67"
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                    defaultValue={showForm.master?.phone || ''}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="master@khansart.kz"
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                    defaultValue={showForm.master?.email || ''}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  О мастере
                </label>
                <textarea
                  name="bio"
                  placeholder="Краткое описание, достижения..."
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none min-h-[80px] resize-none text-sm"
                  defaultValue={showForm.master?.bio || ''}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-4 pt-4 border-t border-[#F5F0E8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest flex items-center">
                    <CalendarDays size={14} className="mr-2" /> График работы
                  </label>
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

                <div className="space-y-2 bg-[#F5F0E8]/40 p-4 rounded-2xl border border-[#E8C4B8]/20">
                  {scheduleData.map((day, idx) => (
                    <div key={day.day} className="flex items-center justify-between py-2 border-b border-[#F5F0E8] last:border-0">
                      <div className="flex items-center space-x-3 w-20">
                        <div className="w-8 text-sm font-bold text-[#4A3728]">{day.day}</div>
                        <button
                          type="button"
                          onClick={() => updateDaySchedule(idx, { isWorkDay: !day.isWorkDay })}
                          className={`w-10 h-6 rounded-full relative transition-colors ${
                            day.isWorkDay ? 'bg-[#8B6F5C]' : 'bg-[#C49A7C]/30'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              day.isWorkDay ? 'left-5' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {day.isWorkDay ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={day.startTime}
                            onChange={(e) => updateDaySchedule(idx, { startTime: e.target.value })}
                            className="px-2 py-1 rounded-lg bg-white text-xs font-bold text-[#4A3728] border border-[#E8C4B8] outline-none"
                          >
                            {timeOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-[#8B6F5C]">—</span>
                          <select
                            value={day.endTime}
                            onChange={(e) => updateDaySchedule(idx, { endTime: e.target.value })}
                            className="px-2 py-1 rounded-lg bg-white text-xs font-bold text-[#4A3728] border border-[#E8C4B8] outline-none"
                          >
                            {timeOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-[#C49A7C] uppercase tracking-widest">
                          Выходной
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm({ show: false })}
                  className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold hover:bg-[#E8C4B8] transition-all"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TODAY'S SCHEDULE */}
      {viewSchedule && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {viewSchedule.photo_url ? (
                  <img src={viewSchedule.photo_url} className="w-14 h-14 rounded-xl object-cover" alt="" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#8B6F5C] flex items-center justify-center text-white text-xl font-bold">
                    {viewSchedule.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-rounded font-bold text-[#4A3728]">{viewSchedule.name}</h3>
                  <p className="text-[#8B6F5C] font-bold text-sm">
                    Сегодня: {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewSchedule(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {todayBookings.length > 0 ? (
                todayBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="flex gap-4 items-center p-5 bg-[#F5F0E8] rounded-2xl border border-[#E8C4B8]/30 hover:shadow-inner transition-all"
                  >
                    <div className="w-16 font-bold text-[#8B6F5C] text-lg">
                      {formatTime(booking.booking_time)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-[#4A3728]">{booking.client_name}</p>
                        <span className="text-[10px] text-[#8B6F5C] font-bold uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full">
                          {booking.services?.name || 'Услуга'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8B6F5C]">{booking.client_phone}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-600'
                          : booking.status === 'completed'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'Подтв.' : booking.status === 'completed' ? 'Готово' : 'Ожидает'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-[#8B6F5C]/60 italic font-medium">
                  Нет записей на сегодня
                </div>
              )}
            </div>

            <button
              onClick={() => setViewSchedule(null)}
              className="w-full py-4 bg-[#8B6F5C] text-white rounded-2xl font-bold hover:bg-[#4A3728] transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMasters;
