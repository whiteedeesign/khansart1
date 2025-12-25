import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      console.log('✅ Вход выполнен:', data.user?.email);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error('❌ Ошибка входа:', err);
      setError(err.message === 'Invalid login credentials' 
        ? 'Неверный email или пароль' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Регистрация пользователя
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone
          }
        }
      });

      if (error) throw error;

      // Создаём запись в таблице clients
      if (data.user) {
        const { error: clientError } = await supabase
          .from('clients')
          .insert([{
            id: data.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone
          }]);

        if (clientError) {
          console.log('⚠️ Клиент уже существует или ошибка:', clientError.message);
        }
      }

      console.log('✅ Регистрация выполнена:', data.user?.email);
      setSuccess('Регистрация успешна! Проверьте почту для подтверждения.');
      
      // Если email confirmation выключен — сразу входим
      if (data.user && !data.user.email_confirmed_at === null) {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      console.error('❌ Ошибка регистрации:', err);
      setError(err.message === 'User already registered' 
        ? 'Пользователь с таким email уже зарегистрирован' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess('Ссылка для сброса пароля отправлена на вашу почту');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', phone: '' });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8C4B8]">
          <h2 className="text-2xl font-rounded font-bold text-[#4A3728]">
            {mode === 'login' && 'Вход'}
            {mode === 'register' && 'Регистрация'}
            {mode === 'reset' && 'Восстановление пароля'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F5F0E8] rounded-xl transition-colors"
          >
            <X size={24} className="text-[#8B6F5C]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error / Success messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="example@mail.ru"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Пароль</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B6F5C] text-white py-4 rounded-xl font-bold hover:bg-[#4A3728] transition-all disabled:opacity-50"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setMode('reset'); resetForm(); }}
                  className="text-[#8B6F5C] hover:text-[#4A3728]"
                >
                  Забыли пароль?
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); resetForm(); }}
                  className="text-[#8B6F5C] hover:text-[#4A3728] font-medium"
                >
                  Регистрация
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Имя</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Телефон</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="example@mail.ru"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Пароль</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="Минимум 6 символов"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B6F5C] text-white py-4 rounded-xl font-bold hover:bg-[#4A3728] transition-all disabled:opacity-50"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); resetForm(); }}
                className="w-full text-center text-sm text-[#8B6F5C] hover:text-[#4A3728]"
              >
                Уже есть аккаунт? Войти
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all"
                    placeholder="example@mail.ru"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B6F5C] text-white py-4 rounded-xl font-bold hover:bg-[#4A3728] transition-all disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); resetForm(); }}
                className="w-full text-center text-sm text-[#8B6F5C] hover:text-[#4A3728]"
              >
                Вернуться к входу
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
