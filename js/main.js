document.addEventListener('DOMContentLoaded', () => {
  loadTrophies();
  buildJobGrid();
  buildLevelList();
  buildTrophyGrid();
  buildChangelog();
  buildSaveLoad();
});

// Start home BGM on first user interaction
document.addEventListener('click', () => Audio.startBgm('home'), { once: true });
