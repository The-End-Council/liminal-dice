function startCombat(entityData) {
  G.entityState = { entity:{ ...entityData }, hp:entityData.hp, maxHp:entityData.maxHp };
  document.getElementById('combat-entity-name').textContent = entityData.name;
  document.getElementById('combat-entity-name').style.color = entityData.color;
  const entityImg = document.getElementById('combat-entity-image');
  const entityImgWrap = document.getElementById('combat-entity-image-wrap');
  if (entityImg && entityImgWrap) {
    if (entityData.image) {
      entityImg.src = entityData.image;
      entityImg.alt = entityData.name;
      entityImgWrap.style.display = 'flex';
    } else {
      entityImg.removeAttribute('src');
      entityImg.alt = '';
      entityImgWrap.style.display = 'none';
    }
  }
  document.getElementById('combat-entity-desc').textContent = entityData.desc;
  document.getElementById('combat-hp-val').textContent = entityData.hp;
  document.getElementById('combat-hp-max').textContent = entityData.maxHp;
  document.getElementById('combat-hp-bar').style.width = '100%';
  document.getElementById('combat-log').textContent = `${entityData.name} が現れた！攻撃するか逃走するかを選べ。`;
  document.getElementById('combat-dice-display').innerHTML = '';
  resetCombatBtns();
  document.getElementById('combat-overlay').classList.add('active');
}

function resetCombatBtns() {
  document.getElementById('combat-btns').innerHTML = `
    <button class="combat-attack-btn" onclick="combatAction('attack')">⚔ 攻撃する</button>
    <button class="combat-flee-btn" onclick="combatAction('flee')">💨 逃走する</button>`;
}

