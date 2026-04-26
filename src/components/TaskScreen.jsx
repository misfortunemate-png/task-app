// タスク画面 — CharTab・TaskList・セリフモーダル・放置判定・なでなでモーダルを束ねる
// spec-phase3.md §2 §3 §4 §6
import { useState, useEffect } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.js'
import CharTab from './CharTab.jsx'
import TaskList from './TaskList.jsx'
import DialogModal from './DialogModal.jsx'
import NadeModal from './NadeModal.jsx'
import { useTasks } from '../hooks/useTasks.js'
import { getCharacterById } from '../data/characters.js'
import { pickLine } from '../data/lines.js'
import { toLocalDateStr, tsToLocalDateStr } from '../utils/date.js'

const SS_KEY_LAST_NEGLECT = 'lastNeglectTaskId'

export default function TaskScreen({ user, onCharColorChange, debugMode, nadeThreshold, showToast }) {
  const { tasks, addTask, updateTask, toggleDone, deleteTask } = useTasks(user.uid, showToast)
  const [activeChar, setActiveChar]     = useState(null)
  const [dialog, setDialog]             = useState(null)
  const [neglectModal, setNeglectModal] = useState(null)
  const [neglectDone, setNeglectDone]   = useState(false) // マウントあたり1回のみ表示

  const handleCharChange = (charId) => {
    setActiveChar(charId)
    const color = charId ? (getCharacterById(charId)?.color ?? null) : null
    onCharColorChange(color)
  }

  const handleDialogOpen = (event, characterId) => {
    if (!characterId) return
    setDialog({ characterId, line: pickLine(characterId, event) })
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
    setNeglectModal({ task: target, line: pickLine(target.character, 'neglect') })
  }, [tasks, neglectDone])

  // なでなでロック解除
  const handleUnlock = (taskId) =>
    updateDoc(doc(db, 'tasks', taskId), { dueDateUnlocked: true })

  // デバッグ用: 放置判定手動トリガー
  const triggerNeglect = () => {
    const target = tasks.find((t) => t.status !== 'done' && t.dueDate)
    if (!target) return
    setNeglectModal({ task: target, line: pickLine(target.character, 'neglect') })
  }

  return (
    <div className="task-screen">
      <CharTab activeChar={activeChar} onCharChange={handleCharChange} />
      <TaskList
        tasks={tasks}
        addTask={addTask}
        updateTask={updateTask}
        toggleDone={toggleDone}
        deleteTask={deleteTask}
        characterFilter={activeChar}
        onDialogOpen={handleDialogOpen}
        debugMode={debugMode}
        onTriggerNeglect={debugMode ? triggerNeglect : undefined}
      />
      {dialog && (
        <DialogModal
          characterId={dialog.characterId}
          line={dialog.line}
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
