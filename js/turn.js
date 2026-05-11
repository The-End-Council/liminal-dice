function getLevelActionContext(levelId) {
  const lv = GAME_DATA.levels[levelId];
  if (!lv.zones) {
    return {
      zoneId: null,
      zoneName: null,
      diceMax: lv.diceMax,
      actions: lv.actions
    };
  }

  if (!G.currentZone || !lv.zones[G.currentZone]) G.currentZone = 'normal';
  const zone = lv.zones[G.currentZone] || lv.zones.normal;
  return {
    zoneId: G.currentZone,
    zoneName: zone.name || G.currentZone,
    diceMax: zone.diceMax || lv.diceMax,
    actions: zone.actions || lv.actions
  };
}

function getShuffledActions(levelId) {
  const ctx = getLevelActionContext(levelId);
  const zoneKey = ctx.zoneId || 'base';
  const key = `${levelId}_${zoneKey}_${G.turnCount}`;
  if (G.shuffledActions[key]) return G.shuffledActions[key];
  const arr = [...ctx.actions];
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

  const staminaOut = G.players.filter(p => p.stamina <= 0 && p.hp > 0);
  if (staminaOut.length > 0) {
    promptStaminaRecovery(staminaOut, () => {
      if (G.players.filter(isPlayerActionable).length === 0) { gameOver('全員が行動不能となった'); return; }
      continueTurnStart();
    });
    return;
  }

  const actionable = G.players.filter(isPlayerActionable);
  if (actionable.length === 0) {
    gameOver('全員が倒れた');
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
  // スタミナ不足通知はターン開始時のみ実施する
  callback();
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
        const recoverMult = (typeof getItemRecoveryMultiplier === 'function') ? getItemRecoveryMultiplier() : 1.0;
        const staminaPerUse = it.effects && it.effects.stamina ? Math.round(it.effects.stamina * recoverMult) : 0;
        const qtyId = `srq-${pidx}-${slot.id}`;
        const qtyKey = `${pidx}_${slot.id}`;
        const initialQty = _srQty[qtyKey] || 1;
        itemBtns += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-size:12px">${it.icon} ${it.name} (×${slot.qty}) +${staminaPerUse}ST</span>
          <div class="stamina-qty-row">
            <button class="stamina-qty-btn" onclick="changeSRQty('${pidx}','${slot.id}',-1)">-</button>
            <div class="stamina-qty-val" id="${qtyId}">${initialQty}</div>
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
  const recoverMult = (typeof getItemRecoveryMultiplier === 'function') ? getItemRecoveryMultiplier() : 1.0;
  const hpPerUse = it.effects && it.effects.hp ? Math.round(it.effects.hp * recoverMult) : 0;
  const staminaPerUse = it.effects && it.effects.stamina ? Math.round(it.effects.stamina * recoverMult) : 0;
  const prev = p.stamina;
  for (let q=0; q<qty; q++) {
    if (staminaPerUse > 0) p.stamina = Math.min(p.maxStamina, p.stamina + staminaPerUse);
    if (hpPerUse > 0)      p.hp      = Math.min(p.maxHp, p.hp + hpPerUse);
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
  const ctx = getLevelActionContext(G.currentLevel);
  const zoneSuffix = ctx.zoneName ? ` [${ctx.zoneName}]` : '';
  setDiceUI({
    prompt:`${p.name} のターン${zoneSuffix} — ダイスを振れ (1-${ctx.diceMax})`,
    diceMax:ctx.diceMax,
    label:`D${ctx.diceMax}`
  });
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
  const ctx = getLevelActionContext(G.currentLevel);
  const zoneSuffix = ctx.zoneName ? ` [${ctx.zoneName}]` : '';
  setDiceUI({
    prompt:`団体行動${zoneSuffix} — ダイスを振れ (1-${ctx.diceMax})`,
    diceMax:ctx.diceMax,
    label:`D${ctx.diceMax}`
  });
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

function getInvestigatorRollContext() {
  const lv = GAME_DATA.levels[G.currentLevel];
  const zoneKey = (lv && lv.zones) ? (G.currentZone || 'normal') : 'base';

  if (G.turnMode === 'group') {
    const investigatorIdxs = G.players
      .map((p, idx) => ({ p, idx }))
      .filter(x => x.p.job === 'investigator')
      .map(x => x.idx);
    if (investigatorIdxs.length === 0) return { canInspect: false, readKeys: [], writeKeys: [] };
    const keys = investigatorIdxs.map(idx => `${idx}@${zoneKey}`);
    // 旧データ互換: 以前の団体キーも判定には含める
    const legacyGroupKey = `group@${zoneKey}`;
    return { canInspect: true, readKeys: [...keys, legacyGroupKey], writeKeys: keys };
  }
  const currentPlayer = G.players[G.currentPlayerIdx];
  if (currentPlayer && currentPlayer.job === 'investigator') {
    const key = `${G.currentPlayerIdx}@${zoneKey}`;
    return { canInspect: true, readKeys: [key], writeKeys: [key] };
  }
  return { canInspect: false, readKeys: [], writeKeys: [] };
}

function handleRollResult(roll) {
  const action = getActionForRoll(G.currentLevel, roll);
  if (!action) return;

  const inv = getInvestigatorRollContext();
  const canInspect = inv.canInspect;
  const hasNote = G.bag.find(s => s.id === 'investigationNote');

  // Check roll history key (個別/団体で共通の調査員履歴を参照)
  let alreadyUsed = false;
  if (canInspect) {
    alreadyUsed = inv.readKeys.some(key => {
      const myRolls = G.investigatorRolls[key] || [];
      return myRolls.includes(roll);
    });
  }

  if (canInspect && hasNote && alreadyUsed) {
    const hiddenInfo = action.hidden ? ` <span class="text-muted" style="font-size:11px">[${action.hidden}]</span>` : '';
    document.getElementById('dice-result').innerHTML =
      `<span class="text-yellow">目 ${roll}: ${action.label}</span>${hiddenInfo} <span class="text-muted">[調査ノート: 過去に出た目 — 振り直し可能]</span>`;
    document.getElementById('dice-buttons').innerHTML = `
      <button class="roll-btn" onclick="doRoll()">振り直す</button>
      <button class="confirm-btn" onclick="confirmAction(${roll})">そのまま実行</button>`;
    return;
  }

  // Record roll history for investigator ability scope
  if (canInspect) {
    inv.writeKeys.forEach(key => {
      if (!G.investigatorRolls[key]) G.investigatorRolls[key] = [];
      if (!G.investigatorRolls[key].includes(roll)) G.investigatorRolls[key].push(roll);
    });
  }

  let labelHtml = `目 <span class="text-yellow">${roll}</span>: ${action.label}`;
  if (canInspect && action.hidden) labelHtml += ` <span class="text-muted" style="font-size:11px">[${action.hidden}]</span>`;
  document.getElementById('dice-result').innerHTML = labelHtml;

  if (action.event === 'levelMove' || action.event === 'zoneMove') {
    let btns = `<button class="roll-btn" onclick="confirmAction(${roll})">確定</button>`;
    if (canInspect) btns += `<button class="confirm-btn" onclick="cancelLevelMove()">移動キャンセル</button>`;
    document.getElementById('dice-buttons').innerHTML = btns;
  } else {
    document.getElementById('dice-buttons').innerHTML = `<button class="roll-btn" onclick="confirmAction(${roll})">確定</button>`;
  }
}

function cancelLevelMove() {
  addLog('system', '階層調査員の能力で移動イベントをキャンセルした。');
  document.getElementById('dice-result').textContent = '';
  document.getElementById('dice-buttons').innerHTML = `<button class="roll-btn" onclick="doRoll()">ダイスを振り直す</button>`;
}

function confirmAction(roll) {
  Audio.playSE('confirm');
  const action = getActionForRoll(G.currentLevel, roll);
  processAction(action);
}

function getActionTargets() {
  if (G.turnMode === 'group') return G.players.filter(isPlayerActionable);
  const p = G.players[G.currentPlayerIdx];
  return (p && isPlayerActionable(p)) ? [p] : [];
}

function applyActionEffects(action) {
  if (!action.effects) return;
  const targets = getActionTargets();
  targets.forEach(p => {
    const changes = [];

    const hpDelta = action.effects.hp || 0;
    if (hpDelta !== 0) {
      const before = p.hp;
      p.hp = Math.max(0, Math.min(p.maxHp, p.hp + hpDelta));
      const actual = p.hp - before;
      if (actual !== 0) changes.push(`体力${actual > 0 ? '+' : ''}${actual}`);
    }

    const staminaDelta = action.effects.stamina || 0;
    if (staminaDelta !== 0) {
      const before = p.stamina;
      p.stamina = Math.max(0, Math.min(p.maxStamina, p.stamina + staminaDelta));
      const actual = p.stamina - before;
      if (actual !== 0) changes.push(`スタミナ${actual > 0 ? '+' : ''}${actual}`);
    }

    const sanityDelta = action.effects.sanity || 0;
    if (sanityDelta !== 0) {
      const before = p.sanity;
      p.sanity = Math.max(0, Math.min(p.maxSanity, p.sanity + sanityDelta));
      const actual = p.sanity - before;
      if (actual !== 0) changes.push(`精神力${actual > 0 ? '+' : ''}${actual}`);
    }

    if (changes.length > 0) {
      const hasMinus = changes.some(t => t.includes('-'));
      addLog(hasMinus ? 'danger' : 'item', `${p.name}：${changes.join(' / ')}`);
    }
  });
  updateStatusBar();
}

function moveToZone(nextZone, msg) {
  const lv = GAME_DATA.levels[G.currentLevel];
  if (!lv || !lv.zones || !lv.zones[nextZone]) return;
  G.currentZone = nextZone;
  G.shuffledActions = {};
  if (msg) {
    addLog('level', `▼ ${msg}`);
  } else {
    addLog('level', `▼ ${lv.zones[nextZone].name}へ移動した。`);
  }
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
      addLog('explore', action.log || '探索した... 何も見つからなかった。');
      afterIndividualAction();
      break;
    case 'item': {
      const it = GAME_DATA.items[action.reward];
      if (action.log) addLog('explore', action.log);
      const picked = addToBag(action.reward);
      if (picked) {
        Audio.playSE('item');
        addLog('item', `🎁 「${it.name}」を発見した！`);
      }
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
    case 'effect': {
      if (action.log) addLog('info', action.log);
      applyActionEffects(action);
      if (action.nextZone) moveToZone(action.nextZone);
      afterIndividualAction();
      break;
    }
    case 'zoneMove': {
      moveToZone(action.nextZone, action.log);
      afterIndividualAction();
      break;
    }
    default:
      addLog('explore', '何も起きなかった。');
      afterIndividualAction();
      break;
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
        if (r && r.type === 'ADD_ITEM') {
          const added = addToBag(r.item);
          if (added) addLog('item', `✨ ${r.msg}`);
          updateBagMini();
        }
      }
    }
    G.currentPlayerIdx++;
    beginNextPlayerRoll();
  } else {
    triggerGroupPassives(() => { endTurn(); });
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
      if (r && r.type === 'ADD_ITEM') {
        const added = addToBag(r.item);
        if (added) addLog('item', `✨ ${r.msg}`);
        updateBagMini();
      }
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
      if (r && r.type === 'ADD_ITEM') {
        const added = addToBag(r.item);
        if (added) addLog('item', `✨ ${r.msg}`);
        updateBagMini();
      }
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
  G.currentZone = 'normal';
  G.shuffledActions = {};
  // Reset investigator rolls on level change
  G.investigatorRolls = {};
  updateLevelUI();
  updateStatusBar();
  if (nl >= 1) unlockTrophy('survivor');
  if (nl === 1) unlockTrophy('descend');
  addLog('level', `== ${GAME_DATA.levels[nl].name} "${GAME_DATA.levels[nl].subtitle}" に到着した ==`);
  addLog('info', GAME_DATA.levels[nl].desc);
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
