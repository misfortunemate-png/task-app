// タスク一覧 — ステータスタブ切り替え・キャラフィルタ・FAB・フォーム管理
// tasks と CRUD 操作は TaskScreen から受け取る — spec-phase3.md §3 §4 §6
// §1 URLインポート: pendingImport があればフォームを自動オープン+プリフィル
import { useState, useEffect } from 'react'
import TaskCard from './TaskCard.jsx'
import TaskForm from './TaskForm.jsx'

const STATUS_TABS = [
  { key: 'active', label: '進行中' },
  { key: 'done',   label: '完了' },
  { key: 'all',    label: 'すべて' },
]

export default function TaskList({
  tasks, addTask, updateTask, toggleDone, deleteTask,
  characterFilter, onDialogOpen,
  debugMode, onTriggerNeglect,
  pendingImport, onImportConsumed,
}) {
  const [tab, setTab]       = useState('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  // §1: プリフィル用 — TaskFormに渡す初期値（pendingImportを変換したもの）
  const [prefill, setPrefill] = useState(null)

  // pendingImport が来たらフォームをプリフィル状態でオートオープン
  useEffect(() => {
    if (!pendingImport) return
    setPrefill({
      title:        pendingImport.title,
      character:    pendingImport.character,
      category:     pendingImport.category,
      note:         pendingImport.note,
      dueDate:      pendingImport.dueDate, // YYYY-MM-DD文字列のまま
      rewardPrompt: pendingImport.rewardPrompt,
      _prefilled:   true, // TaskFormで視覚強調するためのマーカー
    })
    setFormOpen(true)
  }, [pendingImport])

  const charFiltered = characterFilter
    ? tasks.filter((t) => t.character === characterFilter)
    : tasks
  const filtered = tab === 'all'
    ? charFiltered
    : charFiltered.filter((t) => t.status === tab)

  const handleAdd = async (data) => {
    await addTask(data)
    setFormOpen(false)
    setPrefill(null)
    onImportConsumed?.()
    onDialogOpen?.('register', data.character)
  }

  const handleCancelAdd = () => {
    setFormOpen(false)
    setPrefill(null)
    onImportConsumed?.()
  }

  const handleUpdate = async (data) => {
    await updateTask(editing.id, data)
    setEditing(null)
  }

  const handleToggle = async (task) => {
    await toggleDone(task)
    if (task.status === 'active') {
      // §7: 完了時にrewardPromptをDialogModalへ渡す
      onDialogOpen?.('complete', task.character, { rewardPrompt: task.rewardPrompt })
    }
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return
    await deleteTask(task.id)
    onDialogOpen?.('cancel', task.character)
  }

  return (
    <main className="task-list">
      <div className="tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="task-count">{filtered.length} 件</p>

      {filtered.length === 0 ? (
        <p className="tasks-empty">タスクがありません</p>
      ) : (
        filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() => handleToggle(task)}
            onEdit={() => setEditing(task)}
            onDelete={() => handleDelete(task)}
          />
        ))
      )}

      <button className="fab" onClick={() => setFormOpen(true)} aria-label="タスクを追加">＋</button>

      {/* デバッグ: 放置判定手動トリガー */}
      {debugMode && onTriggerNeglect && (
        <button
          className="debug-trigger-btn"
          onClick={onTriggerNeglect}
        >
          🐛 放置判定を実行
        </button>
      )}

      {formOpen && (
        <TaskForm initial={prefill} onSubmit={handleAdd} onCancel={handleCancelAdd} />
      )}
      {editing && (
        <TaskForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      )}
    </main>
  )
}
