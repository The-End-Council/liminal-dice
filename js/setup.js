function buildJobGrid() {
  const grid = document.getElementById('job-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.values(GAME_DATA.jobs).forEach(job => {
    const names = (job.startItems||[]).reduce((a,id)=>{ const it=GAME_DATA.items[id]; if(it){a[it.name]=(a[it.name]||0)+1;} return a; },{});
    const tags = Object.entries(names).map(([n,q])=>`<span class="job-item-tag">${q>1?n+'×'+q:n}</span>`).join('');
    grid.innerHTML += `<div class="job-card" style="--job-color:${job.color}"><div class="job-name" style="color:${job.color}">${job.name}</div><div class="job-name-en">${job.nameEn}</div><div class="job-passive">${job.desc}</div><div class="job-items">${tags}</div></div>`;
  });
}

function selectCount(n) {
  setupState.count = n;
  document.querySelectorAll('.count-btn').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.count)===n));
  buildPlayerAssignRows(n);
}

function buildPlayerAssignRows(count) {
  const grid = document.getElementById('player-assign-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i=0; i<count; i++) {
    const p = setupState.players[i];
    const btns = Object.values(GAME_DATA.jobs).map(j =>
      `<button class="job-pick-btn ${p.job===j.id?'selected':''}" onclick="pickJob(${i},'${j.id}')">${j.name}</button>`
    ).join('');
    grid.innerHTML += `<div class="player-assign-row"><div class="player-number">${i+1}</div><input class="player-name-input" value="${p.name}" oninput="setupState.players[${i}].name=this.value||'Player ${i+1}'" placeholder="名前"><div class="player-job-select">${btns}</div></div>`;
  }
}

function pickJob(pi, jid) { setupState.players[pi].job = jid; buildPlayerAssignRows(setupState.count); }

// ================================================================
// START GAME
// ================================================================
function startGame() {
  G = {
    players: [],
    bag: [],
    bagMax: 12,
    currentLevel: 0,
    turnMode: null,
    currentPlayerIdx: 0,
    pendingLevelMove: null,
    investigatorRolls: {},
    trophies: G.trophies || {},
    entityState: null,
    selectedBagItem: null,
    discardQty: 1,
    itemUseQty: 1,
    gameTime: 6 * 60,
    daysPassed: 0,
    turnCount: 0,
    shuffledActions: {},
    pendingPassivePlayers: [],
    pendingStaminaCheck: null,
    staminaRecoveryQueue: [],
    _prevDice: null,
  };
  for (let i=0; i<setupState.count; i++) {
    const p = setupState.players[i];
    const job = GAME_DATA.jobs[p.job];
    G.players.push({ name:p.name, job:p.job, hp:100, maxHp:100, stamina:100, maxStamina:100, sanity:100, maxSanity:100, attack:1, equip:{weapon:null, weaponDurability:0}, alive:true });
    (job.startItems||[]).forEach(id => addToBag(id));
  }
  setScreen('game-screen');
  updateLevelUI();
  updateStatusBar();
  updateBagMini();
  clearLog();
  Audio.startBgm('level' + G.currentLevel);
  addLog('system', 'Backrooms へようこそ。脱出を目指せ。');
  addLog('level', `現在地: ${GAME_DATA.levels[0].name} — "${GAME_DATA.levels[0].subtitle}"`);
  addLog('info', GAME_DATA.levels[0].desc);
  beginTurn();
}