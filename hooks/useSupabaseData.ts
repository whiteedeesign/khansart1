import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Service, Master, Review } from '../types';

// Hook для загрузки услуг
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order');

      if (error) {
        console.error('Ошибка загрузки услуг:', error);
        return;
      }

      const formatted: Service[] = data.map(s => ({
        id: s.id,
        name: s.name,
        price: `от ${s.price}₽`,
        duration: `${Math.floor(s.duration / 60)} ч.${s.duration % 60 > 0 ? ` ${s.duration % 60} мин.` : ''}`,
        category: 'Наращивание' as const,
        description: s.description || ''
      }));

      setServices(formatted);
      setLoading(false);
    }
    load();
  }, []);

  return { services, loading };
}

// Hook для загрузки мастеров
export function useMasters() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Ошибка загрузки мастеров:', error);
        return;
      }

      const formatted: Master[] = data.map(m => ({
        id: m.id,
        name: m.name,
        role: m.specialization || 'Мастер',
        image: m.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500',
        experience: m.experience || '',
        description: m.bio || '',
        rating: 5.0
      }));

      setMasters(formatted);
      setLoading(false);
    }
    load();
  }, []);

  return { masters, loading };
}

// Hook для загрузки отзывов
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          masters (name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки отзывов:', error);
        return;
      }

      const formatted: Review[] = data.map(r => ({
        id: r.id,
        author: r.client_name,
        rating: r.rating,
        text: r.text || '',
        date: new Date(r.created_at).toLocaleDateString('ru-RU'),
        masterName: r.masters?.name,
        status: 'published' as const
      }));

      setReviews(formatted);
      setLoading(false);
    }
    load();
  }, []);

  return { reviews, loading };
}