function calcPlayerAttack(p) {
  let atk = p.attack;
  const wid = p.equip.weapon;
  if (wid) { const w=GAME_DATA.items[wid]; if(w&&w.attack) atk += w.attack; }
  if (p.job === 'hunter') atk = Math.round(atk * 1.10);
  return atk;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeFaceCounts(sides, a, b, fallbackA, fallbackB) {
  let aa = Number.isFinite(a) ? Math.max(0, Math.floor(a)) : fallbackA;
  let bb = Number.isFinite(b) ? Math.max(0, Math.floor(b)) : fallbackB;
  if (aa + bb !== sides) {
    aa = fallbackA;
    bb = fallbackB;
  }
  if (aa <= 0) { aa = sides - 1; bb = 1; }
  if (bb <= 0) { bb = sides - 1; aa = 1; }
  return { a: aa, b: bb };
}

function buildRandomFaceMap(sides, entries) {
  const faces = shuffleArray(Array.from({ length: sides }, (_, i) => i + 1));
  const map = {};
  let ptr = 0;
  entries.forEach(entry => {
    for (let i = 0; i < entry.count && ptr < faces.length; i++, ptr++) {
      map[faces[ptr]] = entry.type;
    }
  });
  while (ptr < faces.length) {
    map[faces[ptr]] = entries[entries.length - 1].type;
    ptr++;
  }
  return map;
}

function buildEntityAttackDice(entity) {
  const raw = (entity && entity.attackDice) ? entity.attackDice : {};
  const sides = Number.isFinite(raw.sides) ? Math.max(2, Math.floor(raw.sides)) : 6;
  const c = normalizeFaceCounts(sides, raw.attackFaces, raw.dodgeFaces, 4, 2);
  return {
    sides,
    faceMap: buildRandomFaceMap(sides, [
      { type: 'attack', count: c.a },
      { type: 'dodge', count: c.b }
    ])
  };
}

function buildEntityFleeDice(entity) {
  const raw = (entity && entity.fleeDice) ? entity.fleeDice : {};
  const sides = Number.isFinite(raw.sides) ? Math.max(2, Math.floor(raw.sides)) : 6;
  const c = normalizeFaceCounts(sides, raw.escapeFaces, raw.failFaces, 4, 2);
  return {
    sides,
    faceMap: buildRandomFaceMap(sides, [
      { type: 'escape', count: c.a },
      { type: 'fail', count: c.b }
    ])
  };
}

function rollEntityAttackDice() {
  const cs = G.entityState;
  if (!cs) return;
  const dice = buildEntityAttackDice(cs.entity);
  animateCombatDice(dice.sides, r => entityAttack(r, dice.faceMap[r]));
}

function rollEntityFleeDice() {
  const cs = G.entityState;
  if (!cs) return;
  const dice = buildEntityFleeDice(cs.entity);
  animateCombatDice(dice.sides, r => fleeAttempt(r, dice.faceMap[r]));
}

function combatAction(action) {
  const cs = G.entityState;
  if (!cs) return;
  document.getElementById('combat-btns').innerHTML = '';

  if (action === 'attack') {
    let totalAtk = 0;
    const attackers = [];
    if (G.turnMode === 'individual') {
      const p = G.players[G.currentPlayerIdx];
      if (p && p.hp > 0) { totalAtk = calcPlayerAttack(p); attackers.push(p); }
    } else {
      G.players.forEach(p => { if (p.hp > 0) { totalAtk += calcPlayerAttack(p); attackers.push(p); } });
    }

    attackers.forEach(p => {
      const wid = p.equip.weapon;
      if (!wid) return;
      const w = GAME_DATA.items[wid];
      if (w && w.needAmmo) {
        const bulletSlot = G.bag.find(s => s.id === 'bullet');
        if (bulletSlot && bulletSlot.qty > 0) {
          removeFromBag('bullet', 1);
          addLog('combat', `${p.name}がハンドガンを発射！弾丸消費（残${G.bag.find(s=>s.id==='bullet')?.qty||0}個）`);
        } else {
          addLog('danger', `${p.name}のハンドガンに弾丸がない！素手で攻撃`);
          totalAtk -= w.attack;
        }
        updateBagMini();
      }
      if (w && w.maxDurability) {
        p.equip.weaponDurability = p.equip.weaponDurability || w.maxDurability;
        p.equip.weaponDurability--;
        addLog('combat', `${p.name}のナイフ耐久-1（残${p.equip.weaponDurability}）`);
        if (p.equip.weaponDurability <= 0) {
          addLog('danger', `${p.name}のナイフが壊れた！`);
          p.equip.weapon = null; p.equip.weaponDurability = 0;
        }
      }
    });

    cs.hp = Math.max(0, cs.hp - totalAtk);
    updateCombatHP();
    Audio.playSE('combat');
    setCombatLog(`攻撃！合計 ${totalAtk} ダメージ。残りHP: ${cs.hp}`);

    if (cs.hp <= 0) {
      setCombatLog(`${cs.entity.name} を倒した！`);
      addLog('success', `✓ エンティティ「${cs.entity.name}」を撃破した！`);
      unlockTrophy('hunter');
      setTimeout(() => { closeCombat(); afterCombatEnd(); }, 1200);
      return;
    }
    setTimeout(() => rollEntityAttackDice(), 600);

  } else if (action === 'flee') {
    rollEntityFleeDice();
  }
}

function animateCombatDice(sides, callback) {
  const faceMax = Number.isFinite(sides) ? Math.max(2, Math.floor(sides)) : 6;
  const wrap = document.getElementById('combat-dice-display');
  wrap.innerHTML = `<div><div class="combat-dice-face rolling" id="combat-dice-face">?</div><div class="combat-dice-label">D${faceMax}</div></div>`;
  const face = document.getElementById('combat-dice-face');
  let t = 0;
  const iv = setInterval(() => {
    face.textContent = Math.ceil(Math.random() * faceMax);
    if (++t > 10) {
      clearInterval(iv);
      face.classList.remove('rolling');
      const r = Math.ceil(Math.random() * faceMax);
      face.textContent = r;
      setTimeout(() => callback(r), 200);
    }
  }, 55);
}

function entityAttack(r, outcome) {
  const cs = G.entityState;
  const dodge = outcome === 'dodge';
  const face = document.getElementById('combat-dice-face');
  if (face) {
    face.textContent = r;
    face.style.color = dodge ? '#80c080' : '#e08080';
  }

  if (dodge) {
    setCombatLog(`エンティティの攻撃！ ダイス:${r} → 回避成功！`);
    addLog('success', '⚡ 攻撃を回避した！');
  } else {
    let target;
    if (G.turnMode === 'individual') {
      target = G.players[G.currentPlayerIdx];
    } else {
      const alive = G.players.filter(p => p.hp > 0);
      target = alive[Math.floor(Math.random()*alive.length)];
    }
    if (target) {
      const prev = target.hp;
      Audio.playSE('combatHit');
      target.hp = Math.max(0, target.hp - cs.entity.attack);
      setCombatLog(`エンティティの攻撃！ ダイス:${r} → ${target.name} が ${cs.entity.attack} ダメージ！(HP: ${prev}→${target.hp})`);
      addLog('danger', `💥 ${target.name} が ${cs.entity.attack} ダメージ！(HP: ${prev}→${target.hp})`);
      if (target.hp <= 0) addLog('danger', `${target.name} が倒れた！`);
    }
  }
  updateStatusBar();

  if (checkCombatEndCondition()) {
    if (G.players.filter(p=>p.hp>0).length === 0) {
      setTimeout(() => { closeCombat(); gameOver('全員の体力が尽きた'); }, 1200);
    } else {
      setTimeout(() => { closeCombat(); afterCombatEnd(); }, 1200);
    }
    return;
  }
  setTimeout(() => resetCombatBtns(), 800);
}

function checkCombatEndCondition() {
  if (G.turnMode === 'individual') {
    const p = G.players[G.currentPlayerIdx];
    return !p || p.hp <= 0;
  }
  return G.players.every(p => p.hp <= 0);
}

function fleeAttempt(r, outcome) {
  const face = document.getElementById('combat-dice-face');
  const success = outcome === 'escape';
  if (face) {
    face.textContent = r;
    face.style.color = success ? '#80c080' : '#e08080';
  }

  // Fix: only apply stamina cost to the relevant player(s)
  Audio.playSE('flee');
  if (G.turnMode === 'individual') {
    const p = G.players[G.currentPlayerIdx];
    if (p && p.hp > 0) p.stamina = Math.max(0, p.stamina - 10);
  } else {
    G.players.forEach(p => { if (p.hp > 0) p.stamina = Math.max(0, p.stamina - 10); });
  }

  if (success) {
    setCombatLog(`逃走成功！ ダイス:${r} → スタミナ-10`);
    addLog('explore', '💨 逃走成功。スタミナを10消費した。');
    updateStatusBar();
    setTimeout(() => { closeCombat(); afterCombatEnd(); }, 1000);
  } else {
    setCombatLog(`逃走失敗！ ダイス:${r} → スタミナ-10`);
    addLog('danger', '逃走失敗！スタミナを10消費した。');
    updateStatusBar();
    setTimeout(() => rollEntityAttackDice(), 800);
  }
}

function setCombatLog(msg) { document.getElementById('combat-log').textContent = msg; }
function updateCombatHP() {
  const cs = G.entityState;
  document.getElementById('combat-hp-val').textContent = cs.hp;
  document.getElementById('combat-hp-bar').style.width = `${(cs.hp/cs.maxHp)*100}%`;
}
function closeCombat() {
  document.getElementById('combat-overlay').classList.remove('active');
  const entityImg = document.getElementById('combat-entity-image');
  if (entityImg) {
    entityImg.removeAttribute('src');
    entityImg.alt = '';
  }
  G.entityState = null;
  if (typeof scrollArchiveToBottom === 'function') {
    scrollArchiveToBottom();
    setTimeout(() => scrollArchiveToBottom(), 0);
    setTimeout(() => scrollArchiveToBottom(), 120);
  }
}
function afterCombatEnd() {
  if (G.turnMode === 'individual') {
    // Fire passive for current player
    const p = G.players[G.currentPlayerIdx];
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
// GAME OVER
// ================================================================
function gameOver(reason) {
  addLog('danger', `⬛ GAME OVER — ${reason}`);
  Audio.playSE('gameover');
  Audio.stopBgm();
  document.getElementById('dice-prompt').textContent = '';
  document.getElementById('dice-display').innerHTML = '';
  document.getElementById('dice-result').textContent = '';
  document.getElementById('dice-buttons').innerHTML = '';

  // Show cinematic overlay
  const ov = document.getElementById('gameover-overlay');
  ov.style.display = 'flex';
  const title = document.getElementById('gameover-title');
  const reasonEl = document.getElementById('gameover-reason');
  const statsEl = document.getElementById('gameover-stats');
  const btn = document.getElementById('gameover-btn');

  reasonEl.textContent = reason;
  statsEl.innerHTML = `生存ターン数: ${G.turnCount}　/　到達Level: ${G.currentLevel}　/　経過日数: ${G.daysPassed}`;

  // Animate in
  requestAnimationFrame(() => {
    title.style.opacity = '1';
    setTimeout(() => { reasonEl.style.opacity = '1'; }, 1000);
    setTimeout(() => { statsEl.style.opacity = '1'; }, 1500);
    setTimeout(() => { btn.style.display = 'inline-block'; }, 2500);
  });

  // Particle / glitch canvas effect
  const canvas = document.getElementById('gameover-canvas');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const gc = canvas.getContext('2d');
  let frame = 0;
  const particles = Array.from({length:80}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5,
    r: Math.random()*2+0.5, alpha: Math.random()
  }));

  function drawFrame() {
    if (!ov.style.display || ov.style.display==='none') return;
    frame++;
    gc.fillStyle = `rgba(0,0,0,${frame<60?0.3:0.07})`;
    gc.fillRect(0,0,W,H);

    // Scanlines
    for (let y=0; y<H; y+=4) {
      gc.fillStyle = 'rgba(0,0,0,0.15)';
      gc.fillRect(0,y,W,1);
    }

    // Blood-red particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>W) p.vx*=-1;
      if (p.y<0||p.y>H) p.vy*=-1;
      p.alpha = 0.3+0.4*Math.sin(frame*0.05+p.x);
      gc.beginPath();
      gc.arc(p.x,p.y,p.r,0,Math.PI*2);
      gc.fillStyle = `rgba(${150+Math.random()*50},${Math.floor(Math.random()*20)},${Math.floor(Math.random()*20)},${p.alpha})`;
      gc.fill();
    });

    // Random glitch lines
    if (Math.random()<0.08) {
      const y2 = Math.random()*H;
      gc.fillStyle = `rgba(192,40,40,${Math.random()*0.15})`;
      gc.fillRect(0,y2,W,Math.random()*3+1);
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

function gameOverReturn() {
  const ov = document.getElementById('gameover-overlay');
  ov.style.display = 'none';
  // Reset overlay state
  document.getElementById('gameover-title').style.opacity = '0';
  document.getElementById('gameover-reason').style.opacity = '0';
  document.getElementById('gameover-stats').style.opacity = '0';
  document.getElementById('gameover-btn').style.display = 'none';
  showHome();
}
