# 三姉妹タスクアプリ

ショウゴさんの生活を三姉妹（ハコネ・クリーデ・フラン）が見守るタスク管理アプリ。

## デプロイ

https://task-app-6e764.web.app

## 技術スタック

- Vite + React
- Firebase: Firestore / Authentication (Google) / Hosting
- Firebaseプロジェクト: task-app-6e764（asia-northeast1）
- Googleアカウント: misfortunemate@gmail.com

## フェーズ構成

| Phase | 内容 | 状態 |
|-------|------|------|
| 1 | claude.aiアーティファクトでプロトタイプ | 完了 |
| 2 | GitHub + Firebase + Vite/React基盤。CRUD + リアルタイム同期 | 完了（2026-04-26） |
| 3 | キャラクター統合（担当選択・セリフ・ライフサイクル） | 完了（2026-04-26） |
| 4+ | 拡張機能（ガチャ・つんつん・ストリーク等） | 未着手 |

## 開発体制

| 役割 | 担当 | 環境 |
|------|------|------|
| 発注者 | ショウゴさん | — |
| PM | ハコネ（Opus）※Phase 2はクリーデ | claude.ai |
| PG | Sonnet | Claude Code on フラン |

プロセス定義: devスキル process.md に準拠。

## Phase 3 成果

- メインメニュー5タブ構造（タスク / 通知 / キャラ / ガチャ / 設定）
- 担当キャラ選択（タスク登録時）・キャラタブ（フィルタ＋テーマ切替）
- セリフ表示システム（モーダル、登録・達成・放置・キャンセルの4イベント）
- セリフ選択ロジック（カテゴリ専用 > generic > ランダム抽選）
- 完了予定日（任意入力、「今日」「明日」ショートカット）
- 放置判定（期限翌日に発火、クライアント起動時判定）
- なでなでロック解除（タップ→期限延長の制限解除）
- 設定画面（デフォルトタブ / なでなで回数 / デバッグモード）
- デバッグモード（セリフ強制表示 / 放置トリガー / カウンター / セリフ一覧 / パラメータ変更）
- エラーハンドリング（トースト通知 / フォールバックセリフ / バリデーション）
- キャラ画像（default.png + emoji併記。差分なし表情はemoji表示）
- キャラ定義マスター（パラメータ5種：baseMood / moodModifier / taskLoyalty / skinshipTolerance / neglectTolerance）
- Klee One / Zen Maru Gothic フォント
- 通知 / キャラ / ガチャ画面はプレースホルダー（Coming Soon + セリフ）

## Phase 4に持ち越す事項

### スコープ外として確定済み

- レアセリフ演出（★1〜★5）
- 姉妹コンボ（三姉妹コンプリート）
- 連続記録ボーナス（ストリーク）
- 時間帯セリフ（朝昼夜深夜）
- いたずらタスク（キャラが勝手にタスク追加）
- 担当キャラ実績ランキング
- 無駄ガチャ
- つんつん機能（意味のない愛玩。放置時のなでなでは別）
- ご褒美画像＆記念ギャラリー
- セリフデータのインポート/エクスポートUI
- ご機嫌システムの動的変動・セリフ選択への反映
- ムード補正の時間帯判定

### 既知の制限事項

- 表情差分は未制作（サーフェス表: 3キャラ × 12表情 = 36差分）
- キャラパラメータはデータ保持のみ、ロジック未使用

## 原資料

- `docs/spec.md` — Phase 2 実装仕様書
- `docs/instructions.md` — Phase 2 PG向け作業指示書
- `docs/spec-phase3.md` — Phase 3 実装仕様書
- `docs/instructions-phase3.md` — Phase 3 PG向け作業指示書
- planning-note.html — ハコネ企画ノート v0.1（claude.aiチャットに添付）

## 環境情報

- 作業ディレクトリ: D:\AI\github\task-app
- Node.js: v24.15.0 / npm: v11.12.1
- Firebase CLI: インストール済み・misfortuneアカウントでログイン済み
- PowerShell: 実行ポリシー RemoteSigned（CurrentUser）
- OS: Windows 11
