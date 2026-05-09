function getSaveKey(slot) { return `backrooms-save-${slot}`; }

function saveGame(slot) {
  if (!G.players || G.players.length === 0) { addLog('danger', 'ゲームが開始されていません。'); return; }
  const data = {
    players: G.players, bag: G.bag, bagMax: G.bagMax,
    currentLevel: G.currentLevel, gameTime: G.gameTime,
    daysPassed: G.daysPassed, turnCount: G.turnCount,
    trophies: G.trophies, investigatorRolls: G.investigatorRolls,
    savedAt: Date.now()
  };
  localStorage.setItem(getSaveKey(slot), JSON.stringify(data));
  addLog('system', `💾 スロット${slot+1}にセーブした。`);
  buildSaveLoad();
  closeModal('saveload-modal');
}

function loadGame(slot) {
  const raw = localStorage.getItem(getSaveKey(slot));
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    // Inline confirm
    const btns = document.getElementById('saveload-content');
    // Use a simple flag approach
    if (!window._loadConfirm) {
      window._loadConfirm = slot;
      buildSaveLoad(); // will show confirm
      return;
    }
    delete window._loadConfirm;
    G = {
      players: data.players, bag: data.bag, bagMax: data.bagMax,
      currentLevel: data.currentLevel, gameTime: data.gameTime,
      daysPassed: data.daysPassed||0, turnCount: data.turnCount||0,
      trophies: data.trophies||{}, investigatorRolls: data.investigatorRolls||{},
      turnMode: null, currentPlayerIdx: 0, pendingLevelMove: null,
      entityState: null, selectedBagItem: null, discardQty:1, itemUseQty:1,
      shuffledActions:{}, pendingPassivePlayers:[], pendingStaminaCheck:null, staminaRecoveryQueue:[],
    };
    closeModal('saveload-modal');
    setScreen('game-screen');
    updateLevelUI(); updateStatusBar(); updateBagMini(); clearLog();
    addLog('system', `📂 スロット${slot+1}からロードした。`);
    addLog('level', `現在地: ${GAME_DATA.levels[G.currentLevel].name}`);
    beginTurn();
  } catch(e) { addLog('danger', 'セーブデータの読み込みに失敗した。'); }
}

function deleteSave(slot) {
  window._deleteConfirm = slot;
  buildSaveLoad();
}

function buildSaveLoad() {
  const cont = document.getElementById('saveload-content');
  if (!cont) return;
  cont.innerHTML = '';
  for (let i=0; i<SAVE_SLOTS; i++) {
    const raw = localStorage.getItem(getSaveKey(i));
    let info = 'データなし'; let hasSave = false;
    if (raw) {
      try {
        const d = JSON.parse(raw); hasSave = true;
        const lv = GAME_DATA.levels[d.currentLevel];
        const dt = new Date(d.savedAt);
        const pnames = d.players.map(p=>p.name).join('、');
        info = `${lv?lv.name:'?'} | T${d.turnCount||0} | ${pnames} | ${dt.toLocaleDateString('ja')} ${dt.toLocaleTimeString('ja',{hour:'2-digit',minute:'2-digit'})}`;
      } catch(e) { info = '破損データ'; }
    }
    const inGame = G.players && G.players.length > 0;
    const showLoadConfirm = window._loadConfirm === i;
    const showDeleteConfirm = window._deleteConfirm === i;
    let extra = '';
    if (showLoadConfirm) {
      extra = `<div style="margin-top:8px;padding:10px;background:rgba(212,184,74,0.08);border:1px solid var(--yellow);font-size:12px;color:var(--yellow)">
        ロードしますか？現在の進行状況は失われます。<br>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="save-btn2" onclick="window._loadConfirm=${i};loadGame(${i})">ロードする</button>
          <button class="save-btn2" onclick="delete window._loadConfirm;buildSaveLoad()">キャンセル</button>
        </div>
      </div>`;
    }
    if (showDeleteConfirm) {
      extra = `<div style="margin-top:8px;padding:10px;background:rgba(192,64,64,0.08);border:1px solid var(--red);font-size:12px;color:#e08080">
        本当に削除しますか？<br>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="save-btn2 danger" onclick="localStorage.removeItem(getSaveKey(${i}));delete window._deleteConfirm;buildSaveLoad()">削除する</button>
          <button class="save-btn2" onclick="delete window._deleteConfirm;buildSaveLoad()">キャンセル</button>
        </div>
      </div>`;
    }
    cont.innerHTML += `<div class="save-slot" style="flex-direction:column;align-items:flex-start">
      <div style="display:flex;align-items:center;gap:12px;width:100%">
        <div class="save-slot-info">
          <div class="save-slot-name">スロット ${i+1}</div>
          <div class="save-slot-meta">${info}</div>
        </div>
        <button class="save-btn2" onclick="saveGame(${i})" ${!inGame?'disabled':''}>保存</button>
        <button class="save-btn2" onclick="window._loadConfirm=${i};buildSaveLoad()" ${!hasSave?'disabled':''}>読込</button>
        <button class="save-btn2 danger" onclick="deleteSave(${i})" ${!hasSave?'disabled':''}>削除</button>
      </div>
      ${extra}
    </div>`;
  }
}