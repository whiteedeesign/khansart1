import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import WhyUs from './components/WhyUs';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import Masters from './components/Masters';
import Gallery from './components/Gallery';
import Promotions from './components/Promotions';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import BookingPage from './components/BookingPage';
import ClientAccount from './components/ClientAccount';
import MasterAccount from './components/MasterAccount';
import AdminPanel from './components/AdminPanel';
import ServicesModal from './components/ServicesModal';
import MasterDetailModal from './components/MasterDetailModal';
import AuthModal from './components/AuthModal';
import { supabase } from './src/lib/supabase';
import { Master } from './types';

type View = 'landing' | 'booking' | 'account' | 'master' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [selectedMasterForDetail, setSelectedMasterForDetail] = useState<Master | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Pre-selection state for booking
  const [preselectedData, setPreselectedData] = useState<{ serviceId?: string, masterId?: string, appliedPromo?: string }>({});

  // Проверяем авторизацию при загрузке
  useEffect(() => {
  // Функция загрузки аватара
  const loadUserAvatar = async (userId: string) => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('avatar_url')
        .eq('id', userId)
        .single();
      
      if (client?.avatar_url) {
        setUserAvatar(client.avatar_url);
      }
    } catch (error) {
      console.log('Аватар не найден');
    }
  };

  // Получаем текущую сессию
  const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      console.log('👤 Текущий пользователь:', session?.user?.email || 'не авторизован');
      
      // Загружаем аватар если пользователь авторизован
      if (session?.user?.id) {
        loadUserAvatar(session.user.id);
      }
    } catch (error) {
      console.error('Ошибка получения сессии:', error);
    } finally {
      setLoadingAuth(false);
    }
  };

  getSession();

  // Подписываемся на изменения авторизации
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
    console.log('🔄 Изменение авторизации:', session?.user?.email || 'вышел');
    
    // Загружаем/очищаем аватар
    if (session?.user?.id) {
      loadUserAvatar(session.user.id);
    } else {
      setUserAvatar(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    if (view === 'landing') {
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash && hash !== '#') {
          try {
            const id = hash.replace('#', '');
            const el = document.getElementById(id);
            el?.scrollIntoView({ behavior: 'smooth' });
          } catch (e) {
            console.error('Scroll error:', e);
          }
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [view]);

  const scrollToSection = (id: string) => {
    if (view !== 'landing') {
      setView('landing');
      window.history.pushState(null, '', '/');
      
      const attemptScroll = (retries = 0) => {
        if (id === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (retries < 10) {
          setTimeout(() => attemptScroll(retries + 1), 50);
        }
      };
      setTimeout(attemptScroll, 100);
    } else {
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBookingClick = (serviceId?: string, masterId?: string, appliedPromo?: string) => {
    setPreselectedData({ serviceId, masterId, appliedPromo });
    setView('booking');
    setIsServicesModalOpen(false);
    setSelectedMasterForDetail(null);
  };

  const handleHomeClick = () => {
    setPreselectedData({});
    setView('landing');
    window.history.pushState(null, '', '/');
  };

  const handleAccountClick = () => {
    if (user) {
      setView('account');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    // Можно сразу перейти в личный кабинет
    // setView('account');
  };

 const handleMasterClick = () => {
  if (user) {
    setView('master');
  } else {
    setIsAuthModalOpen(true);
  }
};

  const handleAdminClick = () => setView('admin');

  return (
    <div className="min-h-screen selection:bg-[#E8C4B8] selection:text-[#4A3728]">
      {view !== 'admin' && (
        <Header 
          onBookClick={() => handleBookingClick()} 
          onHomeClick={handleHomeClick} 
          onAccountClick={handleAccountClick} 
          onMasterClick={handleMasterClick}
          onAdminClick={handleAdminClick}
          scrollToSection={scrollToSection}
          user={user}
          userAvatar={userAvatar}
          onAuthClick={handleAuthClick}
        />
      )}
      <main>
        {view === 'landing' && (
          <>
            <Hero onBookClick={() => handleBookingClick()} onScrollTo={scrollToSection} />
            <WhyUs />
            <HowItWorks />
            <Services 
              onServiceClick={(id) => handleBookingClick(id)} 
              onShowAllClick={() => setIsServicesModalOpen(true)}
            />
            <Masters 
              onMasterClick={(id) => handleBookingClick(undefined, id)} 
              onViewDetail={(master) => setSelectedMasterForDetail(master)}
            />
            <Gallery />
            <Promotions onPromoClick={() => handleBookingClick(undefined, undefined, "5-я процедура в подарок")} />
            <Reviews />
          </>
        )}
        {view === 'booking' && (
          <BookingPage 
            onHomeClick={handleHomeClick} 
            initialServiceId={preselectedData.serviceId}
            initialMasterId={preselectedData.masterId}
            appliedPromo={preselectedData.appliedPromo}
            user={user}
          />
        )}
        {view === 'account' && (
          <ClientAccount onHomeClick={handleHomeClick} onBookClick={() => handleBookingClick()} user={user}/>
        )}
        {view === 'master' && user && (
  <MasterAccount onHomeClick={handleHomeClick} user={user} />
)}

        {view === 'admin' && (
          <AdminPanel onHomeClick={handleHomeClick} />
        )}
      </main>
      
      {view !== 'admin' && (
        <Footer 
          onHomeClick={handleHomeClick} 
          onBookClick={() => handleBookingClick()} 
          scrollToSection={scrollToSection}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Services Modal */}
      {isServicesModalOpen && (
        <ServicesModal 
          onClose={() => setIsServicesModalOpen(false)} 
          onBookService={handleBookingClick}
        />
      )}

      {/* Master Detail Modal */}
      {selectedMasterForDetail && (
        <MasterDetailModal 
          master={selectedMasterForDetail} 
          onClose={() => setSelectedMasterForDetail(null)}
          onBookClick={(masterId) => handleBookingClick(undefined, masterId)}
        />
      )}
    </div>
  );
};

export default App;
