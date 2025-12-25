import React, { useState, useEffect } from 'react';
import { Plus, Gift, Edit2, Trash2, X, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminPromotionsProps {
  onNotify: (msg: string) => void;
}

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  promo_code: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminPromotions: React.FC<AdminPromotionsProps> = ({ onNotify }) => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<{ show: boolean; promo?: Promotion }>({ show: false });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_percent: '',
    discount_amount: '',
    promo_code: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromos(data || []);
      console.log('✅ Акции загружены:', data?.length);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
      onNotify('Ошибка загрузки акций');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (promo?: Promotion) => {
    if (promo) {
      setFormData({
        name: promo.name || '',
        description: promo.description || '',
        discount_percent: promo.discount_percent?.toString() || '',
        discount_amount: promo.discount_amount?.toString() || '',
        promo_code: promo.promo_code || '',
        start_date: promo.start_date || '',
        end_date: promo.end_date || '',
        is_active: promo.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        discount_percent: '',
        discount_amount: '',
        promo_code: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true
      });
    }
    setShowForm({ show: true, promo });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
        discount_amount: formData.discount_amount ? parseInt(formData.discount_amount) : null,
        promo_code: formData.promo_code?.toUpperCase() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active
      };

      if (showForm.promo) {
        // Update
        const { error } = await supabase
          .from('promotions')
          .update(payload)
          .eq('id', showForm.promo.id);

        if (error) throw error;
        onNotify('Акция обновлена');
      } else {
        // Create
        const { error } = await supabase
          .from('promotions')
          .insert(payload);

        if (error) throw error;
        onNotify('Акция создана');
      }

      setShowForm({ show: false });
      loadPromotions();
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      onNotify('Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', confirmDelete);

      if (error) throw error;

      setPromos(prev => prev.filter(p => p.id !== confirmDelete));
      setConfirmDelete(null);
      onNotify('Акция удалена');
    } catch (error: any) {
      console.error('Ошибка удаления:', error);
      onNotify('Ошибка удаления');
    }
  };

  const toggleStatus = async (promo: Promotion) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promo.is_active })
        .eq('id', promo.id);

      if (error) throw error;

      setPromos(prev =>
        prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p)
      );
      onNotify(promo.is_active ? 'Акция деактивирована' : 'Акция активирована');
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка изменения статуса');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const getDiscountText = (promo: Promotion) => {
    if (promo.discount_percent) return `${promo.discount_percent}%`;
    if (promo.discount_amount) return `${promo.discount_amount}₽`;
    return '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#8B6F5C]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Акции и скидки</h2>
          <p className="text-[#8B6F5C]">Всего: {promos.length} акций</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadPromotions}
            className="p-3 bg-white rounded-xl border border-[#E8C4B8] hover:bg-[#F5F0E8]"
          >
            <RefreshCw size={20} className="text-[#8B6F5C]" />
          </button>
          <button
            onClick={() => openForm()}
            className="bg-[#8B6F5C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center space-x-2 hover:bg-[#4A3728]"
          >
            <Plus size={20} />
            <span>Новая акция</span>
          </button>
        </div>
      </header>

      {promos.length === 0 ? (
        <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-[#E8C4B8]">
          <Gift size={64} className="mx-auto text-[#E8C4B8] mb-4" />
          <p className="text-[#4A3728]/60 mb-4">Акции не созданы</p>
          <button
            onClick={() => openForm()}
            className="bg-[#8B6F5C] text-white px-6 py-3 rounded-xl font-bold"
          >
            Создать первую акцию
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {promos.map(p => (
            <div
              key={p.id}
              className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-[#E8C4B8]/30 flex flex-col md:flex-row gap-8 relative group overflow-hidden"
            >
              {/* Status Badge */}
              <div
                className={`absolute top-0 right-0 px-6 py-2 rounded-bl-[2rem] text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                  p.is_active
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                onClick={() => toggleStatus(p)}
              >
                {p.is_active ? 'Активна' : 'Неактивна'}
              </div>

              {/* Icon */}
              <div className="w-24 h-24 bg-[#F5F0E8] rounded-[2rem] flex items-center justify-center text-[#8B6F5C] shrink-0">
                <Gift size={40} />
              </div>

              {/* Content */}
              <div className="flex-grow space-y-4">
                <h3 className="text-2xl font-bold text-[#4A3728]">{p.name}</h3>
                <p className="text-[#4A3728]/60 text-sm leading-relaxed">
                  {p.description || 'Без описания'}
                </p>

                <div className="flex flex-wrap gap-6 pt-4 border-t border-[#F5F0E8]">
                  <div>
                    <p className="text-[9px] font-bold text-[#8B6F5C] uppercase">Скидка</p>
                    <p className="font-bold text-[#4A3728]">{getDiscountText(p)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#8B6F5C] uppercase">Промокод</p>
                    <p className="font-bold text-[#4A3728] font-mono">
                      {p.promo_code || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#8B6F5C] uppercase">Действует до</p>
                    <p className="font-bold text-[#4A3728]">{formatDate(p.end_date)}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-[#F5F0E8]/50">
                  <button
                    onClick={() => openForm(p)}
                    className="flex items-center space-x-1 text-xs font-bold text-[#8B6F5C] hover:underline"
                  >
                    <Edit2 size={14} />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="flex items-center space-x-1 text-xs font-bold text-red-400 hover:underline"
                  >
                    <Trash2 size={14} />
                    <span>Удалить</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-rounded font-bold text-[#4A3728]">
                {showForm.promo ? 'Редактировать акцию' : 'Новая акция'}
              </h3>
              <button onClick={() => setShowForm({ show: false })} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                  Название акции *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="5-я процедура в подарок"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробное описание акции..."
                  rows={3}
                  className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] resize-none focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                />
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                    Скидка %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value, discount_amount: '' })}
                    placeholder="15"
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                    Или сумма ₽
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value, discount_percent: '' })}
                    placeholder="500"
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                  />
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                  Промокод
                </label>
                <input
                  value={formData.promo_code}
                  onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8B6F5C] uppercase mb-2">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F0E8] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B6F5C]"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-[#E8C4B8] text-[#8B6F5C] focus:ring-[#8B6F5C]"
                />
                <label htmlFor="is_active" className="font-bold text-[#4A3728]">
                  Акция активна
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-[#4A3728] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <span>{showForm.promo ? 'Сохранить изменения' : 'Создать акцию'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#4A3728]">Удалить акцию?</h3>
            <p className="text-[#8B6F5C] text-sm">Это действие нельзя отменить</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600"
              >
                Да, удалить
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="w-full py-4 font-bold hover:bg-[#F5F0E8] rounded-2xl"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
