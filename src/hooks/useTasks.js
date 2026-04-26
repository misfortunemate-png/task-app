// Firestoreの tasks コレクションをリアルタイム監視し、CRUD操作を提供するカスタムフック
import { useEffect, useState } from 'react'
import {
  collection, query, where,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
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

  const addTask = (data) =>
    addDoc(collection(db, 'tasks'), {
      ...data,
      uid,
      status: 'active',
      createdAt: serverTimestamp(),
      completedAt: null,
    })

  const updateTask = (id, data) =>
    updateDoc(doc(db, 'tasks', id), data)

  const toggleDone = (task) =>
    updateDoc(doc(db, 'tasks', task.id), {
      status: task.status === 'done' ? 'active' : 'done',
      completedAt: task.status === 'done' ? null : serverTimestamp(),
    })

  const deleteTask = (id) =>
    deleteDoc(doc(db, 'tasks', id))

  return { tasks, addTask, updateTask, toggleDone, deleteTask }
}
