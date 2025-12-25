
import React, { useState, useEffect } from 'react';
import { User, Menu, X, Briefcase, Lock } from 'lucide-react';

interface HeaderProps {
  onBookClick: () => void;
  onHomeClick: () => void;
  onAccountClick: () => void;
  scrollToSection: (id: string) => void;
  onMasterClick?: () => void;
  onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBookClick, onHomeClick, onAccountClick, onMasterClick, onAdminClick, scrollToSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Главная', href: '#', scrollId: 'top' },
    { name: 'Услуги', href: '#services', scrollId: 'services' },
    { name: 'Мастера', href: '#masters', scrollId: 'masters' },
    { name: 'Галерея', href: '#gallery', scrollId: 'gallery' },
    { name: 'Отзывы', href: '#reviews', scrollId: 'reviews' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#F5F0E8]/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => scrollToSection('top')}
          className="text-2xl font-rounded font-bold tracking-tight text-[#4A3728] outline-none hover:opacity-80 transition-opacity"
        >
          Khan's Art
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button 
              key={link.name} 
              onClick={() => scrollToSection(link.scrollId)}
              className="text-[#4A3728] hover:text-[#8B6F5C] font-medium transition-colors outline-none"
            >
              {link.name}
            </button>
          ))}
          <div className="flex items-center space-x-3 border-l border-[#E8C4B8] pl-6 ml-2">
            <button 
              onClick={onMasterClick}
              className="text-[#4A3728]/40 hover:text-[#8B6F5C] flex items-center space-x-1"
              title="Вход для мастеров"
            >
              <Briefcase size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Сотрудник</span>
            </button>
            <button 
              onClick={onAdminClick}
              className="text-[#4A3728]/40 hover:text-[#8B6F5C] flex items-center space-x-1"
              title="Панель управления"
            >
              <Lock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Админ</span>
            </button>
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBookClick}
            className="hidden sm:flex bg-[#8B6F5C] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#4A3728] transition-all transform active:scale-95"
          >
            Записаться
          </button>
          <button 
            onClick={onAccountClick}
            className="p-2 text-[#4A3728] hover:bg-[#E8C4B8] rounded-full transition-colors"
          >
            <User size={24} />
          </button>
          <button 
            className="md:hidden p-2 text-[#4A3728]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#F5F0E8] border-t border-[#E8C4B8] shadow-xl p-6 flex flex-col space-y-4 animate-in slide-in-from-top">
          {navLinks.map((link) => (
            <button 
              key={link.name} 
              className="text-[#4A3728] text-lg font-medium py-2 border-b border-[#E8C4B8] text-left"
              onClick={() => {
                scrollToSection(link.scrollId);
                setIsMenuOpen(false);
              }}
            >
              {link.name}
            </button>
          ))}
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              onAccountClick();
            }}
            className="text-[#4A3728] text-lg font-medium py-2 border-b border-[#E8C4B8] text-left"
          >
            Личный кабинет
          </button>
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              if(onAdminClick) onAdminClick();
            }}
            className="text-[#4A3728] text-lg font-medium py-2 border-b border-[#E8C4B8] text-left"
          >
            Админ-панель
          </button>
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              onBookClick();
            }}
            className="bg-[#8B6F5C] text-white w-full py-4 rounded-xl font-bold mt-4 shadow-lg shadow-[#8B6F5C]/20"
          >
            Записаться онлайн
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
