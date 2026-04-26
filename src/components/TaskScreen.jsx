// タスク画面 — TaskList・セリフモーダル・放置判定・なでなでモーダルを束ねる
// spec-phase3.md §2 §3 §4 §6 / spec-phase4.md §B0（CharTabはAppへ移動）
import { useState, useEffect, useCallback } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.js'
import TaskList from './TaskList.jsx'
import DialogModal from './DialogModal.jsx'
import NadeModal from './NadeModal.jsx'
import { useTasks } from '../hooks/useTasks.js'
import { pickLine } from '../data/lines.js'
import { toLocalDateStr, tsToLocalDateStr } from '../utils/date.js'

const SS_KEY_LAST_NEGLECT = 'lastNeglectTaskId'

// characterFilter: 上位（App.jsx）から渡される現在のキャラフィルタ — null | charId
// pendingImport / onImportConsumed: §1 URLインポート（プリフィル）
// userDoc / updateUserDoc: §4 チケット付与に使う
export default function TaskScreen({
  user, characterFilter, debugMode, nadeThreshold, showToast,
  userDoc, updateUserDoc,
  pendingImport, onImportConsumed,
}) {
  const { tasks, addTask, updateTask, toggleDone, deleteTask } = useTasks(user.uid, showToast)
  const [dialog, setDialog]             = useState(null)
  const [neglectModal, setNeglectModal] = useState(null)
  const [neglectDone, setNeglectDone]   = useState(false) // マウントあたり1回のみ表示

  // §5/§6: デバッグ強制設定を読む（debugModeがONの時のみ反映）
  const buildPickOpts = useCallback(() => {
    if (!debugMode) return {}
    const opts = {}
    const ts = localStorage.getItem('debugTimeSlot')
    if (ts && ts !== 'auto') opts.forceTimeSlot = ts
    const rr = parseInt(localStorage.getItem('debugForceRarity') ?? '0', 10)
    if (rr >= 1 && rr <= 5) opts.forceRarity = rr
    return opts
  }, [debugMode])

  const handleDialogOpen = (event, characterId, extras = {}) => {
    if (!characterId) return
    const line = pickLine(characterId, event, 'generic', buildPickOpts())
    setDialog({ characterId, line, rewardPrompt: extras.rewardPrompt })
    // §4: タスク完了時にガチャチケット +1
    if (event === 'complete' && updateUserDoc) {
      updateUserDoc({ gachaTickets: (userDoc?.gachaTickets ?? 0) + 1 })
    }
  }

  // 放置判定 — tasksロード後に1回だけ実行
  useEffect(() => {
    if (neglectDone || !tasks || tasks.length === 0) return
    const todayStr = toLocalDateStr(new Date())
    const overdue = tasks.filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false
      const dueDateStr = tsToLocalDateStr(t.dueDate)
      // 日付のみ比較: 期限当日は放置判定しない。翌日以降に発火
      return dueDateStr !== null && dueDateStr < todayStr
    })
    if (overdue.length === 0) return
    setNeglectDone(true)

    const lastId = sessionStorage.getItem(SS_KEY_LAST_NEGLECT)
    const others = overdue.filter((t) => t.id !== lastId)
    const target = others.length > 0 ? others[0] : overdue[0]
    sessionStorage.setItem(SS_KEY_LAST_NEGLECT, target.id)
    setNeglectModal({ task: target, line: pickLine(target.character, 'neglect', 'generic', buildPickOpts()) })
  }, [tasks, neglectDone, buildPickOpts])

  // なでなでロック解除
  const handleUnlock = (taskId) =>
    updateDoc(doc(db, 'tasks', taskId), { dueDateUnlocked: true })

  // デバッグ用: 放置判定手動トリガー
  const triggerNeglect = () => {
    const target = tasks.find((t) => t.status !== 'done' && t.dueDate)
    if (!target) return
    setNeglectModal({ task: target, line: pickLine(target.character, 'neglect', 'generic', buildPickOpts()) })
  }

  return (
    <div className="task-screen">
      <TaskList
        tasks={tasks}
        addTask={addTask}
        updateTask={updateTask}
        toggleDone={toggleDone}
        deleteTask={deleteTask}
        characterFilter={characterFilter}
        onDialogOpen={handleDialogOpen}
        pendingImport={pendingImport}
        onImportConsumed={onImportConsumed}
        debugMode={debugMode}
        onTriggerNeglect={debugMode ? triggerNeglect : undefined}
      />
      {dialog && (
        <DialogModal
          characterId={dialog.characterId}
          line={dialog.line}
          showToast={showToast}
          onCopyPrompt={dialog.rewardPrompt ? () => dialog.rewardPrompt : undefined}
          onClose={() => setDialog(null)}
        />
      )}
      {neglectModal && (
        <NadeModal
          task={neglectModal.task}
          neglectLine={neglectModal.line}
          nadeThreshold={nadeThreshold}
          debugMode={debugMode}
          onClose={() => setNeglectModal(null)}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  )
}
