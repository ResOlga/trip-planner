/* ============================================================
 state.js - состояние приложения и работа с localStorage
 ============================================================ */
'use strict';

let appData = { plans: {}, activeCity: '' };
let state = null;
let aiSettings = { apiKey: '', model: 'deepseek-flash', baseUrl: 'https://api.deepseek.com' };

/* ---------- Storage ---------- */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.plans && typeof parsed.plans === 'object') {
        appData.plans = parsed.plans;
        Object.keys(appData.plans).forEach(k => normalizePlan(appData.plans[k]));
        appData.activeCity = parsed.activeCity || Object.keys(appData.plans)[0] || '';
      }
    }
  } catch (e) { console.warn('Storage error:', e); }

  if (appData.activeCity && appData.plans[appData.activeCity]) {
    state = appData.plans[appData.activeCity];
  } else {
    state = emptyPlan();
  }

  try {
    const aiRaw = localStorage.getItem(AI_SETTINGS_KEY);
    if (aiRaw) {
      const p = JSON.parse(aiRaw);
      if (p && typeof p === 'object') aiSettings = { ...aiSettings, ...p };
    }
  } catch (e) {}
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }
  catch (e) { console.error('Save error:', e); }
}
function saveAiSettings() {
  try { localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings)); } catch (e) {}
}

function switchCity(city) {
  city = city.trim();
  if (!city) return;
  if (!appData.plans[city]) appData.plans[city] = emptyPlan(city);
  appData.activeCity = city;
  state = appData.plans[city];
  save();
  populateCatalog();
  populateCitySuggestions();
}
