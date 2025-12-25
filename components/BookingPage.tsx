import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock, User as UserIcon, Scissors, CircleCheck, X, Gift } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { SERVICES as FALLBACK_SERVICES, MASTERS as FALLBACK_MASTERS, TIME_SLOTS } from '../constants';
import { BookingState, Service, Master } from '../types';

interface BookingPageProps {
  onHomeClick: () => void;
  initialServiceId?: string;
  initialMasterId?: string;
  appliedPromo?: string;
  promoCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  user?: any;
}

const BookingPage: React.FC<BookingPageProps> = ({ 
  onHomeClick, 
  initialServiceId, 
  initialMasterId, 
  appliedPromo, 
  promoCode,
  discountPercent,
  discountAmount,
  user 
}) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [masters, setMasters] = useState<Master[]>(FALLBACK_MASTERS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');

  // 🎟️ Промокод вручную
  const [manualPromoCode, setManualPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromoData, setAppliedPromoData] = useState<{
    code: string;
    name: string;
    discountPercent?: number;
    discountAmount?: number;
  } | null>(null);
  
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
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Инициализация промокода из props
  useEffect(() => {
    if (appliedPromo && promoCode) {
      setAppliedPromoData({
        code: promoCode,
        name: appliedPromo,
        discountPercent: discountPercent,
        discountAmount: discountAmount
      });
      setManualPromoCode(promoCode);
    }
  }, [appliedPromo, promoCode, discountPercent, discountAmount]);

  // Автозаполнение данных авторизованного пользователя
  useEffect(() => {
    if (user) {
      console.log('👤 Автозаполнение данных пользователя:', user);
      setBookingData(prev => ({
        ...prev,
        userData: {
          ...prev.userData,
          name: user.user_metadata?.name || user.user_metadata?.full_name || prev.userData.name || '',
          phone: user.user_metadata?.phone || prev.userData.phone || '',
          email: user.email || prev.userData.email || ''
        }
      }));
    }
  }, [user]);

  // Загрузка данных из Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('name')
          .order('sort_order');

        if (categoriesData && categoriesData.length > 0) {
          const catNames = categoriesData.map(c => c.name);
          setCategories(catNames);
          setActiveCategory(catNames[0]);
        } else {
          setCategories(['Наращивание', 'Ламинирование', 'Коррекция', 'Оформление']);
          setActiveCategory('Наращивание');
        }

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select(`*, categories (name)`)
          .eq('is_active', true)
          .order('sort_order');

        if (servicesError) throw servicesError;

        if (servicesData && servicesData.length > 0) {
          const formatted: Service[] = servicesData.map(s => ({
            id: s.id,
            name: s.name,
            price: `от ${s.price}₽`,
            priceNumber: s.price,
            duration: s.duration >= 60 
              ? `${Math.floor(s.duration / 60)}${s.duration % 60 > 0 ? `.${s.duration % 60}` : ''} ч.`
              : `${s.duration} мин.`,
            durationMinutes: s.duration,
            category: s.categories?.name || 'Другое',
            description: s.description || ''
          }));
          setServices(formatted);
        }

        const { data: mastersData, error: mastersError } = await supabase
          .from('masters')
          .select('*')
          .eq('is_active', true);

        if (mastersError) throw mastersError;

        if (mastersData && mastersData.length > 0) {
          const formatted: Master[] = mastersData.map(m => ({
            id: m.id,
            name: m.name,
            role: m.specialization || 'Мастер',
            image: m.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500',
            experience: m.experience || '',
            description: m.bio || '',
            rating: m.rating || 5.0
          }));
          setMasters(formatted);
        }

      } catch (error) {
        console.log('⚠️ Используем локальные данные для бронирования', error);
        setCategories(['Наращивание', 'Ламинирование', 'Коррекция', 'Оформление']);
        setActiveCategory('Наращивание');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
      const service = services.find(s => s.id === initialServiceId);
      if (service) setActiveCategory(service.category);
    }
  }, [initialServiceId, initialMasterId, services]);

  // 🎟️ Применить промокод
  const handleApplyPromoCode = async () => {
    if (!manualPromoCode) return;
    
    setPromoLoading(true);
    setPromoError(null);
    
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('promo_code', manualPromoCode.toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        setPromoError('Промокод не найден или недействителен');
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (data.start_date) {
        const start = new Date(data.start_date);
        if (start > today) {
          setPromoError('Промокод ещё не активен');
          return;
        }
      }
      
      if (data.end_date) {
        const end = new Date(data.end_date);
        if (end < today) {
          setPromoError('Срок действия промокода истёк');
          return;
        }
      }
      
      setAppliedPromoData({
        code: data.promo_code,
        name: data.name,
        discountPercent: data.discount_percent || undefined,
        discountAmount: data.discount_amount || undefined
      });
      
      console.log('✅ Промокод применён:', data);
      
    } catch (err) {
      console.error('❌ Ошибка проверки промокода:', err);
      setPromoError('Ошибка проверки промокода');
    } finally {
      setPromoLoading(false);
    }
  };

  // 🎟️ Удалить промокод
  const handleRemovePromoCode = () => {
    setAppliedPromoData(null);
    setManualPromoCode('');
    setPromoError(null);
  };

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

  const selectedService = services.find(s => s.id === bookingData.serviceId);
  
  // Расчёт скидки (учитываем и props и ручной ввод)
  const activeDiscount = appliedPromoData || (appliedPromo ? {
    code: promoCode || '',
    name: appliedPromo,
    discountPercent,
    discountAmount
  } : null);

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (activeDiscount?.discountPercent) {
      return Math.round(originalPrice * (1 - activeDiscount.discountPercent / 100));
    }
    if (activeDiscount?.discountAmount) {
      return Math.max(0, originalPrice - activeDiscount.discountAmount);
    }
    return originalPrice;
  };

  const originalPrice = selectedService?.priceNumber || 0;
  const finalPrice = activeDiscount ? calculateDiscountedPrice(originalPrice) : originalPrice;
  const discountText = activeDiscount?.discountPercent 
    ? `-${activeDiscount.discountPercent}%` 
    : activeDiscount?.discountAmount 
      ? `-${activeDiscount.discountAmount}₽` 
      : '';

  const selectedMaster = bookingData.masterId === 'any' 
    ? { name: 'Любой свободный мастер', role: 'Мастер', id: 'any', image: '' }
    : masters.find(m => m.id === bookingData.masterId);

  const parseBookingDate = (dateStr: string, timeStr: string): string => {
    const months: { [key: string]: number } = {
      'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
      'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
      'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };
    
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0]);
    const month = months[parts[1]] ?? new Date().getMonth();
    const year = new Date().getFullYear();
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const date = new Date(year, month, day, hours, minutes);
    return date.toISOString();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const bookingDateTime = parseBookingDate(bookingData.date!, bookingData.time!);

      const bookingPayload = {
        client_name: bookingData.userData.name,
        client_phone: bookingData.userData.phone,
        client_email: bookingData.userData.email || null,
        service_id: bookingData.serviceId,
        master_id: bookingData.masterId === 'any' ? null : bookingData.masterId,
        booking_date: bookingDateTime.split('T')[0],
        booking_time: bookingData.time,
        duration: (selectedService as any)?.durationMinutes || 60,
        price: originalPrice,
        total_price: finalPrice,
        status: 'pending',
        notes: bookingData.userData.comment || null,
        promo_code: activeDiscount?.code || null,
        user_id: user?.id || null
      };
      
      console.log('📤 Отправляем запись:', bookingPayload);

      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ Запись создана:', data);
      setBookingId(data.id);
      setIsSuccess(true);

    } catch (err: any) {
      console.error('❌ Ошибка создания записи:', err);
      setError(err.message || 'Произошла ошибка при создании записи');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!bookingData.date || !bookingData.time) return;
    
    const eventTitle = `Запись в Khan's Art: ${selectedService?.name}`;
    const eventDescription = `Мастер: ${selectedMaster?.name}. Ждем вас по адресу: ул. Арбат, 25.`;
    const eventLocation = "г. Москва, ул. Арбат, 25, этаж 3, офис 302";
    
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(eventTitle);
    const details = encodeURIComponent(eventDescription);
    const location = encodeURIComponent(eventLocation);
    
    const calendarUrl = `${baseUrl}&text=${text}&details=${details}&location=${location}`;
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-24 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 text-center">
        <div className="w-12 h-12 border-4 border-[#8B6F5C] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[#8B6F5C]">Загрузка...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="pt-24 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 text-center animate-in fade-in zoom-in">
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 shadow-xl border border-[#E8C4B8]">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#8B6F5C] rounded-full flex items-center justify-center text-white mx-auto mb-6 md:mb-8 shadow-lg">
            <CircleCheck size={32} className="md:w-12 md:h-12" />
          </div>
          <h2 className="text-2xl md:text-4xl font-rounded font-bold text-[#4A3728] mb-2 md:mb-4">Вы успешно записаны!</h2>
          <p className="text-lg md:text-xl text-[#8B6F5C] mb-8 md:mb-12">Мы отправили подтверждение на ваш телефон.</p>
          
          {bookingId && (
            <p className="text-sm text-[#8B6F5C]/60 mb-4">Номер записи: {bookingId.slice(0, 8)}...</p>
          )}
          
          <div className="bg-[#F5F0E8] rounded-2xl md:rounded-3xl p-6 md:p-8 text-left space-y-3 md:space-y-4 mb-8 md:mb-12">
            <p className="text-sm md:text-base"><span className="font-bold">Услуга:</span> {selectedService?.name}</p>
            <p className="text-sm md:text-base"><span className="font-bold">Мастер:</span> {selectedMaster?.name}</p>
            <p className="text-sm md:text-base"><span className="font-bold">Дата и время:</span> {bookingData.date}, {bookingData.time}</p>
            {activeDiscount && (
              <>
                <div className="flex items-center justify-between text-[#8B6F5C] font-bold py-2 border-t border-[#E8C4B8] mt-2 text-sm md:text-base">
                  <div className="flex items-center">
                    <Gift size={16} className="mr-2 md:w-5 md:h-5" />
                    <span>Акция: {activeDiscount.name}</span>
                  </div>
                  <span className="text-green-600">{discountText}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Итого со скидкой:</span>
                  <span className="font-bold text-[#8B6F5C]">{finalPrice}₽</span>
                </div>
              </>
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
      {error && (
        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={20} /></button>
        </div>
      )}

      {activeDiscount && step < 5 && (
        <div className="mb-6 md:mb-8 bg-[#D4A69A] text-white p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Gift size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Акция применена!</p>
              <p className="text-[10px] md:text-xs text-white/80">{activeDiscount.name}</p>
            </div>
          </div>
          <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{discountText || 'Скидка'}</div>
        </div>
      )}

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
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat ? 'bg-[#D4A69A] text-white shadow-md' : 'bg-[#F5F0E8] text-[#8B6F5C] hover:bg-[#E8C4B8]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                ) : (
                  <p className="text-[#8B6F5C]">Загрузка категорий...</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {services.filter(s => s.category === activeCategory).map(service => (
                  <div 
                    key={service.id}
                    onClick={() => setBookingData({ ...bookingData, serviceId: service.id })}
                    className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer group ${
                      bookingData.serviceId === service.id 
                        ? 'border-[#8B6F5C] bg-[#F5F0E8]' 
                        : 'border-transparent bg-[#F5F0E8]/50 hover:bg-[#F5F0E8]'
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
                {services.filter(s => s.category === activeCategory).length === 0 && (
                  <p className="text-[#8B6F5C] col-span-2 text-center py-8">Нет услуг в этой категории</p>
                )}
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
                {masters.map(master => (
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
                
                {/* 🎟️ ПРОМОКОД */}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#4A3728]/60 ml-2">Промокод</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Введите промокод" 
                      value={manualPromoCode}
                      onChange={e => setManualPromoCode(e.target.value.toUpperCase())}
                      disabled={!!appliedPromoData}
                      className="flex-1 px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium text-sm md:text-base uppercase disabled:opacity-50"
                    />
                    {!appliedPromoData ? (
                      <button
                        type="button"
                        onClick={handleApplyPromoCode}
                        disabled={!manualPromoCode || promoLoading}
                        className="px-5 py-3.5 md:px-6 md:py-4 bg-[#8B6F5C] text-white rounded-xl md:rounded-2xl font-bold hover:bg-[#4A3728] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {promoLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Применить'
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRemovePromoCode}
                        className="px-5 py-3.5 md:px-6 md:py-4 bg-red-500 text-white rounded-xl md:rounded-2xl font-bold hover:bg-red-600 transition-all"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-xs md:text-sm ml-2">{promoError}</p>
                  )}
                  {appliedPromoData && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2 flex items-center gap-2">
                      <Gift size={18} className="text-green-600" />
                      <div>
                        <p className="text-green-700 font-bold text-sm">{appliedPromoData.name}</p>
                        <p className="text-green-600 text-xs">
                          Скидка: {appliedPromoData.discountPercent ? `${appliedPromoData.discountPercent}%` : `${appliedPromoData.discountAmount}₽`}
                        </p>
                      </div>
                    </div>
                  )}
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
                        <div className="flex-grow">
                          <p className="text-[10px] md:text-xs text-[#8B6F5C] uppercase font-bold tracking-wider">Услуга</p>
                          <p className="text-base md:text-lg font-bold text-[#4A3728]">{selectedService?.name}</p>
                          <div className="text-xs md:text-sm text-[#4A3728]/60 flex items-center gap-2">
                            {activeDiscount ? (
                              <>
                                <span className="line-through">{originalPrice}₽</span>
                                <span className="text-green-600 font-bold">{finalPrice}₽</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">{discountText}</span>
                              </>
                            ) : (
                              <span>{selectedService?.price}</span>
                            )}
                            <span>• {selectedService?.duration}</span>
                          </div>
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
                      {activeDiscount && (
                        <div className="pt-4 border-t border-[#E8C4B8]">
                          <div className="flex items-center text-[#8B6F5C] font-bold text-sm mb-2">
                            <Gift size={16} className="mr-2" /> Акция применена
                          </div>
                          <p className="text-xs text-[#4A3728]/60">{activeDiscount.name}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm">Скидка:</span>
                            <span className="font-bold text-green-600">{discountText}</span>
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <span className="text-sm font-bold">Итого:</span>
                            <span className="font-bold text-lg text-[#8B6F5C]">{finalPrice}₽</span>
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
                submitting ||
                (step === 1 && !bookingData.serviceId) ||
                (step === 2 && !bookingData.masterId) ||
                (step === 3 && (!bookingData.date || !bookingData.time)) ||
                (step === 4 && (!bookingData.userData.name || !bookingData.userData.phone))
              }
              className="flex items-center space-x-1.5 md:space-x-2 bg-[#8B6F5C] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-[#8B6F5C]/20 hover:bg-[#4A3728] transition-all disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 text-sm md:text-base"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <span>{step === 5 ? 'Подтвердить' : 'Далее'}</span>
                  {step < 5 && <ChevronRight size={18} className="md:w-5 md:h-5" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
