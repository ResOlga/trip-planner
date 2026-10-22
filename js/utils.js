/* ============================================================
 utils.js - вспомогательные функции: даты, деньги, экранирование
 ============================================================ */
'use strict';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const toISO = (d) => { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${dd}`; };
const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, forms) => { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return forms[0]; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1]; return forms[2]; };
const formatMoney = (amount, currency = '₽') => {
  const n = Number(amount) || 0;
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ' + currency;
};

function emptyPlan(city = '') {
  return {
    trip: { title: city, city, startDate: '', endDate: '', budget: { total: 0, currency: '₽' } },
    excursions: [],
    expenses: [],
  };
}

function normalizePlan(plan) {
  if (!plan || typeof plan !== 'object') plan = emptyPlan();
  plan.trip = plan.trip || {};
  plan.trip.budget = { total: 0, currency: '₽', ...(plan.trip.budget || {}) };
  plan.trip.budget.total = Number(plan.trip.budget.total) || 0;
  plan.excursions = Array.isArray(plan.excursions) ? plan.excursions.map(e => ({ ...e, cost: Number(e.cost) || 0 })) : [];
  plan.expenses = Array.isArray(plan.expenses) ? plan.expenses.map(e => ({
    id: e.id || uid(),
    title: e.title || '',
    category: EXPENSE_CATEGORIES.includes(e.category) ? e.category : 'Разное',
    cost: Number(e.cost) || 0,
  })) : [];
  return plan;
}

function generateDays() {
  if (!state) return [];
  const { startDate, endDate } = state.trip;
  if (!startDate || !endDate || startDate > endDate) return [];
  const days = []; const d = new Date(startDate + 'T00:00:00'); const end = new Date(endDate + 'T00:00:00');
  while (d <= end) { days.push(toISO(d)); d.setDate(d.getDate() + 1); }
  return days;
}

const WEEKDAYS = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const formatDayHeader = (iso, i) => { const d = new Date(iso + 'T00:00:00'); return `День ${i + 1} · ${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const formatDayOption = (iso, i) => { const d = new Date(iso + 'T00:00:00'); return `День ${i + 1} · ${d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}`; };
const formatShort = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

function calcTotals(plan) {
  const cur = plan.trip?.budget?.currency || '₽';
  const excursionTotal = (plan.excursions || [])
    .filter(e => e.status !== 'cancelled')
    .reduce((s, e) => s + (Number(e.cost) || 0), 0);
  const expenseTotal = (plan.expenses || []).reduce((s, e) => s + (Number(e.cost) || 0), 0);
  const spent = excursionTotal + expenseTotal;
  const total = Number(plan.trip?.budget?.total) || 0;
  return { excursionTotal, expenseTotal, spent, total, remaining: total - spent, currency: cur };
}
