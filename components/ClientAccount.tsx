
import React, { useState, useEffect } from 'react';
import { 
  Calendar, CreditCard, History, MessageSquare, Settings, LogOut, 
  ChevronRight, Star, MapPin, Bell, Trash2, Camera, Plus, Clock, User,
  X, AlertTriangle, CircleCheck
} from 'lucide-react';
import { MOCK_USER, PAST_BOOKINGS, REVIEWS, MASTERS, TIME_SLOTS } from '../constants';

type Tab = 'bookings' | 'loyalty' | 'history' | 'reviews' | 'settings';

interface ClientAccountProps {
  onHomeClick: () => void;
  onBookClick: () => void;
}

const ClientAccount: React.FC<ClientAccountProps> = ({ onHomeClick, onBookClick }) => {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for simulated data
  const [upcomingBookings, setUpcomingBookings] = useState([
    { 
      id: 'b1', 
      date: '25 июня, 14:00', 
      service: '2D-3D объём', 
      price: '3200₽', 
      master: 'Анна Кхан', 
      status: 'confirmed',
      masterImg: MASTERS[0].image
    }
  ]);
  const [pastBookings, setPastBookings] = useState([...PAST_BOOKINGS]);
  const [myReviews, setMyReviews] = useState([
    { id: 'r1', rating: 5, text: 'Самая уютная студия в городе! Ресницы держатся целый месяц...', date: '12.05.2024', service: '2D-3D объём' }
  ]);
  
  // Modal states
  const [modal, setModal] = useState<{
    type: 'reschedule' | 'cancel' | 'review' | 'deleteAccount' | 'deleteReview' | null,
    data?: any
  }>({ type: null });
  
  const [notification, setNotification] = useState<string | null>(null);

  const menuItems = [
    { id: 'bookings', label: 'Мои записи', icon: <Calendar size={20} /> },
    { id: 'loyalty', label: 'Карта лояльности', icon: <CreditCard size={20} /> },
    { id: 'history', label: 'История посещений', icon: <History size={20} /> },
    { id: 'reviews', label: 'Мои отзывы', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'Настройки профиля', icon: <Settings size={20} /> },
  ];

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelBooking = (id: string) => {
    setUpcomingBookings(prev => prev.filter(b => b.id !== id));
    setModal({ type: null });
    showNotify("Запись отменена");
  };

  const handleReschedule = (id: string, newDate: string, newTime: string) => {
    setUpcomingBookings(prev => prev.map(b => b.id === id ? { ...b, date: `${newDate}, ${newTime}` } : b));
    setModal({ type: null });
    showNotify("Дата записи успешно изменена");
  };

  const handleSaveReview = (reviewData: { id?: string, rating: number, text: string }) => {
    if (reviewData.id) {
      setMyReviews(prev => prev.map(r => r.id === reviewData.id ? { ...r, ...reviewData } : r));
      showNotify("Отзыв изменен");
    } else {
      const newReview = {
        id: Math.random().toString(36).substr(2, 9),
        rating: reviewData.rating,
        text: reviewData.text,
        date: new Date().toLocaleDateString('ru-RU'),
        service: 'Услуга'
      };
      setMyReviews(prev => [newReview, ...prev]);
      showNotify("Спасибо за ваш отзыв!");
    }
    setModal({ type: null });
  };

  const handleDeleteReview = (id: string) => {
    setMyReviews(prev => prev.filter(r => r.id !== id));
    setModal({ type: null });
    showNotify("Отзыв удален");
  };

  return (
    <div className="pt-32 pb-24 container mx-auto px-6">
      {/* Notifications */}
      {notification && (
        <div className="fixed top-24 right-6 z-[110] bg-[#4A3728] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* MOBILE MENU TOGGLE */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            <img src={MOCK_USER.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-[#E8C4B8]" />
            <span className="font-bold text-[#4A3728]">{MOCK_USER.name}</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#8B6F5C] font-bold">Меню</button>
        </div>

        {/* SIDEBAR */}
        <aside className={`${isMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-4 shrink-0`}>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E8C4B8]/30">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4 group cursor-pointer">
                <img src={MOCK_USER.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-[#F5F0E8] object-cover" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#4A3728]">{MOCK_USER.name}</h2>
              <p className="text-sm text-[#8B6F5C]">{MOCK_USER.phone}</p>
            </div>

            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as Tab); setIsMenuOpen(false); }}
                  className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-[#8B6F5C] text-white shadow-lg shadow-[#8B6F5C]/20' 
                    : 'text-[#4A3728] hover:bg-[#F5F0E8] hover:text-[#8B6F5C]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button 
                onClick={onHomeClick}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-[#D4A69A] hover:bg-[#F5F0E8] transition-all"
              >
                <LogOut size={20} />
                <span>Выйти</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-grow space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-6">Предстоящие записи</h3>
                {upcomingBookings.length > 0 ? (
                  <div className="grid gap-6">
                    {upcomingBookings.map(b => (
                      <div key={b.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                          <div className="bg-[#F5F0E8] p-4 rounded-3xl text-center min-w-[100px]">
                            <p className="text-xs text-[#8B6F5C] font-bold uppercase mb-1">{b.date.split(' ')[1]}</p>
                            <p className="text-3xl font-rounded font-bold text-[#4A3728]">{b.date.split(' ')[0]}</p>
                            <p className="text-sm font-bold text-[#8B6F5C]">{b.date.split(', ')[1]}</p>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-[#4A3728] mb-1">{b.service}</h4>
                            <p className="text-[#8B6F5C] font-medium mb-2">{b.price}</p>
                            <div className="flex items-center space-x-2 text-sm text-[#4A3728]/60">
                              <img src={b.masterImg} className="w-6 h-6 rounded-full object-cover" />
                              <span>Мастер: {b.master}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={() => setModal({ type: 'reschedule', data: b })}
                            className="px-6 py-2 border border-[#E8C4B8] text-[#4A3728] rounded-xl font-bold hover:bg-[#F5F0E8] transition-all"
                          >
                            Перенести
                          </button>
                          <button 
                            onClick={() => setModal({ type: 'cancel', data: b })}
                            className="px-6 py-2 border border-[#E8C4B8] text-red-400 rounded-xl font-bold hover:bg-red-50 transition-all"
                          >
                            Отменить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-[#E8C4B8]">
                    <p className="text-[#4A3728]/60 mb-6">У вас пока нет предстоящих записей</p>
                    <button onClick={onBookClick} className="bg-[#8B6F5C] text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Записаться</button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-6">Прошедшие записи</h3>
                <div className="grid gap-4 mt-6">
                  {pastBookings.map(b => (
                    <div key={b.id} className="bg-white/60 p-6 rounded-3xl border border-[#E8C4B8]/20 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#4A3728]">{b.date}</p>
                        <p className="text-xs text-[#8B6F5C]">{b.service} • {b.master}</p>
                      </div>
                      {!b.reviewId ? (
                        <button 
                          onClick={() => setModal({ type: 'review', data: { service: b.service } })}
                          className="text-xs font-bold text-[#8B6F5C] underline hover:text-[#4A3728]"
                        >
                          Оставить отзыв
                        </button>
                      ) : (
                        <div className="flex text-[#C49A7C]"><Star size={12} className="fill-[#C49A7C]" /><Star size={12} className="fill-[#C49A7C]" /><Star size={12} className="fill-[#C49A7C]" /></div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="space-y-12">
              <div className="bg-[#D4A69A] p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Star size={300} strokeWidth={1} /></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h3 className="text-3xl font-rounded font-bold mb-1">Khan's Art Loyalty</h3>
                      <p className="text-white/60 text-sm">Карта лояльности</p>
                    </div>
                    <div className="text-4xl font-rounded">K'A</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-rounded font-bold tracking-widest">{MOCK_USER.name}</p>
                    <p className="text-sm text-white/60">ID: 4892 0293 8472</p>
                  </div>
                </div>
              </div>
              <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30">
                <h3 className="text-2xl font-bold text-[#4A3728] text-center mb-10">Ваш прогресс</h3>
                <div className="flex justify-center items-center space-x-4 md:space-x-8 mb-10">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 ${
                      i <= MOCK_USER.loyaltyStamps ? 'bg-[#8B6F5C] border-[#8B6F5C] text-white' : 'bg-white border-[#E8C4B8] text-[#E8C4B8]'
                    }`}>
                      {i <= MOCK_USER.loyaltyStamps ? <CircleCheck size={32} /> : i}
                    </div>
                  ))}
                </div>
                <p className="text-xl text-[#4A3728] text-center">Осталось <span className="font-bold text-[#8B6F5C]">{5 - MOCK_USER.loyaltyStamps} визита</span> до бесплатной процедуры!</p>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-[#E8C4B8]/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F5F0E8] text-[#8B6F5C] uppercase text-xs font-bold">
                    <tr><th className="px-8 py-5">Дата</th><th className="px-8 py-5">Услуга</th><th className="px-8 py-5">Мастер</th><th className="px-8 py-5">Сумма</th><th className="px-8 py-5">Статус</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8C4B8]/30">
                    {pastBookings.map(b => (
                      <tr key={b.id} className="hover:bg-[#F5F0E8]/30 transition-colors">
                        <td className="px-8 py-6 font-bold text-[#4A3728]">{b.date}</td>
                        <td className="px-8 py-6 text-[#4A3728]/80">{b.service}</td>
                        <td className="px-8 py-6 text-[#4A3728]/80">{b.master}</td>
                        <td className="px-8 py-6 font-bold text-[#8B6F5C]">{b.price}</td>
                        <td className="px-8 py-6"><span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-green-100 text-green-600">Завершено</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Мои отзывы</h3>
                <button 
                  onClick={() => setModal({ type: 'review' })}
                  className="flex items-center space-x-2 text-[#8B6F5C] font-bold hover:underline"
                >
                  <Plus size={18} /> <span>Написать новый</span>
                </button>
              </div>
              
              {myReviews.length > 0 ? (
                <div className="grid gap-6">
                  {myReviews.map(r => (
                    <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < r.rating ? "fill-[#C49A7C] text-[#C49A7C]" : "text-gray-200"} />
                          ))}
                        </div>
                        <div className="flex space-x-4">
                          <button 
                            onClick={() => setModal({ type: 'review', data: r })}
                            className="text-[#8B6F5C] text-sm font-bold hover:underline"
                          >
                            Редактировать
                          </button>
                          <button 
                            onClick={() => setModal({ type: 'deleteReview', data: r })}
                            className="text-red-400 text-sm font-bold hover:underline"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                      <p className="text-[#4A3728] italic leading-relaxed mb-4">"{r.text}"</p>
                      <p className="text-xs text-[#8B6F5C]">{r.date} • Услуга: {r.service}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-[#E8C4B8]">
                  <p className="text-[#4A3728]/60">Вы ещё не оставляли отзывов</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-[#E8C4B8]/30 max-w-2xl mx-auto">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728] mb-10 text-center">Настройки профиля</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2">Имя</label>
                    <input type="text" defaultValue={MOCK_USER.name} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2">Телефон</label>
                    <input type="tel" defaultValue={MOCK_USER.phone} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8B6F5C] uppercase ml-2">Email</label>
                  <input type="email" defaultValue={MOCK_USER.email} className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none" />
                </div>
                <button 
                  onClick={() => showNotify("Настройки профиля сохранены")}
                  className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold shadow-lg"
                >
                  Сохранить изменения
                </button>
                <button 
                  onClick={() => setModal({ type: 'deleteAccount' })}
                  className="w-full flex items-center justify-center space-x-2 text-red-400 py-4 hover:bg-red-50 rounded-2xl transition-all font-bold"
                >
                  <Trash2 size={18} /><span>Удалить аккаунт</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}
      
      {/* Cancellation Confirmation */}
      {modal.type === 'cancel' && (
        <Modal onClose={() => setModal({ type: null })}>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={32} /></div>
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Вы уверены?</h3>
            <p className="text-[#4A3728]/70">Запись на {modal.data?.date} будет безвозвратно отменена.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleCancelBooking(modal.data.id)} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Да, отменить</button>
              <button onClick={() => setModal({ type: null })} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Оставить запись</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Account Deletion Confirmation */}
      {modal.type === 'deleteAccount' && (
        <Modal onClose={() => setModal({ type: null })}>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={32} /></div>
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Удалить аккаунт?</h3>
            <p className="text-[#4A3728]/70">Все ваши данные, история визитов и карта лояльности будут удалены навсегда.</p>
            <div className="flex flex-col gap-3">
              <button onClick={onHomeClick} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Подтверждаю удаление</button>
              <button onClick={() => setModal({ type: null })} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Отмена</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal (Create/Edit) */}
      {modal.type === 'review' && (
        <Modal onClose={() => setModal({ type: null })}>
          <ReviewForm 
            initialData={modal.data} 
            onSave={handleSaveReview} 
            onCancel={() => setModal({ type: null })} 
          />
        </Modal>
      )}

      {/* Delete Review Confirmation */}
      {modal.type === 'deleteReview' && (
        <Modal onClose={() => setModal({ type: null })}>
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Удалить отзыв?</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDeleteReview(modal.data.id)} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Удалить</button>
              <button onClick={() => setModal({ type: null })} className="w-full bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold">Отмена</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {modal.type === 'reschedule' && (
        <Modal onClose={() => setModal({ type: null })}>
          <RescheduleForm 
            onSave={(date, time) => handleReschedule(modal.data.id, date, time)} 
            onCancel={() => setModal({ type: null })} 
          />
        </Modal>
      )}

    </div>
  );
};

export default ClientAccount;

// Sub-components for Modals
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-[#F5F0E8] rounded-full transition-colors"><X size={24} /></button>
      {children}
    </div>
  </div>
);

const ReviewForm: React.FC<{ initialData?: any, onSave: (d: any) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [text, setText] = useState(initialData?.text || '');

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">{initialData?.id ? 'Редактировать отзыв' : 'Оставить отзыв'}</h3>
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} onClick={() => setRating(i)}>
            <Star size={32} className={`${i <= rating ? 'fill-[#C49A7C] text-[#C49A7C]' : 'text-gray-200'}`} />
          </button>
        ))}
      </div>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Поделитесь впечатлениями о процедуре..."
        className="w-full p-4 bg-[#F5F0E8] rounded-2xl h-32 outline-none resize-none"
      />
      <button 
        onClick={() => onSave({ id: initialData?.id, rating, text })}
        disabled={!text}
        className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold disabled:opacity-50"
      >
        Сохранить
      </button>
    </div>
  );
};

const RescheduleForm: React.FC<{ onSave: (date: string, time: string) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">Новое время записи</h3>
      <div className="space-y-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-[#F5F0E8] rounded-2xl outline-none" />
        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-[#F5F0E8] rounded-2xl outline-none">
          <option value="">Выберите время</option>
          {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button 
        onClick={() => onSave(date, time)}
        disabled={!date || !time}
        className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold disabled:opacity-50"
      >
        Перенести
      </button>
    </div>
  );
};
