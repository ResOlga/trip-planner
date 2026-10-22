/* ============================================================
 trip.js - параметры поездки, готовый маршрут, экспорт и импорт
 ============================================================ */
'use strict';

document.getElementById('btnSaveTrip').addEventListener('click', () => {
  const city = inputCity.value.trim();
  const title = inputTitle.value.trim();
  const startDate = inputStart.value;
  const endDate = inputEnd.value;
  if (!city) { alert('Введите город.'); return; }
  if (!startDate || !endDate) { alert('Укажите даты начала и окончания.'); return; }
  if (startDate > endDate) { alert('Дата начала должна быть раньше даты окончания.'); return; }

  if (city !== appData.activeCity) switchCity(city);
  state.trip.title = title || city;
  state.trip.city = city;
  state.trip.startDate = startDate;
  state.trip.endDate = endDate;

  const days = generateDays();
  const outside = state.excursions.filter(e => !days.includes(e.date));
  if (outside.length && confirm(`${outside.length} экскурс(ии) вне нового диапазона дат. Удалить их?`)) {
    state.excursions = state.excursions.filter(e => days.includes(e.date));
  }
  save(); render();
});

/* ---------- Sample itinerary ---------- */
function loadSampleItinerary() {
  const city = appData.activeCity;
  if (!city) { alert('Сначала введите город.'); return; }
  const preset = CITY_PRESETS[city];
  if (!preset || !preset.samplePlan) {
    alert(`Для города «${city}» нет готового примера.\nДобавьте экскурсии вручную или спросите ИИ.`);
    return;
  }
  if (state.excursions.length > 0 && !confirm('Это заменит текущий план экскурсий (бюджет и расходы сохранятся). Продолжить?')) return;

  let start = state.trip.startDate;
  if (!start) { const d = new Date(); d.setDate(d.getDate() + 1); start = toISO(d); }
  const plan = preset.samplePlan(start);
  const maxDay = Math.max(...plan.map(p => Math.floor((new Date(p.date + 'T00:00:00') - new Date(start + 'T00:00:00')) / 86400000)));
  const endDate = new Date(start + 'T00:00:00');
  endDate.setDate(endDate.getDate() + maxDay);
  state.trip.startDate = start;
  state.trip.endDate = toISO(endDate);
  if (!state.trip.title) state.trip.title = city;
  state.trip.city = city;
  state.excursions = plan.map(p => ({ id: uid(), ...p }));
  save(); render();
  alert(`Пример маршрута «${city}» загружен. Укажите стоимость экскурсий и добавьте траты в блоке «Смета».`);
}

/* ---------- Export / Import ---------- */
document.getElementById('btnExport').addEventListener('click', () => {
  const payload = { version: 4, exportedAt: new Date().toISOString(), plans: appData.plans, activeCity: appData.activeCity };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeCity = (appData.activeCity || 'trip').replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase().replace(/^-|-$/g, '');
  a.href = url; a.download = `${safeCity || 'trip'}-${toISO(new Date())}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

document.getElementById('btnImport').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files?.[0]; e.target.value = '';
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object') throw new Error('Неверный формат');
    if (parsed.plans && typeof parsed.plans === 'object') {
      if (!confirm('Импорт заменит все сохранённые планы. Продолжить?')) return;
      appData.plans = parsed.plans;
      Object.keys(appData.plans).forEach(k => normalizePlan(appData.plans[k]));
      appData.activeCity = parsed.activeCity && appData.plans[parsed.activeCity] ? parsed.activeCity : Object.keys(appData.plans)[0] || '';
    } else if (parsed.trip || parsed.excursions) {
      const city = parsed.trip?.city || parsed.trip?.title || 'Импорт';
      if (!confirm(`Импортировать как план для «${city}»?`)) return;
      appData.plans[city] = normalizePlan({
        trip: { title: parsed.trip?.title || city, city, startDate: parsed.trip?.startDate || '', endDate: parsed.trip?.endDate || '', budget: parsed.trip?.budget },
        excursions: parsed.excursions || [],
        expenses: parsed.expenses || [],
      });
      appData.activeCity = city;
    } else {
      throw new Error('Неизвестный формат');
    }
    state = appData.plans[appData.activeCity] || emptyPlan();
    save(); populateCatalog(); render();
    alert('Импорт выполнен.');
  } catch (err) { alert('Ошибка импорта: ' + err.message); }
});
