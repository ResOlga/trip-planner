/* ============================================================
 speech.js - голосовой ввод в чат
 ============================================================ */
'use strict';

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;
function initRecognition() {
  if (!SpeechRecognitionCtor) return null;
  const rec = new SpeechRecognitionCtor();
  rec.lang = 'ru-RU'; rec.continuous = false; rec.interimResults = false;
  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatInput.value = (chatInput.value + ' ' + transcript).trim();
    chatInput.dispatchEvent(new Event('input'));
  };
  rec.onerror = (event) => {
    if (event.error === 'not-allowed') chatHint.textContent = 'Доступ к микрофону запрещён.';
    else if (event.error === 'no-speech') chatHint.textContent = 'Речь не распознана.';
    else chatHint.textContent = 'Ошибка распознавания: ' + event.error;
  };
  rec.onend = () => { isRecording = false; micBtn.classList.remove('recording'); };
  return rec;
}
function startRecognition() {
  if (!SpeechRecognitionCtor) { chatHint.textContent = 'Голосовой ввод не поддерживается. Используйте Chrome или Edge.'; return; }
  if (!recognition) recognition = initRecognition();
  if (!recognition) return;
  try { recognition.start(); isRecording = true; micBtn.classList.add('recording'); chatHint.textContent = '🎤 Говорите…'; }
  catch (e) { chatHint.textContent = 'Не удалось запустить микрофон.'; }
}
function stopRecognition() {
  if (recognition && isRecording) { try { recognition.stop(); } catch (_) {} }
  isRecording = false; micBtn.classList.remove('recording');
}
micBtn.addEventListener('click', () => isRecording ? stopRecognition() : startRecognition());
