function loadTrophies() {
  try { G.trophies = JSON.parse(localStorage.getItem('backrooms-trophies')||'{}'); } catch(e){ G.trophies={}; }
}
function saveTrophies() { localStorage.setItem('backrooms-trophies', JSON.stringify(G.trophies)); }
function unlockTrophy(id) {
  if (G.trophies[id]) return;
  G.trophies[id] = true;
  saveTrophies();
  Audio.playSE('trophy');
  const t = GAME_DATA.trophies.find(t=>t.id===id);
  if (t) addLog('success', `🏆 トロフィー解除: 「${t.name}」— ${t.desc}`);
  buildTrophyGrid();
}
function buildTrophyGrid() {
  const grid = document.getElementById('trophy-grid');
  if (!grid) return;
  grid.innerHTML = '';
  GAME_DATA.trophies.forEach(t => {
    grid.innerHTML += `<div class="trophy-card ${G.trophies[t.id]?'unlocked':''}"><div class="trophy-icon">${t.icon}</div><div class="trophy-name">${t.name}</div><div class="trophy-desc">${t.desc}</div></div>`;
  });
}