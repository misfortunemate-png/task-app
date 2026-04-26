// Firestoreの tasks コレクションをリアルタイム監視し、CRUD操作を提供するカスタムフック
// spec-phase3.md §3 §5 §8（エラーハンドリング追加）
import { useEffect, useState } from 'react'
import {
  collection, query, where,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { startOfWeek, weekKey } from '../utils/week.js'

const LS_LAST_RESET = 'lastResetWeek'

// §B2 週次リセット: 月曜以降に開いた際、前週(月〜日)の完了タスクを削除する
const runWeeklyReset = async (tasks) => {
  const currentWeek = weekKey()
  if (localStorage.getItem(LS_LAST_RESET) === currentWeek) return
  const thisWeekStart = startOfWeek().getTime()
  const stale = tasks.filter((t) => {
    if (t.status !== 'done') return false
    const ms = t.completedAt?.toMillis?.()
    return ms != null && ms < thisWeekStart
  })
  for (const t of stale) {
    try { await deleteDoc(doc(db, 'tasks', t.id)) } catch (e) { console.error('週次リセット削除失敗:', e) }
  }
  localStorage.setItem(LS_LAST_RESET, currentWeek)
}

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
      // 初回ロード時に週次リセット判定
      if (!resetDone) {
        setResetDone(true)
        runWeeklyReset(docs).catch((e) => console.error(e))
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
      await addDoc(collection(db, 'tasks'), {
        ...data,
        uid,
        status: 'active',
        createdAt: serverTimestamp(),
        completedAt: null,
        dueDate: toTimestamp(data.dueDate),
        dueDateUnlocked: false,
      })
    } catch (err) {
      console.error('addTask失敗:', err)
      showToast?.('保存に失敗しました。もう一度お試しください', 'error')
      throw err
    }
  }

  const updateTask = async (id, data) => {
    try {
      const payload = { ...data }
      if (typeof payload.dueDate === 'string') {
        payload.dueDate = toTimestamp(payload.dueDate)
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

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id))
    } catch (err) {
      console.error('deleteTask失敗:', err)
      showToast?.('保存に失敗しました。もう一度お試しください', 'error')
      throw err
    }
  }

  return { tasks, addTask, updateTask, toggleDone, deleteTask }
}
