import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
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
import { Master, Service, Review, Promotion } from './types';

type View = 'landing' | 'booking' | 'account' | 'master' | 'admin' | 'login' | 'register' | 'forgot-password';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [selectedMasterForDetail, setSelectedMasterForDetail] = useState<Master | null>(null);
  
  // Pre-selection state for booking
  const [preselectedData, setPreselectedData] = useState<{ serviceId?: string, masterId?: string, appliedPromo?: string }>({});

  // Data from Supabase
  const [masters, setMasters] = useState<Master[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        console.log('📡 Загружаем данные из Supabase...');
        
        // Load masters
        const { data: mastersData, error: mastersError } = await supabase
          .from('masters')
          .select('*')
          .eq('is_active', true);
        
        if (mastersError) throw mastersError;
        console.log('✅ Мастера загружены:', mastersData);
        
        // Load services with categories
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select(`
            *,
            categories (name)
          `)
          .eq('is_visible', true)
          .order('sort_order');
        
        if (servicesError) throw servicesError;
        console.log('✅ Услуги загружены:', servicesData);
        
        // Load reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            masters (name, photo_url)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (reviewsError) throw reviewsError;
        console.log('✅ Отзывы загружены:', reviewsData);
        
        // Load promotions
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString().split('T')[0]);
        
        if (promotionsError) throw promotionsError;
        console.log('✅ Акции загружены:', promotionsData);
        
        // Transform data to match existing types
        setMasters(mastersData?.map(m => ({
          id: m.id,
          name: m.name,
          photo: m.photo_url || '/default-avatar.jpg',
          specialization: m.specialization || '',
          experience: m.experience || '',
          rating: 5.0,
          reviewCount: 0,
          bio: m.bio || '',
          phone: m.phone,
          email: m.email
        })) || []);
        
        setServices(servicesData?.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          price: s.price,
          duration: s.duration,
          category: s.categories?.name || 'Другое'
        })) || []);
        
        setReviews(reviewsData?.map(r => ({
          id: r.id,
          clientName: r.client_name,
          rating: r.rating,
          text: r.text || '',
          date: new Date(r.created_at).toLocaleDateString('ru-RU'),
          masterName: r.masters?.name,
          masterPhoto: r.masters?.photo_url
        })) || []);
        
        setPromotions(promotionsData?.map(p => ({
          id: p.id,
          title: p.name,
          description: p.description || '',
          discount: p.discount_percent ? `${p.discount_percent}%` : `${p.discount_amount}₽`,
          promoCode: p.promo_code,
          validUntil: p.end_date
        })) || []);
        
        setLoading(false);
        console.log('🎉 Все данные загружены!');
        
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        setLoading(false);
      }
    }
    
    loadData();
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

  const navigateWithAuth = (targetView: View, message: string) => {
    setAuthMessage(message);
    setView(targetView);
  };

  const handleBookService = (serviceId: string) => {
    setPreselectedData({ serviceId });
    setView('booking');
    setIsServicesModalOpen(false);
  };

  const handleBookMaster = (masterId: string) => {
    setPreselectedData({ masterId });
    setView('booking');
    setSelectedMasterForDetail(null);
  };

  const handleApplyPromotion = (promoCode: string) => {
    setPreselectedData({ appliedPromo: promoCode });
    setView('booking');
  };

  const handleMasterClick = (master: Master) => {
    setSelectedMasterForDetail(master);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {view === 'landing' && (
        <>
          <Header
            onBook={() => setView('booking')}
            onLogin={() => setView('login')}
            onAdminLogin={() => setView('admin')}
            onMasterLogin={() => setView('master')}
            onAllServices={() => setIsServicesModalOpen(true)}
          />
          <Hero onBook={() => setView('booking')} />
          <WhyUs />
          <HowItWorks />
          <Services 
  onBook={handleBookService}
  onViewAll={() => setIsServicesModalOpen(true)}
/>
<Masters 
  onMasterClick={handleMasterClick}
/>

          <Masters 
            masters={masters}
            onMasterClick={handleMasterClick}
          />
          <Gallery />
          <Promotions 
  onApply={handleApplyPromotion}
/>
<Reviews />

          <Footer />
          
          <ServicesModal
            isOpen={isServicesModalOpen}
            onClose={() => setIsServicesModalOpen(false)}
            services={services}
            onBook={handleBookService}
          />
          
          {selectedMasterForDetail && (
            <MasterDetailModal
              master={selectedMasterForDetail}
              onClose={() => setSelectedMasterForDetail(null)}
              onBook={() => handleBookMaster(selectedMasterForDetail.id)}
            />
          )}
        </>
      )}

      {view === 'booking' && (
        <BookingPage
          masters={masters}
          services={services}
          preselectedServiceId={preselectedData.serviceId}
          preselectedMasterId={preselectedData.masterId}
          appliedPromoCode={preselectedData.appliedPromo}
          onBack={() => {
            setPreselectedData({});
            setView('landing');
          }}
          onSuccess={() => navigateWithAuth('login', 'Запись успешно создана! Войдите чтобы увидеть её в личном кабинете.')}
        />
      )}

      {view === 'account' && (
        <ClientAccount onBack={() => setView('landing')} />
      )}

      {view === 'master' && (
        <MasterAccount onBack={() => setView('landing')} />
      )}

      {view === 'admin' && (
        <AdminPanel onBack={() => setView('landing')} />
      )}

      {view === 'login' && (
        <LoginPage
          onBack={() => setView('landing')}
          onRegister={() => setView('register')}
          onForgotPassword={() => setView('forgot-password')}
          onSuccess={(role) => {
            if (role === 'admin') setView('admin');
            else if (role === 'master') setView('master');
            else setView('account');
          }}
          message={authMessage}
        />
      )}

      {view === 'register' && (
        <RegisterPage
          onBack={() => setView('login')}
          onSuccess={() => navigateWithAuth('login', 'Регистрация успешна! Теперь войдите в аккаунт.')}
        />
      )}

      {view === 'forgot-password' && (
        <ForgotPasswordPage
          onBack={() => setView('login')}
          onSuccess={() => navigateWithAuth('login', 'Инструкции отправлены на email!')}
        />
      )}

      {authMessage && view === 'login' && (
        <AuthSuccessModal
          message={authMessage}
          onClose={() => setAuthMessage(null)}
        />
      )}
    </div>
  );
};

export default App;
