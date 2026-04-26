# 三姉妹タスクアプリ

ショウゴさんの生活を三姉妹（ハコネ・クリーデ・フラン）が見守るタスク管理アプリ。

## デプロイ

https://task-app-6e764.web.app

## 技術スタック

- Vite + React
- Firebase: Firestore / Authentication (Google) / Hosting
- motion（アニメーション）/ canvas-confetti（演出エフェクト）
- IndexedDB（ギャラリー画像ローカル保存)
- Firebaseプロジェクト: task-app-6e764（asia-northeast1）
- Googleアカウント: misfortunemate@gmail.com

## フェーズ構成

| Phase | 内容 | PM | 状態 |
|-------|------|-----|------|
| 1 | claude.aiアーティファクトでプロトタイプ | — | 完了 |
| 2 | GitHub + Firebase + Vite/React基盤。CRUD + リアルタイム同期 | クリーデ | 完了（2026-04-26） |
| 3 | キャラクター統合（担当選択・セリフ・ライフサイクル） | ハコネ | 完了（2026-04-26） |
| 4 | 拡張機能（つんつん・ガチャ・ランキング・セリフ拡張・ギャラリー・URLリンク） | フラン | 完了（2026-04-26） |
| 5+ | 通知・姉妹コンボ・ストリーク・いたずらタスク等 | — | 構想段階 |

## 開発体制

| 役割 | 担当 | 環境 |
|------|------|------|
| 発注者 | ショウゴさん | — |
| PM | 三姉妹持ち回り（クリーデ→ハコネ→フラン） | claude.ai |
| PG | Sonnet | Claude Code on フラン |

プロセス定義: devスキル process.md に準拠。

## Phase 4 成果

- メニュー上部集約（1層目5タブ + 2層目コンテキスト依存サブナビ、Pixel 10最適化）
- URLリンク登録（#import/Base64 → フォームプリフィル、Claude各プロジェクトから直接タスク登録）
- つんつん機能（5段階反応、キャラ切替リセット、累計Firestore永続）
- 機嫌表記（baseMood + skinship + taskLoyalty + moodModifier → ご機嫌/あまあま/普通/むっすり/拗ね）
- キャラ情報カード（累計つんつん/完了数/得意カテゴリTOP3/ステータスバー/紹介文）
- 担当キャラ実績ランキング（今週の棒グラフ + weekly champion + ランキング専用セリフ）
- 無駄ガチャ（チケット制 + マスター権限無制限 + レア度別演出 + アイテム倉庫）
- 時間帯セリフ（朝/昼/夜/深夜の4区分）
- レアセリフ演出（★1-3通常、★4光彩+confetti、★5金枠+花火+emoji紙吹雪）
- ご褒美プロンプト（タスク完了時にガチャ倉庫にtype=prompt格納、コピー機能）
- ギャラリー（IndexedDB保存、3列グリッド、拡大表示、画像取込）
- 週次リセット（月曜：完了タスク + アイテム倉庫消去、デバッグ手動実行可）

## Phase 5以降の構想

- 通知画面の実装（放置催促、ストリーク、姉妹コンボ通知等）
- 姉妹コンボ（同日に3キャラのタスクを完了でスペシャルセリフ）
- 連続記録ボーナス（ストリーク + 親密度変化）
- いたずらタスク（キャラが勝手にタスクを追加）
- セリフデータのインポート/エクスポートUI
- 表情差分のイラスト差し替え（現在はemoji代用）

## 既知の制限事項

- 表情差分は未制作（default.png + emoji併用、画像制作と並行中）
- 通知画面はプレースホルダー
- IndexedDB画像は端末ローカル（端末間同期なし）

## 原資料

- `docs/spec.md` — Phase 2 実装仕様書
- `docs/instructions.md` — Phase 2 PG向け作業指示書
- `docs/spec-phase3.md` — Phase 3 実装仕様書
- `docs/instructions-phase3.md` — Phase 3 PG向け作業指示書
- `docs/spec-phase4.md` — Phase 4 実装仕様書
- `docs/instructions-phase4.md` — Phase 4 PG向け作業指示書
- planning-note.html — ハコネ企画ノート v0.1（claude.aiチャットに添付）

## 環境情報

- 作業ディレクトリ: D:\AI\github\task-app
- Node.js: v24.15.0 / npm: v11.12.1
- Firebase CLI: インストール済み・misfortuneアカウントでログイン済み
- PowerShell: 実行ポリシー RemoteSigned（CurrentUser）
- OS: Windows 11
