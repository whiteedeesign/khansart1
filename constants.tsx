
import React from 'react';
import { ShieldCheck, Star, Award, Heart, MousePointer2, UserCheck, CalendarDays, Sparkles } from 'lucide-react';
import { Service, Master, Review, Feature, UserProfile, PastBooking, ScheduleEntry, PortfolioWork, MasterClient, Promotion, BlacklistEntry } from './types';

export const COLORS = {
  bg: '#F5F0E8',
  lightPink: '#E8C4B8',
  pink: '#D4A69A',
  lightBrown: '#C49A7C',
  brown: '#8B6F5C',
  darkBrown: '#4A3728',
};

export const SERVICES: Service[] = [
  { id: '1', name: 'Классическое наращивание', price: 'от 2500₽', duration: '1.5 ч.', category: 'Наращивание', description: 'Естественный вид, одна искусственная ресница на одну свою.' },
  { id: '2', name: '2D-3D объём', price: 'от 3000₽', duration: '2 ч.', category: 'Наращивание', description: 'Выразительный взгляд, создание пушистого эффекта.' },
  { id: '3', name: 'Ламинирование ресниц', price: 'от 2000₽', duration: '1 ч.', category: 'Ламинирование', description: 'Укрепление своих ресниц, придание изгиба и цвета.' },
  { id: '4', name: 'Коррекция ресниц', price: 'от 1500₽', duration: '1.5 ч.', category: 'Коррекция', description: 'Обновление наращивания через 2-3 недели.' },
  { id: '5', name: 'Снятие ресниц', price: 'от 500₽', duration: '30 мин.', category: 'Коррекция', description: 'Бережное удаление искусственных ресниц.' },
];

export const MASTERS: Master[] = [
  { 
    id: 'm1', 
    name: 'Анна Кхан', 
    role: 'Топ-мастер, основатель', 
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500',
    experience: 'Более 7 лет',
    rating: 5.0,
    description: 'Специализируется на сложных техниках наращивания и архитектуре взгляда. Автор уникальной методики обучения мастеров Khan\'s Art.'
  },
  { 
    id: 'm2', 
    name: 'Марина Соколова', 
    role: 'Lash-стилист', 
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500',
    experience: '4 года',
    rating: 4.9,
    description: 'Мастер объемного наращивания. Марина обожает создавать яркие, голливудские образы, которые подчеркивают индивидуальность.'
  },
  { 
    id: 'm3', 
    name: 'Елена Белова', 
    role: 'Мастер по ламинированию', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=500',
    experience: '3 года',
    rating: 4.8,
    description: 'Елена — перфекционист в ламинировании и ботоксе ресниц. Делает взгляд выразительным, сохраняя максимальную естественность.'
  },
];

export const BOOKING_STEPS = [
  { id: 1, title: 'Выбор услуги', icon: <MousePointer2 size={24} />, desc: 'Подберите идеальный объем и эффект' },
  { id: 2, title: 'Ваш мастер', icon: <UserCheck size={24} />, desc: 'Доверьтесь профессионалу студии' },
  { id: 3, title: 'Дата и время', icon: <CalendarDays size={24} />, desc: 'Выберите удобное окно в графике' },
  { id: 4, title: 'Результат', icon: <Sparkles size={24} />, desc: 'Ваш идеальный взгляд готов' },
];

export const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:30', '15:30', '17:00', '18:30', '20:00'
];

export const FEATURES: Feature[] = [
  { id: 'f1', title: 'Опыт более 5 лет', icon: <Award className="w-8 h-8" /> },
  { id: 'f2', title: 'Премиум материалы', icon: <ShieldCheck className="w-8 h-8" /> },
  { id: 'f3', title: 'Индивидуальный подход', icon: <Heart className="w-8 h-8" /> },
  { id: 'f4', title: 'Гарантия качества', icon: <Star className="w-8 h-8" /> },
];

export const REVIEWS: Review[] = [
  { 
    id: 'r1', 
    author: 'Екатерина М.', 
    rating: 5, 
    text: 'Самая уютная студия в городе! Ресницы держатся целый месяц, взгляд просто волшебный. Анна — настоящий профессионал.', 
    date: '12.05.2024',
    masterName: 'Анна Кхан',
    status: 'published'
  },
  { 
    id: 'r2', 
    author: 'Ольга С.', 
    rating: 5, 
    text: 'Делала ламинирование. Эффект превзошел все ожидания! Очень нежно и естественно. Рекомендую всем подругам.', 
    date: '20.05.2024',
    masterName: 'Елена Белова',
    status: 'published'
  },
  { 
    id: 'r3', 
    author: 'Виктория К.', 
    rating: 5, 
    text: 'Всегда идеальный 2D объем. Качество материалов на высоте, глазам комфортно сразу после процедуры.', 
    date: '05.06.2024',
    masterName: 'Марина Соколова',
    status: 'published'
  },
];

export const MOCK_USER: UserProfile = {
  name: 'Александра Иванова',
  phone: '+7 (900) 123-45-67',
  email: 'alexandra@mail.ru',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
  birthday: '1995-08-15',
  loyaltyStamps: 3,
  totalVisits: 12
};

