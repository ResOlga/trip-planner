/* ============================================================
 data.js - константы и справочники (города, статусы, расходы)
 ============================================================ */
'use strict';

const STORAGE_KEY = 'trip-planner-v4';
const OLD_STORAGE_KEY = 'trip-planner-v3';
const AI_SETTINGS_KEY = 'spb-ai-settings-v1';
const EXPENSE_CATEGORIES = ['Проживание', 'Транспорт', 'Питание', 'Билеты', 'Сувениры', 'Разное'];

const CITY_PRESETS = {
  'Санкт-Петербург': {
    catalog: [
      { title: 'Эрмитаж', place: 'Дворцовая пл., 2', category: 'Музей', duration: '3–4 ч', notes: 'Билеты онлайн заранее. Выходной — понедельник.' },
      { title: 'Русский музей', place: 'Инженерная ул., 4', category: 'Музей', duration: '2–3 ч', notes: 'Выходной — вторник.' },
      { title: 'Петергоф', place: 'г. Петергоф, Разводная ул., 2', category: 'Дворец', duration: '5–6 ч', notes: 'Метеор от Дворцовой набережной. Фонтаны в сезон.' },
      { title: 'Царское Село (Екатерининский дворец)', place: 'г. Пушкин, Садовая ул., 7', category: 'Дворец', duration: '4–5 ч', notes: 'Янтарная комната. Выходной — вторник.' },
      { title: 'Юсуповский дворец', place: 'наб. реки Мойки, 94', category: 'Дворец', duration: '2 ч' },
      { title: 'Крейсер «Аврора»', place: 'Петроградская наб.', category: 'Музей', duration: '1 ч' },
      { title: 'Гранд Макет Россия', place: 'Цветочная ул., 16', category: 'Музей', duration: '1.5–2 ч' },
      { title: 'Музей «Эрарта»', place: '29-я линия В.О., 2', category: 'Музей', duration: '2 ч', notes: 'Современное искусство' },
      { title: 'Исаакиевский собор', place: 'Исаакиевская пл., 4', category: 'Собор', duration: '1.5 ч', notes: 'Колоннада. Выходной — среда.' },
      { title: 'Спас на Крови', place: 'наб. канала Грибоедова, 2Б', category: 'Собор', duration: '1–1.5 ч', notes: 'Выходной — среда.' },
      { title: 'Казанский собор', place: 'Казанская пл., 2', category: 'Собор', duration: '1 ч' },
      { title: 'Смольный собор', place: 'пл. Растрелли, 1', category: 'Собор', duration: '1 ч', notes: 'Можно на звонницу' },
      { title: 'Петропавловская крепость', place: 'Заячий остров', category: 'Крепость', duration: '2–3 ч', notes: 'Выходной — среда, летом без выходных.' },
      { title: 'Стрелка Васильевского острова', place: 'Биржевая пл.', category: 'Прогулка', duration: '1 ч' },
      { title: 'Кронштадт', place: 'г. Кронштадт', category: 'Прогулка', duration: '5–6 ч' },
      { title: 'Летний сад', place: 'Летний сад', category: 'Парк', duration: '1.5 ч' },
      { title: 'Новая Голландия', place: 'наб. Адмиралтейского канала, 2', category: 'Парк', duration: '2 ч' },
      { title: 'Прогулка по Невскому проспекту', place: 'Невский пр.', category: 'Прогулка', duration: '2 ч' },
      { title: 'Развод мостов', place: 'Дворцовая наб.', category: 'Прогулка', duration: '1.5 ч', notes: 'Ночью, около 01:00–02:00. Сезон навигации.' },
      { title: 'Экскурсия по метро', place: 'Станции «Автово», «Площадь Восстания»', category: 'Прогулка', duration: '1.5 ч' },
      { title: 'Мариинский театр', place: 'Театральная пл., 1', category: 'Театр', duration: '3 ч', notes: 'Билеты за месяц и раньше' },
    ],
    samplePlan: (startISO) => {
      const day = (o) => { const d = new Date(startISO + 'T00:00:00'); d.setDate(d.getDate() + o); return toISO(d); };
      return [
        { date: day(0), time: '10:00', title: 'Эрмитаж', place: 'Дворцовая пл., 2', category: 'Музей', duration: '3–4 ч', notes: 'Билеты онлайн заранее.', status: 'planned', cost: 0 },
        { date: day(0), time: '14:30', title: 'Прогулка по Невскому проспекту', place: 'Невский пр.', category: 'Прогулка', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '16:30', title: 'Казанский собор', place: 'Казанская пл., 2', category: 'Собор', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '10:00', title: 'Петропавловская крепость', place: 'Заячий остров', category: 'Крепость', duration: '2–3 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '13:30', title: 'Крейсер «Аврора»', place: 'Петроградская наб.', category: 'Музей', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '15:30', title: 'Стрелка Васильевского острова', place: 'Биржевая пл.', category: 'Прогулка', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '10:30', title: 'Исаакиевский собор', place: 'Исаакиевская пл., 4', category: 'Собор', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '13:00', title: 'Спас на Крови', place: 'наб. канала Грибоедова, 2Б', category: 'Собор', duration: '1–1.5 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '15:30', title: 'Летний сад', place: 'Летний сад', category: 'Парк', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(3), time: '09:30', title: 'Петергоф', place: 'г. Петергоф', category: 'Дворец', duration: '5–6 ч', notes: 'Метеор. Фонтаны в сезон.', status: 'planned', cost: 0 },
        { date: day(4), time: '10:30', title: 'Русский музей', place: 'Инженерная ул., 4', category: 'Музей', duration: '2–3 ч', status: 'planned', cost: 0 },
        { date: day(4), time: '15:00', title: 'Новая Голландия', place: 'наб. Адмиралтейского канала, 2', category: 'Парк', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(4), time: '23:30', title: 'Развод мостов', place: 'Дворцовая наб.', category: 'Прогулка', duration: '1.5 ч', notes: 'Ночью.', status: 'planned', cost: 0 },
      ];
    },
  },
  'Москва': {
    catalog: [
      { title: 'Красная площадь', place: 'Красная пл.', category: 'Прогулка', duration: '1 ч' },
      { title: 'Московский Кремль', place: 'Кремль', category: 'Крепость', duration: '3 ч', notes: 'Выходной — четверг.' },
      { title: 'Третьяковская галерея', place: 'Лаврушинский пер., 10', category: 'Музей', duration: '2–3 ч', notes: 'Выходной — понедельник.' },
      { title: 'Пушкинский музей', place: 'ул. Волхонка, 12', category: 'Музей', duration: '2–3 ч', notes: 'Выходной — понедельник.' },
      { title: 'Храм Христа Спасителя', place: 'ул. Волхонка, 15', category: 'Собор', duration: '1 ч' },
      { title: 'Парк Зарядье', place: 'ул. Варварка, 6', category: 'Парк', duration: '2 ч' },
      { title: 'Парк Горького', place: 'Крымский Вал, 9', category: 'Парк', duration: '2 ч' },
      { title: 'ВДНХ', place: 'просп. Мира, 119', category: 'Прогулка', duration: '3 ч' },
      { title: 'Останкинская башня', place: 'ул. Академика Королёва, 15', category: 'Развлечение', duration: '1.5 ч' },
      { title: 'Арбат', place: 'ул. Арбат', category: 'Прогулка', duration: '2 ч' },
      { title: 'Большой театр', place: 'Театральная пл., 1', category: 'Театр', duration: '3 ч' },
      { title: 'Воробьёвы горы', place: 'Воробьёвы горы', category: 'Прогулка', duration: '1.5 ч' },
    ],
    samplePlan: (startISO) => {
      const day = (o) => { const d = new Date(startISO + 'T00:00:00'); d.setDate(d.getDate() + o); return toISO(d); };
      return [
        { date: day(0), time: '10:00', title: 'Московский Кремль', place: 'Кремль', category: 'Крепость', duration: '3 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '13:30', title: 'Красная площадь', place: 'Красная пл.', category: 'Прогулка', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '15:00', title: 'Парк Зарядье', place: 'ул. Варварка, 6', category: 'Парк', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '10:00', title: 'Третьяковская галерея', place: 'Лаврушинский пер., 10', category: 'Музей', duration: '2–3 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '14:00', title: 'Арбат', place: 'ул. Арбат', category: 'Прогулка', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '16:30', title: 'Храм Христа Спасителя', place: 'ул. Волхонка, 15', category: 'Собор', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '10:00', title: 'ВДНХ', place: 'просп. Мира, 119', category: 'Прогулка', duration: '3 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '14:00', title: 'Останкинская башня', place: 'ул. Академика Королёва, 15', category: 'Развлечение', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '16:30', title: 'Воробьёвы горы', place: 'Воробьёвы горы', category: 'Прогулка', duration: '1.5 ч', status: 'planned', cost: 0 },
      ];
    },
  },
  'Казань': {
    catalog: [
      { title: 'Казанский Кремль', place: 'Кремль', category: 'Крепость', duration: '2 ч' },
      { title: 'Мечеть Кул-Шариф', place: 'Казанский Кремль', category: 'Собор', duration: '1 ч' },
      { title: 'Улица Баумана', place: 'ул. Баумана', category: 'Прогулка', duration: '2 ч' },
      { title: 'Дворец земледельцев', place: 'ул. Федосеевская, 36', category: 'Прогулка', duration: '0.5 ч' },
      { title: 'Храм всех религий', place: 'пос. Старое Аракчино', category: 'Собор', duration: '1 ч' },
      { title: 'Кремлёвская набережная', place: 'Кремлёвская наб.', category: 'Прогулка', duration: '1.5 ч' },
      { title: 'Старо-Татарская слобода', place: 'ул. Марджани', category: 'Прогулка', duration: '2 ч' },
      { title: 'Национальный музей РТ', place: 'ул. Кремлёвская, 2', category: 'Музей', duration: '2 ч' },
    ],
    samplePlan: (startISO) => {
      const day = (o) => { const d = new Date(startISO + 'T00:00:00'); d.setDate(d.getDate() + o); return toISO(d); };
      return [
        { date: day(0), time: '10:00', title: 'Казанский Кремль', place: 'Кремль', category: 'Крепость', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '12:30', title: 'Мечеть Кул-Шариф', place: 'Казанский Кремль', category: 'Собор', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '14:30', title: 'Улица Баумана', place: 'ул. Баумана', category: 'Прогулка', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '10:00', title: 'Храм всех религий', place: 'пос. Старое Аракчино', category: 'Собор', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '14:00', title: 'Кремлёвская набережная', place: 'Кремлёвская наб.', category: 'Прогулка', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '16:30', title: 'Старо-Татарская слобода', place: 'ул. Марджани', category: 'Прогулка', duration: '2 ч', status: 'planned', cost: 0 },
      ];
    },
  },
  'Сочи': {
    catalog: [
      { title: 'Олимпийский парк', place: 'Адлер', category: 'Прогулка', duration: '3 ч' },
      { title: 'Красная Поляна', place: 'Красная Поляна', category: 'Прогулка', duration: '6 ч' },
      { title: 'Сочинский дендрарий', place: 'Курортный пр., 74', category: 'Парк', duration: '2–3 ч' },
      { title: 'Парк «Ривьера»', place: 'ул. Егорова, 1', category: 'Парк', duration: '2 ч' },
      { title: 'Смотровая башня Ахун', place: 'г. Большой Ахун', category: 'Прогулка', duration: '2 ч' },
      { title: 'Сочи Парк', place: 'Адлер', category: 'Развлечение', duration: '4–6 ч' },
      { title: 'Набережная Сочи', place: 'Приморская наб.', category: 'Прогулка', duration: '1.5 ч' },
    ],
    samplePlan: (startISO) => {
      const day = (o) => { const d = new Date(startISO + 'T00:00:00'); d.setDate(d.getDate() + o); return toISO(d); };
      return [
        { date: day(0), time: '10:00', title: 'Сочинский дендрарий', place: 'Курортный пр., 74', category: 'Парк', duration: '2–3 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '14:00', title: 'Набережная Сочи', place: 'Приморская наб.', category: 'Прогулка', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '09:00', title: 'Красная Поляна', place: 'Красная Поляна', category: 'Прогулка', duration: '6 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '10:00', title: 'Олимпийский парк', place: 'Адлер', category: 'Прогулка', duration: '3 ч', status: 'planned', cost: 0 },
        { date: day(2), time: '14:00', title: 'Сочи Парк', place: 'Адлер', category: 'Развлечение', duration: '4–6 ч', status: 'planned', cost: 0 },
        { date: day(3), time: '10:00', title: 'Смотровая башня Ахун', place: 'г. Большой Ахун', category: 'Прогулка', duration: '2 ч', status: 'planned', cost: 0 },
      ];
    },
  },
  'Екатеринбург': {
    catalog: [
      { title: 'Плотинка', place: 'Плотинка', category: 'Прогулка', duration: '1 ч' },
      { title: 'Храм на Крови', place: 'ул. Царская, 10', category: 'Собор', duration: '1 ч' },
      { title: 'Ельцин-центр', place: 'ул. Бориса Ельцина, 3', category: 'Музей', duration: '2 ч' },
      { title: 'Улица Вайнера', place: 'ул. Вайнера', category: 'Прогулка', duration: '1 ч' },
      { title: 'Музей ИЗО', place: 'ул. Воеводина, 5', category: 'Музей', duration: '1.5 ч' },
      { title: 'БЦ «Высоцкий»', place: 'ул. Малышева, 51', category: 'Развлечение', duration: '1 ч' },
      { title: 'Литературный квартал', place: 'ул. Пролетарская, 14', category: 'Прогулка', duration: '1.5 ч' },
    ],
    samplePlan: (startISO) => {
      const day = (o) => { const d = new Date(startISO + 'T00:00:00'); d.setDate(d.getDate() + o); return toISO(d); };
      return [
        { date: day(0), time: '10:00', title: 'Плотинка', place: 'Плотинка', category: 'Прогулка', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '11:30', title: 'Храм на Крови', place: 'ул. Царская, 10', category: 'Собор', duration: '1 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '14:00', title: 'Ельцин-центр', place: 'ул. Бориса Ельцина, 3', category: 'Музей', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '10:00', title: 'Музей ИЗО', place: 'ул. Воеводина, 5', category: 'Музей', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '14:00', title: 'Литературный квартал', place: 'ул. Пролетарская, 14', category: 'Прогулка', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '16:30', title: 'БЦ «Высоцкий»', place: 'ул. Малышева, 51', category: 'Развлечение', duration: '1 ч', status: 'planned', cost: 0 },
      ];
    },
  },
  'Нижний Новгород': {
    catalog: [
      { title: 'Нижегородский кремль', place: 'Кремль', category: 'Крепость', duration: '2 ч' },
      { title: 'Чкаловская лестница', place: 'Нижневолжская наб.', category: 'Прогулка', duration: '0.5 ч' },
      { title: 'Большая Покровская', place: 'ул. Б. Покровская', category: 'Прогулка', duration: '2 ч' },
      { title: 'Стрелка', place: 'Стрелка', category: 'Прогулка', duration: '1.5 ч' },
      { title: 'Канатная дорога', place: 'Нижний Новгород — Бор', category: 'Развлечение', duration: '1.5 ч' },
      { title: 'Рождественская улица', place: 'ул. Рождественская', category: 'Прогулка', duration: '1.5 ч' },
      { title: 'Пакгаузы', place: 'Стрелка', category: 'Музей', duration: '1.5 ч' },
    ],
    samplePlan: (startISO) => {
      const day = (o) => { const d = new Date(startISO + 'T00:00:00'); d.setDate(d.getDate() + o); return toISO(d); };
      return [
        { date: day(0), time: '10:00', title: 'Нижегородский кремль', place: 'Кремль', category: 'Крепость', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '13:00', title: 'Чкаловская лестница', place: 'Нижневолжская наб.', category: 'Прогулка', duration: '0.5 ч', status: 'planned', cost: 0 },
        { date: day(0), time: '15:00', title: 'Большая Покровская', place: 'ул. Б. Покровская', category: 'Прогулка', duration: '2 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '10:00', title: 'Стрелка', place: 'Стрелка', category: 'Прогулка', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '12:00', title: 'Пакгаузы', place: 'Стрелка', category: 'Музей', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '14:30', title: 'Канатная дорога', place: 'Нижний Новгород — Бор', category: 'Развлечение', duration: '1.5 ч', status: 'planned', cost: 0 },
        { date: day(1), time: '17:00', title: 'Рождественская улица', place: 'ул. Рождественская', category: 'Прогулка', duration: '1.5 ч', status: 'planned', cost: 0 },
      ];
    },
  },
};

const STATUS_LABELS = {
  planned:   { label: 'Запланировано', class: 'status-planned' },
  booked:    { label: 'Забронировано', class: 'status-booked' },
  done:      { label: 'Посещено',      class: 'status-done' },
  cancelled: { label: 'Отменено',      class: 'status-cancelled' },
};
