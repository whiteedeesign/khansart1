
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

const Gallery: React.FC = () => {
  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1583001931046-f090d85ec565?auto=format&fit=crop&q=80&w=600', title: '2D Объём' },
    { id: 2, url: 'https://images.unsplash.com/photo-1614859324967-bdf471b42330?auto=format&fit=crop&q=80&w=600', title: 'Ламинирование' },
    { id: 3, url: 'https://images.unsplash.com/photo-1595475246624-39a5ba2eca0d?auto=format&fit=crop&q=80&w=600', title: '3D Эффект' },
    { id: 4, url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600', title: 'Классика' },
    { id: 5, url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=600', title: 'Лисий взгляд' },
    { id: 6, url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', title: 'Натуральный эффект' },
  ];

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
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A3728]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <div>
                  <p className="text-white text-xl font-bold font-rounded">{img.title}</p>
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
