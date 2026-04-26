# 三姉妹タスクアプリ Phase 2 実装仕様書

作成日: 2026-04-26
PM: クリーデ
承認済み要件定義: 2026-04-26 開発企画書 v2

## 1. 概要

- 何を作るか: タスクCRUDアプリ（Vite + React + Firebase）
- なぜ作るか: Phase 1（アーティファクト版）をWeb化し、複数端末でのリアルタイム同期を実現する
- 誰が使うか: ショウゴさん（唯一のユーザー）

## 2. ファイル構成

```
task-app/
├── CLAUDE.md
├── _STATUS.md
├── docs/
│   ├── spec.md              # 本ファイル
│   └── instructions.md
├── src/
│   ├── main.jsx             # エントリーポイント
│   ├── App.jsx              # ルートコンポーネント（認証分岐）
│   ├── App.css              # グローバルスタイル
│   ├── firebase.js          # Firebase初期化・エクスポート
│   ├── components/
│   │   ├── Login.jsx        # ログイン画面
│   │   ├── TaskList.jsx     # タスク一覧（タブ切り替え含む）
│   │   ├── TaskCard.jsx     # タスクカード（完了/編集/削除）
│   │   └── TaskForm.jsx     # タスク登録・編集フォーム（モーダル）
│   └── hooks/
│       └── useTasks.js      # Firestoreリアルタイムリスナー
├── public/
├── firestore.rules           # 既存（上書き）
├── firebase.json             # 既存（変更不要）
├── firestore.indexes.json    # 既存（変更不要）
├── package.json
├── vite.config.js
└── index.html
```

新規作成するファイルは上記の通り。既存ファイル（firebase.json, .firebaserc, .gitignore）は変更しない。firestore.rulesは§5で上書きする。

## 3. 技術選定

| 技術 | 理由 |
|------|------|
| Vite + React | 軽量ビルド、HMRが高速、Phase 1がReactで実装済み |
| Firebase JS SDK v10+ (modular) | クライアント直接接続、Tree-shakingによるバンドルサイズ削減 |
| Firebase Auth (Google) | 無料、ショウゴさんのGoogleアカウントで即ログイン |
| Cloud Firestore | リアルタイム同期（onSnapshot）、無料枠で十分 |
| CSS (vanilla) | 依存を最小化。Tailwind等のフレームワークは不使用 |

## 4. 機能仕様

### §1: プロジェクト初期化

- 何を: Vite + React プロジェクトを初期化し、Firebase SDKをインストールする
- どのように:
  1. `npm create vite@latest . -- --template react`（既存ファイルとの競合はスキップ）
  2. `npm install`
  3. `npm install firebase`
  4. 不要な初期ファイル（App.cssのデフォルト内容、assets/等）を整理
- 制約: 既存のfirebase.json, .firebaserc, firestore.rules, firestore.indexes.jsonを消さないこと

### §2: Firebase初期化モジュール

- 何を: src/firebase.js を作成し、Firebase App/Auth/Firestoreを初期化・エクスポートする
- どのように:
  ```js
  import { initializeApp } from 'firebase/app';
  import { getAuth, GoogleAuthProvider } from 'firebase/auth';
  import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: "AIzaSyCsCsRjah82Ix4IYZ-PJyEsBvVSQszvwcg",
    authDomain: "task-app-6e764.firebaseapp.com",
    projectId: "task-app-6e764",
    storageBucket: "task-app-6e764.firebasestorage.app",
    messagingSenderId: "948489874503",
    appId: "1:948489874503:web:3629f0f546f5f1bd249562"
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const provider = new GoogleAuthProvider();
  export const db = getFirestore(app);
  ```
- 制約: 設定値はここに直書きする（環境変数化は不要。クライアントSDKの設定値は公開前提）

### §3: 認証フロー

- 何を: Googleログイン/ログアウトを実装する
- どのように:
  - App.jsx で onAuthStateChanged を監視し、ログイン済みならTaskListを、未ログインならLoginを表示
  - Login.jsx に「Googleでログイン」ボタンを配置。signInWithPopup を使用
  - ログアウトボタンをヘッダーに配置
- 制約:
  - signInWithRedirect は使わない（ローカルテスト時に問題が出やすいため）
  - ユーザーのdisplayNameをヘッダーに表示する

### §4: タスクCRUDとリアルタイムリスナー

