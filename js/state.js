// ================================================================
// STATE
// ================================================================
let G = {
  players: [],
  bag: [],
  bagMax: 12,
  currentLevel: 0,
  turnMode: null,
  currentPlayerIdx: 0,
  pendingLevelMove: null,
  // investigatorRolls: per-player roll history { playerIdx: [rolls...] }
  investigatorRolls: {},
  trophies: {},
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
  staminaRecoveryQueue: [],  // array of player indices awaiting stamina recovery
};

let setupState = {
  count: 1,
  players: [
    { name:'Player 1', job:'wanderer' },
    { name:'Player 2', job:'wanderer' },
    { name:'Player 3', job:'wanderer' },
    { name:'Player 4', job:'wanderer' },
  ]
};

window.setupState = setupState;

let logSeq = 0;

// Turn flow shared state
const _srQty = {};
let diceState = { rolling:false, diceMax:6 };

const SAVE_SLOTS = 3;
