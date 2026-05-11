document.addEventListener('DOMContentLoaded', () => {
  loadTrophies();
  buildJobGrid();
  buildLevelList();
  buildTrophyGrid();
  buildChangelog();
  buildSaveLoad();
});

function startContextBgmOnce() {
  const activeGame = document.getElementById('game-screen')?.classList.contains('active');
  if (activeGame && typeof G !== 'undefined' && GAME_DATA.levels[G.currentLevel]) {
    Audio.startBgm('level' + G.currentLevel);
  } else {
    Audio.startBgm('home');
  }
}

// Start BGM on first user interaction
document.addEventListener('click', startContextBgmOnce, { once: true });

let _hoverBtn = null;
document.addEventListener('mouseover', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn === _hoverBtn) return;
  if (!btn.matches('.action-btn, .roll-btn, .confirm-btn, .menu-btn, .count-btn, .job-pick-btn, .start-btn, .back-btn, .save-btn2, .tm-btn, .combat-attack-btn, .combat-flee-btn, .modal-close, .stamina-use-btn, .stamina-qty-btn, .stamina-skip-btn, .qty-btn, .use-btn, .discard-btn, .discard-confirm-yes, .discard-confirm-no')) return;
  _hoverBtn = btn;
  Audio.playSE('hover');
});

document.addEventListener('mouseout', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn !== _hoverBtn) return;
  if (btn.contains(e.relatedTarget)) return;
  _hoverBtn = null;
});
