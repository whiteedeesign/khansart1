import React, { useState, useEffect } from 'react';
import { 
  Star, Search, Loader2, RefreshCw, Trash2, Eye, X,
  CheckCircle, XCircle, MessageSquare, User, Calendar,
  ThumbsUp, ThumbsDown, Filter
} from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminReviewsProps {
  onNotify: (msg: string) => void;
}

interface Review {
  id: string;
  client_name: string;
  rating: number;
  text: string;
  status: string;
  created_at: string;
  service_id?: string;
  master_id?: string;
  services?: { name: string } | null;
  masters?: { name: string } | null;
}

const AdminReviews: React.FC<AdminReviewsProps> = ({ onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [viewReview, setViewReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, services(name), masters(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
      console.log('✅ Отзывы загружены:', data?.length);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      onNotify('Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
      );

      const statusLabels: Record<string, string> = {
        approved: 'одобрен',
        rejected: 'отклонён',
        pending: 'на модерации'
      };

      onNotify(`Отзыв ${statusLabels[newStatus] || newStatus}`);
      setViewReview(null);
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка при обновлении статуса');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Удалить этот отзыв навсегда?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setViewReview(null);
      onNotify('Отзыв удалён');
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка при удалении');
    }
  };

  // Filtering
  const filteredReviews = reviews.filter(review => {
    // Status filter
    if (statusFilter !== 'all' && review.status !== statusFilter) return false;

    // Rating filter
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false;

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = review.client_name?.toLowerCase().includes(search);
      const matchesText = review.text?.toLowerCase().includes(search);
      if (!matchesName && !matchesText) return false;
    }

    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      pending: 'На модерации',
      approved: 'Одобрен',
      rejected: 'Отклонён'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  // Stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка отзывов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Отзывы клиентов</h2>
          <p className="text-[#8B6F5C] font-medium">Модерация и управление отзывами</p>
        </div>
        <button
          onClick={loadReviews}
          className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl text-[#8B6F5C] hover:bg-[#F5F0E8] border border-[#E8C4B8] font-bold"
        >
          <RefreshCw size={18} />
          <span>Обновить</span>
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl text-center border border-[#E8C4B8]/30">
          <p className="text-2xl font-bold text-[#4A3728]">{stats.total}</p>
          <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Всего</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-[10px] font-bold text-yellow-600 uppercase">На модерации</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          <p className="text-[10px] font-bold text-green-600 uppercase">Одобрено</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          <p className="text-[10px] font-bold text-red-600 uppercase">Отклонено</p>
        </div>
        <div className="bg-[#F5F0E8] p-4 rounded-2xl text-center border border-[#E8C4B8]">
          <div className="flex items-center justify-center space-x-1">
            <Star size={20} className="text-yellow-400 fill-yellow-400" />
            <p className="text-2xl font-bold text-[#4A3728]">{stats.avgRating}</p>
          </div>
          <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Средний рейтинг</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30 flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-grow relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
          <input
            type="text"
            placeholder="Поиск по имени или тексту..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-medium"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-bold text-[#4A3728]"
        >
          <option value="all">Все статусы</option>
          <option value="pending">На модерации</option>
          <option value="approved">Одобренные</option>
          <option value="rejected">Отклонённые</option>
        </select>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-bold text-[#4A3728]"
        >
          <option value="all">Все оценки</option>
          <option value="5">⭐ 5 звёзд</option>
          <option value="4">⭐ 4 звезды</option>
          <option value="3">⭐ 3 звезды</option>
          <option value="2">⭐ 2 звезды</option>
          <option value="1">⭐ 1 звезда</option>
        </select>

        {/* Clear Filters */}
        {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setRatingFilter('all');
            }}
            className="px-4 py-3 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl font-bold"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className={`bg-white p-6 rounded-2xl border transition-all hover:shadow-lg cursor-pointer ${
              review.status === 'pending' 
                ? 'border-yellow-300 bg-yellow-50/30' 
                : review.status === 'rejected'
                ? 'border-red-200 bg-red-50/30 opacity-60'
                : 'border-[#E8C4B8]/30'
            }`}
            onClick={() => setViewReview(review)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#F5F0E8] rounded-full flex items-center justify-center text-[#8B6F5C] font-bold text-lg">
                  {review.client_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-[#4A3728]">{review.client_name || 'Аноним'}</h3>
                  <p className="text-xs text-[#8B6F5C]">{formatDate(review.created_at)}</p>
                </div>
              </div>
              {getStatusBadge(review.status)}
            </div>

            {/* Rating */}
            <div className="mb-3">
              {renderStars(review.rating)}
            </div>

            {/* Text */}
            <p className="text-[#4A3728]/80 text-sm line-clamp-3 mb-4">
              {review.text || 'Без комментария'}
            </p>

            {/* Service/Master */}
            {(review.services?.name || review.masters?.name) && (
              <div className="text-xs text-[#8B6F5C] space-y-1 pt-3 border-t border-[#E8C4B8]/30">
                {review.services?.name && <p>📌 {review.services.name}</p>}
                {review.masters?.name && <p>👤 {review.masters.name}</p>}
              </div>
            )}

            {/* Quick Actions */}
            {review.status === 'pending' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-[#E8C4B8]/30">
                <button
                  onClick={(e) => { e.stopPropagation(); updateStatus(review.id, 'approved'); }}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm hover:bg-green-200 flex items-center justify-center space-x-1"
                >
                  <ThumbsUp size={14} />
                  <span>Одобрить</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateStatus(review.id, 'rejected'); }}
                  className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 flex items-center justify-center space-x-1"
                >
                  <ThumbsDown size={14} />
                  <span>Отклонить</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="mx-auto text-[#E8C4B8] mb-4" size={48} />
          <p className="text-[#8B6F5C] font-bold">Отзывов не найдено</p>
          <p className="text-sm text-[#8B6F5C]/60">Попробуйте изменить фильтры</p>
        </div>
      )}

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#F5F0E8] rounded-full flex items-center justify-center text-[#8B6F5C] font-bold text-2xl">
                  {viewReview.client_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-rounded font-bold text-[#4A3728]">
                    {viewReview.client_name || 'Аноним'}
                  </h3>
                  <p className="text-sm text-[#8B6F5C]">{formatDate(viewReview.created_at)}</p>
                </div>
              </div>
              <button onClick={() => setViewReview(null)} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Status & Rating */}
            <div className="flex items-center justify-between">
              {renderStars(viewReview.rating, 24)}
              {getStatusBadge(viewReview.status)}
            </div>

            {/* Text */}
            <div className="bg-[#F5F0E8] p-6 rounded-2xl">
              <p className="text-[#4A3728] leading-relaxed">
                {viewReview.text || 'Клиент не оставил комментарий'}
              </p>
            </div>

            {/* Service/Master Info */}
            {(viewReview.services?.name || viewReview.masters?.name) && (
              <div className="grid grid-cols-2 gap-4">
                {viewReview.services?.name && (
                  <div className="p-4 bg-[#F5F0E8] rounded-xl">
                    <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Услуга</p>
                    <p className="font-bold text-[#4A3728]">{viewReview.services.name}</p>
                  </div>
                )}
                {viewReview.masters?.name && (
                  <div className="p-4 bg-[#F5F0E8] rounded-xl">
                    <p className="text-[10px] font-bold text-[#8B6F5C] uppercase">Мастер</p>
                    <p className="font-bold text-[#4A3728]">{viewReview.masters.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-[#E8C4B8]/30">
              {viewReview.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(viewReview.id, 'approved')}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>Одобрить</span>
                  </button>
                  <button
                    onClick={() => updateStatus(viewReview.id, 'rejected')}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 flex items-center justify-center space-x-2"
                  >
                    <XCircle size={18} />
                    <span>Отклонить</span>
                  </button>
                </div>
              )}

              {viewReview.status === 'approved' && (
                <button
                  onClick={() => updateStatus(viewReview.id, 'rejected')}
                  className="w-full py-3 bg-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-200"
                >
                  Скрыть отзыв
                </button>
              )}

              {viewReview.status === 'rejected' && (
                <button
                  onClick={() => updateStatus(viewReview.id, 'approved')}
                  className="w-full py-3 bg-green-100 text-green-600 rounded-xl font-bold hover:bg-green-200"
                >
                  Восстановить отзыв
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => deleteReview(viewReview.id)}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 flex items-center justify-center space-x-2"
                >
                  <Trash2 size={18} />
                  <span>Удалить навсегда</span>
                </button>
                <button
                  onClick={() => setViewReview(null)}
                  className="flex-1 py-3 bg-[#F5F0E8] text-[#4A3728] rounded-xl font-bold hover:bg-[#E8C4B8]"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
