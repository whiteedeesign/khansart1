
import React, { useState, useRef, useMemo } from 'react';
import { 
  Settings, Info, Clock, Share2, CalendarRange, Save, 
  Camera, Upload, Instagram, MessageCircle, Send, Globe,
  CheckCircle2, AlertCircle, ToggleRight, ToggleLeft
} from 'lucide-react';

interface AdminSettingsProps {
  onNotify: (msg: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onNotify }) => {
  // Basic Info
  const [studioName, setStudioName] = useState("Khan's Art");
  const [studioDesc, setStudioDesc] = useState("Студия наращивания ресниц премиум-класса. Создаем идеальные взгляды с 2018 года.");
  const [phone, setPhone] = useState("+7 (999) 123-45-67");
  const [email, setEmail] = useState("hello@khansart.ru");
  const [address, setAddress] = useState("г. Москва, ул. Арбат, 25, этаж 3, офис 302");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Schedule
  const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const [schedule, setSchedule] = useState(
    DAYS.map(day => ({
      day,
      isActive: !['Суббота', 'Воскресенье'].includes(day),
      open: '10:00',
      close: '21:00'
    }))
  );

  // Socials
  const [socials, setSocials] = useState({
    instagram: 'khans_art_lashes',
    whatsapp: '79991234567',
    telegram: 'khans_art',
    vk: 'khans_art_studio'
  });

  // Booking Rules
  const [bookingRules, setBookingRules] = useState({
    minHours: 2,
    maxDays: 30,
    requiresConfirmation: true
  });

  // Time options
  const timeOptions = useMemo(() => {
    const opts = [];
    for (let h = 7; h <= 23; h++) {
      opts.push(`${h < 10 ? '0' + h : h}:00`, `${h < 10 ? '0' + h : h}:30`);
    }
    return opts;
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const updateScheduleDay = (idx: number, updates: any) => {
    const next = [...schedule];
    next[idx] = { ...next[idx], ...updates };
    setSchedule(next);
  };

  const handleSave = () => {
    // Simulate API call
    onNotify("Все настройки успешно сохранены");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Настройки студии</h2>
          <p className="text-[#8B6F5C] font-medium">Управление информацией, графиком и правилами записи</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-[#8B6F5C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4A3728] transition-all flex items-center justify-center space-x-2 shrink-0 transform active:scale-95"
        >
          <Save size={20} />
          <span>Сохранить изменения</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION: BASIC INFO */}
        <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 space-y-8">
          <h3 className="text-xl font-bold text-[#4A3728] flex items-center">
            <Info size={20} className="mr-2 text-[#8B6F5C]" /> Основная информация
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 pb-4">
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="w-32 h-32 rounded-[2.5rem] bg-[#F5F0E8] border-2 border-dashed border-[#E8C4B8] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
            >
              {logoPreview ? (
                <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <Upload size={32} className="text-[#8B6F5C]/40" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-bold text-[#4A3728]">Логотип студии</p>
              <p className="text-xs text-[#8B6F5C]">Рекомендуемый размер 512x512px. <br /> Форматы: PNG, JPG.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Название</label>
              <input value={studioName} onChange={e => setStudioName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Описание студии</label>
              <textarea value={studioDesc} onChange={e => setStudioDesc(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none min-h-[100px] resize-none text-sm leading-relaxed" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Телефон</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Адрес</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-bold" />
            </div>
          </div>
        </section>

        <div className="space-y-8">
          {/* SECTION: WORK SCHEDULE */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 space-y-6">
            <h3 className="text-xl font-bold text-[#4A3728] flex items-center">
              <Clock size={20} className="mr-2 text-[#8B6F5C]" /> График работы
            </h3>
            <div className="space-y-2">
              {schedule.map((day, idx) => (
                <div key={day.day} className="flex items-center justify-between p-4 bg-[#F5F0E8]/50 rounded-2xl transition-all hover:bg-[#F5F0E8]">
                  <div className="flex items-center space-x-3 w-1/3">
                    <button 
                      onClick={() => updateScheduleDay(idx, { isActive: !day.isActive })}
                      className={`w-10 h-6 rounded-full relative transition-colors ${day.isActive ? 'bg-[#8B6F5C]' : 'bg-[#C49A7C]/30'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.isActive ? 'left-5' : 'left-1'}`} />
                    </button>
                    <span className="text-xs font-bold text-[#4A3728]">{day.day}</span>
                  </div>
                  
                  {day.isActive ? (
                    <div className="flex items-center space-x-2">
                      <select 
                        value={day.open} 
                        onChange={e => updateScheduleDay(idx, { open: e.target.value })}
                        className="bg-white border border-[#E8C4B8] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        {timeOptions.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span className="text-[#8B6F5C]">—</span>
                      <select 
                        value={day.close} 
                        onChange={e => updateScheduleDay(idx, { close: e.target.value })}
                        className="bg-white border border-[#E8C4B8] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        {timeOptions.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#C49A7C] uppercase tracking-widest italic">Выходной</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: BOOKING RULES */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 space-y-6">
            <h3 className="text-xl font-bold text-[#4A3728] flex items-center">
              <CalendarRange size={20} className="mr-2 text-[#8B6F5C]" /> Настройки записи
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-2xl">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#4A3728]">Минимум за...</p>
                  <p className="text-[10px] text-[#8B6F5C]">До начала процедуры (в часах)</p>
                </div>
                <input 
                  type="number" 
                  value={bookingRules.minHours} 
                  onChange={e => setBookingRules({...bookingRules, minHours: parseInt(e.target.value)})}
                  className="w-16 px-3 py-2 rounded-xl bg-white border border-[#E8C4B8] font-bold text-center" 
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-2xl">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#4A3728]">Максимум за...</p>
                  <p className="text-[10px] text-[#8B6F5C]">Глубина записи (в днях)</p>
                </div>
                <input 
                  type="number" 
                  value={bookingRules.maxDays} 
                  onChange={e => setBookingRules({...bookingRules, maxDays: parseInt(e.target.value)})}
                  className="w-16 px-3 py-2 rounded-xl bg-white border border-[#E8C4B8] font-bold text-center" 
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-2xl">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#4A3728]">Подтверждение записи</p>
                  <p className="text-[10px] text-[#8B6F5C]">Нужно ли одобрять запись вручную</p>
                </div>
                <button 
                  onClick={() => setBookingRules({...bookingRules, requiresConfirmation: !bookingRules.requiresConfirmation})}
                  className={`w-12 h-7 rounded-full relative transition-colors ${bookingRules.requiresConfirmation ? 'bg-green-500' : 'bg-[#C49A7C]/30'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${bookingRules.requiresConfirmation ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION: SOCIAL MEDIA */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 space-y-6">
            <h3 className="text-xl font-bold text-[#4A3728] flex items-center">
              <Share2 size={20} className="mr-2 text-[#8B6F5C]" /> Социальные сети
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
                <input 
                  placeholder="Instagram username" 
                  value={socials.instagram} 
                  onChange={e => setSocials({...socials, instagram: e.target.value})}
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" 
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
                <input 
                  placeholder="WhatsApp number" 
                  value={socials.whatsapp} 
                  onChange={e => setSocials({...socials, whatsapp: e.target.value})}
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" 
                />
              </div>
              <div className="relative">
                <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
                <input 
                  placeholder="Telegram username" 
                  value={socials.telegram} 
                  onChange={e => setSocials({...socials, telegram: e.target.value})}
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" 
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
                <input 
                  placeholder="VK profile" 
                  value={socials.vk} 
                  onChange={e => setSocials({...socials, vk: e.target.value})}
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" 
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
