# 三姉妹タスクアプリ Phase 5 実装仕様書

作成日: 2026-04-26
PM: クリーデ
改訂: Rev.1（依存関係整合性チェック反映）
承認済み要件定義: 20260426_task-app_phase5_requirements.md

---

## 1. 概要

- 何を作るか: PWA化、通知、画像添付、データ入出力、Markdown対応等の実用性強化
- なぜ作るか: 「毎日開いて使う道具」にする
- 誰が使うか: ショウゴさん（Pixel 10）

---

## 2. ファイル構成（差分）

既存構成への追加・変更のみ記載する。

```
task-app/
├─ public/
│   ├─ manifest.json          ← 新規: PWA用マニフェスト
│   ├─ icons/                 ← 新規: PWAアイコン群
│   │   ├─ icon-192.png
│   │   └─ icon-512.png
│   ├─ offline.html           ← 新規: オフラインフォールバック
│   └─ characters/            ← 移動: src/assets/characters/ から移動
│       ├─ hakone/
│       │   └─ default.png
│       ├─ cleade/
│       │   └─ default.png
│       └─ frane/
│           └─ default.png
│
├─ src/
│   ├─ firebase.js            ← 変更: Storage SDK 追加
│   ├─ components/
│   │   └─ TaskCard.jsx       ← 変更: 画像表示・コピーボタン・復活ボタン・Markdown表示
│   │   └─ TaskForm.jsx       ← 変更: 画像添付UI追加
│   │   └─ SettingsScreen.jsx ← 変更: インポート/エクスポートUI追加
│   │   └─ TaskScreen.jsx     ← 変更: 通知許可リクエスト追加
│   ├─ hooks/
│   │   └─ useTasks.js        ← 変更: deleteTaskシグネチャ変更、画像連動削除
│   ├─ utils/
│   │   ├─ charImage.js       ← 変更: public/参照 + onerrorフォールバック方式へ
│   │   ├─ compress.js        ← 新規: 画像リサイズ・圧縮
│   │   ├─ storage.js         ← 新規: Firebase Storage 操作
│   │   ├─ exportImport.js    ← 新規: JSON エクスポート/インポート
│   │   ├─ clipboard.js       ← 新規: タスク内容クリップボードコピー
│   │   └─ notification.js    ← 新規: Web Notification 制御
│   └─ assets/characters/     ← 削除: public/characters/ に移動
│
├─ storage.rules               ← 新規: Firebase Storage セキュリティルール
├─ firebase.json               ← 変更: storage設定追加
├─ vite.config.js              ← 変更: PWAプラグイン設定追加
└─ package.json                ← 変更: 依存追加
```

### ファイル構成変更の理由（R-006準拠・発注者承認済み）

| 変更 | 理由 |
|------|------|
| src/assets/characters/ → public/characters/ | import.meta.globはビルド時解決のため画像追加に再ビルド+コード変更が必要。public/に移すことで「画像を置いてデプロイするだけ」を実現する |
| firebase.js にStorage追加 | 画像添付機能（F-04）の前提 |
| 新規utilsファイル群 | 各機能の関心を分離し、既存コードへの影響を最小化する |
| storage.rules 新規 | Firebase Storageのセキュリティルール（uidベースアクセス制御） |

---

## 3. 技術選定

| 技術 | 理由 |
|------|------|
| vite-plugin-pwa | ViteプロジェクトでのPWA化の標準的選択。Service Worker + manifestの自動生成。Workboxベース |
| Firebase Storage (Web SDK v9+) | 既にFirestore/AuthのSDKを使用しており、同一パッケージ（firebase ^11）内で追加設定のみで利用可能 |
| Canvas API | クライアント側画像圧縮。外部ライブラリ不要 |
| react-markdown | 軽量Markdownレンダリング。React 19環境での注意事項あり（§9参照） |
| Web Notification API | ブラウザ標準API。Service Worker不要でシンプルに通知を出せる |
| Clipboard API (navigator.clipboard) | ブラウザ標準。HTTPS環境（Firebase Hosting）で利用可能 |

---

## 4. 依存関係整合性（PMチェック済み）

