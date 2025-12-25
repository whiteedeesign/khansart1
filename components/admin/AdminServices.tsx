import React, { useState, useEffect } from 'react';
import { 
  Scissors, Plus, Edit2, Trash2, Loader2, RefreshCw, 
  X, Save, Clock, DollarSign, Tag, Search, Filter
} from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface AdminServicesProps {
  onNotify: (msg: string) => void;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category_id: string;
  is_active: boolean;
  categories?: { name: string } | null;
}

const AdminServices: React.FC<AdminServicesProps> = ({ onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal states
  const [showServiceForm, setShowServiceForm] = useState<{ show: boolean; service?: Service }>({ show: false });
  const [showCategoryForm, setShowCategoryForm] = useState<{ show: boolean; category?: Category }>({ show: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;
      setCategories(categoriesData || []);

      // Load services
      const { data: servicesData, error: servError } = await supabase
        .from('services')
        .select('*, categories(name)')
        .order('category_id', { ascending: true })
        .order('name', { ascending: true });

      if (servError) throw servError;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      onNotify('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // ========== SERVICES ==========

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const serviceData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
        price: parseInt(formData.get('price') as string) || 0,
        duration: parseInt(formData.get('duration') as string) || 60,
        category_id: formData.get('category_id') as string,
        is_active: true
      };

      if (showServiceForm.service) {
        // Update
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', showServiceForm.service.id);

        if (error) throw error;
        onNotify('Услуга обновлена');
      } else {
        // Create
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;
        onNotify('Услуга добавлена');
      }

      setShowServiceForm({ show: false });
      loadData();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      onNotify('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Удалить эту услугу?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      onNotify('Услуга удалена');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      onNotify('Ошибка при удалении');
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const newStatus = !service.is_active;
      const { error } = await supabase
        .from('services')
        .update({ is_active: newStatus })
        .eq('id', service.id);

      if (error) throw error;

      setServices(prev =>
        prev.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s)
      );
      onNotify(`Услуга ${newStatus ? 'активирована' : 'деактивирована'}`);
    } catch (error) {
      console.error('Ошибка:', error);
      onNotify('Ошибка при обновлении');
    }
  };

  // ========== CATEGORIES ==========

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
        sort_order: parseInt(formData.get('sort_order') as string) || 0
      };

      if (showCategoryForm.category) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', showCategoryForm.category.id);

        if (error) throw error;
        onNotify('Категория обновлена');
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);

        if (error) throw error;
        onNotify('Категория добавлена');
      }

      setShowCategoryForm({ show: false });
      loadData();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      onNotify('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    // Check if category has services
    const servicesInCategory = services.filter(s => s.category_id === categoryId);
    if (servicesInCategory.length > 0) {
      onNotify(`Нельзя удалить: в категории ${servicesInCategory.length} услуг`);
      return;
    }

    if (!confirm('Удалить эту категорию?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== categoryId));
      onNotify('Категория удалена');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      onNotify('Ошибка при удалении');
    }
  };

  // Filter services
  const filteredServices = services.filter(service => {
    if (categoryFilter !== 'all' && service.category_id !== categoryFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return service.name.toLowerCase().includes(search);
    }
    return true;
  });

  // Group services by category
  const servicesByCategory = categories.map(cat => ({
    category: cat,
    services: filteredServices.filter(s => s.category_id === cat.id)
  })).filter(group => group.services.length > 0 || categoryFilter === 'all');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8B6F5C] mx-auto mb-4" size={48} />
          <p className="text-[#8B6F5C]">Загрузка услуг...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-rounded font-bold text-[#4A3728]">Услуги и категории</h2>
          <p className="text-[#8B6F5C] font-medium">
            {categories.length} категорий • {services.length} услуг
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCategoryForm({ show: true })}
            className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl text-[#8B6F5C] hover:bg-[#F5F0E8] border border-[#E8C4B8] font-bold"
          >
            <Tag size={18} />
            <span>+ Категория</span>
          </button>
          <button
            onClick={() => setShowServiceForm({ show: true })}
            className="flex items-center space-x-2 px-6 py-3 bg-[#8B6F5C] text-white rounded-xl font-bold hover:bg-[#4A3728]"
          >
            <Plus size={18} />
            <span>+ Услуга</span>
          </button>
        </div>
      </header>

      {/* Categories Row */}
      <div className="flex flex-wrap gap-3">
        <p className="text-sm font-bold text-[#8B6F5C] self-center mr-2">Категории:</p>
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-[#E8C4B8]/30 group"
          >
            <span className="font-medium text-[#4A3728]">{cat.name}</span>
            <span className="text-xs text-[#8B6F5C]">
              ({services.filter(s => s.category_id === cat.id).length})
            </span>
            <button
              onClick={() => setShowCategoryForm({ show: true, category: cat })}
              className="p-1 text-[#8B6F5C] hover:text-[#4A3728] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8C4B8]/30 flex flex-wrap gap-4">
        <div className="flex-grow relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" size={18} />
          <input
            type="text"
            placeholder="Поиск услуги..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-medium"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-[#E8C4B8] rounded-xl focus:outline-none focus:border-[#8B6F5C] font-bold text-[#4A3728]"
        >
          <option value="all">Все категории</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-3 text-[#8B6F5C] hover:bg-[#F5F0E8] rounded-xl"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Services by Category */}
      <div className="space-y-8">
        {servicesByCategory.map(({ category, services: catServices }) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-[#4A3728]">{category.name}</h3>
              <span className="text-sm text-[#8B6F5C]">({catServices.length} услуг)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catServices.map(service => (
                <div
                  key={service.id}
                  className={`bg-white p-6 rounded-2xl border border-[#E8C4B8]/30 hover:shadow-lg transition-all ${
                    !service.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-grow">
                      <h4 className="font-bold text-[#4A3728] text-lg">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-[#8B6F5C] mt-1 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                    {!service.is_active && (
                      <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">
                        Скрыто
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-[#8B6F5C]">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-bold text-[#4A3728]">{service.price}₽</span>
                    </div>
                    <div className="flex items-center text-[#8B6F5C]">
                      <Clock size={16} className="mr-1" />
                      <span>{service.duration} мин</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowServiceForm({ show: true, service })}
                      className="flex-1 py-2 bg-[#F5F0E8] text-[#8B6F5C] rounded-xl font-bold hover:bg-[#E8C4B8] transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit2 size={14} />
                      <span>Изменить</span>
                    </button>
                    <button
                      onClick={() => toggleServiceStatus(service)}
                      className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                        service.is_active
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {service.is_active ? 'Вкл' : 'Выкл'}
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16">
          <Scissors className="mx-auto text-[#E8C4B8] mb-4" size={48} />
          <p className="text-[#8B6F5C] font-bold">Услуг не найдено</p>
        </div>
      )}

      {/* Service Form Modal */}
      {showServiceForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-rounded font-bold text-[#4A3728]">
                {showServiceForm.service ? 'Редактировать услугу' : 'Новая услуга'}
              </h3>
              <button onClick={() => setShowServiceForm({ show: false })} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  Название *
                </label>
                <input
                  required
                  name="name"
                  placeholder="Наращивание ресниц"
                  defaultValue={showServiceForm.service?.name}
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  Категория *
                </label>
                <select
                  required
                  name="category_id"
                  defaultValue={showServiceForm.service?.category_id || ''}
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Цена (₽) *
                  </label>
                  <input
                    required
                    name="price"
                    type="number"
                    min="0"
                    placeholder="2000"
                    defaultValue={showServiceForm.service?.price}
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                    Длительность (мин) *
                  </label>
                  <input
                    required
                    name="duration"
                    type="number"
                    min="15"
                    step="15"
                    placeholder="60"
                    defaultValue={showServiceForm.service?.duration || 60}
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  placeholder="Описание услуги..."
                  defaultValue={showServiceForm.service?.description || ''}
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none min-h-[80px] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold hover:bg-[#4A3728] disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceForm({ show: false })}
                  className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold hover:bg-[#E8C4B8]"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A3728]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-rounded font-bold text-[#4A3728]">
                {showCategoryForm.category ? 'Редактировать категорию' : 'Новая категория'}
              </h3>
              <button onClick={() => setShowCategoryForm({ show: false })} className="p-2 hover:bg-[#F5F0E8] rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  Название *
                </label>
                <input
                  required
                  name="name"
                  placeholder="Ресницы"
                  defaultValue={showCategoryForm.category?.name}
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  Порядок сортировки
                </label>
                <input
                  name="sort_order"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={showCategoryForm.category?.sort_order || 0}
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none font-bold text-[#4A3728]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  placeholder="Описание категории..."
                  defaultValue={showCategoryForm.category?.description || ''}
                  className="w-full px-5 py-3 rounded-xl bg-[#F5F0E8] outline-none min-h-[60px] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold hover:bg-[#4A3728] disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm({ show: false })}
                  className="flex-1 bg-[#F5F0E8] text-[#4A3728] py-4 rounded-2xl font-bold hover:bg-[#E8C4B8]"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
