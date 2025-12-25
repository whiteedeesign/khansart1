
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
import { LoginPage, RegisterPage, ForgotPasswordPage, AuthSuccessModal } from './components/AuthPages';
import { Master } from './types';

type View = 'landing' | 'booking' | 'account' | 'master' | 'admin' | 'login' | 'register' | 'forgot-password';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [selectedMasterForDetail, setSelectedMasterForDetail] = useState<Master | null>(null);
  
  // Pre-selection state for booking
  const [preselectedData, setPreselectedData] = useState<{ serviceId?: string, masterId?: string, appliedPromo?: string }>({});

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

  const handleAccountClick = () => setView('login');
  const handleMasterClick = () => setView('master');
  const handleAdminClick = () => setView('admin');
  
  const handleAuthSuccess = (msg: string) => {
    setAuthMessage(msg);
  };

  const closeAuthModal = () => {
    setAuthMessage(null);
    setView('login');
  };

  const isAuthPage = ['login', 'register', 'forgot-password'].includes(view);

  return (
    <div className="min-h-screen selection:bg-[#E8C4B8] selection:text-[#4A3728]">
      {view !== 'admin' && !isAuthPage && (
        <Header 
          onBookClick={() => handleBookingClick()} 
          onHomeClick={handleHomeClick} 
          onAccountClick={handleAccountClick} 
          onMasterClick={handleMasterClick}
          onAdminClick={handleAdminClick}
          scrollToSection={scrollToSection}
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
          />
        )}
        {view === 'account' && (
          <ClientAccount onHomeClick={handleHomeClick} onBookClick={() => handleBookingClick()} />
        )}
        {view === 'master' && (
          <MasterAccount onHomeClick={handleHomeClick} />
        )}
        {view === 'admin' && (
          <AdminPanel onHomeClick={handleHomeClick} />
        )}

        {/* Auth Views */}
        {view === 'login' && (
          <LoginPage 
            onRegisterClick={() => setView('register')} 
            onForgotClick={() => setView('forgot-password')}
            onSuccess={() => setView('account')}
            onHomeClick={handleHomeClick}
          />
        )}
        {view === 'register' && (
          <RegisterPage 
            onLoginClick={() => setView('login')} 
            onSuccess={handleAuthSuccess}
            onHomeClick={handleHomeClick}
          />
        )}
        {view === 'forgot-password' && (
          <ForgotPasswordPage 
            onBackClick={() => setView('login')} 
            onSuccess={handleAuthSuccess}
            onHomeClick={handleHomeClick}
          />
        )}
      </main>
      
      {view !== 'admin' && !isAuthPage && (
        <Footer 
          onHomeClick={handleHomeClick} 
          onBookClick={() => handleBookingClick()} 
          scrollToSection={scrollToSection}
        />
      )}

      {authMessage && (
        <AuthSuccessModal message={authMessage} onClose={closeAuthModal} />
      )}

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
