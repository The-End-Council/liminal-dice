---
name: review-driven-system-update
description: docs/reviewsの最新レビューMarkdownを読み込み、liminal-diceのゲームシステムを安全に改善する。Use when Codex needs to evaluate review feedback, prioritize risks, and update Backrooms roguelike systems without blindly applying every suggestion.
---

# review-driven-system-update

## 目的

`docs/reviews` の最新レビューMarkdownを読み込み、指摘内容をもとに `liminal-dice` のゲームシステムを改善する。

このSkillは、レビュー内容をそのまま実装するためではない。
重要度・リスク・影響範囲を判断して、安全にアップデートするために使う。

## 読み込む資料

| 対象 | 内容 |
|---|---|
| `docs/reviews/` | 最新レビューMarkdown |
| `docs/GameSystem.md` | 現在のゲームシステム |
| `docs/Jobs.md` | 職業 |
| `docs/Items.md` | アイテム |
| `docs/Entities.md` | エンティティ |
| `docs/Achievements.md` | 実績 |
| `game-data.js` | 実装データ |
| `js/` | 実装ロジック |

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
| 9 | ユーザー確認 |
| 1 | マージ |
| 11 | 不要ブランチの削除 |

## 作業手順

| 順番 | 内容 |
|---|---|
| 1 | `docs/reviews` の最新Markdownを確認する |
| 2 | 指摘内容をカテゴリ分けする |
| 3 | 重要度とリスクを判断する |
| 4 | 実装すべき内容を選ぶ |
| 5 | 小さく安全に修正する |
| 6 | docsを更新する |
| 7 | 動作確認する |

## 判断基準

| 観点 | 内容 |
|---|---|
| 重要度 | 進行不能、バグ、遊びやすさ、表記の順で優先 |
| リスク | 既存機能やゲームバランスへの影響を見る |
| 影響範囲 | `game-data.js`、`js/`、docsのどこへ影響するか確認 |
| 実装量 | 小さく直せるものを優先 |
| 保守性 | 今後のLevel追加に役立つか確認 |

## 出力方針

| 出力 | 内容 |
|---|---|
| 変更内容 | 何を直したか |
| 判断理由 | なぜ直したか |
| 見送った内容 | なぜ今は入れないか |
| 確認結果 | どこまで確認したか |

## 注意事項

- レビュー内容を無条件に実装しない。
- ゲームバランス変更は慎重に行う。
- 新機能追加は必要性を確認する。
- docsと実装の差を残さない。
- Markdown内では絵文字を使用しない。
