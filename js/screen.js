// SCREENS / MODALS
// ================================================================
function setScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function showHome()  { setScreen('home-screen'); Audio.startBgm('home'); }
function showSetup() { buildJobGrid(); buildPlayerAssignRows(setupState.count); setScreen('setup-screen'); }
function showModal(id)  { buildSaveLoad(); document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function confirmHome() {
  // inline confirm via dice area
  const btns = document.getElementById('dice-buttons');
  const prompt = document.getElementById('dice-prompt');
  const prev = { prompt: prompt.textContent, btns: btns.innerHTML };
  prompt.textContent = 'ホームへ戻りますか？進行状況は失われます。';
  btns.innerHTML = `<button class="roll-btn" style="background:var(--red);color:#fff" onclick="showHome()">戻る</button>
    <button class="confirm-btn" onclick="restoreDiceArea()" >キャンセル</button>`;
  G._prevDice = prev;
}
function restoreDiceArea() {
  if (!G._prevDice) return;
  document.getElementById('dice-prompt').textContent = G._prevDice.prompt;
  document.getElementById('dice-buttons').innerHTML = G._prevDice.btns;
  G._prevDice = null;
}