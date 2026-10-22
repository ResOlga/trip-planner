/* ============================================================
 excursion.js - модальное окно карточки экскурсии
 ============================================================ */
'use strict';

function openModal(id = null, presetDate = null) {
  const isEdit = Boolean(id);
  document.getElementById('modalTitle').textContent = isEdit ? 'Редактировать экскурсию' : 'Новая экскурсия';
  document.getElementById('btnDelete').hidden = !isEdit;

  const days = generateDays();
  if (days.length === 0) { alert('Сначала задайте город и даты поездки.'); return; }
  fieldDate.innerHTML = days.map((iso, i) => `<option value="${iso}">${formatDayOption(iso, i)}</option>`).join('');

  if (isEdit) {
    const exc = state.excursions.find(x => x.id === id);
    if (!exc) return;
    document.getElementById('fieldId').value = exc.id;
    document.getElementById('fieldTitle').value = exc.title || '';
    document.getElementById('fieldDate').value = exc.date || days[0];
    document.getElementById('fieldTime').value = exc.time || '';
    document.getElementById('fieldDuration').value = exc.duration || '';
    document.getElementById('fieldCategory').value = exc.category || 'Музей';
    document.getElementById('fieldPlace').value = exc.place || '';
    document.getElementById('fieldCost').value = exc.cost || '';
    document.getElementById('fieldStatus').value = exc.status || 'planned';
    document.getElementById('fieldLink').value = exc.link || '';
    document.getElementById('fieldNotes').value = exc.notes || '';
  } else {
    form.reset();
    document.getElementById('fieldId').value = '';
    document.getElementById('fieldStatus').value = 'planned';
    document.getElementById('fieldCategory').value = 'Музей';
    document.getElementById('fieldCost').value = '';
    fieldDate.value = (presetDate && days.includes(presetDate)) ? presetDate : days[0];
  }

  catalogSelect.value = '';
  overlay.hidden = false;
  setTimeout(() => document.getElementById('fieldTitle').focus(), 50);
}

function closeModal() { overlay.hidden = true; }

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('fieldId').value;
  const data = {
    title: document.getElementById('fieldTitle').value.trim(),
    date: document.getElementById('fieldDate').value,
    time: document.getElementById('fieldTime').value,
    duration: document.getElementById('fieldDuration').value.trim(),
    category: document.getElementById('fieldCategory').value,
    place: document.getElementById('fieldPlace').value.trim(),
    cost: Math.max(0, Number(document.getElementById('fieldCost').value) || 0),
    status: document.getElementById('fieldStatus').value,
    link: document.getElementById('fieldLink').value.trim(),
    notes: document.getElementById('fieldNotes').value.trim(),
  };
  if (!data.title || !data.date) return;
  if (id) {
    const idx = state.excursions.findIndex(x => x.id === id);
    if (idx >= 0) state.excursions[idx] = { ...state.excursions[idx], ...data };
  } else {
    state.excursions.push({ id: uid(), ...data });
  }
  save(); closeModal(); render();
});

document.getElementById('btnDelete').addEventListener('click', () => {
  const id = document.getElementById('fieldId').value;
  if (!id) return;
  if (!confirm('Удалить эту экскурсию?')) return;
  state.excursions = state.excursions.filter(x => x.id !== id);
  save(); closeModal(); render();
});

catalogSelect.addEventListener('change', () => {
  const item = getActiveCatalog().find(c => c.title === catalogSelect.value);
  if (!item) return;
  document.getElementById('fieldTitle').value = item.title;
  document.getElementById('fieldPlace').value = item.place || '';
  document.getElementById('fieldCategory').value = item.category || 'Другое';
  document.getElementById('fieldDuration').value = item.duration || '';
  if (item.notes) document.getElementById('fieldNotes').value = item.notes;
});

document.getElementById('btnCloseModal').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeModal(); });

daysContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id, date } = btn.dataset;
  if (action === 'add') openModal(null, date);
  else if (action === 'edit') openModal(id);
  else if (action === 'delete') deleteExcursion(id);
});

/* ---------- Drag & drop: перенос экскурсии между днями ---------- */
const DRAG_MIN_WIDTH = 640;
const dragState = { id: null, card: null, overEl: null };

function clearDropHighlight() {
  if (dragState.overEl) dragState.overEl.classList.remove('is-drop-target');
  dragState.overEl = null;
}

function resetDrag() {
  if (dragState.card) dragState.card.classList.remove('is-dragging');
  clearDropHighlight();
  dragState.id = null;
  dragState.card = null;
}

daysContainer.addEventListener('dragstart', (e) => {
  const handle = e.target.closest('.exc-handle');
  if (!handle) return;
  if (window.innerWidth <= DRAG_MIN_WIDTH) { e.preventDefault(); return; }
  const card = handle.closest('.excursion');
  if (!card) return;
  dragState.id = card.dataset.id;
  dragState.card = card;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragState.id);
  e.dataTransfer.setDragImage(card, 16, 16);
  card.classList.add('is-dragging');
});

daysContainer.addEventListener('dragover', (e) => {
  if (!dragState.id) return;
  const body = e.target.closest('.day-body');
  if (!body) { clearDropHighlight(); return; }
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (dragState.overEl !== body) {
    clearDropHighlight();
    body.classList.add('is-drop-target');
    dragState.overEl = body;
  }
});

daysContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  const body = e.target.closest('.day-body');
  const card = body ? body.closest('.day-card') : null;
  const targetDate = card ? card.dataset.date : '';
  const id = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || dragState.id;
  const exc = state.excursions.find(x => x.id === id);
  clearDropHighlight();
  if (!exc || !targetDate || exc.date === targetDate) { resetDrag(); return; }
  if (!generateDays().includes(targetDate)) { resetDrag(); return; }
  exc.date = targetDate;
  save();
  render();
  resetDrag();
});

daysContainer.addEventListener('dragend', resetDrag);

function deleteExcursion(id) {
  const exc = state.excursions.find(x => x.id === id);
  if (!exc) return;
  if (!confirm(`Удалить «${exc.title}»?`)) return;
  state.excursions = state.excursions.filter(x => x.id !== id);
  save(); render();
}