- 何を: hooks/useTasks.js にFirestoreの読み書きロジックを集約する
- どのように:
  - **読み取り**: onSnapshot で `tasks` コレクションをリアルタイム監視。createdAtの降順でソート。uidが現在のユーザーと一致するドキュメントのみ取得（queryのwhere句）
  - **登録**: addDoc で新規ドキュメントを追加。uid, createdAt（serverTimestamp）を自動付与
  - **更新**: updateDoc でtitle, category, note, statusを更新
  - **完了切替**: updateDoc で status を "active"⇔"done" に切替。completedAt を設定/null化
  - **削除**: deleteDoc でドキュメントを削除
- 制約:
  - コレクション名は `tasks`
  - createdAt, completedAt には serverTimestamp() を使用する（クライアント時刻ではなくサーバー時刻）
  - onSnapshotのunsubscribeをuseEffectのクリーンアップで確実に呼ぶ

### §5: Firestoreセキュリティルール

- 何を: firestore.rules を以下の内容で上書きする
- どのように:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /tasks/{taskId} {
        allow read, update, delete: if request.auth != null
                                    && resource.data.uid == request.auth.uid;
        allow create: if request.auth != null
                      && request.resource.data.uid == request.auth.uid;
      }
    }
  }
  ```
- 制約: 上書き後 `firebase deploy --only firestore:rules` でデプロイすること

### §6: UIコンポーネント

- 何を: Phase 1と同等のUI（TaskList, TaskCard, TaskForm）をReactコンポーネントとして実装する
- どのように:
  - **TaskList.jsx**: タブ切り替え（進行中/完了/すべて）、タスク件数表示、FABボタン
  - **TaskCard.jsx**: チェックボックス（完了切替）、タイトル・メモ・カテゴリ表示、編集・削除ボタン、削除確認
  - **TaskForm.jsx**: モーダル形式。タイトル入力、カテゴリ選択（12種）、メモ入力、登録/保存ボタン
  - **Login.jsx**: 中央配置のログインボタン。アプリ名を表示
- 制約:
  - CSS変数で色管理。Phase 1のカラースキームを踏襲:
    - ハコネ: #e85d75
    - クリーデ: #3a7ca5
    - フラン: #7b68ae
    - 背景: #faf8f5
    - テキスト: #2c2420
  - モバイルファースト（max-width: 480px基準）、PCでも閲覧可（中央寄せ、max-width: 480px）
  - FABボタンのグラデーションは三姉妹カラー（Phase 1と同じ）
  - フォントはsans-serifのシステムフォント（Google Fontsは不使用。Phase 3でKlee Oneを検討）

**カテゴリ一覧（Phase 1から継承）:**

| id | emoji | label |
|----|-------|-------|
| cleaning | 🧹 | 掃除 |
| shopping | 🛒 | 買い物 |
| cooking | 🍳 | 料理 |
| maintenance | 🔧 | 整備 |
| plants | 🪴 | 植物 |
| rearrange | 📦 | 模様替え |
| dev | 💻 | 開発 |
| study | 📚 | 勉強 |
| health | 🏃 | 運動 |
| admin | 📋 | 事務 |
| play | 🎮 | 遊び |
| other | 🌟 | その他 |

### §7: 動作確認とデプロイ

- 何を: ローカルで動作確認後、Firebase Hostingにデプロイする
- どのように:
  1. `npm run dev` でローカル起動。ブラウザで動作確認
  2. Googleログイン → タスク登録・編集・完了・削除を確認
  3. `npm run build` でプロダクションビルド
  4. `firebase deploy` でHostingとFirestoreルールをデプロイ
  5. デプロイURLを報告
- 制約: ビルドエラー・警告がないことを確認してからデプロイ

## 5. テスト方針

| テスト対象 | 方法 | 合格条件 |
|-----------|------|---------|
| Googleログイン | 手動 | ログイン・ログアウトが正常に動作 |
| タスクCRUD | 手動 | 登録・編集・完了切替・削除がすべて動作 |
| データ永続化 | 手動 | リロードしてもタスクが消えない |
| リアルタイム同期 | 手動（2タブ） | 一方のタブでの変更が他方に即座に反映 |
| セキュリティ | 手動 | 未ログイン状態でFirestoreにアクセスできない |
| レスポンシブ | 手動（DevTools） | モバイル幅で崩れない |
| ビルド | npm run build | エラー・警告なし |
