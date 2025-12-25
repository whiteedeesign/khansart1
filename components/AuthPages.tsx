
import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Phone, 
  ArrowLeft, CircleCheck, Chrome, Send, ShieldCheck, 
  AlertCircle, ChevronRight 
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  logoClick: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, onBack, logoClick }) => (
  <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
    <button 
      onClick={logoClick}
      className="text-4xl font-rounded font-bold text-[#4A3728] mb-8 hover:opacity-80 transition-opacity"
    >
      Khan's Art
    </button>
    
    <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-[#8B6F5C]/10 p-10 md:p-12 border border-[#E8C4B8]/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E8C4B8] via-[#8B6F5C] to-[#E8C4B8]" />
      
      <div className="flex items-center mb-8">
        {onBack && (
          <button onClick={onBack} className="mr-4 p-2 hover:bg-[#F5F0E8] rounded-full text-[#8B6F5C] transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-rounded font-bold text-[#4A3728]">{title}</h2>
      </div>
      
      {children}
    </div>
  </div>
);

// --- LOGIN PAGE ---
export const LoginPage: React.FC<{ 
  onRegisterClick: () => void; 
  onForgotClick: () => void; 
  onSuccess: () => void;
  onHomeClick: () => void;
}> = ({ onRegisterClick, onForgotClick, onSuccess, onHomeClick }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout title="Вход в кабинет" logoClick={onHomeClick}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Email или телефон</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={20} />
            <input 
              type="text" 
              placeholder="example@mail.ru" 
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium text-[#4A3728]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-[#8B6F5C] uppercase tracking-widest">Пароль</label>
            <button onClick={onForgotClick} className="text-[10px] font-bold text-[#8B6F5C] hover:text-[#4A3728] uppercase transition-colors">Забыли?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#F5F0E8] border-2 border-transparent focus:border-[#8B6F5C] outline-none transition-all font-medium text-[#4A3728]"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B6F5C] hover:text-[#4A3728] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <label className="flex items-center space-x-3 cursor-pointer group px-1">
          <input type="checkbox" className="w-5 h-5 rounded-md border-2 border-[#E8C4B8] text-[#8B6F5C] focus:ring-[#8B6F5C]" />
          <span className="text-sm font-medium text-[#4A3728] group-hover:text-[#8B6F5C] transition-colors">Запомнить меня</span>
        </label>

        <button 
          onClick={onSuccess}
          className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl text-lg font-bold shadow-xl shadow-[#8B6F5C]/20 hover:bg-[#4A3728] transition-all transform active:scale-95"
        >
          Войти
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8C4B8]"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-[#8B6F5C] font-bold">или</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 py-3 border border-[#E8C4B8] rounded-xl hover:bg-[#F5F0E8] transition-all font-bold text-xs text-[#4A3728]">
            <Chrome size={18} /> <span>Google</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 border border-[#E8C4B8] rounded-xl hover:bg-[#F5F0E8] transition-all font-bold text-xs text-[#4A3728]">
            <Send size={18} /> <span>Telegram</span>
          </button>
        </div>

        <p className="text-center text-sm text-[#4A3728]/60 pt-4">
          Нет аккаунта? <button onClick={onRegisterClick} className="text-[#8B6F5C] font-bold hover:underline">Зарегистрироваться</button>
        </p>
      </div>
    </AuthLayout>
  );
};

// --- REGISTER PAGE ---
export const RegisterPage: React.FC<{ 
  onLoginClick: () => void; 
  onSuccess: (msg: string) => void;
  onHomeClick: () => void;
}> = ({ onLoginClick, onSuccess, onHomeClick }) => {
  const [password, setPassword] = useState('');
  
  const getPasswordStrength = () => {
    if (!password) return 0;
    if (password.length < 6) return 33;
    if (password.length < 10) return 66;
    return 100;
  };

  const strengthColor = getPasswordStrength() <= 33 ? 'bg-red-400' : getPasswordStrength() <= 66 ? 'bg-orange-400' : 'bg-green-400';

  return (
    <AuthLayout title="Создать аккаунт" logoClick={onHomeClick}>
      <div className="space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Имя и фамилия</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={18} />
            <input type="text" placeholder="Анна Иванова" className="w-full pl-11 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Телефон</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={18} />
            <input type="tel" placeholder="+7 (___) ___-__-__" className="w-full pl-11 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={18} />
            <input type="email" placeholder="example@mail.ru" className="w-full pl-11 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full pl-11 pr-6 py-3.5 rounded-2xl bg-[#F5F0E8] outline-none text-sm font-medium" 
            />
          </div>
          {password && (
            <div className="px-1 pt-1">
              <div className="h-1 w-full bg-[#E8C4B8]/30 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColor} transition-all duration-500`} style={{ width: `${getPasswordStrength()}%` }} />
              </div>
              <p className="text-[9px] font-bold text-[#8B6F5C] mt-1 uppercase tracking-tighter">Надежность: {getPasswordStrength() <= 33 ? 'Слабый' : getPasswordStrength() <= 66 ? 'Средний' : 'Отличный'}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[#E8C4B8] text-[#8B6F5C] focus:ring-[#8B6F5C]" />
            <span className="text-xs text-[#4A3728]/70 leading-tight">Согласен с <button className="text-[#8B6F5C] font-bold hover:underline">политикой конфиденциальности</button></span>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-[#E8C4B8] text-[#8B6F5C] focus:ring-[#8B6F5C]" />
            <span className="text-xs text-[#4A3728]/70 leading-tight">Получать уведомления о новых акциях и скидках</span>
          </label>
        </div>

        <button 
          onClick={() => onSuccess("Письмо с подтверждением отправлено на ваш email")}
          className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#8B6F5C]/10 hover:bg-[#4A3728] transition-all transform active:scale-95 mt-4"
        >
          Зарегистрироваться
        </button>

        <p className="text-center text-sm text-[#4A3728]/60 pt-2">
          Уже есть аккаунт? <button onClick={onLoginClick} className="text-[#8B6F5C] font-bold hover:underline">Войти</button>
        </p>
      </div>
    </AuthLayout>
  );
};

// --- FORGOT PASSWORD PAGE ---
export const ForgotPasswordPage: React.FC<{ 
  onBackClick: () => void; 
  onSuccess: (msg: string) => void;
  onHomeClick: () => void;
}> = ({ onBackClick, onSuccess, onHomeClick }) => (
  <AuthLayout title="Восстановление" onBack={onBackClick} logoClick={onHomeClick}>
    <div className="space-y-6">
      <p className="text-sm text-[#4A3728]/70 leading-relaxed px-1">
        Введите ваш email, и мы отправим ссылку для сброса пароля.
      </p>

      <div className="space-y-2">
        <label className="text-xs font-bold text-[#8B6F5C] uppercase tracking-widest ml-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F5C]/50" size={20} />
          <input type="email" placeholder="example@mail.ru" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#F5F0E8] outline-none font-medium" />
        </div>
      </div>

      <button 
        onClick={() => onSuccess("Инструкции по восстановлению отправлены на ваш email")}
        className="w-full bg-[#8B6F5C] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#4A3728] transition-all transform active:scale-95"
      >
        Отправить
      </button>

      <button onClick={onBackClick} className="w-full text-center text-sm font-bold text-[#8B6F5C] hover:text-[#4A3728] transition-colors">
        Вернуться ко входу
      </button>
    </div>
  </AuthLayout>
);

// --- SUCCESS MODAL ---
export const AuthSuccessModal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center text-[#8B6F5C] mx-auto mb-6 shadow-inner">
        <CircleCheck size={40} />
      </div>
      <h3 className="text-xl font-rounded font-bold text-[#4A3728] mb-4">Готово!</h3>
      <p className="text-[#4A3728]/70 text-sm leading-relaxed mb-8">
        {message}
      </p>
      <button 
        onClick={onClose}
        className="w-full bg-[#8B6F5C] text-white py-4 rounded-2xl font-bold hover:bg-[#4A3728] transition-all"
      >
        Понятно
      </button>
    </div>
  </div>
);
