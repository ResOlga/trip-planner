/* ============================================================
 budget.js - модальное окно сметы и дополнительных трат
 ============================================================ */
'use strict';

function openBudgetModal() {
  if (!state) { alert('Сначала введите город и даты.'); return; }
  budgetTotalInput.value = state.trip.budget.total || '';
  budgetCurrency.value = state.trip.budget.currency || '₽';
  renderBudgetModalSummary();
  renderExpensesList();
  budgetOverlay.hidden = false;
  setTimeout(() => budgetTotalInput.focus(), 50);
}
function closeBudgetModal() { budgetOverlay.hidden = true; }

function renderBudgetModalSummary() {
  const t = calcTotals(state);
  document.getElementById('bmTotal').textContent = t.total > 0 ? formatMoney(t.total, t.currency) : '—';
  document.getElementById('bmSpent').textContent = formatMoney(t.spent, t.currency);
  const rem = document.getElementById('bmRemaining');
  if (t.total > 0) {
    rem.textContent = formatMoney(t.remaining, t.currency);
    rem.className = 'value ' + (t.remaining >= 0 ? 'pos' : 'neg');
  } else {
    rem.textContent = '—';
    rem.className = 'value';
  }

  const cats = {};
  if (t.excursionTotal > 0) cats['Экскурсии'] = t.excursionTotal;
  (state.expenses || []).forEach(e => {
    const c = Number(e.cost) || 0;
    if (c > 0) cats[e.category] = (cats[e.category] || 0) + c;
  });

  const bd = document.getElementById('breakdownList');
  const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    bd.innerHTML = '<div class="breakdown-empty">Трат пока нет. Укажите стоимость экскурсий или добавьте прочие траты ниже.</div>';
  } else {
    const max = Math.max(...entries.map(([, v]) => v));
    bd.innerHTML = entries.map(([name, cost]) => `
      <div class="breakdown-item">
        <span>${escapeHTML(name)}</span>
        <strong>${formatMoney(cost, t.currency)}</strong>
        <div class="bar-wrap"><div class="bar" style="width:${(cost / max * 100).toFixed(1)}%"></div></div>
      </div>`).join('');
  }
}

function renderExpensesList() {
  if (!state.expenses || state.expenses.length === 0) {
    expensesList.innerHTML = '<div class="expense-empty">Прочих трат нет. Добавьте проживание, транспорт, питание и т.д.</div>';
    return;
  }
  expensesList.innerHTML = state.expenses.map(e => `
    <div class="expense-row" data-id="${e.id}">
      <input type="text" data-field="title" value="${escapeHTML(e.title)}" placeholder="Название">
      <select data-field="category">
        ${EXPENSE_CATEGORIES.map(c => `<option${c === e.category ? ' selected' : ''}>${c}</option>`).join('')}
      </select>
      <input type="number" data-field="cost" value="${e.cost || ''}" min="0" step="1" placeholder="0">
      <button class="icon-btn" data-action="delete-expense" data-id="${e.id}" title="Удалить">🗑️</button>
    </div>`).join('');
}

document.getElementById('btnOpenBudget').addEventListener('click', openBudgetModal);
document.getElementById('btnBudget').addEventListener('click', openBudgetModal);
document.getElementById('btnCloseBudget').addEventListener('click', closeBudgetModal);
budgetOverlay.addEventListener('click', (e) => { if (e.target === budgetOverlay) closeBudgetModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !budgetOverlay.hidden) closeBudgetModal(); });

budgetTotalInput.addEventListener('input', () => {
  state.trip.budget.total = Math.max(0, Number(budgetTotalInput.value) || 0);
  save(); renderBudgetCard(); renderBudgetModalSummary();
});
budgetCurrency.addEventListener('change', () => {
  state.trip.budget.currency = budgetCurrency.value;
  save(); renderBudgetCard(); renderBudgetModalSummary(); render();
});

expensesList.addEventListener('change', (e) => {
  const row = e.target.closest('.expense-row');
  if (!row) return;
  const exp = state.expenses.find(x => x.id === row.dataset.id);
  if (!exp) return;
  const field = e.target.dataset.field;
  if (field === 'cost') exp.cost = Math.max(0, Number(e.target.value) || 0);
  else if (field === 'category') exp.category = e.target.value;
  else if (field === 'title') exp.title = e.target.value;
  save(); renderBudgetCard(); renderBudgetModalSummary(); render();
});

expensesList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="delete-expense"]');
  if (!btn) return;
  if (!confirm('Удалить этот расход?')) return;
  state.expenses = state.expenses.filter(x => x.id !== btn.dataset.id);
  save(); renderBudgetCard(); renderExpensesList(); renderBudgetModalSummary(); render();
});

document.getElementById('btnAddExpense').addEventListener('click', () => {
  const title = newExpenseTitle.value.trim();
  const cost = Math.max(0, Number(newExpenseCost.value) || 0);
  if (!title && cost === 0) { alert('Введите название или сумму.'); return; }
  state.expenses.push({
    id: uid(),
    title: title || newExpenseCategory.value,
    category: newExpenseCategory.value,
    cost,
  });
  newExpenseTitle.value = ''; newExpenseCost.value = '';
  save(); renderBudgetCard(); renderExpensesList(); renderBudgetModalSummary(); render();
});
