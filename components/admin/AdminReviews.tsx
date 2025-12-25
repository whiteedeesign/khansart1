
import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Star, Check, X, Trash2, Reply, 
  Search, Filter, ChevronDown, CircleCheck, AlertCircle, 
  User, Calendar, Briefcase, Quote
} from 'lucide-react';
import { REVIEWS, MASTERS } from '../../constants';
import { Review } from '../../types';

// Extended review type for admin functionality
interface AdminReview extends Review {
  replyText?: string;
  adminRepliedAt?: string;
}

const AdminReviews: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<AdminReview[]>(
    REVIEWS.map(r => ({ ...r, status: r.status || 'pending' }))
  );
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [masterFilter, setMasterFilter] = useState<string>('Все мастера');

  // Actions
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [notify, setNotify] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotify(msg);
    setTimeout(() => setNotify(null), 3000);
  };

  const filteredReviews = useMemo(() => {
    return reviewsList.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchRating = ratingFilter === 'all' || r.rating === ratingFilter;
      const matchMaster = masterFilter === 'Все мастера' || r.masterName === masterFilter;
      return matchStatus && matchRating && matchMaster;
    });
  }, [reviewsList, statusFilter, ratingFilter, masterFilter]);

  const handleUpdateStatus = (id: string, status: Review['status']) => {
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    showNotify(status === 'published' ? "Отзыв опубликован" : "Отзыв отклонён");
  };

  const handleDelete = () => {
    if (confirmDelete) {
      setReviewsList(prev => prev.filter(r => r.id !== confirmDelete));
      setConfirmDelete(null);
      showNotify("Отзыв успешно удалён");
    }
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    setReviewsList(prev => prev.map(r => 
      r.id === id ? { 
        ...r, 
        replyText: replyText, 
        adminRepliedAt: new Date().toLocaleDateString('ru-RU') 
      } : r
    ));
    setReplyingTo(null);
    setReplyText('');
    showNotify("Ответ отправлен");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Toast Notification */}
      {notify && (
        <div className="fixed top-6 right-6 z-[200] bg-[#4A3728] text-[#F5F0E8] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notify}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Модерация отзывов</h2>
          <p className="text-[#8B6F5C] font-medium">Управляйте обратной связью от ваших клиентов</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-[#E8C4B8]/30 shadow-sm flex items-center space-x-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Средний рейтинг</p>
              <div className="flex items-center justify-center text-[#C49A7C] font-bold">
                <Star size={14} className="fill-[#C49A7C] mr-1" />
                <span>4.9</span>
              </div>
            </div>
            <div className="w-px h-8 bg-[#E8C4B8]/30" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">На проверке</p>
              <p className="font-bold text-[#4A3728]">{reviewsList.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#E8C4B8]/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Статус</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none border-none"
          >
            <option value="all">Все статусы</option>
            <option value="pending">На модерации</option>
            <option value="published">Опубликованные</option>
            <option value="hidden">Отклонённые</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">Оценка</label>
          <select 
            value={ratingFilter} 
            onChange={e => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F0E8] text-sm font-bold outline-none border-none"
          >
            <option value="all">Любая оценка</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} {n === 1 ? 'звезда' : n < 5 ? 'звезды' : 'звёзд'}</option>)}
          </select>
        </div>
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
      </div>

      {/* REVIEWS LIST */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.map(review => (
          <div 
            key={review.id} 
            className={`bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border transition-all duration-300 ${
              review.status === 'pending' ? 'border-[#D4A69A]' : 'border-[#E8C4B8]/30'
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-grow space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F5F0E8] flex items-center justify-center text-[#8B6F5C] font-bold text-xl shadow-inner">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#4A3728]">{review.author}</h4>
                      <div className="flex text-[#C49A7C] mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? "fill-[#C49A7C]" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    review.status === 'published' ? 'bg-green-100 text-green-600' :
                    review.status === 'hidden' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {review.status === 'published' ? 'Опубликован' :
                     review.status === 'hidden' ? 'Отклонён' : 'На модерации'}
                  </div>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-4 -left-4 text-[#F5F0E8] w-12 h-12 -z-10" />
                  <p className="text-[#4A3728] italic leading-relaxed text-lg pl-2">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 items-center text-xs font-bold text-[#8B6F5C] pt-4 border-t border-[#F5F0E8]">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2" /> {review.date}
                  </div>
                  <div className="flex items-center">
                    <Briefcase size={14} className="mr-2" /> Мастер: {review.masterName}
                  </div>
                </div>

                {/* ADMIN REPLY DISPLAY */}
                {review.replyText && (
                  <div className="bg-[#F5F0E8]/50 p-6 rounded-3xl border-l-4 border-[#8B6F5C] space-y-2 animate-in slide-in-from-left-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[#8B6F5C] uppercase tracking-widest flex items-center">
                        <Reply size={12} className="mr-2" /> Ответ студии
                      </p>
                      <span className="text-[10px] text-[#8B6F5C]/60">{review.adminRepliedAt}</span>
                    </div>
                    <p className="text-sm text-[#4A3728] leading-relaxed font-medium">
                      {review.replyText}
                    </p>
                  </div>
                )}

                {/* REPLY FORM */}
                {replyingTo === review.id && (
                  <div className="space-y-4 pt-4 border-t border-[#F5F0E8] animate-in slide-in-from-top-2">
                    <textarea 
                      placeholder="Ваш ответ клиенту..." 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="w-full p-6 rounded-3xl bg-[#F5F0E8] outline-none text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-[#8B6F5C]/20 transition-all"
                    />
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleSendReply(review.id)}
                        disabled={!replyText.trim()}
                        className="bg-[#8B6F5C] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#4A3728] transition-all disabled:opacity-50"
                      >
                        Отправить ответ
                      </button>
                      <button 
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="px-8 py-3 font-bold text-[#8B6F5C]"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SIDE ACTIONS */}
              <div className="flex flex-row lg:flex-col gap-3 shrink-0 lg:w-48">
                {review.status !== 'published' && (
                  <button 
                    onClick={() => handleUpdateStatus(review.id, 'published')}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-2 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-md"
                  >
                    <Check size={18} />
                    <span>Опубликовать</span>
                  </button>
                )}
                {review.status !== 'hidden' && (
                  <button 
                    onClick={() => handleUpdateStatus(review.id, 'hidden')}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-2 py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all"
                  >
                    <X size={18} />
                    <span>Отклонить</span>
                  </button>
                )}
                {!review.replyText && replyingTo !== review.id && (
                  <button 
                    onClick={() => setReplyingTo(review.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-2 py-4 bg-[#F5F0E8] text-[#8B6F5C] rounded-2xl font-bold hover:bg-[#E8C4B8] transition-all"
                  >
                    <Reply size={18} />
                    <span>Ответить</span>
                  </button>
                )}
                <button 
                  onClick={() => setConfirmDelete(review.id)}
                  className="flex items-center justify-center p-4 text-[#8B6F5C]/40 hover:text-red-400 transition-colors"
                  title="Удалить отзыв"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="py-32 text-center space-y-6 bg-white rounded-[4rem] border border-dashed border-[#E8C4B8]">
            <MessageSquare className="mx-auto text-[#E8C4B8]" size={64} strokeWidth={1} />
            <div>
              <p className="text-xl font-bold text-[#4A3728]">Отзывы не найдены</p>
              <p className="text-[#8B6F5C]">Попробуйте изменить параметры фильтрации</p>
            </div>
            <button 
              onClick={() => { setStatusFilter('all'); setRatingFilter('all'); setMasterFilter('Все мастера'); }}
              className="px-8 py-3 bg-[#F5F0E8] text-[#8B6F5C] rounded-2xl font-bold hover:bg-[#E8C4B8]"
            >
              Сбросить все фильтры
            </button>
          </div>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><AlertCircle size={32} /></div>
              <div>
                <h3 className="text-xl font-bold text-[#4A3728]">Удалить отзыв?</h3>
                <p className="text-sm text-[#8B6F5C] mt-2">Это действие нельзя будет отменить.</p>
              </div>
              <div className="flex flex-col gap-2">
                 <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all">Да, удалить окончательно</button>
                 <button onClick={() => setConfirmDelete(null)} className="w-full py-4 font-bold text-[#4A3728]">Отмена</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
