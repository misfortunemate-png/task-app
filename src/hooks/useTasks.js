// Firestoreの tasks コレクションをリアルタイム監視し、CRUD操作を提供するカスタムフック
import { useEffect, useState } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'

export function useTasks(uid) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
    )

    // onSnapshot のクリーンアップを useEffect の戻り値で確実に実行する
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
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
