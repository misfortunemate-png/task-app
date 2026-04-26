// 週次リセット処理 — spec-phase4.md §B2 + 修正指示書 修正3
// 月曜以降に開いた際、前週(月-日)の完了タスクとガチャ倉庫を削除する
// useTasks（自動実行）と SettingsScreen のデバッグボタン（手動実行）から共用
import { collection, deleteDoc, doc, getDocs, query, where, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { startOfWeek, weekKey } from './week.js'

const LS_LAST_RESET = 'lastResetWeek'

// force=true: lastResetWeekチェックをスキップ、かつ status='done' の全タスクを削除する
//   （デバッグ「全完了タスク削除＋アイテム倉庫消去＋ランキングリセット」用 — 修正C）
// force=false（自動）: 前週(月-日)の完了タスクのみ削除する（従来通り）
// 戻り値: { skipped: bool, deletedTasks: number }
export const runWeeklyReset = async (uid, { force = false } = {}) => {
  if (!uid) return { skipped: true, deletedTasks: 0 }
  const currentWeek = weekKey()
  if (!force && localStorage.getItem(LS_LAST_RESET) === currentWeek) {
    return { skipped: true, deletedTasks: 0 }
  }

  const thisWeekStart = startOfWeek().getTime()
  const snap = await getDocs(query(
    collection(db, 'tasks'),
    where('uid', '==', uid),
    where('status', '==', 'done'),
  ))
  let deleted = 0
  for (const d of snap.docs) {
    // 修正C: forceは全done削除、自動は前週分のみ
    if (!force) {
      const ms = d.data().completedAt?.toMillis?.()
      if (ms == null || ms >= thisWeekStart) continue
    }
    try {
      await deleteDoc(doc(db, 'tasks', d.id))
      deleted += 1
    } catch (e) { console.error('週次リセット削除失敗:', e) }
  }

  // 修正3: アイテム倉庫もリセット
  try {
    await setDoc(doc(db, 'users', uid), { gachaInventory: [] }, { merge: true })
  } catch (e) { console.error('gachaInventoryリセット失敗:', e) }

  localStorage.setItem(LS_LAST_RESET, currentWeek)
  return { skipped: false, deletedTasks: deleted }
}
