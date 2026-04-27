// Web Notification ユーティリティ — 放置タスク通知（仕様書 Phase5 §3）
// セッション内で1回のみ発火。連打しない
import { toLocalDateStr, tsToLocalDateStr } from './date.js'
import { getCharacterById } from '../data/characters.js'

const SS_KEY_NOTIFIED = 'phase5_notified'

// 通知許可をリクエストする（未決定の場合のみダイアログを出す）
// 呼び出し元: TaskScreen マウント時
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

// 放置タスク（期限翌日以降・未完了）を検出して通知を表示する
// tasks: Firestoreから取得済みのタスク配列
// 同セッション内で既に通知済みの場合は何もしない
export const notifyNeglectedTasks = (tasks) => {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (sessionStorage.getItem(SS_KEY_NOTIFIED)) return

  // 放置判定: 期限が今日より前・未完了
  const todayStr = toLocalDateStr(new Date())
  const neglected = tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false
    const due = tsToLocalDateStr(t.dueDate)
    return due !== null && due < todayStr
  })

  if (neglected.length === 0) return

  // 担当キャラの中で最多の放置タスクを持つキャラを代表にする
  const countByChar = {}
  for (const t of neglected) {
    countByChar[t.character] = (countByChar[t.character] ?? 0) + 1
  }
  const topCharId = Object.entries(countByChar).sort((a, b) => b[1] - a[1])[0][0]
  const chara = getCharacterById(topCharId)
  const emoji = chara?.emoji ?? '📋'
  const name  = chara?.name  ?? 'キャラ'

  // セッションフラグを先にセット（通知コンストラクタが例外を投げても二重発火しない）
  sessionStorage.setItem(SS_KEY_NOTIFIED, '1')

  // 通知表示（仕様書 §3 通知内容フォーマット）
  const n = new Notification(`${emoji} ${name}`, {
    body: `「放置されてるタスクがあるよ」（${neglected.length}件）`,
    icon: '/icons/icon-192.png',
    tag: 'neglect-notice', // 重複通知を防ぐタグ
  })

  // タップでアプリにフォーカス（タスク一覧へ）
  n.onclick = () => {
    window.focus()
    n.close()
  }
}
