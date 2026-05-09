function addLog(type, msg) {
  const inner = document.getElementById('game-log-inner');
  if (!inner) return;
  logSeq++;
  const el = document.createElement('div');
  el.className = `log-entry ${type}`;
  el.innerHTML = `<span class="log-time">T${String(logSeq).padStart(3,'0')}</span>${msg}`;
  inner.appendChild(el);
  // Scroll container to bottom
  const log = document.getElementById('game-log');
  if (log) log.scrollTop = log.scrollHeight;
}
function clearLog() {
  logSeq = 0;
  const inner = document.getElementById('game-log-inner');
  if (inner) inner.innerHTML = '';
}

// ================================================================
// TIME SYSTEM
// ================================================================
function advanceTime() {
  const prevDay = Math.floor(G.gameTime / (24*60));
  G.gameTime += 6 * 60;
  const currDay = Math.floor(G.gameTime / (24*60));
  if (currDay > prevDay) {
    const days = currDay - prevDay;
    G.daysPassed += days;
    G.players.forEach(p => {
      if (!isPlayerIncapacitated(p)) {
        p.sanity = Math.max(0, p.sanity - 10 * days);
      }
    });
    addLog('danger', `24時間が経過した。全員の精神力-${10*days}！`);
    updateStatusBar();
  }
}

function getTimeDisplay() {
  const totalMins = G.gameTime % (24 * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function getTimePeriod() {
  const h = Math.floor((G.gameTime % (24*60)) / 60);
  if (h >= 5 && h < 12)  return '朝';
  if (h >= 12 && h < 18) return '昼';
  if (h >= 18 && h < 21) return '夕';
  return '夜';
}

function hasClock() {
  return G.bag.some(s => { const it=GAME_DATA.items[s.id]; return it&&it.isClock; }) ||
         G.players.some(p => { const w=p.equip.weapon; if(!w) return false; const it=GAME_DATA.items[w]; return it&&it.isClock; });
}

// ================================================================
// STATUS BAR
// ================================================================
function updateStatusBar() {
  const bar = document.getElementById('status-bar');
  bar.innerHTML = '';
  const lv = GAME_DATA.levels[G.currentLevel];
  if (lv && lv.isOutdoor) {
    const knowTime = hasClock();
    bar.innerHTML += `<div class="clock-widget">
      <div class="clock-label">TIME</div>
      <div class="clock-time">${knowTime ? getTimeDisplay() : '??:??'}</div>
      <div class="clock-period">${knowTime ? getTimePeriod() : '?'}</div>
    </div>`;
  }
  G.players.forEach((p, i) => {
    const isCurrent = (i === G.currentPlayerIdx) && G.turnMode === 'individual';
    const incap = isPlayerIncapacitated(p);
    const tags = [];
    if (p.hp <= 0) tags.push(`<span class="ps-tag hp0">HP0</span>`);
    else if (p.stamina <= 0) tags.push(`<span class="ps-tag st0">ST0</span>`);
    bar.innerHTML += `<div class="player-status-card ${isCurrent?'current-turn':''} ${incap?'incapacitated':''}">
      <div class="ps-name">${isCurrent?'<div class="ps-turn-dot"></div>':''}<span class="mono" style="font-size:10px">${p.name}</span></div>
      <div class="ps-job" style="color:${GAME_DATA.jobs[p.job].color}">${GAME_DATA.jobs[p.job].name}</div>
      ${tags.join('')}
      <div class="ps-bars">
        <div class="stat-bar-row"><div class="stat-label">HP</div><div class="stat-bar"><div class="stat-fill hp" style="width:${p.hp}%"></div></div><div class="stat-val">${p.hp}</div></div>
        <div class="stat-bar-row"><div class="stat-label">ST</div><div class="stat-bar"><div class="stat-fill stamina" style="width:${p.stamina}%"></div></div><div class="stat-val">${p.stamina}</div></div>
        <div class="stat-bar-row"><div class="stat-label">SN</div><div class="stat-bar"><div class="stat-fill sanity" style="width:${p.sanity}%"></div></div><div class="stat-val">${p.sanity}</div></div>
      </div>
    </div>`;
  });
}

function isPlayerIncapacitated(p) { return p.hp <= 0 || p.stamina <= 0; }
function isPlayerActionable(p)     { return p.hp > 0 && p.stamina > 0; }

// ================================================================
// LEVEL UI
// ================================================================
function updateLevelUI() {
  const lv = GAME_DATA.levels[G.currentLevel];
  document.getElementById('sb-level').textContent = lv.name;
  document.getElementById('sb-levelname').textContent = lv.subtitle;
  document.getElementById('sb-leveldesc').textContent = lv.desc;
  document.getElementById('game-screen').className = 'screen active ' + lv.bgClass;
  Audio.startBgm('level' + G.currentLevel);
}

function buildChangelog() {
  const cont = document.getElementById('changelog-content');
  if (!cont) return;
  cont.innerHTML = '';
  GAME_DATA.changelog.forEach((entry, i) => {
    const open = i === 0;
    cont.innerHTML += `<div class="cl-entry ${open?'open':''}" id="cl-${i}">
      <div class="cl-header" onclick="toggleCl(${i})">
        <div class="cl-header-left">
          <span class="cl-ver">${entry.version}</span>
          <span class="cl-date">${entry.date}</span>
        </div>
        <span class="cl-arrow">▶</span>
      </div>
      <div class="cl-body">${entry.notes.map(n=>`<div class="cl-note">${n}</div>`).join('')}</div>
    </div>`;
  });
}
function toggleCl(i) { const el=document.getElementById(`cl-${i}`); if(el) el.classList.toggle('open'); }

// ================================================================
// LEVEL LIST
// ================================================================
function buildLevelList() {
  const cont = document.getElementById('levellist-content');
  if (!cont) return;
  cont.innerHTML = '';
  Object.values(GAME_DATA.levels).forEach(lv => {
    cont.innerHTML += `<div class="level-list-item">
      <div class="lli-num">${lv.name.replace('Level ','L')}</div>
      <div><div class="lli-name">${lv.name}</div><div class="lli-sub">"${lv.subtitle}"</div><div class="lli-desc">${lv.desc}</div></div>
    </div>`;
  });
}