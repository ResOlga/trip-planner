/* ============================================================
 ai.js - настройки DeepSeek и чат с ИИ-помощником
 ============================================================ */
'use strict';

function openAiSettings() {
  aiKeyInput.value = aiSettings.apiKey;
  aiModelInput.value = aiSettings.model;
  aiBaseUrlInput.value = aiSettings.baseUrl;
  aiSettingsOverlay.hidden = false;
}
function closeAiSettings() { aiSettingsOverlay.hidden = true; }

document.getElementById('btnAiSettings').addEventListener('click', openAiSettings);
document.getElementById('btnCloseAiSettings').addEventListener('click', closeAiSettings);
document.getElementById('btnCancelAiSettings').addEventListener('click', closeAiSettings);
document.getElementById('btnClearAiSettings').addEventListener('click', () => {
  if (!confirm('Очистить сохранённый ключ и настройки?')) return;
  aiSettings = { apiKey: '', model: 'deepseek-flash', baseUrl: 'https://api.deepseek.com' };
  saveAiSettings(); openAiSettings();
});
document.getElementById('btnSaveAiSettings').addEventListener('click', () => {
  aiSettings.apiKey = aiKeyInput.value.trim();
  aiSettings.model = aiModelInput.value;
  aiSettings.baseUrl = aiBaseUrlInput.value.trim() || 'https://api.deepseek.com';
  saveAiSettings(); closeAiSettings();
});
aiSettingsOverlay.addEventListener('click', (e) => { if (e.target === aiSettingsOverlay) closeAiSettings(); });

let chatHistory = [];

function resetChat() {
  chatMessages.innerHTML = '';
  const hello = state?.trip?.city
    ? `Привет! Помогу спланировать поездку в «${state.trip.city}». Спросите что угодно про маршрут или бюджет.`
    : 'Привет! Введите город в параметрах, а я помогу составить маршрут.';
  addMessage('assistant', hello);
  chatHistory = [{ role: 'assistant', content: hello }];
}
function openAiChat() {
  aiChatOverlay.hidden = false;
  if (chatMessages.children.length === 0) resetChat();
  updateChatHint();
  setTimeout(() => chatInput.focus(), 50);
}
function closeAiChat() { aiChatOverlay.hidden = true; stopRecognition(); }

function updateChatHint() {
  if (!aiSettings.apiKey) chatHint.textContent = '⚠️ Укажите API-ключ DeepSeek в настройках (⚙️).';
  else chatHint.textContent = `Модель: ${aiSettings.model} · Город: ${state?.trip?.city || '(не выбран)'} · Голосовой ввод: Chrome/Edge.`;
}

document.getElementById('btnAiChat').addEventListener('click', openAiChat);
document.getElementById('btnCloseAiChat').addEventListener('click', closeAiChat);
aiChatOverlay.addEventListener('click', (e) => { if (e.target === aiChatOverlay) closeAiChat(); });

function addMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `msg msg-${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

function buildSystemPrompt() {
  const lines = ['Ты — помощник по планированию поездок.'];
  if (state?.trip?.city) lines.push(`Город поездки: ${state.trip.city}.`);
  if (state?.trip?.startDate && state.trip.endDate) lines.push(`Даты: ${state.trip.startDate} — ${state.trip.endDate}.`);
  if (state?.excursions?.length) lines.push(`В плане уже ${state.excursions.length} экскурсий.`);
  if (state?.trip?.budget?.total > 0) {
    const t = calcTotals(state);
    lines.push(`Бюджет: ${formatMoney(t.total, t.currency)}, потрачено ${formatMoney(t.spent, t.currency)}, осталось ${formatMoney(t.remaining, t.currency)}.`);
  }
  lines.push('Отвечай по-русски, кратко. Не выдумывай цены и часы работы — предупреди, если не уверен.');
  return lines.join(' ');
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  if (!aiSettings.apiKey) { addMessage('error', 'Сначала укажите API-ключ DeepSeek в настройках (⚙️).'); return; }
  addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });
  chatInput.value = ''; chatInput.style.height = 'auto';
  const placeholder = addMessage('assistant', 'Думаю…');
  placeholder.style.opacity = '0.6';
  try {
    const reply = await callDeepSeek();
    placeholder.textContent = reply;
    placeholder.style.opacity = '1';
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    placeholder.parentElement.className = 'msg msg-error';
    placeholder.textContent = `Ошибка: ${err.message}`;
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callDeepSeek() {
  const base = aiSettings.baseUrl.replace(/\/+$/, '');
  const url = `${base}/chat/completions`;
  const messages = [{ role: 'system', content: buildSystemPrompt() }, ...chatHistory.slice(-10)];
  const body = { model: aiSettings.model, messages, temperature: 0.7, max_tokens: 1200 };
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiSettings.apiKey}` },
      body: JSON.stringify(body),
    });
  } catch (e) { throw new Error('Не удалось отправить запрос (возможно, CORS). Укажите прокси в Base URL.'); }
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    if (response.status === 401) throw new Error('Неверный API-ключ (401).');
    if (response.status === 402) throw new Error('Недостаточно средств на балансе DeepSeek (402).');
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Пустой ответ от модели.');
  return content.trim();
}

document.getElementById('btnSendChat').addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } });
chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px'; });
