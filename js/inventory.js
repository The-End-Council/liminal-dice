function addToBag(itemId) {
  const ex = G.bag.find(s => s.id === itemId);
  if (ex) { ex.qty++; return; }
  if (G.bag.length >= G.bagMax) { addLog('danger', 'バッグがいっぱい！アイテムを取得できなかった。'); return; }
  G.bag.push({ id: itemId, qty: 1 });
}

function removeFromBag(itemId, qty=1) {
  const slot = G.bag.find(s => s.id === itemId);
  if (!slot) return;
  slot.qty -= qty;
  if (slot.qty <= 0) G.bag.splice(G.bag.indexOf(slot), 1);
}

function updateBagMini() {
  const mini = document.getElementById('bag-mini');
  const countEl = document.getElementById('bag-count');
  if (!mini) return;
  mini.innerHTML = '';
  const slots = [...G.bag];
  for (let i=slots.length; i<G.bagMax; i++) slots.push(null);
  slots.slice(0,12).forEach(s => {
    if (s) {
      const it = GAME_DATA.items[s.id];
      mini.innerHTML += `<div class="bag-slot" title="${it.name}" onclick="openBag()">${it.icon}<span class="item-qty">${s.qty>1?s.qty:''}</span></div>`;
    } else {
      mini.innerHTML += `<div class="bag-slot empty">·</div>`;
    }
  });
  if (countEl) countEl.textContent = `${G.bag.length}/${G.bagMax}`;
}
function openBag() {
  G.selectedBagItem = null;
  G.itemUseQty = 1;
  G.discardQty = 1;
  const grid = document.getElementById('bag-modal-grid');
  grid.innerHTML = '';
  document.getElementById('item-detail').classList.remove('visible');
  if (G.bag.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:13px;grid-column:1/-1">バッグは空です。</p>';
  } else {
    G.bag.forEach((slot, idx) => {
      const it = GAME_DATA.items[slot.id];
      grid.innerHTML += `<div class="bag-item-card" id="bag-card-${idx}" onclick="selectBagItem(${idx})">
        <div class="item-icon">${it.icon}</div>
        <div class="item-name">${it.name}</div>
        <div class="item-qty">×${slot.qty}</div>
      </div>`;
    });
  }
  showModal('bag-modal');
}

function selectBagItem(idx) {
  G.selectedBagItem = idx;
  G.itemUseQty = 1;
  G.discardQty = 1;
  document.querySelectorAll('.bag-item-card').forEach(c => c.classList.remove('selected-item'));
  const card = document.getElementById(`bag-card-${idx}`);
  if (card) card.classList.add('selected-item');
  const slot = G.bag[idx];
  if (!slot) return;
  const it = GAME_DATA.items[slot.id];
  document.getElementById('item-detail').classList.add('visible');
  document.getElementById('item-detail-name').textContent = `${it.icon} ${it.name}`;
  document.getElementById('item-detail-desc').textContent = it.desc;

  // Hide discard confirm
  document.getElementById('discard-confirm').classList.remove('visible');
  document.getElementById('discard-qty-val').textContent = 1;

  // Determine if item is usable (has effects)
  const isUsable = !!(it.effects && Object.keys(it.effects).length > 0);
  const usableSection = document.getElementById('item-usable-section');
  const useBtn = document.getElementById('item-use-btn');

  if (isUsable) {
    usableSection.style.display = 'block';
    // Qty
    document.getElementById('item-qty-val').textContent = 1;
    document.getElementById('item-qty-row').style.display = slot.qty > 1 ? 'flex' : 'none';
    // Target select
    const sel = document.getElementById('item-use-target');
    sel.innerHTML = '';
    G.players.forEach((p, i) => {
      const isHealItem = it.id === 'bandage' || it.id === 'medKit';
      const disabled = isHealItem && p.hp <= 0;
      sel.innerHTML += `<option value="${i}" ${disabled?'disabled':''}>${p.name} (HP:${p.hp} ST:${p.stamina} SN:${p.sanity})${disabled?' [HP0]':''}</option>`;
    });
    updateItemEffectPreview();
    useBtn.disabled = false;
  } else {
    usableSection.style.display = 'none';
    useBtn.disabled = true;
  }

  // Investigator note info
  const noteInfo = document.getElementById('investigator-note-info');
  if (it.id === 'investigationNote') {
    const investigators = G.players.filter(p => p.job === 'investigator');
    if (investigators.length > 0) {
      let lines = investigators.map(p => {
        const pidx = G.players.indexOf(p);
        const rolls = (G.investigatorRolls[String(pidx)] || []).sort((a,b)=>a-b);
        return `<div style="margin-bottom:4px"><span style="color:var(--yellow)">${p.name}</span>: 出した目 [${rolls.length > 0 ? rolls.join(', ') : 'なし'}]</div>`;
      }).join('');
      noteInfo.innerHTML = `<div style="margin-bottom:6px;color:var(--dim);font-size:10px;letter-spacing:0.15em">現在のLevelで出した目 (再振り可能)</div>${lines}`;
      noteInfo.style.display = 'block';
    } else {
      noteInfo.style.display = 'none';
    }
  } else {
    noteInfo.style.display = 'none';
  }
}

