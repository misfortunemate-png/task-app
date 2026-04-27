// Firebase Storage 操作ユーティリティ — 画像のアップロード・削除・URL取得（仕様書 Phase5 §4）
// ストレージパス: users/{uid}/tasks/{taskId}/{filename}
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase.js'

// メイン画像をアップロードしダウンロードURLを返す
export const uploadTaskImage = async (uid, taskId, file) => {
  const storageRef = ref(storage, `users/${uid}/tasks/${taskId}/image.jpg`)
  await uploadBytes(storageRef, file, { contentType: 'image/jpeg' })
  return getDownloadURL(storageRef)
}

// サムネイル（200px・軽量）をアップロードしダウンロードURLを返す
// タスク一覧の高速表示用。メイン画像とは別パスに保存する
export const uploadTaskThumbnail = async (uid, taskId, file) => {
  const storageRef = ref(storage, `users/${uid}/tasks/${taskId}/thumb.jpg`)
  await uploadBytes(storageRef, file, { contentType: 'image/jpeg' })
  return getDownloadURL(storageRef)
}

// imageUrl（ダウンロードURL）から Storage ファイルを削除する
// エラーは呼び出し元で catch すること（インポート上書き時は無視して続行）
export const deleteStorageFile = async (imageUrl) => {
  const storageRef = ref(storage, imageUrl)
  await deleteObject(storageRef)
}
