
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock, User as UserIcon, Scissors, Star, CircleCheck, X, Gift } from 'lucide-react';
import { SERVICES, MASTERS, TIME_SLOTS, COLORS } from '../constants';
import { BookingState, Service, Master } from '../types';

interface BookingPageProps {
  onHomeClick: () => void;
  initialServiceId?: string;
  initialMasterId?: string;
  appliedPromo?: string;
}

const BookingPage: React.FC<BookingPageProps> = ({ onHomeClick, initialServiceId, initialMasterId, appliedPromo }) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingState>({
    serviceId: initialServiceId || null,
    masterId: initialMasterId || null,
    date: null,
    time: null,
    userData: {
      name: '',
      phone: '',
      email: '',
      comment: '',
      createAccount: false,
    },
  });

  const [isSuccess, setIsSuccess] = useState(false);

  // Categories for Step 1
  const categories = ['Наращивание', 'Ламинирование', 'Коррекция'];
  const [activeCategory, setActiveCategory] = useState<string>('Наращивание');

  // Skip steps if data is pre-selected
  useEffect(() => {
    if (initialServiceId && initialMasterId) {
      setStep(3);
    } else if (initialServiceId) {
      setStep(2);
    } else if (initialMasterId) {
      setStep(1);
    }
    
    if (initialServiceId) {
      const service = SERVICES.find(s => s.id === initialServiceId);
      if (service) setActiveCategory(service.category);
    }
  }, [initialServiceId, initialMasterId]);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const selectedService = SERVICES.find(s => s.id === bookingData.serviceId);
  const selectedMaster = bookingData.masterId === 'any' 
    ? { name: 'Любой свободный мастер', role: 'Мастер', id: 'any', image: '' }
    : MASTERS.find(m => m.id === bookingData.masterId);

  const handleSubmit = () => {
    setIsSuccess(true);
  };

  const handleAddToCalendar = () => {
    if (!bookingData.date || !bookingData.time) return;
    
    const eventTitle = `Запись в Khan's Art: ${selectedService?.name}`;
    const eventDescription = `Мастер: ${selectedMaster?.name}. Ждем вас по адресу: ул. Арбат, 25.`;
    const eventLocation = "г. Москва, ул. Арбат, 25, этаж 3, офис 302";
    
    // Construct Google Calendar URL
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(eventTitle);
    const details = encodeURIComponent(eventDescription);
    const location = encodeURIComponent(eventLocation);
    
    const calendarUrl = `${baseUrl}&text=${text}&details=${details}&location=${location}`;
    window.open(calendarUrl, '_blank');
  };

  if (isSuccess) {
    return (
      <div className="pt-24 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 text-center animate-in fade-in zoom-in">
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 shadow-xl border border-[#E8C4B8]">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#8B6F5C] rounded-full flex items-center justify-center text-white mx-auto mb-6 md:mb-8 shadow-lg">
            <CircleCheck size={32} className="md:w-12 md:h-12" />
          </div>
          <h2 className="text-2xl md:text-4xl font-rounded font-bold text-[#4A3728] mb-2 md:mb-4">Вы успешно записаны!</h2>
          <p className="text-lg md:text-xl text-[#8B6F5C] mb-8 md:mb-12">Мы отправили подтверждение на ваш телефон.</p>
          
          <div className="bg-[#F5F0E8] rounded-2xl md:rounded-3xl p-6 md:p-8 text-left space-y-3 md:space-y-4 mb-8 md:mb-12">
            <p className="text-sm md:text-base"><span className="font-bold">Услуга:</span> {selectedService?.name}</p>
            <p className="text-sm md:text-base"><span className="font-bold">Мастер:</span> {selectedMaster?.name}</p>
            <p className="text-sm md:text-base"><span className="font-bold">Дата и время:</span> {bookingData.date}, {bookingData.time}</p>
            {appliedPromo && (
              <div className="flex items-center text-[#8B6F5C] font-bold py-2 border-t border-[#E8C4B8] mt-2 text-sm md:text-base">
                <Gift size={16} className="mr-2 md:w-5 md:h-5" />
                <span>Акция: {appliedPromo}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button 
              onClick={onHomeClick}
              className="bg-[#8B6F5C] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-[#4A3728] transition-all"
            >
              На главную
            </button>
            <button 
              onClick={handleAddToCalendar}
              className="border-2 border-[#8B6F5C] text-[#8B6F5C] px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-[#8B6F5C] hover:text-white transition-all flex items-center justify-center"
            >
              <CalendarIcon size={18} className="mr-2" />
              Добавить в календарь
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 max-w-5xl">
      {/* Promotion banner */}
      {appliedPromo && step < 5 && (
        <div className="mb-6 md:mb-8 bg-[#D4A69A] text-white p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Gift size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Акция применена!</p>
              <p className="text-[10px] md:text-xs text-white/80">{appliedPromo}</p>
            </div>
          </div>
          <div className="text-[10px] md:text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase shrink-0">Скидка 100%</div>
        </div>
      )}

      {/* Responsive Progress Bar */}
      <div className="mb-12 md:mb-16 px-2">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 bg-[#E8C4B8] -z-10" />
          
          {[1, 2, 3, 4, 5].map((s, idx) => (
            <div key={s} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                  s <= step ? 'bg-[#8B6F5C] text-white scale-110 shadow-lg' : 'bg-white text-[#8B6F5C] border-2 border-[#E8C4B8]'
                }`}
              >
                {s < step ? <Check size={16} className="md:w-5 md:h-5" /> : s}
              </div>
              <div className={`mt-3 text-[9px] md:text-xs font-bold uppercase tracking-tighter text-center absolute -bottom-6 md:-bottom-8 whitespace-nowrap hidden sm:block ${
                s === step ? 'text-[#8B6F5C]' : 'text-[#8B6F5C]/40'
              }`}>
                {['Услуга', 'Мастер', 'Время', 'Данные', 'Финал'][idx]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl overflow-hidden border border-[#E8C4B8]/30 mt-4 md:mt-8">
        <div className="p-6 md:p-12">
          
          {/* STEP 1: SERVICE */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl md:text-3xl font-rounded font-bold text-[#4A3728] mb-6 md:mb-8 text-center md:text-left">Выберите услугу</h2>
              <div className="flex space-x-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-all ${
                      activeCategory === cat ? 'bg-[#D4A69A] text-white shadow-md' : 'bg-[#F5F0E8] text-[#8B6F5C] hover:bg-[#E8C4B8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {SERVICES.filter(s => s.category === activeCategory).map(service => (
                  <div 
                    key={service.id}
                    onClick={() => setBookingData({ ...bookingData, serviceId: service.id })}
                    className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer group ${
                      bookingData.serviceId === service.id ? 'border-[#8B6F5C] bg-[#F5F0E8]' : 'border-transparent bg-[#F5F0E8]/50 hover:bg-[#F5F0E8]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-[#4A3728]">{service.name}</h3>
                      <span className="text-base md:text-lg font-bold text-[#8B6F5C] shrink-0 ml-2">{service.price}</span>
                    </div>
                    <p className="text-xs md:text-sm text-[#4A3728]/60 mb-4 line-clamp-2 md:line-clamp-none">{service.description}</p>
                    <div className="flex items-center text-[10px] md:text-xs text-[#8B6F5C] font-bold">
                      <Clock size={12} className="mr-1 md:w-3.5 md:h-3.5" /> {service.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: MASTER */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl md:text-3xl font-rounded font-bold text-[#4A3728] mb-6 md:mb-8 text-center md:text-left">Выберите мастера</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div 
                  onClick={() => setBookingData({ ...bookingData, masterId: 'any' })}
                  className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-3 md:space-y-4 ${
                    bookingData.masterId === 'any' ? 'border-[#8B6F5C] bg-[#F5F0E8]' : 'border-transparent bg-[#F5F0E8]/50 hover:bg-[#F5F0E8]'
                  }`}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E8C4B8] flex items-center justify-center text-[#8B6F5C]">
                    <UserIcon size={32} className="md:w-10 md:h-10" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-[#4A3728]">Любой мастер</h3>
                    <p className="text-[10px] md:text-xs text-[#8B6F5C]">Сэкономит время</p>
                  </div>
                </div>
                {MASTERS.map(master => (
                  <div 
                    key={master.id}
                    onClick={() => setBookingData({ ...bookingData, masterId: master.id })}
                    className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-3 md:space-y-4 ${
                      bookingData.masterId === master.id ? 'border-[#8B6F5C] bg-[#F5F0E8]' : 'border-transparent bg-[#F5F0E8]/50 hover:bg-[#F5F0E8]'
                    }`}
                  >
                    <img src={master.image} alt={master.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-md" />
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-[#4A3728]">{master.name}</h3>
                      <p className="text-[10px] md:text-xs text-[#8B6F5C]">{master.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl md:text-3xl font-rounded font-bold text-[#4A3728] mb-6 md:mb-8 text-center md:text-left">Выберите дату и время</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[#4A3728] mb-4 flex items-center">
                    <CalendarIcon size={18} className="mr-2 text-[#8B6F5C] md:w-5 md:h-5" /> Доступные даты
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 md:gap-2">
                    {availableDates.map((date) => {
                      const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
                      const dayLabel = date.toLocaleDateString('ru-RU', { weekday: 'short' });
                      const isSelected = bookingData.date === dateStr;
                      return (
                        <button 
                          key={dateStr}
                          onClick={() => setBookingData({ ...bookingData, date: dateStr })}
                          className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl flex flex-col items-center transition-all ${
                            isSelected ? 'bg-[#8B6F5C] text-white shadow-lg' : 'bg-[#F5F0E8] text-[#4A3728] hover:bg-[#E8C4B8]'
                          }`}
                        >
                          <span className="text-[8px] md:text-[10px] uppercase opacity-60">{dayLabel}</span>
                          <span className="text-base md:text-lg font-bold leading-tight">{date.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {bookingData.date && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-base md:text-lg font-bold text-[#4A3728] mb-4 flex items-center">
                      <Clock size={18} className="mr-2 text-[#8B6F5C] md:w-5 md:h-5" /> Доступное время
                    </h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      {TIME_SLOTS.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => setBookingData({ ...bookingData, time: slot })}
                          className={`py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all ${
                            bookingData.time === slot ? 'bg-[#D4A69A] text-white shadow-md' : 'bg-[#F5F0E8] text-[#8B6F5C] hover:bg-[#E8C4B8]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: USER DATA */}
          {step === 4 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-rounded font-bold text-[#4A3728] mb-6 md:mb-8 text-center">Контактные данные</h2>
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#4A3728]/60 ml-2">Как к вам обращаться?</label>
                  <input 
                    type="text" 
                    placeholder="Ваше имя" 
                    value={bookingData.userData.name}
                    onChange={e => setBookingData({ ...bookingData, userData: { ...bookingData.userData, name: e.target.value } })}
                    className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium text-sm md:text-base"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#4A3728]/60 ml-2">Номер телефона</label>
                  <input 
                    type="tel" 
                    placeholder="+7 (___) ___-__-__" 
                    value={bookingData.userData.phone}
                    onChange={e => setBookingData({ ...bookingData, userData: { ...bookingData.userData, phone: e.target.value } })}
                    className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium text-sm md:text-base"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#4A3728]/60 ml-2">Email (для чека)</label>
                  <input 
                    type="email" 
                    placeholder="example@mail.ru" 
                    value={bookingData.userData.email}
                    onChange={e => setBookingData({ ...bookingData, userData: { ...bookingData.userData, email: e.target.value } })}
                    className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium text-sm md:text-base"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#4A3728]/60 ml-2">Комментарий</label>
                  <textarea 
                    placeholder="Ваши пожелания..." 
                    rows={3}
                    value={bookingData.userData.comment}
                    onChange={e => setBookingData({ ...bookingData, userData: { ...bookingData.userData, comment: e.target.value } })}
                    className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all resize-none font-medium text-sm md:text-base"
                  />
                </div>

                <div className="flex flex-col space-y-3 pt-2 md:pt-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-md border-2 border-[#E8C4B8] text-[#8B6F5C] focus:ring-[#8B6F5C]"
                      checked={bookingData.userData.createAccount}
                      onChange={e => setBookingData({ ...bookingData, userData: { ...bookingData.userData, createAccount: e.target.checked } })}
                    />
                    <span className="text-xs md:text-sm text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors font-medium">Создать аккаунт для карты лояльности</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl md:text-3xl font-rounded font-bold text-[#4A3728] mb-6 md:mb-8">Подтверждение</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <div className="bg-[#F5F0E8] p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-[#E8C4B8]/50">
                    <h3 className="text-lg md:text-xl font-bold text-[#4A3728] mb-4 md:mb-6 border-b border-[#E8C4B8] pb-4">Детали записи</h3>
                    <div className="space-y-5 md:space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-[#8B6F5C]">
                          <Scissors size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-[#8B6F5C] uppercase font-bold tracking-wider">Услуга</p>
                          <p className="text-base md:text-lg font-bold text-[#4A3728]">{selectedService?.name}</p>
                          <p className="text-xs md:text-sm text-[#4A3728]/60">
                            {appliedPromo ? <span className="line-through mr-2">{selectedService?.price}</span> : null}
                            <span className={appliedPromo ? 'text-[#8B6F5C] font-bold' : ''}>
                              {appliedPromo ? '0₽ (По акции)' : selectedService?.price}
                            </span>
                            {' '}• {selectedService?.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-[#8B6F5C]">
                          <UserIcon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-[#8B6F5C] uppercase font-bold tracking-wider">Мастер</p>
                          <p className="text-base md:text-lg font-bold text-[#4A3728]">{selectedMaster?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-[#8B6F5C]">
                          <CalendarIcon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-[#8B6F5C] uppercase font-bold tracking-wider">Дата и время</p>
                          <p className="text-base md:text-lg font-bold text-[#4A3728]">{bookingData.date} в {bookingData.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-[#D4A69A] shadow-lg shadow-[#D4A69A]/10">
                    <h3 className="text-lg md:text-xl font-bold text-[#4A3728] mb-4 md:mb-6">Ваши данные</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] md:text-xs text-[#8B6F5C] uppercase font-bold">Имя</p>
                        <p className="font-bold text-[#4A3728]">{bookingData.userData.name || 'Не указано'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-[#8B6F5C] uppercase font-bold">Телефон</p>
                        <p className="font-bold text-[#4A3728]">{bookingData.userData.phone || 'Не указан'}</p>
                      </div>
                      {appliedPromo && (
                        <div className="pt-2 border-t border-[#E8C4B8]">
                           <div className="flex items-center text-[#8B6F5C] font-bold text-sm">
                             <Gift size={16} className="mr-1" /> Применена акция
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-[#4A3728]/50 text-center italic">Нажимая "Подтвердить запись", вы соглашаетесь с условиями оферты</p>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="mt-8 md:mt-12 flex items-center justify-between border-t border-[#E8C4B8]/30 pt-6 md:pt-8">
            <button 
              onClick={step === 1 ? onHomeClick : prevStep}
              className="flex items-center space-x-1.5 md:space-x-2 text-[#8B6F5C] font-bold hover:text-[#4A3728] transition-colors p-2 text-sm md:text-base"
            >
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
              <span>{step === 1 ? 'На главную' : 'Назад'}</span>
            </button>
            
            <button 
              onClick={step === 5 ? handleSubmit : nextStep}
              disabled={
                (step === 1 && !bookingData.serviceId) ||
                (step === 2 && !bookingData.masterId) ||
                (step === 3 && (!bookingData.date || !bookingData.time)) ||
                (step === 4 && (!bookingData.userData.name || !bookingData.userData.phone))
              }
              className="flex items-center space-x-1.5 md:space-x-2 bg-[#8B6F5C] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-[#8B6F5C]/20 hover:bg-[#4A3728] transition-all disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 text-sm md:text-base"
            >
              <span>{step === 5 ? 'Подтвердить' : 'Далее'}</span>
              {step < 5 && <ChevronRight size={18} className="md:w-5 md:h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
