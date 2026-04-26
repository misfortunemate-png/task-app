// users/{uid} のリアルタイム購読 + 書き込みヘルパー — spec-phase4.md §B2
// gachaTickets / pokeCount / gachaInventory を保持
import { useEffect, useState, useCallback } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const DEFAULT_DOC = {
  gachaTickets: 0,
  pokeCount: { hakone: 0, cleade: 0, frane: 0 },
  gachaInventory: [],
}

export function useUserDoc(uid, showToast) {
  const [data, setData] = useState(DEFAULT_DOC)

  useEffect(() => {
    if (!uid) return
    const ref = doc(db, 'users', uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const v = snap.data()
        setData({
          gachaTickets:   typeof v.gachaTickets === 'number' ? v.gachaTickets : 0,
          pokeCount:      { ...DEFAULT_DOC.pokeCount, ...(v.pokeCount ?? {}) },
          gachaInventory: Array.isArray(v.gachaInventory) ? v.gachaInventory : [],
        })
      } else {
        setData(DEFAULT_DOC)
      }
    }, (err) => {
      console.error('users/{uid} 購読エラー:', err)
      showToast?.('ユーザー設定の読み込みに失敗しました', 'error')
    })
    return unsubscribe
  }, [uid, showToast])

  // mergeで部分更新
  const update = useCallback(async (patch) => {
    if (!uid) return
    try {
      await setDoc(doc(db, 'users', uid), patch, { merge: true })
    } catch (err) {
      console.error('users更新失敗:', err)
      showToast?.('保存に失敗しました', 'error')
      throw err
    }
  }, [uid, showToast])

  return { userDoc: data, updateUserDoc: update }
}