export const PAST_BOOKINGS: PastBooking[] = [
  { id: 'pb1', date: '10 мая, 12:00', service: '2D-3D объём', master: 'Марина Соколова', price: '3200₽', status: 'completed', reviewId: 'r3', clientName: 'Александра И.', clientPhone: '+7 (900) 123-45-67' },
  { id: 'pb2', date: '15 апреля, 15:00', service: 'Классическое наращивание', master: 'Анна Кхан', price: '2500₽', status: 'completed', clientName: 'Ольга С.', clientPhone: '+7 (922) 333-44-55' },
  { id: 'pb3', date: '1 марта, 10:00', service: 'Ламинирование ресниц', master: 'Елена Белова', price: '2000₽', status: 'completed', reviewId: 'r2', clientName: 'Екатерина М.', clientPhone: '+7 (911) 222-33-44' }
];

export const MASTER_SCHEDULE: ScheduleEntry[] = [
  { id: 's1', timeStart: '10:00', timeEnd: '12:00', clientName: 'Елена П.', clientPhone: '+7 (911) 222-33-44', service: '2D Объём', price: '3200₽', status: 'confirmed', notes: 'Аллергия на дешевый клей' },
  { id: 's2', timeStart: '12:30', timeEnd: '14:00', clientName: 'Ольга С.', clientPhone: '+7 (922) 333-44-55', service: 'Классика', price: '2500₽', status: 'pending' },
  { id: 's3', timeStart: '15:00', timeEnd: '16:00', clientName: 'Марина К.', clientPhone: '+7 (933) 444-55-66', service: 'Перерыв', price: '0₽', status: 'confirmed' },
  { id: 's4', timeStart: '16:30', timeEnd: '18:30', clientName: 'Юлия В.', clientPhone: '+7 (944) 555-66-77', service: '3D Объём', price: '3800₽', status: 'confirmed' },
  { id: 's5', timeStart: '19:00', timeEnd: '20:30', clientName: 'Анна Л.', clientPhone: '+7 (955) 666-77-88', service: 'Ламинирование', price: '2000₽', status: 'confirmed' },
];

export const MASTER_PORTFOLIO: PortfolioWork[] = [
  { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1583001931046-f090d85ec565?auto=format&fit=crop&q=80&w=400&h=400', serviceType: '2D Объём', description: 'Изгиб C, 0.10мм', masterName: 'Анна Кхан', status: 'published' },
  { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1614859324967-bdf471b42330?auto=format&fit=crop&q=80&w=400&h=400', serviceType: 'Ламинирование', description: 'Эффект распахнутого взгляда', masterName: 'Елена Белова', status: 'published' },
  { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1595475246624-39a5ba2eca0d?auto=format&fit=crop&q=80&w=400&h=400', serviceType: '3D Объём', description: 'Лисий эффект', masterName: 'Марина Соколова', status: 'published' },
  { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400&h=400', serviceType: 'Классика', description: 'Натуральный объем', masterName: 'Анна Кхан', status: 'published' },
  { id: 'p5', imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400&h=400', serviceType: '2D Объём', description: 'Беличий эффект', masterName: 'Марина Соколова', status: 'published' },
];

export const ADMIN_CLIENTS: MasterClient[] = [
  { id: 'c1', name: 'Елена Петрова', phone: '+7 (911) 222-33-44', email: 'elena@gmail.com', visits: 8, totalSpent: '25 600₽', lastVisit: '25 мая 2024', loyaltyStamps: 3, notes: 'Предпочитает изгиб L, любит кофе с молоком.' },
  { id: 'c2', name: 'Ольга Смирнова', phone: '+7 (922) 333-44-55', email: 'olga@yandex.ru', visits: 3, totalSpent: '8 500₽', lastVisit: '10 апреля 2024', loyaltyStamps: 3, notes: 'Чувствительная слизистая.' },
  { id: 'c3', name: 'Мария Иванова', phone: '+7 (933) 444-55-66', email: 'masha@mail.ru', visits: 12, totalSpent: '42 000₽', lastVisit: '05 июня 2024', loyaltyStamps: 2, notes: 'Постоянная клиентка, всегда 3D.' },
  { id: 'c4', name: 'Дарья Котова', phone: '+7 (944) 111-22-33', email: 'darya@me.com', visits: 1, totalSpent: '2 500₽', lastVisit: '12 июня 2024', loyaltyStamps: 1, notes: 'Первый раз.' },
];

export const PROMOTIONS: Promotion[] = [
  { id: 'pr1', title: 'Каждая 5-я процедура в подарок', description: 'Приходите 4 раза и 5-й визит за наш счет!', discount: '100%', expiryDate: '31.12.2025', status: 'active' },
  { id: 'pr2', title: 'Скидка в День Рождения', description: 'Дарим 15% скидку на любую услугу в течение 3 дней до и после праздника.', discount: '15%', promoCode: 'HAPPYBDAY', expiryDate: 'Бессрочно', status: 'active' },
  { id: 'pr3', title: 'Приведи подругу', description: 'Вам и подруге 500 рублей на бонусный счет.', discount: '500₽', expiryDate: '30.09.2024', status: 'draft' },
];

export const BLACKLIST: BlacklistEntry[] = [
  { id: 'bl1', name: 'Татьяна К.', phone: '+7 (988) 123-00-00', reason: '3 пропуска без предупреждения', addedBy: 'Анна Кхан', date: '12.01.2024' },
  { id: 'bl2', name: 'Ирина Ж.', phone: '+7 (999) 555-44-33', reason: 'Конфликтное поведение', addedBy: 'Администратор', date: '05.03.2024' },
];
