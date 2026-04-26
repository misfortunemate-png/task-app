# 三姉妹タスクアプリ Phase 5 作業指示書

作成日: 2026-04-26
PM: クリーデ
改訂: Rev.1（依存関係整合性チェック反映）
対応仕様書: docs/spec-phase5.md

---

## 作業範囲

- 何を: Phase 5 全9セクション（§1〜§9）の実装
- なぜ: 要件定義書 F-01〜F-09 の実現
- どこで: D:\AI\github\task-app

## 参照ドキュメント

- 仕様書: docs/spec-phase5.md（本指示書と共にリポジトリに配置すること）
- _STATUS.md: 作業開始前に必ず読むこと
- CLAUDE.md: リポジトリの規約を確認すること

## 実装順序（厳守）

以下の順序で実装すること。依存関係があるため順序を変えない。

1. §1 → 2. §7 → 3. §2 → 4. §4 → 5. §3 → 6. §5 → 7. §6 → 8. §8 → 9. §9

## 禁止事項

- 仕様書に記載のない機能を追加しない
- 仕様書に記載のないファイルを新規作成しない
- 仕様書の原本を改変しない
- 仕様外の設計判断が必要な場合は作業を停止し報告する
- src/assets/characters/ の画像を削除する前に、public/characters/ への移動と動作確認が完了していることを確認すること
- **依存先の変更禁止**: 仕様書 §4.2 に記載されたファイル間依存関係を、PGの判断で変更してはならない。依存関係の整合性はPMが事前チェック済みである。問題が発生した場合は依存先を変更せず、作業を停止しPMにエスカレーションすること

## §ごとの作業要約

### §1: Firebase Storage 基盤
- firebase.js に `getStorage` を追加（既存exportは変更しない）
- storage.rules を新規作成（仕様書記載のルール）
- firebase.json に storage 設定追加
- `firebase deploy --only storage` で反映

### §7: 画像差分フォルダ移行
- src/assets/characters/ の全画像を public/characters/ にコピー
- charImage.js を public/ 参照方式に書き換え（import.meta.glob 廃止 → getCharImageSrc）
- CharImage.jsx に onError 3段階フォールバック実装（useState で段階管理）
- **CharImage.jsx の props インターフェースは変更しない**
- 全画面でキャラ画像正常表示を確認後、src/assets/characters/ を削除

### §2: PWA化
- `npm install vite-plugin-pwa`
- vite.config.js に PWA プラグイン設定追加（既存の plugins 配列・build設定を維持）
- public/icons/ に仮アイコン配置（192x192, 512x512）
- public/offline.html 作成
- ビルド後、Lighthouse で PWA チェックを実施

### §4: 画像添付
- src/utils/compress.js 新規作成（Canvas API、300KB以下圧縮）
- src/utils/storage.js 新規作成（upload/delete/getUrl）
- TaskForm.jsx に画像選択 input 追加
- TaskCard.jsx にサムネイル表示追加
- **useTasks.js の deleteTask シグネチャ変更**: `deleteTask(id)` → `deleteTask(task)` に変更。画像連動削除を追加
- **deleteTask の呼び出し側を全て修正**: `deleteTask(task.id)` → `deleteTask(task)` に書き換え。対象ファイルを grep で洗い出し、漏れなく修正すること
- Firestore タスクドキュメントに imageUrl フィールド追加

### §3: 通知機能
- src/utils/notification.js 新規作成
- App.jsx または TaskScreen.jsx のマウント時に通知ロジックを呼び出し
- 放置タスクの件数と担当キャラ情報を通知テキストに含める

### §5: インポート/エクスポート
- src/utils/exportImport.js 新規作成
- SettingsScreen.jsx にエクスポート/インポート UI 追加
- **インポート時の画像クリーンアップ**: 既存全タスクの imageUrl を取得し、Storage から画像を全削除してからFirestore を全削除する。画像削除のエラーは無視して続行する
- インポート時は確認ダイアログ必須（「現在のデータはすべて上書きされます」）

### §6: クリップボードコピー
- src/utils/clipboard.js 新規作成
- TaskCard.jsx にコピーボタン追加
- コピー完了時に Toast で通知

### §8: 完了タスク復活
- **新規メソッド不要**: useTasks.js の toggleDone は既に双方向トグル実装済み
- TaskCard.jsx に復活ボタン追加（完了タスクのみ表示）
- 復活ボタンは既存の toggleDone を呼び出す
- **useTasks.js の toggleDone ロジックには手を入れない**
- セリフ反応はPG裁量

### §9: Markdownメモ
- `npm install react-markdown`（peer dependency 警告が出た場合は `--legacy-peer-deps` を付与）
- TaskCard.jsx のメモ表示部分を react-markdown でラップ
- リンクは target="_blank" rel="noopener noreferrer"
- **react-markdown が React 19 で正常動作しない場合**: 自律的に代替ライブラリを選定せず、PMにエスカレーションすること

## 完了条件

- 全9セクションが実装されていること
- 仕様書 §6 のテスト方針に記載された全テストがパスしていること
- _STATUS.md を更新していること
- firebase deploy が成功していること
- Pixel 10 実機でホーム画面追加→起動→基本操作が動作すること

## コミットメッセージ形式

各§ごとにコミットすること。

```
[Phase5-§N] 作業タイトル

何を: 実装した内容
なぜ: 仕様書 §N への参照
どのように: 技術的アプローチ
テスト: 実行結果
```

## コード内コメント

各ブロックに「何を・なぜ」のコメントを残すこと。
既存コメントの形式（例: `// キャラ画像解決ユーティリティ — import.meta.glob でビルド時に解決`）に合わせる。

## エスカレーション条件

以下の場合は作業を停止し、PMに報告すること。

1. 仕様に記載のない判断が必要な場合
2. 仕様通りに実装すると問題が生じると判断した場合
3. 技術的制約により仕様の実現が困難な場合
4. **依存関係の不整合**が発生した場合（想定外のimport、シグネチャの不一致、型の不適合等）
5. **react-markdown が動作しない場合**（代替ライブラリの自律選定禁止）
6. npm install でビルドが壊れる場合
