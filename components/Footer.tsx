
import React from 'react';
import { Instagram, MapPin, Phone, MessageCircle } from 'lucide-react';

interface FooterProps {
  onHomeClick: () => void;
  onBookClick: () => void;
  scrollToSection: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onHomeClick, onBookClick, scrollToSection }) => {
  return (
    <footer className="bg-[#4A3728] text-[#F5F0E8] pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <button 
              onClick={() => scrollToSection('top')}
              className="text-3xl font-rounded font-bold text-left outline-none hover:opacity-80 transition-opacity"
            >
              Khan's Art
            </button>
            <p className="text-[#F5F0E8]/60 font-light leading-relaxed">
              Ваша красота в надежных руках. <br />
              Студия с душой и заботой о каждой ресничке.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B6F5C] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B6F5C] transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Навигация</h3>
            <ul className="space-y-4 text-[#F5F0E8]/70 flex flex-col items-start">
              <li><button onClick={() => scrollToSection('top')} className="hover:text-white transition-colors outline-none">Главная</button></li>
              <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors outline-none text-left">Услуги</button></li>
              <li><button onClick={() => scrollToSection('masters')} className="hover:text-white transition-colors outline-none text-left">Мастера</button></li>
              <li><button onClick={() => scrollToSection('gallery')} className="hover:text-white transition-colors outline-none text-left">Галерея работ</button></li>
              <li><button onClick={() => scrollToSection('reviews')} className="hover:text-white transition-colors outline-none text-left">Отзывы</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-[#F5F0E8]/70">
                <MapPin size={20} className="mt-1 text-[#C49A7C]" />
                <span>г. Москва, ул. Арбат, 25, этаж 3, офис 302</span>
              </li>
              <li className="flex items-center space-x-3 text-[#F5F0E8]/70">
                <Phone size={20} className="text-[#C49A7C]" />
                <a href="tel:+79991234567" className="hover:text-white transition-colors">+7 (999) 123-45-67</a>
              </li>
              <li className="flex items-center space-x-3 text-[#F5F0E8]/70">
                <div className="w-5 h-5 bg-[#C49A7C] rounded-full flex items-center justify-center text-[#4A3728] text-[10px] font-bold">WA</div>
                <a href="https://wa.me/79991234567" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp для записи</a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Режим работы</h3>
            <div className="text-[#F5F0E8]/70 space-y-2">
              <p>Пн - Пт: 10:00 — 21:00</p>
              <p>Сб - Вс: 11:00 — 19:00</p>
              <div className="mt-4 p-4 border border-white/10 rounded-2xl bg-white/5">
                <p className="text-sm font-bold text-white mb-2">Запись онлайн 24/7</p>
                <button 
                  onClick={onBookClick}
                  className="bg-[#8B6F5C] text-white w-full py-2 rounded-lg text-sm font-bold hover:bg-[#C49A7C] transition-colors"
                >
                  Забронировать время
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[#F5F0E8]/40 text-sm gap-4">
          <p>© 2025 Khan's Art Studio. Все права защищены.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Публичная оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
