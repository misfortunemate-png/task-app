// Firestoreの tasks コレクションをリアルタイム監視し、CRUD操作を提供するカスタムフック
// spec-phase3.md §3 §5 §8（エラーハンドリング追加）
import { useEffect, useState } from 'react'
import {
  collection, query, where,
  onSnapshot, setDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { uploadTaskImage, uploadTaskThumbnail, deleteStorageFile } from '../utils/storage.js'
import { compressImage, compressThumbnail } from '../utils/compress.js'
import { runWeeklyReset } from '../utils/weeklyReset.js'

// showToast: (message, type) => void — §8 エラー時にトースト通知
export function useTasks(uid, showToast) {
  const [tasks, setTasks] = useState([])
  // 週次リセットをマウントあたり1回だけ実行（複数useTasks呼び出しがあっても多重実行は防ぐ）
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    if (!uid) return

    const q = query(collection(db, 'tasks'), where('uid', '==', uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      setTasks(docs)
      // 初回ロード時に週次リセット判定（修正3: gachaInventoryも消去される）
      if (!resetDone) {
        setResetDone(true)
        runWeeklyReset(uid).catch((e) => console.error(e))
      }
    }, (err) => {
      console.error('Firestore読み取りエラー:', err)
      showToast?.('データの読み込みに失敗しました', 'error')
    })

    return unsubscribe
  }, [uid, showToast, resetDone])

  // "YYYY-MM-DD" 文字列を Firestore Timestamp に変換
  const toTimestamp = (dateStr) =>
    dateStr ? Timestamp.fromDate(new Date(dateStr + 'T00:00:00')) : null

  const addTask = async (data) => {
    try {
      const { imageFile, ...rest } = data
      // doc() でIDを事前生成 → 圧縮・アップロード後に setDoc 1回で完結（addDoc+updateDoc の2往復を排除）
      const docRef = doc(collection(db, 'tasks'))
      let imageUrl = null
      let thumbnailUrl = null
      if (imageFile) {
        // メイン画像とサムネイルを並行圧縮→並行アップロードして時間を最小化
        const [compressed, thumb] = await Promise.all([
          compressImage(imageFile),
          compressThumbnail(imageFile),
        ]);
        [imageUrl, thumbnailUrl] = await Promise.all([
          uploadTaskImage(uid, docRef.id, compressed),
          uploadTaskThumbnail(uid, docRef.id, thumb),
        ])
      }
      await setDoc(docRef, {
        ...rest,
        uid,
        status: 'active',
        createdAt: serverTimestamp(),
        completedAt: null,
        dueDate: toTimestamp(rest.dueDate),
        dueDateUnlocked: false,
        imageUrl,
        thumbnailUrl,
      })
    } catch (err) {
      console.error('addTask失敗:', err)
      showToast?.('保存に失敗しました。もう一度お試しください', 'error')
      throw err
    }
  }

  const updateTask = async (id, data) => {
    try {
      const { imageFile, ...rest } = data
      const payload = { ...rest }
      if (typeof payload.dueDate === 'string') {
        payload.dueDate = toTimestamp(payload.dueDate)
      }
      // 画像差し替え: 並行圧縮→並行アップロードで imageUrl/thumbnailUrl を上書き
      if (imageFile) {
        const [compressed, thumb] = await Promise.all([
          compressImage(imageFile),
          compressThumbnail(imageFile),
        ]);
        [payload.imageUrl, payload.thumbnailUrl] = await Promise.all([
          uploadTaskImage(uid, id, compressed),
          uploadTaskThumbnail(uid, id, thumb),
        ])
      }
      await updateDoc(doc(db, 'tasks', id), payload)
    } catch (err) {
      console.error('updateTask失敗:', err)
      showToast?.('保存に失敗しました。もう一度お試しください', 'error')
      throw err
    }
  }

  const toggleDone = async (task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: task.status === 'done' ? 'active' : 'done',
        completedAt: task.status === 'done' ? null : serverTimestamp(),
      })
    } catch (err) {
      console.error('toggleDone失敗:', err)
      showToast?.('保存に失敗しました。もう一度お試しください', 'error')
      throw err
    }
  }

  // deleteTask — 引数を id → task に変更（仕様書 Phase5 §4.2）
  // imageUrl がある場合は Storage 画像を先に削除してから Firestore ドキュメントを削除する
  const deleteTask = async (task) => {
    try {
      // imageUrl・thumbnailUrl を並行削除（エラーは無視して Firestore 削除に進む）
      await Promise.allSettled([
        task.imageUrl ? deleteStorageFile(task.imageUrl) : Promise.resolve(),
        task.thumbnailUrl ? deleteStorageFile(task.thumbnailUrl) : Promise.resolve(),
      ])
      await deleteDoc(doc(db, 'tasks', task.id))
    } catch (err) {
      console.error('deleteTask失敗:', err)
      showToast?.('保存に失敗しました。もう一度お試しください', 'error')
      throw err
    }
  }

  return { tasks, addTask, updateTask, toggleDone, deleteTask }
}
