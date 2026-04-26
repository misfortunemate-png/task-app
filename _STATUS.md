# _STATUS.md

## 現在のフェーズ

Phase 4: 拡張機能 — **実装完了（受入待ち）** 2026-04-26

## Phase 4 成果

### ブロック①基盤（§B0/§B1/§B2）
- メニュー上部集約（1層目MainMenu + 2層目SubNav、合計約60px）
- motion / canvas-confetti 導入
- characters.js: bio追加、lines.js: timeSlot/rarity対応 + pickLine拡張
- firestore.rules: users/{uid} + tasks.rewardPrompt 許可
- src/utils/indexeddb.js: ギャラリーDB CRUD

### ブロック②URLリンク登録（§1）
- src/utils/urlImport.js: `#import/<URLセーフBase64>` 解析
- App→TaskList→TaskFormにプリフィル伝播、背景色強調
- lines.js: ランタイム IMPORTED_LINES（ローカルマージ）
- rewardPrompt は Firestore保存

### ブロック③セリフ拡張（§5/§6）
- 時間帯セリフ追加（complete×3キャラ×4timeSlot）
- ★4/★5レアセリフ追加
- DialogModal: motion入退場 + canvas-confetti演出（★4光彩、★5金色枠+バッジ+花火+emoji紙吹雪）
- SettingsScreen: timeSlot手動切替、強制レア度ドロップダウン

### ブロック④キャラ画面（§2/§3）
- CharScreen: 2層目選択でIndividual/Rankingに分岐
- CharIndividualScreen: つんつん（5段階・累計Firestore保存・セッションsessionStorage）+ キャラ情報カード（bio/累計/完了数/カテゴリTOP3/paramsバー）
- RankingScreen: 今週月-日の完了数比較、棒グラフ + champion + ランキング専用セリフ

### ブロック⑤ガチャ（§4）
- src/data/gachaPrizes.js: 各キャラ×各レア度×2件以上、計30件
- GachaScreen: チケット消費 + マスター権限ボタン + アイテム倉庫グリッド
- GachaResultModal: レア度別演出（★3軽confetti, ★4光彩, ★5金枠+花火+emoji）
- TaskScreen: タスク完了時 +1チケット付与

### ブロック⑥ギャラリー（§7）
- src/utils/image.js: resize 800px/q75 + thumb 400px/q60
- Gallery.jsx: 3列グリッド、+セルでファイル選択、IndexedDB保存
- M8拡大表示: 全画面 + 前後ナビ + 削除
- DialogModal: rewardPrompt がある完了モーダルにプロンプトコピーボタン

### 最終
- useTasks: 月曜起動時 前週(月-日)の完了タスクを削除（lastResetWeekで重複防止）
- 全機能 npm run build 通過（491 modules、警告なし）

## 既知の制限事項

- 表情差分は未制作（default.png + emoji 併用継続）
- 通知画面は引き続きプレースホルダー（仕様外）
- IndexedDBの画像データはブラウザ単位（端末間同期なし）

## 次のアクション

- マスター（ショウゴ）受入確認 → コミット
- Firestore Rules デプロイ（`firebase deploy --only firestore:rules`）
- Firestore Hosting デプロイ後、Pixel 10実機で各テスト項目（#1-23）の確認
