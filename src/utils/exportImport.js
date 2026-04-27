// エクスポート/インポートユーティリティ — JSON バックアップ/リストア（仕様書 Phase5 §5）
import {
  collection, query, where, getDocs,
  doc, getDoc, setDoc, deleteDoc, addDoc,
  Timestamp, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { deleteStorageFile } from './storage.js'

// ---- エクスポート -----------------------------------------------------------

// Firestore の Timestamp オブジェクトを JSON セーフな形式に変換するヘルパー
const toJsonSafe = (value) => {
  if (value === null || value === undefined) return value
  if (value instanceof Timestamp) return { _type: 'Timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = toJsonSafe(v)
    return out
  }
  if (Array.isArray(value)) return value.map(toJsonSafe)
  return value
}

// 全タスク + ユーザードキュメントを JSON ファイルとしてダウンロードする（仕様書 §5.1）
export const exportData = async (uid) => {
  // タスク全件取得
  const q = query(collection(db, 'tasks'), where('uid', '==', uid))
  const snap = await getDocs(q)
  const tasks = snap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }))

  // ユーザードキュメント取得
  const userSnap = await getDoc(doc(db, 'users', uid))
  const userDoc  = userSnap.exists() ? toJsonSafe(userSnap.data()) : {}

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    uid,
    tasks,
    userDoc,
  }

  // ファイル名: task-app-backup-YYYYMMDD.json
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `task-app-backup-${dateStr}.json`
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

// ---- インポート -----------------------------------------------------------

// JSON セーフ形式から Firestore Timestamp に戻す
const fromJsonSafe = (value) => {
  if (value === null || value === undefined) return value
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (value._type === 'Timestamp') return new Timestamp(value.seconds, value.nanoseconds)
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = fromJsonSafe(v)
    return out
  }
  if (Array.isArray(value)) return value.map(fromJsonSafe)
  return value
}

// 既存データを全消去してインポートデータで上書きする（仕様書 §5.2）
// onProgress: (msg: string) => void — ローディング状態表示用
export const importData = async (uid, jsonText, onProgress) => {
  const payload = JSON.parse(jsonText)

  onProgress('既存タスクの画像を削除中...')
  // ステップ3: 既存タスクの Storage 画像を全削除（失敗は無視して続行）
  const existingSnap = await getDocs(query(collection(db, 'tasks'), where('uid', '==', uid)))
  await Promise.allSettled(
    existingSnap.docs.flatMap((d) => {
      const data = d.data()
      return [
        data.imageUrl     ? deleteStorageFile(data.imageUrl)     : null,
        data.thumbnailUrl ? deleteStorageFile(data.thumbnailUrl) : null,
      ].filter(Boolean)
    })
  )

  onProgress('既存タスクを削除中...')
  // ステップ4: 既存タスクを Firestore から全削除
  await Promise.all(existingSnap.docs.map((d) => deleteDoc(d.ref)))

  onProgress('タスクをインポート中...')
  // ステップ5: インポートデータを新規ドキュメントとして書き込み（id は再生成）
  const tasks = payload.tasks ?? []
  await Promise.all(
    tasks.map(({ id: _id, ...rest }) => {
      const restored = fromJsonSafe(rest)
      return addDoc(collection(db, 'tasks'), restored)
    })
  )

  onProgress('ユーザー設定を復元中...')
  // ステップ6: ユーザードキュメントを上書き
  if (payload.userDoc && Object.keys(payload.userDoc).length > 0) {
    await setDoc(doc(db, 'users', uid), fromJsonSafe(payload.userDoc))
  }

  onProgress('完了')
}