PMが既存コードの依存グラフを事前検証し、本仕様書の変更が波及する範囲を確定した。以下はその結果である。

### 4.1 確認済みの依存関係

| 変更対象 | 依存元（参照しているファイル） | 影響 |
|----------|-------------------------------|------|
| firebase.js | 全コンポーネント・フック | exportの追加のみ。既存exportに変更なし。影響なし |
| charImage.js | CharImage.jsx のみ | CharImage.jsxと同時に変更。影響は閉じている |
| CharImage.jsx | DialogModal, TaskCard, CharScreen, CharIndividualScreen, NadeModal, GachaResultModal 等 | propsインターフェース不変。呼び出し側変更不要 |
| useTasks.js（deleteTask） | TaskCard.jsx（主）、他deleteTask呼び出し元 | §4でシグネチャ変更あり。呼び出し側の修正が必要（§4.2参照） |
| characters.js | 各コンポーネント | 変更なし |

### 4.2 PGへの指示（厳守）

**依存先の変更禁止**: 上記で確認済みのファイル間依存関係を、PGの判断で変更してはならない。たとえば、charImage.jsの参照元を増やす、useTasks.jsのexportインターフェースを変える等の設計変更は禁止する。

**エスカレーション義務**: 実装中に依存関係の不整合（想定外のimport、シグネチャの不一致、型の不適合等）が発生した場合、自律的に解決を試みず、作業を停止しPMに報告すること。PMが依存グラフを再検証した上で対処方針を指示する。

---

## 5. 機能仕様

### §1: Firebase Storage 基盤整備

- **何を**: firebase.js に Firebase Storage SDK を追加し、セキュリティルールを設定する
- **変更対象**: firebase.js, storage.rules, firebase.json
- **firebase.js 追加内容**:
  ```js
  import { getStorage } from 'firebase/storage';
  export const storage = getStorage(app);
  ```
  ※ 既存の app, auth, provider, db のexportは一切変更しない
