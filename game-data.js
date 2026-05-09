
// ============================================================
// BACKROOMS GAME DATA  v0.1.1
// ============================================================

const GAME_DATA = {

  // ── JOBS ──────────────────────────────────────────────────
  jobs: {
    wanderer: {
      id: "wanderer",
      name: "放浪者",
      nameEn: "Wanderer",
      desc: "行動後25%の確率で「アーモンドウォーター」をGET",
      passiveLabel: "アーモンドウォーター取得(25%)",
      color: "#b8a070",
      startItems: ["water", "flashlight"],
      passive: (state, player) => {
        if (Math.random() < 0.25) {
          return { type: "ADD_ITEM", item: "almondWater", msg: `${player.name}がアーモンドウォーターを入手した！` };
        }
        return null;
      }
    },
    investigator: {
      id: "investigator",
      name: "階層調査員",
      nameEn: "Investigator",
      desc: "階層情報を知ることができる・階層移動を「キャンセル」できる・調査ノートで振り直し",
      passiveLabel: "階層情報確認 / 移動キャンセル / 調査ノート",
      color: "#7aab8a",
      startItems: ["investigationNote", "water"],
      passive: null
    },
    hunter: {
      id: "hunter",
      name: "ハンター",
      nameEn: "Hunter",
      desc: "エンティティへの攻撃+1・行動後10%の確率で「弾丸」をGET",
      passiveLabel: "攻撃+1 / 弾丸取得(10%)",
      color: "#c06060",
      startItems: ["handgun", "bullet", "bullet", "bullet", "bullet", "bullet", "bullet", "knife", "water"],
      passive: (state, player) => {
        if (Math.random() < 0.10) {
          return { type: "ADD_ITEM", item: "bullet", msg: `${player.name}が弾丸を入手した！` };
        }
        return null;
      }
    },
    fisherman: {
      id: "fisherman",
      name: "釣り人",
      nameEn: "Fisherman",
      desc: "水源のある階層で「釣り」を選択可能・行動後25%の確率で「餌」をGET",
      passiveLabel: "釣り行動 / 餌取得(25%)",
      color: "#5b8fc4",
      startItems: ["fishingRod", "bait", "bait", "bait", "bait", "bait", "bait", "water"],
      passive: (state, player) => {
        if (Math.random() < 0.25) {
          return { type: "ADD_ITEM", item: "bait", msg: `${player.name}が餌を入手した！` };
        }
        return null;
      }
    },
    medic: {
      id: "medic",
      name: "救護員",
      nameEn: "Medic",
      desc: "アイテム回復力+10%・行動後15%の確率で「包帯」をGET",
      passiveLabel: "回復+10% / 包帯取得(15%)",
      color: "#a070c8",
      startItems: ["medKit", "bandage", "bandage", "bandage", "sedative", "sedative", "water"],
      passive: (state, player) => {
        if (Math.random() < 0.15) {
          return { type: "ADD_ITEM", item: "bandage", msg: `${player.name}が包帯を入手した！` };
        }
        return null;
      }
    }
  },

  // ── ITEMS ─────────────────────────────────────────────────
  items: {
    water:              { id:"water",              name:"水",                   category:"food",    desc:"スタミナ+10",              effects:{ stamina:10 },          icon:"💧" },
    biscuit:            { id:"biscuit",            name:"乾パン",               category:"food",    desc:"スタミナ+15",              effects:{ stamina:15 },          icon:"🍞" },
    almondWater:        { id:"almondWater",        name:"アーモンドウォーター",  category:"food",    desc:"精神力+5, スタミナ+5",      effects:{ sanity:5, stamina:5 }, icon:"🥛" },
    knife:              { id:"knife",              name:"ナイフ",               category:"weapon",  desc:"攻撃力3 / 耐久3",          attack:3, maxDurability:3,       icon:"🔪" },
    handgun:            { id:"handgun",            name:"ハンドガン",           category:"weapon",  desc:"攻撃力6 / 要弾丸",         attack:6, needAmmo:true,         icon:"🔫" },
    bullet:             { id:"bullet",             name:"弾丸",                 category:"ammo",    desc:"ハンドガン用弾薬",                                          icon:"🔹" },
    bandage:            { id:"bandage",            name:"包帯",                 category:"medical", desc:"体力+25",                  effects:{ hp:25 },               icon:"🩹" },
    medKit:             { id:"medKit",             name:"医療キット",           category:"medical", desc:"体力+50",                  effects:{ hp:50 },               icon:"🧰" },
    sedative:           { id:"sedative",           name:"精神安定剤",           category:"medical", desc:"精神力+50",                effects:{ sanity:50 },           icon:"💊" },
    flashlight:         { id:"flashlight",         name:"懐中電灯",             category:"tool",    desc:"暗闇エリア対応",           battery:3,                       icon:"🔦" },
    battery:            { id:"battery",            name:"電池",                 category:"tool",    desc:"バッテリー+3",             effects:{ battery:3 },           icon:"🔋" },
    pocketWatch:        { id:"pocketWatch",        name:"懐中時計",             category:"tool",    desc:"現在時刻を確認できる",     isClock:true,                    icon:"⌚" },
    fishingRod:         { id:"fishingRod",         name:"釣り竿",               category:"job",     desc:"餌×1消費して釣りが可能",                                    icon:"🎣" },
    bait:               { id:"bait",               name:"餌",                   category:"job",     desc:"釣りに使用",                                                icon:"🪱" },
    investigationNote:  { id:"investigationNote",  name:"調査ノート",           category:"job",     desc:"階層調査員専用：振ったダイスを振り直せる",                  icon:"📓" },
  },

  // ── ENTITIES ──────────────────────────────────────────────
  entities: {
    howler: {
      id: "howler",
      name: "Howler",
      hp: 10, maxHp: 10,
      attack: 25,
      desc: "甲高い叫び声で知られる危険なエンティティ",
      color: "#e05050"
    },
    duller: {
      id: "duller",
      name: "Duller",
      hp: 15, maxHp: 15,
      attack: 30,
      desc: "鈍い動きだが、攻撃力が高い脅威的エンティティ",
      color: "#c060a0"
    }
  },

  // ── LEVELS ────────────────────────────────────────────────
  // actions配列: rollは「元のスロット番号」(シャッフルの基準)。isOutdoor=trueの階層のみ時計表示
  levels: {
    0: {
      id: 0,
      name: "Level 0",
      subtitle: "The Lobby",
      desc: "無限に広がる黄色い壁紙と湿ったカーペットの部屋。蛍光灯が点滅している。",
      diceMax: 12,
      hasWater: false,
      isOutdoor: false,
      bgClass: "level0",
      actions: [
        { roll:1,  label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:2,  label:"探索する",         hidden:"アーモンドウォーター発見！",event:"item",      reward:"almondWater" },
        { roll:3,  label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:4,  label:"穴に飛び降りる",   hidden:"Level1へ移動",             event:"levelMove", reward:null, nextLevel:1 },
        { roll:5,  label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:6,  label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:7,  label:"探索する",         hidden:"Howler出現！",             event:"entity",    reward:null, entity:"howler" },
        { roll:8,  label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:9,  label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:10, label:"探索する",         hidden:"乾パン発見！",              event:"item",      reward:"biscuit" },
        { roll:11, label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:12, label:"探索する",         hidden:"アイテムなし",              event:"explore",   reward:null },
      ]
    },
    1: {
      id: 1,
      name: "Level 1",
      subtitle: "The Habitable Zone",
      desc: "コンクリートの廊下。かつて何かが存在したような痕跡が残っている。",
      diceMax: 10,
      hasWater: false,
      isOutdoor: false,
      bgClass: "level1",
      actions: [
        { roll:1,  label:"探索する",           hidden:"アーモンドウォーター発見！",event:"item",      reward:"almondWater" },
        { roll:2,  label:"探索する",           hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:3,  label:"探索する",           hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:4,  label:"探索する",           hidden:"アーモンドウォーター発見！",event:"item",      reward:"almondWater" },
        { roll:5,  label:"探索する",           hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:6,  label:"エレベーターに乗る", hidden:"Level2へ移動",             event:"levelMove", reward:null, nextLevel:2 },
        { roll:7,  label:"探索する",           hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:8,  label:"探索する",           hidden:"乾パン発見！",              event:"item",      reward:"biscuit" },
        { roll:9,  label:"探索する",           hidden:"アイテムなし",              event:"explore",   reward:null },
        { roll:10, label:"探索する",           hidden:"Duller出現！",             event:"entity",    reward:null, entity:"duller" },
      ]
    }
  },

  // ── CHANGELOG ─────────────────────────────────────────────
  changelog: [
    {
      version: "v0.1.3",
      date: "2026-05-04",
      notes: [
        "ホーム・Level0・Level1に仮BGM追加（Web Audio API生成）",
        "ダイス・アイテム使用・ボタンクリック・エンカウントなどにSE追加",
        "死亡・GAME OVER演出を強化（フルスクリーンオーバーレイ・エフェクト）",
        "音量調整ボタンをサイドバーに追加"
      ]
    },
    {
      version: "v0.1.2",
      date: "2026-05-04",
      notes: [
        "ログを常に最新が見える表示に修正",
        "使用不可アイテム（武器・道具など）の対象プレイヤー欄と使用ボタンを非表示",
        "逃走時スタミナ消費バグ修正（成功/失敗どちらも正しく-10）",
        "調査ノート：プレイヤーごとに目を管理・Level移動でリセット・バッグで履歴表示",
        "個別行動パッシブを自分のターン終了時のみ発動に修正",
        "スタミナ切れ回復を1人ずつ個別対応・複数個使用に対応",
        "アイテム捨て確認をUI内インラインに変更・捨てる個数選択追加"
      ]
    },
    {
      version: "v0.1.1",
      date: "2026-05-04",
      notes: [
        "更新ログをアコーディオン式に変更",
        "ゲームログエリアのみスクロール・画面固定化",
        "階層移動時にログをリセット",
        "エンティティ攻撃・回避ダイスに演出追加",
        "時計システム追加（6時スタート、6時間/ターン、24h=精神-10、屋外のみ表示）",
        "ハンドガン→弾丸消費 / ナイフ→耐久-1の実装",
        "行動テーブルをターンごとにシャッフル",
        "スタミナ0プレイヤーの行動不可 / 全員0でゲームオーバー",
        "個別行動戦闘はそのプレイヤーの攻撃力のみで計算",
        "HP0プレイヤーは行動不可 / 団体戦闘の攻撃力修正",
        "HP0プレイヤーへの包帯・医療キット使用不可",
        "職業固有パッシブの発動タイミング修正（個別/団体）",
        "アイテム複数使用 / 使用前後HP表示",
        "調査ノートは階層調査員のみ有効",
        "バッグからアイテムを捨てる機能追加",
        "装備時バッグから消える / 外すとバッグに戻る",
        "セーブ/ロード機能追加",
        "懐中時計アイテム追加"
      ]
    },
    {
      version: "v0.1.0",
      date: "2026-05-04",
      notes: [
        "Level0「The Lobby」実装",
        "Level1「The Habitable Zone」実装",
        "5職業実装",
        "エンティティ：Howler / Duller実装",
        "アイテムシステム実装",
        "ダイスシステム実装"
      ]
    }
  ],

  // ── TROPHIES ──────────────────────────────────────────────
  trophies: [
    { id:"firstExplore", name:"初探索",            desc:"初めて探索を行った",           icon:"🔍" },
    { id:"firstEntity",  name:"初遭遇",             desc:"初めてエンティティに遭遇した", icon:"👁" },
    { id:"survivor",     name:"生存者",             desc:"Level0をクリアした",           icon:"🚪" },
    { id:"descend",      name:"降下者",             desc:"Level1に到達した",             icon:"⬇️" },
    { id:"hunter",       name:"エンティティハンター",desc:"エンティティを倒した",         icon:"🎯" },
  ]
};
