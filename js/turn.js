function getShuffledActions(levelId) {
  const key = `${levelId}_${G.turnCount}`;
  if (G.shuffledActions[key]) return G.shuffledActions[key];
  const lv = GAME_DATA.levels[levelId];
  const arr = [...lv.actions];
  for (let i=arr.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  const shuffled = arr.map((a,idx) => ({ ...a, roll: idx+1 }));
  G.shuffledActions[key] = shuffled;
  return shuffled;
}

function getActionForRoll(levelId, roll) {
  return getShuffledActions(levelId).find(a => a.roll === roll);
}
function beginTurn() {
  G.turnCount++;
  G.currentPlayerIdx = 0;
  G.pendingPassivePlayers = [];

  const actionable = G.players.filter(isPlayerActionable);
  if (actionable.length === 0) {
    const staminaOut = G.players.filter(p => p.stamina <= 0 && p.hp > 0);
    if (staminaOut.length > 0) {
      promptStaminaRecovery(staminaOut, () => {
        if (G.players.filter(isPlayerActionable).length === 0) { gameOver('全員が行動不能となった'); return; }
        continueTurnStart();
      });
    } else {
      gameOver('全員が倒れた');
    }
    return;
  }
  continueTurnStart();
}

function continueTurnStart() {
  if (G.players.length === 1) {
    G.turnMode = 'individual';
    addLog('system', `【個別行動】スタミナ-10`);
    applyStaminaCost('individual');
    checkStaminaAfterCost(() => { updateStatusBar(); beginNextPlayerRoll(); });
  } else {
    document.getElementById('turn-mode-desc').innerHTML =
      `プレイヤー人数: ${G.players.length}人<br>行動方式を選択してください。<br><span style="font-size:11px;color:var(--muted)">個別: スタミナ-10 / 各自ダイス<br>団体: スタミナ-5 / 全員共通ダイス</span>`;
    showModal('turnmode-modal');
  }
}

function selectTurnMode(mode) {
  closeModal('turnmode-modal');
  G.turnMode = mode;
  const cost = mode === 'individual' ? 10 : 5;
  addLog('system', `【${mode==='individual'?'個別':'団体'}行動】スタミナ-${cost}`);
  applyStaminaCost(mode);
  checkStaminaAfterCost(() => {
    updateStatusBar();
    if (mode === 'individual') beginNextPlayerRoll();
    else beginGroupRoll();
  });
}

function applyStaminaCost(mode) {
  const cost = mode === 'individual' ? 10 : 5;
  G.players.forEach(p => {
    if (p.hp > 0) {
      const prev = p.stamina;
      p.stamina = Math.max(0, p.stamina - cost);
      if (p.stamina === 0 && prev > 0) addLog('danger', `⚠ ${p.name}のスタミナが尽きた！`);
    }
  });
}

function checkStaminaAfterCost(callback) {
  const staminaOut = G.players.filter(p => p.stamina === 0 && p.hp > 0);
  const actionable = G.players.filter(isPlayerActionable);
  if (staminaOut.length > 0 && actionable.length === 0) {
    promptStaminaRecovery(staminaOut, () => {
      if (G.players.filter(isPlayerActionable).length === 0) { gameOver('全員のスタミナが尽きた'); return; }
      callback();
    });
  } else {
    callback();
  }
}

// ================================================================
// STAMINA RECOVERY — per-player, multiple item use
// ================================================================
function promptStaminaRecovery(players, onDone) {
  G.pendingStaminaCheck = onDone;
  G.staminaRecoveryQueue = players.map(p => G.players.indexOf(p));
  document.getElementById('stamina-modal-desc').innerHTML =
    `スタミナが0のプレイヤーが ${players.length}人 います。各プレイヤーのスタミナを回復してください。`;
  renderStaminaPlayers();
  showModal('stamina-modal');
}

function renderStaminaPlayers() {
  const cont = document.getElementById('stamina-modal-players');
  if (!cont) return;
  cont.innerHTML = '';
  G.staminaRecoveryQueue.forEach(pidx => {
    const p = G.players[pidx];
    if (!p) return;
    // Items with stamina effect
    const stItems = G.bag.filter(s => { const it=GAME_DATA.items[s.id]; return it&&it.effects&&it.effects.stamina; });
    let itemBtns = '';
    if (stItems.length === 0) {
      itemBtns = `<span style="font-size:11px;color:var(--muted)">スタミナ回復アイテムなし</span>`;
    } else {
      stItems.forEach(slot => {
        const it = GAME_DATA.items[slot.id];
        const qtyId = `srq-${pidx}-${slot.id}`;
        itemBtns += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-size:12px">${it.icon} ${it.name} (×${slot.qty}) +${it.effects.stamina}ST</span>
          <div class="stamina-qty-row">
            <button class="stamina-qty-btn" onclick="changeSRQty('${pidx}','${slot.id}',-1)">-</button>
            <div class="stamina-qty-val" id="${qtyId}">1</div>
            <button class="stamina-qty-btn" onclick="changeSRQty('${pidx}','${slot.id}',1)">+</button>
          </div>
          <button class="stamina-use-btn" onclick="useStaminaItem(${pidx},'${slot.id}')">使用</button>
        </div>`;
      });
    }
    cont.innerHTML += `<div class="stamina-player-block">
      <div class="stamina-player-name">${p.name} — ST:${p.stamina}/${p.maxStamina}</div>
      ${itemBtns}
    </div>`;
  });
}

// stamina recovery qty per player+item
function changeSRQty(pidx, itemId, delta) {
  const key = `${pidx}_${itemId}`;
  const slot = G.bag.find(s=>s.id===itemId);
  if (!slot) return;
  _srQty[key] = Math.max(1, Math.min(slot.qty, (_srQty[key]||1) + delta));
  const el = document.getElementById(`srq-${pidx}-${itemId}`);
  if (el) el.textContent = _srQty[key];
}

function useStaminaItem(pidx, itemId) {
  const key = `${pidx}_${itemId}`;
  const qty = _srQty[key] || 1;
  const slot = G.bag.find(s=>s.id===itemId);
  if (!slot || slot.qty < qty) return;
  const it = GAME_DATA.items[itemId];
  const p = G.players[pidx];
  if (!p) return;
  const prev = p.stamina;
  for (let q=0; q<qty; q++) {
    if (it.effects.stamina) p.stamina = Math.min(p.maxStamina, p.stamina + it.effects.stamina);
    if (it.effects.hp)     p.hp     = Math.min(p.maxHp, p.hp + it.effects.hp);
    if (it.effects.sanity) p.sanity = Math.min(p.maxSanity, p.sanity + it.effects.sanity);
  }
  removeFromBag(itemId, qty);
  delete _srQty[key];
  addLog('item', `💊 ${p.name}が「${it.name}」×${qty} を使用。ST:${prev}→${p.stamina}`);
  updateStatusBar();
  updateBagMini();
  renderStaminaPlayers();
}

function skipStaminaRecovery() {
  closeModal('stamina-modal');
  if (G.pendingStaminaCheck) { const cb = G.pendingStaminaCheck; G.pendingStaminaCheck = null; cb(); }
}

// ================================================================
// INDIVIDUAL ROLL FLOW
// ================================================================
function beginNextPlayerRoll() {
  let idx = G.currentPlayerIdx;
  while (idx < G.players.length && !isPlayerActionable(G.players[idx])) {
    addLog('info', `${G.players[idx].name} は行動不能のためスキップ`);
    idx++;
  }
  if (idx >= G.players.length) {
    onAllIndividualRollsDone();
    return;
  }
  G.currentPlayerIdx = idx;
  updateStatusBar();
  const p = G.players[idx];
  const lv = GAME_DATA.levels[G.currentLevel];
  setDiceUI({ prompt:`${p.name} のターン — ダイスを振れ (1-${lv.diceMax})`, diceMax:lv.diceMax, label:`D${lv.diceMax}` });
}

function onAllIndividualRollsDone() {
  processNextPassive(() => {
    if (G.pendingLevelMove !== null) finalizeLevelMove();
    else endTurn();
  });
}

// ================================================================
// GROUP ROLL FLOW
// ================================================================
function beginGroupRoll() {
  const lv = GAME_DATA.levels[G.currentLevel];
  setDiceUI({ prompt:`団体行動 — ダイスを振れ (1-${lv.diceMax})`, diceMax:lv.diceMax, label:`D${lv.diceMax}` });
}

// ================================================================
// DICE UI
// ================================================================

function setDiceUI(opts) {
  diceState.diceMax = opts.diceMax || 6;
  diceState.rolling = false;
  document.getElementById('dice-prompt').textContent = opts.prompt || '';
  document.getElementById('dice-display').innerHTML = `<div><div class="dice-face" id="dice-face">?</div><div class="dice-label">${opts.label||''}</div></div>`;
  document.getElementById('dice-result').textContent = '';
  document.getElementById('dice-buttons').innerHTML = `<button class="roll-btn" onclick="doRoll()">ダイスを振る</button>`;
}

function doRoll() {
  if (diceState.rolling) return;
  diceState.rolling = true;
  Audio.playSE('dice');
  const face = document.getElementById('dice-face');
  face.classList.add('rolling');
  const btn = document.querySelector('.roll-btn');
  if (btn) btn.disabled = true;
  let ticks = 0;
  const iv = setInterval(() => {
    face.textContent = Math.ceil(Math.random() * diceState.diceMax);
    if (++ticks > 12) {
      clearInterval(iv);
      face.classList.remove('rolling');
      const r = Math.ceil(Math.random() * diceState.diceMax);
      face.textContent = r;
      diceState.rolling = false;
      handleRollResult(r);
    }
  }, 55);
}

function handleRollResult(roll) {
  const action = getActionForRoll(G.currentLevel, roll);
  if (!action) return;

  const currentPlayer = G.players[G.currentPlayerIdx];
  const isInvestigator = currentPlayer && currentPlayer.job === 'investigator';
  const hasNote = G.bag.find(s => s.id === 'investigationNote');

  // Check if THIS investigator player has already rolled this number this level
  let alreadyUsed = false;
  if (isInvestigator) {
    const pKey = String(G.currentPlayerIdx);
    const myRolls = G.investigatorRolls[pKey] || [];
    alreadyUsed = myRolls.includes(roll);
  }

  if (isInvestigator && hasNote && alreadyUsed) {
    document.getElementById('dice-result').innerHTML =
      `<span class="text-yellow">目 ${roll}: ${action.label}</span> <span class="text-muted">[調査ノート: 過去に出た目 — 振り直し可能]</span>`;
    document.getElementById('dice-buttons').innerHTML = `
      <button class="roll-btn" onclick="doRoll()">振り直す</button>
      <button class="confirm-btn" onclick="confirmAction(${roll})">そのまま実行</button>`;
    return;
  }

  // Record roll for this investigator player
  if (isInvestigator) {
    const pKey = String(G.currentPlayerIdx);
    if (!G.investigatorRolls[pKey]) G.investigatorRolls[pKey] = [];
    if (!G.investigatorRolls[pKey].includes(roll)) G.investigatorRolls[pKey].push(roll);
  }

  let labelHtml = `目 <span class="text-yellow">${roll}</span>: ${action.label}`;
  if (isInvestigator) labelHtml += ` <span class="text-muted" style="font-size:11px">[${action.hidden}]</span>`;
  document.getElementById('dice-result').innerHTML = labelHtml;

  if (action.event === 'levelMove') {
    let btns = `<button class="roll-btn" onclick="confirmAction(${roll})">確定</button>`;
    if (isInvestigator) btns += `<button class="confirm-btn" onclick="cancelLevelMove()">移動キャンセル</button>`;
    document.getElementById('dice-buttons').innerHTML = btns;
  } else {
    document.getElementById('dice-buttons').innerHTML = `<button class="roll-btn" onclick="confirmAction(${roll})">確定</button>`;
  }
}

function cancelLevelMove() {
  addLog('system', '階層調査員の能力でLevel移動をキャンセルした。');
  document.getElementById('dice-result').textContent = '';
  document.getElementById('dice-buttons').innerHTML = `<button class="roll-btn" onclick="doRoll()">ダイスを振り直す</button>`;
}

function confirmAction(roll) {
  const action = getActionForRoll(G.currentLevel, roll);
  processAction(action);
}

// ================================================================
// ACTION PROCESSING
// ================================================================
function processAction(action) {
  document.getElementById('dice-buttons').innerHTML = '';
  document.getElementById('dice-result').textContent = '';
  unlockTrophy('firstExplore');

  switch (action.event) {
    case 'explore':
      addLog('explore', '探索した... 何も見つからなかった。');
      afterIndividualAction();
      break;
    case 'item': {
      const it = GAME_DATA.items[action.reward];
      addToBag(action.reward);
      Audio.playSE('item');
      addLog('item', `🎁 「${it.name}」を発見した！`);
      updateBagMini();
      afterIndividualAction();
      break;
    }
    case 'entity': {
      const ent = GAME_DATA.entities[action.entity];
      addLog('danger', `⚠ エンティティ「${ent.name}」に遭遇した！`);
      Audio.playSE('danger');
      unlockTrophy('firstEntity');
      startCombat(ent);
      break;
    }
    case 'levelMove': {
      const nl = action.nextLevel;
      if (GAME_DATA.levels[nl]) {
        Audio.playSE('levelMove');
        addLog('level', `▼ ${GAME_DATA.levels[nl].name} "${GAME_DATA.levels[nl].subtitle}" へ移動する...`);
        G.pendingLevelMove = nl;
        if (G.turnMode === 'individual') {
          G.currentPlayerIdx++;
          beginNextPlayerRoll();
        } else {
          finalizeLevelMove();
        }
      } else {
        addLog('level', `▼ 次のLevelはまだ存在しない...`);
        afterIndividualAction();
      }
      break;
    }
  }
}

function afterIndividualAction() {
  if (G.turnMode === 'individual') {
    // Only trigger passive for THIS player now
    const idx = G.currentPlayerIdx;
    const p = G.players[idx];
    if (p && isPlayerActionable(p)) {
      const job = GAME_DATA.jobs[p.job];
      if (job.passive) {
        const r = job.passive(G, p);
        if (r && r.type === 'ADD_ITEM') { addToBag(r.item); addLog('item', `✨ ${r.msg}`); updateBagMini(); }
      }
    }
    G.currentPlayerIdx++;
    beginNextPlayerRoll();
  } else {
    triggerGroupPassives(() => { advanceTime(); endTurn(); });
  }
}

// ================================================================
// PASSIVES
// ================================================================
function triggerGroupPassives(cb) {
  G.players.forEach(p => {
    if (!isPlayerActionable(p)) return;
    const job = GAME_DATA.jobs[p.job];
    if (job.passive) {
      const r = job.passive(G, p);
      if (r && r.type === 'ADD_ITEM') { addToBag(r.item); addLog('item', `✨ ${r.msg}`); updateBagMini(); }
    }
  });
  cb();
}

function processNextPassive(cb) {
  if (G.pendingPassivePlayers.length === 0) { cb(); return; }
  const idx = G.pendingPassivePlayers.shift();
  const p = G.players[idx];
  if (p && isPlayerActionable(p)) {
    const job = GAME_DATA.jobs[p.job];
    if (job.passive) {
      const r = job.passive(G, p);
      if (r && r.type === 'ADD_ITEM') { addToBag(r.item); addLog('item', `✨ ${r.msg}`); updateBagMini(); }
    }
  }
  processNextPassive(cb);
}

// ================================================================
// LEVEL MOVE
// ================================================================
function finalizeLevelMove() {
  const nl = G.pendingLevelMove;
  G.pendingLevelMove = null;
  clearLog();
  G.currentLevel = nl;
  G.shuffledActions = {};
  // Reset investigator rolls on level change
  G.investigatorRolls = {};
  updateLevelUI();
  updateStatusBar();
  if (nl >= 1) unlockTrophy('survivor');
  if (nl === 1) unlockTrophy('descend');
  addLog('level', `== ${GAME_DATA.levels[nl].name} "${GAME_DATA.levels[nl].subtitle}" に到着した ==`);
  addLog('info', GAME_DATA.levels[nl].desc);
  advanceTime();
  endTurn();
}

// ================================================================
// END TURN
// ================================================================
function endTurn() {
  advanceTime();
  updateStatusBar();
  updateBagMini();
  addLog('info', '─── ターン終了 ───');
  setTimeout(() => beginTurn(), 250);
}
