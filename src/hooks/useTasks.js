// Firestoreの tasks コレクションをリアルタイム監視し、CRUD操作を提供するカスタムフック
import { useEffect, useState } from 'react'
import {
  collection, query, where,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'

export function useTasks(uid) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!uid) return

    // orderBy を外してクライアント側でソート — where+orderBy の複合インデックスが不要になる
    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', uid),
    )

    // onSnapshot のクリーンアップを useEffect の戻り値で確実に実行する
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // createdAt の降順でソート（serverTimestamp は Timestamp オブジェクト）
      docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      setTasks(docs)
    })

    return unsubscribe
  }, [uid])

  // "YYYY-MM-DD" 文字列を Firestore Timestamp に変換するヘルパー
  const toTimestamp = (dateStr) =>
    dateStr ? Timestamp.fromDate(new Date(dateStr + 'T00:00:00')) : null

  // character・dueDate・dueDateUnlocked は spec-phase3.md §3 §5 で追加
  const addTask = (data) =>
    addDoc(collection(db, 'tasks'), {
      ...data,
      uid,
      status: 'active',
      createdAt: serverTimestamp(),
      completedAt: null,
      dueDate: toTimestamp(data.dueDate),
      dueDateUnlocked: false,
    })

  const updateTask = (id, data) => {
    // dueDate が文字列で来た場合は Timestamp に変換
    const payload = { ...data }
    if (typeof payload.dueDate === 'string') {
      payload.dueDate = toTimestamp(payload.dueDate)
    }
    return updateDoc(doc(db, 'tasks', id), payload)
  }

  const toggleDone = (task) =>
    updateDoc(doc(db, 'tasks', task.id), {
      status: task.status === 'done' ? 'active' : 'done',
      completedAt: task.status === 'done' ? null : serverTimestamp(),
    })

  const deleteTask = (id) =>
    deleteDoc(doc(db, 'tasks', id))

  return { tasks, addTask, updateTask, toggleDone, deleteTask }
}
