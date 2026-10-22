/* ============================================================
 main.js - запуск приложения и подписка на кнопки панели
 ============================================================ */
'use strict';

load();
populateCitySuggestions();
populateCatalog();
render();
updateChatHint();

document.getElementById('btnSample').addEventListener('click', loadSampleItinerary);
document.getElementById('btnAdd').addEventListener('click', () => {
  if (!state.trip.startDate || !state.trip.endDate) { alert('Сначала введите город и даты поездки.'); return; }
  openModal();
});
