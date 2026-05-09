function startCombat(entityData) {
  G.entityState = { entity:{ ...entityData }, hp:entityData.hp, maxHp:entityData.maxHp };
  document.getElementById('combat-entity-name').textContent = entityData.name;
  document.getElementById('combat-entity-name').style.color = entityData.color;
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
  if (p.job === 'hunter') atk += 1;
  const wid = p.equip.weapon;
  if (wid) { const w=GAME_DATA.items[wid]; if(w&&w.attack) atk += w.attack; }
  return atk;
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
    setTimeout(() => animateCombatDice(r => entityAttack(r)), 600);

  } else if (action === 'flee') {
    animateCombatDice(r => fleeAttempt(r));
  }
}

function animateCombatDice(callback) {
  const wrap = document.getElementById('combat-dice-display');
  wrap.innerHTML = `<div><div class="combat-dice-face rolling" id="combat-dice-face">?</div><div class="combat-dice-label">D6</div></div>`;
  const face = document.getElementById('combat-dice-face');
  let t = 0;
  const iv = setInterval(() => {
    face.textContent = Math.ceil(Math.random()*6);
    if (++t > 10) {
      clearInterval(iv);
      face.classList.remove('rolling');
      const r = Math.ceil(Math.random()*6);
      face.textContent = r;
      setTimeout(() => callback(r), 200);
    }
  }, 55);
}

function entityAttack(r) {
  const cs = G.entityState;
  const dodge = (r === 6);
  const face = document.getElementById('combat-dice-face');
  if (face) face.textContent = r;

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

function fleeAttempt(r) {
  const face = document.getElementById('combat-dice-face');
  if (face) face.textContent = r;
  const success = r >= 2;

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
    setTimeout(() => animateCombatDice(r2 => entityAttack(r2)), 800);
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
  G.entityState = null;
}
function afterCombatEnd() {
  if (G.turnMode === 'individual') {
    // Fire passive for current player
    const p = G.players[G.currentPlayerIdx];
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