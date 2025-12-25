import React, { useState, useEffect } from 'react';
import { User, Menu, X, Briefcase, Lock, LogOut, Calendar, ChevronDown } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface HeaderProps {
  onBookClick: () => void;
  onHomeClick: () => void;
  onAccountClick: () => void;
  scrollToSection: (id: string) => void;
  onMasterClick?: () => void;
  onAdminClick?: () => void;
  user?: any;
  userAvatar?: string | null;
  onAuthClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onBookClick, 
  onHomeClick, 
  onAccountClick, 
  onMasterClick, 
  onAdminClick, 
  scrollToSection,
  user,
  userAvatar,
  onAuthClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрыть меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    window.location.reload();
  };

  const navLinks = [
    { name: 'Главная', href: '#', scrollId: 'top' },
    { name: 'Услуги', href: '#services', scrollId: 'services' },
    { name: 'Мастера', href: '#masters', scrollId: 'masters' },
    { name: 'Галерея', href: '#gallery', scrollId: 'gallery' },
    { name: 'Отзывы', href: '#reviews', scrollId: 'reviews' },
  ];

  // Получаем имя пользователя
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Профиль';

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
          
          {/* User Button - авторизован или нет */}
          {user ? (
            <div className="relative user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-[#4A3728] hover:bg-[#E8C4B8] rounded-full transition-colors"
              >
                {userAvatar ? (
  <img 
    src={userAvatar} 
    alt="Avatar" 
    className="w-8 h-8 rounded-full object-cover border border-[#E8C4B8]"
  />
) : (
  <div className="w-8 h-8 bg-[#8B6F5C] rounded-full flex items-center justify-center text-white text-sm font-bold">
    {userName.charAt(0).toUpperCase()}
  </div>
)}
                <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">
                  {userName}
                </span>
                <ChevronDown size={16} className={`hidden lg:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8C4B8] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-[#E8C4B8] bg-[#F5F0E8]">
                    <p className="font-bold text-[#4A3728] truncate">{userName}</p>
                    <p className="text-xs text-[#8B6F5C] truncate">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => { onAccountClick(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-[#F5F0E8] flex items-center space-x-3 transition-colors"
                    >
                      <User size={18} className="text-[#8B6F5C]" />
                      <span>Мой профиль</span>
                    </button>
                    <button
                      onClick={() => { onAccountClick(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-[#F5F0E8] flex items-center space-x-3 transition-colors"
                    >
                      <Calendar size={18} className="text-[#8B6F5C]" />
                      <span>Мои записи</span>
                    </button>
                  </div>
                  <div className="border-t border-[#E8C4B8] py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-3 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Выйти</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onAuthClick || onAccountClick}
              className="p-2 text-[#4A3728] hover:bg-[#E8C4B8] rounded-full transition-colors"
            >
              <User size={24} />
            </button>
          )}

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
          
          {/* Мобильное меню - показываем разное для авторизованных */}
          {user ? (
            <>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  onAccountClick();
                }}
                className="text-[#4A3728] text-lg font-medium py-2 border-b border-[#E8C4B8] text-left flex items-center space-x-2"
              >
                <User size={20} />
                <span>Мой профиль ({userName})</span>
              </button>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="text-red-600 text-lg font-medium py-2 border-b border-[#E8C4B8] text-left flex items-center space-x-2"
              >
                <LogOut size={20} />
                <span>Выйти</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                if (onAuthClick) onAuthClick();
                else onAccountClick();
              }}
              className="text-[#4A3728] text-lg font-medium py-2 border-b border-[#E8C4B8] text-left"
            >
              Войти / Регистрация
            </button>
          )}
          
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
