
import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, Users, Briefcase, Scissors, 
  Gift, CreditCard, MessageSquare, Image as ImageIcon, 
  ShieldAlert, Settings, LogOut, Menu, CircleCheck
} from 'lucide-react';

// Import split components
import AdminDashboard from './admin/AdminDashboard';
import AdminBookings from './admin/AdminBookings';
import AdminClients from './admin/AdminClients';
import AdminMasters from './admin/AdminMasters';
import AdminServices from './admin/AdminServices';
import AdminPromotions from './admin/AdminPromotions';
import AdminLoyalty from './admin/AdminLoyalty';
import AdminReviews from './admin/AdminReviews';
import AdminGallery from './admin/AdminGallery';
import AdminBlacklist from './admin/AdminBlacklist';
import AdminSettings from './admin/AdminSettings';

type AdminTab = 
  | 'dashboard' | 'bookings' | 'clients' | 'masters' | 'services' 
  | 'promotions' | 'loyalty' | 'reviews' | 'gallery' | 'blacklist' | 'settings';

interface AdminPanelProps {
  onHomeClick: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onHomeClick }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Shared Toast Notification System
  const [notification, setNotification] = useState<string | null>(null);
  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
    { id: 'bookings', label: 'Все записи', icon: <Calendar size={20} /> },
    { id: 'clients', label: 'Клиенты', icon: <Users size={20} /> },
    { id: 'masters', label: 'Мастера', icon: <Briefcase size={20} /> },
    { id: 'services', label: 'Услуги', icon: <Scissors size={20} /> },
    { id: 'promotions', label: 'Акции и скидки', icon: <Gift size={20} /> },
    { id: 'loyalty', label: 'Карты лояльности', icon: <CreditCard size={20} /> },
    { id: 'reviews', label: 'Отзывы', icon: <MessageSquare size={20} /> },
    { id: 'gallery', label: 'Галерея', icon: <ImageIcon size={20} /> },
    { id: 'blacklist', label: 'Чёрный список', icon: <ShieldAlert size={20} /> },
    { id: 'settings', label: 'Настройки', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard onTabChange={setActiveTab} />;
      case 'bookings': return <AdminBookings onNotify={showNotify} />;
      case 'clients': return <AdminClients onNotify={showNotify} />;
      case 'masters': return <AdminMasters onNotify={showNotify} />;
      case 'services': return <AdminServices onNotify={showNotify} />;
      case 'promotions': return <AdminPromotions onNotify={showNotify} />;
      case 'loyalty': return <AdminLoyalty />;
      case 'reviews': return <AdminReviews />;
      case 'gallery': return <AdminGallery />;
      case 'blacklist': return <AdminBlacklist onNotify={showNotify} />;
      case 'settings': return <AdminSettings onNotify={showNotify} />;
      default: return <AdminDashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[200] bg-[#4A3728] text-[#F5F0E8] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CircleCheck size={20} className="text-[#E8C4B8]" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`bg-[#4A3728] text-[#F5F0E8] transition-all duration-300 flex flex-col z-50 ${isSidebarOpen ? 'w-80' : 'w-20'} fixed lg:relative h-screen overflow-hidden shadow-2xl`}>
        <div className="p-8 flex items-center justify-between shrink-0">
          <button 
            onClick={onHomeClick}
            className={`text-2xl font-rounded font-bold whitespace-nowrap transition-all hover:opacity-80 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}
          >
            Khan's Art
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-grow py-4 overflow-y-auto scrollbar-hide">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center px-8 py-4 space-x-4 transition-all group ${
                activeTab === item.id 
                ? 'bg-[#8B6F5C] text-white shadow-inner' 
                : 'hover:bg-white/5 text-[#F5F0E8]/60'
              }`}
            >
              <span className={`${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              <span className={`font-bold whitespace-nowrap transition-all text-sm ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10 shrink-0">
          <button 
            onClick={onHomeClick}
            className={`flex items-center space-x-4 text-[#D4A69A] hover:text-white transition-colors w-full font-bold`}
          >
            <LogOut size={20} />
            <span className={isSidebarOpen ? 'block' : 'hidden'}>Выйти</span>
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-grow overflow-y-auto h-screen p-6 md:p-10 transition-all ml-20 lg:ml-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;
