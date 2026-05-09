---
name: rooms-integrate
description: docs内のLevel設計Markdownを読み込み、liminal-diceへ新しいLEVEL〇を追加する。Use when Codex needs to integrate a documented Backrooms level into game-data.js, docs, events, entities, items, fishing, achievements, and changelog.
---

# rooms-integrate

## 目的

`docs/Levels/Level〇/〇〇〇.md` にまとめられたLevel設計を、ゲーム本体へ反映する。

## 読み込む資料

作業前に `docs/` 内のMarkdownを確認する。

| ファイル | 確認内容 |
|---|---|
| `docs/GameSystem.md` | 既存システム |
| `docs/Changelog.md` | 更新履歴 |
| `docs/Jobs.md` | 職業 |
| `docs/Levels/` | 追加対象Level |
| `docs/Entities.md` | エンティティ |
| `docs/Fishing.md` | 釣り |
| `docs/Items.md` | アイテム |
| `docs/Achievements.md` | 実績 |
| `docs/Endings.md` | エンディング |

## 更新内容

| 項目 | 内容 |
|---|---|
| 階層追加 | `game-data.js` の `levels` に追加 |
| ダイスイベント | Levelの特徴に合わせて追加 |
| エンティティ追加 | 必要な場合のみ追加 |
| アイテム追加 | 必要な場合のみ追加 |
| 釣り追加 | 水辺エリアがある場合のみ検討 |
| 実績更新 | 必要な場合のみ追加 |
| GameSystem更新 | 実装内容に合わせて更新 |
| Changelog更新 | 変更内容を記録 |

## 実装ルール

- ゲームバランスを大きく変えない。
- 既存Levelの挙動を壊さない。
- `game-data.js` の構造を大きく変えない。
- 表示文は日本語を基本にする。
- 新しい要素は小さく段階的に追加する。
- 未使用データを増やしすぎない。

## 作業の基本的な流れ

| 順番 | 作業 |
|---|---|
| 1 | ブランチ作成 |
| 2 | ファイル変更 |
| 3 | 動作確認 |
| 4 | ユーザー動作確認 |
| 5 | 必要に応じてREADME.mdを更新する |
| 6 | コミット |
| 7 | プッシュ |
| 8 | Pull Request作成 |
| 9 | マージ |
| 10 | 不要ブランチの削除 |

## 確認項目

| 確認 | 内容 |
|---|---|
| 起動 | ゲームが起動する |
| Level移動 | 新しいLevelへ移動できる |
| ダイス | イベントが発生する |
| アイテム | 取得・使用が動く |
| 戦闘 | エンティティ遭遇時に進行できる |
| セーブ | 追加後も保存できる |
| ロード | 追加後も読み込める |

## 注意事項

- 実装内容とdocsの内容を一致させる。
- 未実装の案を実装済みとして書かない。
- 変更後は不要な差分がないか確認する。
