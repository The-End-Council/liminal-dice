
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
      image: "img/Jobs/wanderer.png",
      desc: "行動後25%の確率で「アーモンドウォーター」をGET",
      passiveLabel: "アーモンドウォーター取得(25%)",
      color: "#b8a070",
      startItems: ["water", "flashlight", "mobile"],
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
      image: "img/Jobs/investigator.png",
      desc: "個別行動と団体行動で階層情報を知ることができる・移動イベントを「キャンセル」できる・調査ノートで振り直し（出目管理はエリア別）",
      passiveLabel: "階層情報確認 / 移動キャンセル / 調査ノート",
      color: "#7aab8a",
      startItems: ["investigationNote", "water"],
      passive: null
    },
    hunter: {
      id: "hunter",
      name: "ハンター",
      nameEn: "Hunter",
      image: "img/Jobs/hunter.png",
      desc: "エンティティへの攻撃+10%・行動後10%の確率で「弾丸」をGET",
      passiveLabel: "攻撃+10% / 弾丸取得(10%)",
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
      image: "img/Jobs/fisherman.png",
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
      image: "img/Jobs/medic.png",
      desc: "パーティー内にいる間、HP回復とスタミナ回復アイテム効果+10%・行動後15%の確率で「包帯」をGET",
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
    water:              { id:"water",              name:"水",                   category:"food",    desc:"スタミナ+10",              effects:{ stamina:10 },          icon:"💧", image:"img/Items/food/water.png" },
    biscuit:            { id:"biscuit",            name:"乾パン",               category:"food",    desc:"スタミナ+15",              effects:{ stamina:15 },          icon:"🍞", image:"img/Items/food/biscuit.png" },
    almondWater:        { id:"almondWater",        name:"アーモンドウォーター",  category:"food",    desc:"精神力+5, スタミナ+5",      effects:{ sanity:5, stamina:5 }, icon:"🥛", image:"img/Items/food/almondWater.png" },
    knife:              { id:"knife",              name:"ナイフ",               category:"weapon",  desc:"攻撃力3 / 耐久3",          attack:3, maxDurability:3,       icon:"🔪", image:"img/Items/weapon/knife.png" },
    handgun:            { id:"handgun",            name:"ハンドガン",           category:"weapon",  desc:"攻撃力6 / 要弾丸",         attack:6, needAmmo:true,         icon:"🔫", image:"img/Items/weapon/handgun.png" },
    bullet:             { id:"bullet",             name:"弾丸",                 category:"ammo",    desc:"ハンドガン用弾薬",                                          icon:"🔹", image:"img/Items/ammo/bullet.png" },
    bandage:            { id:"bandage",            name:"包帯",                 category:"medical", desc:"体力+25",                  effects:{ hp:25 },               icon:"🩹", image:"img/Items/medical/bandage.png" },
    medKit:             { id:"medKit",             name:"医療キット",           category:"medical", desc:"体力+50",                  effects:{ hp:50 },               icon:"🧰", image:"img/Items/medical/medKit.png" },
    sedative:           { id:"sedative",           name:"精神安定剤",           category:"medical", desc:"精神力+50",                effects:{ sanity:50 },           icon:"💊", image:"img/Items/medical/sedative.png" },
    flashlight:         { id:"flashlight",         name:"懐中電灯",             category:"tool",    desc:"暗闇エリア対応",           battery:3,                       icon:"🔦", image:"img/Items/tool/flashlight.png" },
    battery:            { id:"battery",            name:"電池",                 category:"tool",    desc:"バッテリー+3",             effects:{ battery:3 },           icon:"🔋", image:"img/Items/tool/battery.png" },
    pocketWatch:        { id:"pocketWatch",        name:"懐中時計",             category:"tool",    desc:"現在時刻を確認できる",     isClock:true,                    icon:"⌚", image:"img/Items/tool/pocketWatch.png" },
    mobile:             { id:"mobile",             name:"携帯",                 category:"tool",    desc:"現在時刻を確認できる / バッテリー3", isClock:true, battery:3,     icon:"📱", image:"img/Items/tool/mobile.png" },
    fishingRod:         { id:"fishingRod",         name:"釣り竿",               category:"job",     desc:"餌×1消費して釣りが可能",                                    icon:"🎣", image:"img/Items/job/fishingRod.png" },
    bait:               { id:"bait",               name:"餌",                   category:"job",     desc:"釣りに使用",                                                icon:"🪱", image:"img/Items/job/bait.png" },
    investigationNote:  { id:"investigationNote",  name:"調査ノート",           category:"job",     desc:"階層調査員専用：振ったダイスを振り直せる",                  icon:"📓", image:"img/Items/job/investigationNote.png" },
  },

  // ── ENTITIES ──────────────────────────────────────────────
  entities: {
    howler: {
      id: "howler",
      name: "Howler",
      image: "img/Entities/howler.png",
      hp: 10, maxHp: 10,
      attack: 25,
      attackDice: { sides: 6, attackFaces: 4, dodgeFaces: 2 },
      fleeDice: { sides: 6, escapeFaces: 4, failFaces: 2 },
      desc: "甲高い叫び声で知られる危険なエンティティ",
      color: "#e05050"
    },
    duller: {
      id: "duller",
      name: "Duller",
      image: "img/Entities/duller.png",
      hp: 15, maxHp: 15,
      attack: 30,
      attackDice: { sides: 6, attackFaces: 4, dodgeFaces: 2 },
      fleeDice: { sides: 6, escapeFaces: 4, failFaces: 2 },
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
      diceMax: 14,
      hasWater: false,
      isOutdoor: false,
      bgClass: "level0",
      actions: [
        { roll:1,  label:"蛍光灯の下を進む",               hidden:"何も起きない",               event:"explore",   log:"蛍光灯の下を進んだが、何も起きなかった。" },
        { roll:2,  label:"湿ったカーペットを調べる",       hidden:"アーモンドウォーター発見！", event:"item",      reward:"almondWater" },
        { roll:3,  label:"黄色い壁紙の継ぎ目を追う",       hidden:"何も起きない",               event:"explore",   log:"壁紙の継ぎ目を追ったが、何も見つからなかった。" },
        { roll:4,  label:"床に開いた穴へ降りる",           hidden:"Level1へ移動",              event:"levelMove", reward:null, nextLevel:1 },
        { roll:5,  label:"蛍光灯の明るい区画で息を整える", hidden:"スタミナ+5",                event:"effect",    effects:{ stamina:5 }, log:"少し休んで体勢を整えた。" },
        { roll:6,  label:"長い廊下を進む",                 hidden:"何も起きない",               event:"explore",   log:"長い廊下を進んだが、何も起きなかった。" },
        { roll:7,  label:"遠くの叫び声へ近づく",           hidden:"Howler出現！",              event:"entity",    reward:null, entity:"howler" },
        { roll:8,  label:"黒く沈んだ廊下へ入る",           hidden:"Blackout Zoneへ移動",       event:"zoneMove",  nextZone:"blackout", log:"暗闇の区画へ足を踏み入れた。" },
        { roll:9,  label:"赤く剥がれた壁紙を確かめる",     hidden:"Red Roomsへ移動",           event:"zoneMove",  nextZone:"redrooms", log:"赤い区画へ迷い込んだ。" },
        { roll:10, label:"放置された荷物を探る",           hidden:"乾パン発見！",               event:"item",      reward:"biscuit" },
        { roll:11, label:"曲がり角をひとつ越える",         hidden:"何も起きない",               event:"explore",   log:"曲がり角を越えたが、変化はなかった。" },
        { roll:12, label:"蛍光灯の音を頼りに歩く",         hidden:"何も起きない",               event:"explore",   log:"蛍光灯の音を追ったが、何も起きなかった。" },
        { roll:13, label:"剥がれた壁紙を避けて進む",       hidden:"何も起きない",               event:"explore",   log:"慎重に進んだが、何も起きなかった。" },
        { roll:14, label:"点滅する壁を確かめる",           hidden:"何も起きない",               event:"explore",   log:"点滅する壁を確かめたが、何も起きなかった。" },
      ],
      zones: {
        normal: {
          name: "通常エリア",
          diceMax: 14,
          actions: [
            { roll:1,  label:"蛍光灯の下を進む",               hidden:"何も起きない",               event:"explore",   log:"蛍光灯の下を進んだが、何も起きなかった。" },
            { roll:2,  label:"湿ったカーペットを調べる",       hidden:"アーモンドウォーター発見！", event:"item",      reward:"almondWater" },
            { roll:3,  label:"黄色い壁紙の継ぎ目を追う",       hidden:"何も起きない",               event:"explore",   log:"壁紙の継ぎ目を追ったが、何も見つからなかった。" },
            { roll:4,  label:"床に開いた穴へ降りる",           hidden:"Level1へ移動",              event:"levelMove", reward:null, nextLevel:1 },
            { roll:5,  label:"蛍光灯の明るい区画で息を整える", hidden:"スタミナ+5",                event:"effect",    effects:{ stamina:5 }, log:"少し休んで体勢を整えた。" },
            { roll:6,  label:"長い廊下を進む",                 hidden:"何も起きない",               event:"explore",   log:"長い廊下を進んだが、何も起きなかった。" },
            { roll:7,  label:"遠くの叫び声へ近づく",           hidden:"Howler出現！",              event:"entity",    reward:null, entity:"howler" },
            { roll:8,  label:"黒く沈んだ廊下へ入る",           hidden:"Blackout Zoneへ移動",       event:"zoneMove",  nextZone:"blackout", log:"暗闇の区画へ足を踏み入れた。" },
            { roll:9,  label:"赤く剥がれた壁紙を確かめる",     hidden:"Red Roomsへ移動",           event:"zoneMove",  nextZone:"redrooms", log:"赤い区画へ迷い込んだ。" },
            { roll:10, label:"放置された荷物を探る",           hidden:"乾パン発見！",               event:"item",      reward:"biscuit" },
            { roll:11, label:"曲がり角をひとつ越える",         hidden:"何も起きない",               event:"explore",   log:"曲がり角を越えたが、変化はなかった。" },
            { roll:12, label:"蛍光灯の音を頼りに歩く",         hidden:"何も起きない",               event:"explore",   log:"蛍光灯の音を追ったが、何も起きなかった。" },
            { roll:13, label:"剥がれた壁紙を避けて進む",       hidden:"何も起きない",               event:"explore",   log:"慎重に進んだが、何も起きなかった。" },
            { roll:14, label:"点滅する壁を確かめる",           hidden:"何も起きない",               event:"explore",   log:"点滅する壁を確かめたが、何も起きなかった。" },
          ]
        },
        blackout: {
          name: "Blackout Zone",
          diceMax: 6,
          actions: [
            { roll:1, label:"粗い壁を手探りで進む",   hidden:"精神力-5",      event:"effect",   effects:{ sanity:-5 },  log:"暗闇の圧迫感で精神が削られた。" },
            { roll:2, label:"足元の液体を踏み抜く",   hidden:"スタミナ-5",    event:"effect",   effects:{ stamina:-5 }, log:"足を取られて消耗した。" },
            { roll:3, label:"蛍光灯の音を追う",       hidden:"通常エリアへ戻る",event:"zoneMove", nextZone:"normal",    log:"蛍光灯の音を手掛かりに通常エリアへ戻った。" },
            { roll:4, label:"微かな光へ走る",         hidden:"スタミナ-5で帰還",event:"effect",   effects:{ stamina:-5 }, nextZone:"normal", log:"走って光へ向かい、スタミナを消耗した。" },
            { roll:5, label:"暗闇の奥の声を聞く",     hidden:"精神力-5",      event:"effect",   effects:{ sanity:-5 },  log:"不気味な声に精神が揺らいだ。" },
            { roll:6, label:"壁の切れ目を見つける",   hidden:"通常エリアへ戻る",event:"zoneMove", nextZone:"normal",    log:"壁の切れ目を抜け、通常エリアへ戻った。" },
          ]
        },
        redrooms: {
          name: "Red Rooms",
          diceMax: 6,
          actions: [
            { roll:1, label:"赤い壁紙を見続ける",       hidden:"精神力-5",         event:"effect",   effects:{ sanity:-5 },  log:"赤い空間に飲まれ、精神が削られた。" },
            { roll:2, label:"粘つくカーペットに足を取られる", hidden:"スタミナ-5",   event:"effect",   effects:{ stamina:-5 }, log:"粘つく床で体力を消耗した。" },
            { roll:3, label:"入口へ引き返す",           hidden:"通常エリアへ戻る",   event:"zoneMove", nextZone:"normal",    log:"入口を見つけて通常エリアへ戻った。" },
            { roll:4, label:"剥がれた壁紙の裏を見る",   hidden:"精神力-5",         event:"effect",   effects:{ sanity:-5 },  log:"壁の裏の異様な気配で精神が削られた。" },
            { roll:5, label:"閉じた廊下を一周する",     hidden:"精神力-5",         event:"effect",   effects:{ sanity:-5 },  log:"出口が見つからず、精神が削られた。" },
            { roll:6, label:"薄い黄色の光を見つける",   hidden:"Blackout Zoneへ移動",event:"zoneMove", nextZone:"blackout",  log:"赤い区画を抜けた先で暗闇の区画へ入った。" },
          ]
        }
      }
    },
    1: {
      id: 1,
      name: "Level 1",
      subtitle: "Habitable Zone",
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
      version: "v0.1.4",
      date: "2026-05-10",
      notes: [
        "Level0のダイスを12面から14面へ更新",
        "Level0にBlackout ZoneとRed Roomsの階層内移動を実装",
        "Blackout ZoneとRed Roomsの6面ダイスイベントを実装",
        "Level0の行動文を探索中心の内容へ更新",
        "階層調査員の振り直し時に階層情報を表示するよう修正",
        "団体行動でも階層調査員の階層情報表示と調査ノート振り直しを有効化",
        "ダイス・確定・サイドバー操作のSEを追加",
        "セーブSEとロードSEを追加",
        "ロード確認でスロット1が読み込めない不具合を修正",
        "携帯アイテム追加、24時間経過ごとにバッテリー-1を実装",
        "時刻表示を常時表示化（未所持時は??:??）",
        "24時間経過判定を06:00基準へ修正、時間帯表示を朝・昼・夜・深夜へ更新",
        "BGMとSEの音量スライダーとミュートを分離",
        "救護員がパーティーにいる場合のHP/ST回復アイテム効果+10%を実装",
        "ホーム画面に「07 設定」を追加し、BGMとSE設定を移動",
        "調査ノートの出目管理を階層内エリアごとに分離",
        "ステータスバーにATK表示を追加",
        "バッグ満杯時に、アイテムを捨てて取得するか確認する処理を追加",
        "ハンターの攻撃補正を+10%へ変更",
        "階層調査員で階層内移動イベントもキャンセル可能に変更",
        "スタミナ不足回復確認を、該当プレイヤーが1人でもいる場合に表示するよう修正",
        "スタミナ不足回復画面の連続使用動線を改善",
        "戦闘ダイスの成功/失敗色分け表示を追加",
        "ログ自動スクロールを改善",
        "バッグ満杯時の通知をゲーム内ウィンドウ通知へ変更",
        "ホーム画面の「更新ログ」を「パッチノート」へ名称変更",
        "ゲーム内ログの名称を「アーカイブ」へ統一",
        "アーカイブの新規ログ追従スクロールを修正",
        "スタミナ不足通知をターン開始時のみ表示するよう修正",
        "スタミナ不足回復画面で、回復したプレイヤーを一覧から外さないよう修正",
        "HowlerとDullerにエンティティ別の攻撃ダイス/逃走ダイス設定を実装",
        "エンティティ攻撃ダイスの面内結果を毎回ランダム割り当てに変更",
        "逃走ダイスの面内結果を毎回ランダム割り当てに変更"
      ]
    },
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
        "パッチノートをアコーディオン式に変更",
        "アーカイブエリアのみスクロール・画面固定化",
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
        "Level1「Habitable Zone」実装",
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