function updateItemEffectPreview() {
  if (G.selectedBagItem === null) return;
  const slot = G.bag[G.selectedBagItem];
  if (!slot) return;
  const it = GAME_DATA.items[slot.id];
  const qty = G.itemUseQty;
  const sel = document.getElementById('item-use-target');
  if (!sel) return;
  const targetIdx = parseInt(sel.value || '0');
  const p = G.players[targetIdx];
  if (!p || !it.effects) { document.getElementById('item-effect-preview').textContent = ''; return; }
  const mult = p.job === 'medic' ? 1.1 : 1.0;
  const lines = [];
  if (it.effects.hp)     lines.push(`HP: ${p.hp} → ${Math.min(p.maxHp, p.hp + Math.round(it.effects.hp*mult*qty))}`);
  if (it.effects.stamina) lines.push(`ST: ${p.stamina} → ${Math.min(p.maxStamina, p.stamina + Math.round(it.effects.stamina*mult*qty))}`);
  if (it.effects.sanity)  lines.push(`SN: ${p.sanity} → ${Math.min(p.maxSanity, p.sanity + Math.round(it.effects.sanity*mult*qty))}`);
  document.getElementById('item-effect-preview').textContent = lines.join('  /  ');
}

function changeItemQty(delta) {
  if (G.selectedBagItem === null) return;
  const slot = G.bag[G.selectedBagItem];
  if (!slot) return;
  G.itemUseQty = Math.max(1, Math.min(slot.qty, G.itemUseQty + delta));
  document.getElementById('item-qty-val').textContent = G.itemUseQty;
  updateItemEffectPreview();
}

function useSelectedItem() {
  if (G.selectedBagItem === null) return;
  const slot = G.bag[G.selectedBagItem];
  if (!slot) return;
  const it = GAME_DATA.items[slot.id];
  const targetIdx = parseInt(document.getElementById('item-use-target').value);
  const p = G.players[targetIdx];
  if (!p) return;
  if ((it.id === 'bandage' || it.id === 'medKit') && p.hp <= 0) { return; }
  const mult = p.job === 'medic' ? 1.1 : 1.0;
  const qty = G.itemUseQty;
  for (let q=0; q<qty; q++) {
    if (it.effects.hp)     p.hp     = Math.min(p.maxHp, p.hp + Math.round(it.effects.hp*mult));
    if (it.effects.stamina) p.stamina = Math.min(p.maxStamina, p.stamina + Math.round(it.effects.stamina*mult));
    if (it.effects.sanity)  p.sanity  = Math.min(p.maxSanity, p.sanity + Math.round(it.effects.sanity*mult));
  }
  removeFromBag(slot.id, qty);
  Audio.playSE('item');
  addLog('item', `${p.name} が「${it.name}」×${qty} を使用。${it.desc}`);
  updateStatusBar();
  updateBagMini();
  closeModal('bag-modal');
}

// Discard (inline confirm, no popup)
function showDiscardConfirm() {
  if (G.selectedBagItem === null) return;
  const slot = G.bag[G.selectedBagItem];
  if (!slot) return;
  const it = GAME_DATA.items[slot.id];
  G.discardQty = 1;
  document.getElementById('discard-qty-val').textContent = 1;
  document.getElementById('discard-confirm-text').textContent = `「${it.name}」×1 を捨てますか？`;
  document.getElementById('discard-confirm').classList.add('visible');
}

