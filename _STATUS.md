# _STATUS.md

## 現在のフェーズ

Phase 2: 完了

## 完了済み

- GitHub リポジトリ作成
- Firebase CLI インストール・ログイン
- Firebase プロジェクト作成（task-app-6e764, asia-northeast1）
- Firestore データベース作成
- Authentication（Google）有効化
- firebase init 完了（Firestore + Hosting）
- Firebase Web App 作成・SDK設定取得
- §1: Vite + React プロジェクト初期化・Firebase SDK インストール
- §2: src/firebase.js 作成（Firebase App/Auth/Firestore 初期化）
- §5: Firestoreセキュリティルール更新・デプロイ（uid 一致のみ許可）
- §3: 認証フロー実装（App.jsx, Login.jsx, main.jsx）
- §4: タスクCRUD・リアルタイムリスナー実装（hooks/useTasks.js）
- §6: UIコンポーネント実装（TaskList, TaskCard, TaskForm, App.css）
- §7: ビルド（エラー・警告なし）・デプロイ完了

## デプロイURL

https://task-app-6e764.web.app

## 次のアクション

手動テスト:
- Googleログイン / ログアウト
- タスク登録・編集・完了切替・削除
- リロード後のデータ永続化確認
- 2タブでのリアルタイム同期確認
