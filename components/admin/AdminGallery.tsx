import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

interface GalleryItem {
  id: string;
  image_url: string;
  description: string | null;
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('id, image_url, description')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      setImages(data || []);
      console.log('✅ Галерея загружена:', data?.length);

    } catch (error) {
      console.error('❌ Ошибка загрузки галереи:', error);
      // Fallback data
      setImages([
        { id: '1', image_url: 'https://images.unsplash.com/photo-1583001931046-f090d85ec565?auto=format&fit=crop&q=80&w=600', description: '2D Объём' },
        { id: '2', image_url: 'https://images.unsplash.com/photo-1614859324967-bdf471b42330?auto=format&fit=crop&q=80&w=600', description: 'Ламинирование' },
        { id: '3', image_url: 'https://images.unsplash.com/photo-1595475246624-39a5ba2eca0d?auto=format&fit=crop&q=80&w=600', description: '3D Эффект' },
        { id: '4', image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600', description: 'Классика' },
        { id: '5', image_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=600', description: 'Лисий взгляд' },
        { id: '6', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', description: 'Натуральный эффект' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="py-24 bg-white rounded-[4rem] mx-4 md:mx-10 my-12 scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#8B6F5C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="py-24 bg-white rounded-[4rem] mx-4 md:mx-10 my-12 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-rounded font-bold text-[#4A3728]">Галерея работ</h2>
          <p className="text-[#8B6F5C] max-w-xl mx-auto font-medium">Посмотрите результаты наших мастеров. Мы создаем идеальный изгиб и густоту для каждой клиентки.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src={img.image_url} 
                alt={img.description || 'Работа мастера'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A3728]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <div>
                  <p className="text-white text-xl font-bold font-rounded">{img.description || 'Работа мастера'}</p>
                  <p className="text-[#E8C4B8] text-sm font-medium">Khan's Art Studio</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <button className="bg-[#F5F0E8] border-2 border-[#E8C4B8] text-[#8B6F5C] px-10 py-4 rounded-2xl font-bold hover:bg-[#E8C4B8] transition-all">
            Больше работ в Instagram
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