function changeDiscardQty(delta) {
  if (G.selectedBagItem === null) return;
  const slot = G.bag[G.selectedBagItem];
  if (!slot) return;
  const it = GAME_DATA.items[slot.id];
  G.discardQty = Math.max(1, Math.min(slot.qty, G.discardQty + delta));
  document.getElementById('discard-qty-val').textContent = G.discardQty;
  document.getElementById('discard-confirm-text').textContent = `「${it.name}」×${G.discardQty} を捨てますか？`;
}

function confirmDiscard() {
  if (G.selectedBagItem === null) return;
  const slot = G.bag[G.selectedBagItem];
  if (!slot) return;
  const it = GAME_DATA.items[slot.id];
  const qty = G.discardQty;
  removeFromBag(slot.id, qty);
  addLog('system', `「${it.name}」×${qty} を捨てた。`);
  updateBagMini();
  closeModal('bag-modal');
}

function cancelDiscard() {
  document.getElementById('discard-confirm').classList.remove('visible');
}

// ================================================================
// EQUIP MODAL
// ================================================================
function openEquip() {
  const cont = document.getElementById('equip-content');
  cont.innerHTML = '';
  G.players.forEach((p, pi) => {
    const weapons = G.bag.filter(s => { const it=GAME_DATA.items[s.id]; return it&&it.category==='weapon'&&it.attack; });
    let opts = `<option value="">なし</option>`;
    weapons.forEach(s => {
      const it = GAME_DATA.items[s.id];
      opts += `<option value="${s.id}" ${p.equip.weapon===s.id?'selected':''}>${it.icon} ${it.name} (攻撃+${it.attack})</option>`;
    });
    const equipped = p.equip.weapon;
    let unequipBtn = '';
    if (equipped) {
      unequipBtn = `<button class="equip-unequip-btn" onclick="unequipWeapon(${pi})">外す</button>`;
      if (!weapons.find(s=>s.id===equipped)) {
        const ew = GAME_DATA.items[equipped];
        opts = `<option value="">なし</option><option value="${equipped}" selected>${ew.icon} ${ew.name} (装備中)</option>`;
      }
    }
    const durInfo = (equipped && GAME_DATA.items[equipped] && GAME_DATA.items[equipped].maxDurability)
      ? ` <span style="font-size:10px;color:var(--muted)">耐久${p.equip.weaponDurability}/${GAME_DATA.items[equipped].maxDurability}</span>` : '';
    cont.innerHTML += `<div class="equip-row">
      <div class="equip-pname">${p.name}<br><span style="font-size:10px;color:${GAME_DATA.jobs[p.job].color}">${GAME_DATA.jobs[p.job].name}</span></div>
      <span class="equip-slot-label">武器</span>
      <select class="equip-select" onchange="equipWeapon(${pi}, this.value)">${opts}</select>
      ${durInfo}
      ${unequipBtn}
    </div>`;
  });
  showModal('equip-modal');
}

function equipWeapon(pi, wid) {
  const p = G.players[pi];
  if (p.equip.weapon && p.equip.weapon !== wid) {
    addToBag(p.equip.weapon);
    addLog('system', `${p.name}が「${GAME_DATA.items[p.equip.weapon].name}」を外してバッグに戻した。`);
  }
  if (wid) {
    removeFromBag(wid, 1);
    const it = GAME_DATA.items[wid];
    p.equip.weapon = wid;
    p.equip.weaponDurability = it.maxDurability || 0;
    addLog('system', `${p.name}が「${it.name}」を装備した。`);
  } else {
    p.equip.weapon = null; p.equip.weaponDurability = 0;
  }
  updateStatusBar(); updateBagMini(); openEquip();
}

function unequipWeapon(pi) {
  const p = G.players[pi];
  if (!p.equip.weapon) return;
  const wid = p.equip.weapon;
  addToBag(wid);
  addLog('system', `${p.name}が「${GAME_DATA.items[wid].name}」を外してバッグに戻した。`);
  p.equip.weapon = null; p.equip.weaponDurability = 0;
  updateStatusBar(); updateBagMini(); openEquip();
}