- **storage.rules**:
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /users/{userId}/{allPaths=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```
- **firebase.json**: storage項目を追加（rules参照）
- **制約**: Sparkプラン（5GB Storage / 1GB転送/日）内で運用

### §2: PWA化

- **何を**: Service Worker + Web App Manifest を導入し、ホーム画面起動を可能にする
- **vite.config.js**: vite-plugin-pwa を追加設定する
  - registerType: 'autoUpdate'（バックグラウンドで自動更新）
  - manifest: アプリ名「三姉妹タスク」、テーマカラー（既存のアプリテーマに合わせる）、start_url: '/'、display: 'standalone'
  - workbox.runtimeCaching: Firestoreリクエストはネットワーク優先（NetworkFirst）、静的アセットはキャッシュ優先（CacheFirst）
- **既存のvite.config.js構造**: plugins配列にreact()が既にある。PWAプラグインを同配列に追加する形。build.chunkSizeWarningLimitの設定は維持すること
- **public/offline.html**: オフライン時のフォールバック画面。シンプルな表示
- **PWAアイコン**: 192x192 と 512x512 の2サイズ。仮アイコンで可（発注者が後から差し替える）
- **制約**: 完全オフラインCRUDは実装しない

### §3: 通知機能（放置タスク通知）

- **何を**: アプリ起動時に放置タスクを検出し、Web Notification API で通知を表示する
- **新規ファイル**: src/utils/notification.js
- **ロジック**:
  1. アプリ起動時（App.jsxまたはTaskScreen.jsx のマウント時）に通知許可を確認
  2. 許可がなければ `Notification.requestPermission()` で許可を求める
  3. 許可済みの場合、既存の放置判定ロジック（期限翌日に放置フラグ）の結果を参照
  4. 放置タスクがあれば `new Notification()` で通知を表示
  5. 通知をタップしたらアプリにフォーカス（タスク一覧へ）
- **通知内容**: 「📘 クリーデ: 「放置されてるタスクがあるよ」（3件）」のように担当キャラのセリフ風
- **制約**: 通知は起動時に1回。連打しない。同じセッション内で繰り返さない

### §4: 画像添付

- **何を**: タスク登録・編集時に参考画像を添付できるようにする
- **新規ファイル**: src/utils/compress.js, src/utils/storage.js
- **Firestoreスキーマ拡張**: タスクドキュメントに `imageUrl` フィールド（string | null）を追加
- **Firebase Storageパス**: `users/{uid}/tasks/{taskId}/{filename}`

#### §4.1 アップロードフロー
  1. TaskForm.jsx に画像選択UIを追加（`<input type="file" accept="image/*" capture="environment">`）
  2. 選択された画像を compress.js でリサイズ・圧縮
  3. 圧縮後の画像を storage.js 経由で Firebase Storage にアップロード
  4. ダウンロードURLを取得し、Firestoreのタスクドキュメントの `imageUrl` に保存

#### §4.2 deleteTask シグネチャ変更（RISK-1対応）

現在の `deleteTask(id)` を `deleteTask(task)` に変更する。

**変更理由**: 画像連動削除に `task.imageUrl` が必要。`toggleDone(task)` と同じ引数パターンに揃える。

**変更内容**:
```js
// 変更前
const deleteTask = async (id) => {
  await deleteDoc(doc(db, 'tasks', id))
}

// 変更後
const deleteTask = async (task) => {
  // imageUrlがあればStorageから画像を削除
  if (task.imageUrl) {
    await deleteStorageFile(task.imageUrl)  // storage.jsのヘルパー
  }
  await deleteDoc(doc(db, 'tasks', task.id))
}
```

**呼び出し側の修正**: `deleteTask(id)` → `deleteTask(task)` に変更する。対象は TaskCard.jsx 等の deleteTask 呼び出し箇所すべて。呼び出し側は task オブジェクトを既に保持しているため、変更は `deleteTask(task.id)` → `deleteTask(task)` の書き換えのみ。

**注意**: deleteTask の return 値 `{ tasks, addTask, updateTask, toggleDone, deleteTask }` のインターフェースは変更しない。変わるのはシグネチャ（引数の型）のみ。

#### §4.3 compress.js 仕様
  - Canvas APIで長辺1200pxにリサイズ
  - canvas.toBlob() でJPEG品質0.7で出力
  - 300KBを超える場合、品質を0.05刻みで下げて再試行（下限0.3）
  - 入力: File/Blob → 出力: Blob（JPEG）

#### §4.4 表示
  - TaskCard.jsx にサムネイル表示。タップで拡大表示（モーダルまたは新タブ）
  - 制約: 1タスクにつき画像1枚。複数添付はPhase 5では対応しない

### §5: インポート/エクスポート

- **何を**: タスクデータ全体をJSONでエクスポート・インポートする
- **新規ファイル**: src/utils/exportImport.js
- **UIの配置**: SettingsScreen.jsx にエクスポートボタンとインポートボタンを追加

#### §5.1 エクスポート仕様
  - Firestoreから全タスク（進行中+完了）を取得
  - usersコレクションのユーザードキュメントも含める（ガチャ・つんつん等の状態）
  - JSON形式でBlobを生成し、`<a download>` でダウンロード
  - ファイル名: `task-app-backup-YYYYMMDD.json`
  - 画像データ自体はエクスポートに含めない（Firebase Storage上のURLのみ記録）

#### §5.2 インポート仕様（RISK-2対応: 画像クリーンアップ追記）
  - JSONファイルをアップロード
  - **完全上書き**: 以下の順序で実行する
    1. 確認ダイアログを表示（「現在のデータはすべて上書きされます。よろしいですか？」）
    2. 処理中はローディング表示
    3. **既存全タスクを取得し、imageUrlを持つタスクのStorage画像を全削除する**
    4. 既存全タスクをFirestoreから削除
    5. インポートデータを新規ドキュメントとしてFirestoreに書き込み
    6. ユーザードキュメントを上書き
  - **注意**: ステップ3の画像削除が失敗した場合（Storage上に画像が既に存在しない等）、エラーを無視して続行する（孤児画像よりデータ復元を優先）

#### §5.3 制約
  - 画像はURLのみ保持。元のStorage画像が削除済みの場合は表示されない（許容）

### §6: クリップボードコピー

- **何を**: タスク内容をワンタップでクリップボードにコピーする
- **新規ファイル**: src/utils/clipboard.js
- **UIの配置**: TaskCard.jsx にコピーアイコンボタンを追加
- **コピーフォーマット**:
  ```
  【タスク】{title}
  【カテゴリ】{category}
  【担当】{characterName}
  【期限】{dueDate || "なし"}
  【メモ】{note || "なし"}
  【画像】{imageUrl ? "添付あり" : "なし"}
  ```
- **実装**: `navigator.clipboard.writeText(text)` を使用
- **コピー完了通知**: 既存のToastコンポーネントで「コピーしました」を表示
- **制約**: HTTPS必須（Firebase Hostingなので問題なし）

### §7: 画像差分フォルダベース管理

- **何を**: キャラ画像の参照方式を変更し、画像追加を容易にする
- **変更対象**: src/utils/charImage.js, src/components/CharImage.jsx, src/assets/characters/（削除）, public/characters/（新設）
- **依存関係確認済み**: charImage.js をimportしているのは CharImage.jsx のみ。CharImage.jsx のpropsインターフェースは変更しない。したがって、CharImage.jsx の呼び出し元（DialogModal, TaskCard, CharScreen, CharIndividualScreen, NadeModal, GachaResultModal 等）に影響なし

#### §7.1 移行手順
  1. src/assets/characters/ の全画像を public/characters/ にコピー
  2. charImage.js を以下の方式に書き換え
  3. CharImage.jsx を onError フォールバック方式に書き換え
  4. 動作確認（全画面でキャラ画像が正常表示されること）
  5. 確認後、src/assets/characters/ を削除

#### §7.2 新charImage.js
  - `import.meta.glob` を廃止
  - 画像URLは `/characters/{charId}/{faceKey}.png` で静的に生成
  - 存在チェックは行わない（img の onError に委ねる）

  ```js
  // 新しいAPI
  export const getCharImageSrc = (charId, faceKey = 'default') => ({
    faceSrc: `/characters/${charId}/${faceKey}.png`,
    defaultSrc: `/characters/${charId}/default.png`,
  })
  ```

  ※ 旧API `resolveCharImage` は廃止。呼び出し元は CharImage.jsx のみであり影響は閉じている

#### §7.3 CharImage.jsx の変更
  - `resolveCharImage` → `getCharImageSrc` に変更
  - `<img>` に `onError` ハンドラを設定
  - フォールバックチェーン: faceSrc → defaultSrc → emoji表示
  - **propsインターフェースは変更しない**（characterId, faceKey, faceEmoji, charEmoji, size, className）
  - 内部でReact state（useState）を使い、読み込み失敗時にフォールバック段階を管理する

#### §7.4 運用
  - 命名規則: 表情名.png（小文字英字、セリフデータのexpressionフィールドと一致）
  - 画像フォーマット: PNG推奨、透過背景
  - 画像追加手順: PNG画像を public/characters/{charId}/ に配置 → `firebase deploy` でデプロイ。コード変更不要
  - キャラID: hakone / cleade / frane（characters.js の id フィールドに準拠）

### §8: 完了タスクの復活（NOTE-1対応）

- **何を**: 完了済みタスクを「進行中」に戻すUIを追加する
- **既存ロジックの確認**: useTasks.js の `toggleDone` は既に双方向トグル実装済み
  ```js
  status: task.status === 'done' ? 'active' : 'done',
  completedAt: task.status === 'done' ? null : serverTimestamp(),
  ```
  したがって、新規メソッドの追加は不要。
- **必要な変更はUIのみ**: 完了タスクのTaskCardに「復活」ボタン（またはアイコン）を表示し、既存の `toggleDone` を呼び出す。進行中タスクには復活ボタンを表示しない
- **セリフ反応**: PG裁量。registerイベントのセリフを再利用するか、専用の復活セリフを追加するか、どちらでもよい
- **制約**: useTasks.js の toggleDone ロジック自体には手を入れない

### §9: Markdownメモ表示（NOTE-2対応）

- **何を**: タスクのメモ欄表示にMarkdownレンダリングを適用する
- **変更対象**: TaskCard.jsx（または新規のMemoRenderer.jsx）
- **ライブラリ**: react-markdown
- **対応Markdown構文**: 箇条書き（`-`, `*`）、太字（`**`）、リンク（`[text](url)`）、改行
- **編集時**: プレーンテキスト入力のまま（TextAreaに変更なし）
- **表示時**: react-markdownでレンダリング。リンクは `target="_blank"` で外部遷移

#### §9.1 React 19 互換性対応
  - react-markdown v9 は React 18+ を対象としており、React 19（当プロジェクト: react ^19.0.0）では `npm install` 時にpeer dependency警告が出る可能性がある
  - **対応**: 警告が出た場合は `npm install react-markdown --legacy-peer-deps` で対応する
  - インストール後、メモのMarkdown表示が正常に動作することを実機確認する
  - **動作しない場合**: 自律的に代替ライブラリを選定せず、PMにエスカレーションすること

---

## 6. テスト方針

| テスト対象 | 方法 | 合格条件 |
|-----------|------|----------|
| §1 Storage基盤 | 手動 | firebase deploy 後、Storageルールが適用されていること |
| §2 PWA | Pixel 10実機 | ホーム画面に追加→スタンドアロン起動できること |
| §2 オフライン | 機内モード | フォールバック画面が表示されること |
| §3 通知 | Pixel 10実機 | 放置タスクがある状態で起動→通知が表示されること |
| §3 通知なし | Pixel 10実機 | 放置タスクがない状態で起動→通知が出ないこと |
| §4 画像添付 | Pixel 10実機 | カメラで撮影→添付→300KB以下になっていること |
| §4 画像同期 | PC + Pixel 10 | 一方で添付した画像が他方で表示されること |
| §4 画像削除 | 手動 | タスク削除後、Storage上の画像も削除されていること |
| §4 deleteTask | 手動 | deleteTask(task) で画像付きタスク削除→Storage画像も消えること |
| §5 エクスポート | 手動 | JSONファイルがダウンロードされること |
| §5 インポート | 手動 | エクスポートしたJSONをインポート→データが復元されること |
| §5 上書き時画像 | 手動 | インポート上書き後、旧タスクのStorage画像が削除されていること |
| §6 コピー | Pixel 10実機 | コピー→claude.aiに貼り付け→フォーマット通りであること |
| §7 画像差分 | デプロイ後 | public/characters/に画像配置→表情が切り替わること |
| §7 フォールバック | デプロイ後 | 存在しない表情→default.png→emoji の順でフォールバックすること |
| §7 既存画面 | 手動 | 全画面（DialogModal, CharScreen, NadeModal等）でキャラ画像が正常表示されること |
| §8 復活 | 手動 | 完了タスクの復活ボタン→進行中タブに表示されること |
| §8 toggleDone | 手動 | 復活後のタスクを再度完了→正常に完了状態になること |
| §9 Markdown | 手動 | メモに `**太字**` や `- リスト` を入力→レンダリングされること |
| §9 リンク | 手動 | メモ内のURLリンクが新タブで開くこと |

---

## 7. 依存パッケージ追加

```
npm install vite-plugin-pwa react-markdown
```

※ firebase パッケージ（^11.0.0）は既存。Storage SDKは同一パッケージに含まれるため追加インストール不要。
※ react-markdown でpeer dependency警告が出た場合は `--legacy-peer-deps` を付与。

---

## 8. 実装順序（厳守）

依存関係を考慮した推奨順序。PGはこの順序に従うこと。

1. **§1** Firebase Storage基盤 — 他の機能の前提
2. **§7** 画像差分フォルダ移行 — assets/削除を伴うため早期に実施
3. **§2** PWA化 — 独立性が高く、他機能に影響しない
4. **§4** 画像添付 — §1に依存。deleteTaskシグネチャ変更を含む
5. **§3** 通知機能 — §2のService Workerとは独立だが、PWA環境で動作確認
6. **§5** インポート/エクスポート — §4の画像URL・deleteTask変更が確定後
7. **§6** クリップボードコピー — §4のimageUrlフィールド追加後
8. **§8** 完了タスク復活 — UIのみ、いつでも可
9. **§9** Markdownメモ — 独立、いつでも可
