/* ============================================================
 render.js - отрисовка списка дней, экскурсий и сметы
 ============================================================ */
'use strict';

function populateCitySuggestions() {
  const all = [...new Set([...Object.keys(CITY_PRESETS), ...Object.keys(appData.plans)])];
  document.getElementById('citySuggestions').innerHTML = all.map(c => `<option value="${escapeHTML(c)}">`).join('');
}

function getActiveCatalog() { return CITY_PRESETS[appData.activeCity]?.catalog || []; }

function populateCatalog() {
  const catalog = getActiveCatalog();
  const groups = {};
  catalog.forEach(c => { (groups[c.category] ||= []).push(c); });
  catalogSelect.innerHTML =
    `<option value="">${catalog.length ? '— выберите, чтобы заполнить поля —' : '— каталога нет, заполните вручную —'}</option>` +
    Object.entries(groups).map(([cat, items]) =>
      `<optgroup label="${escapeHTML(cat)}">` +
      items.map(i => `<option value="${escapeHTML(i.title)}">${escapeHTML(i.title)}</option>`).join('') +
      '</optgroup>'
    ).join('');
}

/* ---------- Render main ---------- */
function render() {
  const city = state.trip.city || appData.activeCity || '';
  const title = state.trip.title || city || 'Планировщик поездок';
  document.getElementById('tripTitle').textContent = title;

  const sub = document.getElementById('tripSubtitle');
  if (state.trip.startDate && state.trip.endDate) {
    const days = generateDays();
    sub.textContent = `${city ? city + ' · ' : ''}${formatShort(state.trip.startDate)} — ${formatShort(state.trip.endDate)} · ${days.length} ${plural(days.length, ['день','дня','дней'])}`;
  } else if (city) {
    sub.textContent = `${city} · укажите даты поездки`;
  } else {
    sub.textContent = 'Выберите город и даты поездки';
  }

  inputCity.value = city;
  inputTitle.value = state.trip.title || '';
  inputStart.value = state.trip.startDate || '';
  inputEnd.value = state.trip.endDate || '';

  const days = generateDays();
  if (days.length === 0) {
    daysContainer.innerHTML = '';
    emptyState.hidden = false;
    budgetCard.hidden = true;
    return;
  }
  emptyState.hidden = true;
  budgetCard.hidden = false;
  renderBudgetCard();
  daysContainer.innerHTML = days.map((iso, i) => renderDay(iso, i)).join('');
  populateCitySuggestions();
}

function renderDay(iso, index) {
  const items = state.excursions.filter(e => e.date === iso).sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  const body = items.length ? items.map(renderExcursion).join('') : '<div class="day-empty">На этот день пока ничего не запланировано</div>';
  const daySpent = items.filter(e => e.status !== 'cancelled').reduce((s, e) => s + (Number(e.cost) || 0), 0);
  const cur = state.trip.budget.currency || '₽';
  const meta = `${items.length} ${plural(items.length, ['экскурсия','экскурсии','экскурсий'])}${daySpent > 0 ? ' · ' + formatMoney(daySpent, cur) : ''}`;
  return `
    <div class="day-card" data-date="${iso}">
      <div class="day-header">
        <div>
          <div class="day-title">${formatDayHeader(iso, index)}</div>
          <div class="day-meta">${meta}</div>
        </div>
        <button class="btn btn-light" data-action="add" data-date="${iso}">+ Добавить</button>
      </div>
      <div class="day-body">${body}</div>
    </div>`;
}

function renderExcursion(exc) {
  const st = STATUS_LABELS[exc.status] || STATUS_LABELS.planned;
  const cur = state.trip.budget.currency || '₽';
  const cost = Number(exc.cost) || 0;
  const time = exc.time ? `<div class="exc-time">${escapeHTML(exc.time)}</div>` : '<div class="exc-time exc-time-empty">—</div>';
  const place = exc.place ? `<div class="exc-place">📍 ${escapeHTML(exc.place)}</div>` : '';
  const category = exc.category ? `<span class="chip">${escapeHTML(exc.category)}</span>` : '';
  const duration = exc.duration ? `<span class="chip chip-muted">⏱ ${escapeHTML(exc.duration)}</span>` : '';
  const costChip = cost > 0 ? `<span class="chip chip-cost">💰 ${formatMoney(cost, cur)}</span>` : '';
  const link = exc.link ? `<a class="exc-link" href="${escapeHTML(exc.link)}" target="_blank" rel="noopener">Ссылка ↗</a>` : '';
  const notes = exc.notes ? `<div class="exc-notes">${escapeHTML(exc.notes)}</div>` : '';
  return `
    <div class="excursion" data-id="${exc.id}">
      ${time}
      <div class="exc-main">
        <div class="exc-head">
          <div class="exc-title">${escapeHTML(exc.title)}</div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>
        ${place}
        <div class="exc-chips">${category}${duration}${costChip}${link}</div>
        ${notes}
      </div>
      <div class="exc-actions">
        <span class="exc-handle" draggable="true" title="Перетащить в другой день" aria-label="Перетащить в другой день">⠿</span>
        <button class="icon-btn" data-action="edit" data-id="${exc.id}" title="Редактировать">✏️</button>
        <button class="icon-btn" data-action="delete" data-id="${exc.id}" title="Удалить">🗑️</button>
      </div>
    </div>`;
}

/* ---------- Budget card ---------- */
function renderBudgetCard() {
  const t = calcTotals(state);
  document.getElementById('budgetSub').textContent =
    t.total > 0
      ? `${formatMoney(t.spent, t.currency)} из ${formatMoney(t.total, t.currency)}`
      : 'Смета не задана · нажмите «Открыть»';

  document.getElementById('bcTotal').textContent = t.total > 0 ? formatMoney(t.total, t.currency) : '—';
  document.getElementById('bcSpent').textContent = formatMoney(t.spent, t.currency);

  const rem = document.getElementById('bcRemaining');
  if (t.total > 0) {
    rem.textContent = formatMoney(t.remaining, t.currency);
    rem.className = 'value ' + (t.remaining >= 0 ? 'pos' : 'neg');
  } else {
    rem.textContent = '—';
    rem.className = 'value';
  }

  const bar = document.getElementById('bcBar');
  if (t.total > 0) {
    const pct = Math.min(100, (t.spent / t.total) * 100);
    bar.style.width = pct + '%';
    bar.className = 'budget-progress-bar' + (pct >= 100 ? ' over' : pct >= 80 ? ' warn' : '');
  } else {
    bar.style.width = '0';
    bar.className = 'budget-progress-bar';
  }
}
