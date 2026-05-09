---
name: rooms-create
description: Backrooms Wikiの情報をもとに、liminal-dice向けのLevel設計Markdownを作成する。Use when Codex needs to research Backrooms levels, entities, objects, groups, and turn them into docs/Levels/Level〇/〇○○.md plus related docs updates for the Backrooms roguelike game.
---

# rooms-create

## 目的

Backrooms Wikiの情報をもとに、`liminal-dice` 用のLevel設計Markdownを作成する。

## 参照元

必要に応じて以下を調査する。

| 種類 | URL |
|---|---|
| Normal Levels | https://backrooms-wiki.wikidot.com/normal-levels-i |
| Unnumbered Levels | https://backrooms-wiki.wikidot.com/unnumbered-levels |
| Entities | https://backrooms-wiki.wikidot.com/entities |
| Unnumbered Entities | https://backrooms-wiki.wikidot.com/unnumbered-entities |
| Objects | https://backrooms-wiki.wikidot.com/objects |
| Groups | https://backrooms-wiki.wikidot.com/groups-list |

## 作成先

Level設計Markdownは以下へ作成する。

```text
docs/Levels/Level〇/〇〇〇.md
```

## 取得内容

### レベル情報

| 項目 | 内容 |
|---|---|
| 名前 | `LEVEL〇：日本語の名前` |
| 生存難易度 | `Class〇` |
| レベルの概要 | どのようなLevelなのか |
| レベルの異常 | どのような異常があるのか |
| レベルの構造 | 屋内か屋外か、水エリアがあるか |
| ゲーム化案 | ダイスイベント、デバフ、特殊アイテム、NPC、団体など |
| 出現エンティティ | Levelで出現するエンティティ |
| 入口 | どのLevelから入るのか |
| 出口 | どのLevelへ出られるのか |
| 取得オブジェクト | Levelで入手できるオブジェクト |

## ゲームシステム作成

### 階層説明文

短く分かりやすく書く。

| 例 | 内容 |
|---|---|
| Level 0 | 無限に広がる黄色い壁紙と湿ったカーペットの部屋。蛍光灯が点滅している。 |
| Level 1 | コンクリートの廊下。かつて何かが存在したような痕跡が残っている。 |

### 階層情報

| 項目 | 書く内容 |
|---|---|
| 屋内・屋外 | 屋内か屋外か |
| 水辺エリア | 有無 |
| 精神異常 | 有無 |
| 危険度 | ゲーム上の危険度 |

### 階層のダイスイベント

基本は**12面ダイス**を想定する。

| Levelの特徴 | イベント方針 |
|---|---|
| 単純 | 探索イベントを多めにする |
| 危険 | エンティティ遭遇イベントを増やす |
| 複雑 | 階層内移動や特殊イベントを増やす |
| 水辺あり | 釣りイベントを検討する |
| 精神異常あり | 精神力に影響するイベントを入れる |

## 更新対象

必要に応じて以下を作成・更新する。

| ファイル | 内容 |
|---|---|
| `docs/Levels/Level〇/〇〇〇.md` | Level設計 |
| `docs/Entities.md` | エンティティ情報 |
| `docs/Items.md` | アイテム情報 |
| `docs/Achievements.md` | 実績情報 |
| `docs/Fishing.md` | 水辺エリアがある場合の釣り情報 |

## 注意事項

- ゲームシステムが複雑になりすぎないようにする。
- 実装済みと未実装を混ぜない。
- Wiki由来の情報は、ゲーム向けに短く整理する。
- Markdown内では絵文字を使用しない。
