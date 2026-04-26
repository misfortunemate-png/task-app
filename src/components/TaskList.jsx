// タスク一覧 — ステータスタブ切り替え・キャラフィルタ・FAB・フォーム管理
// spec-phase3.md §3（characterFilter追加）
import { useState } from 'react'
import { useTasks } from '../hooks/useTasks.js'
import TaskCard from './TaskCard.jsx'
import TaskForm from './TaskForm.jsx'

const STATUS_TABS = [
  { key: 'active', label: '進行中' },
  { key: 'done',   label: '完了' },
  { key: 'all',    label: 'すべて' },
]

// characterFilter: null（全員）| character.id string
// onDialogOpen: セリフモーダル表示コールバック（§4で追加）
export default function TaskList({ user, characterFilter, onDialogOpen }) {
  const { tasks, addTask, updateTask, toggleDone, deleteTask } = useTasks(user.uid)
  const [tab, setTab] = useState('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // キャラフィルタ → ステータスフィルタの順で絞り込む
  const charFiltered = characterFilter
    ? tasks.filter((t) => t.character === characterFilter)
    : tasks
  const filtered = tab === 'all'
    ? charFiltered
    : charFiltered.filter((t) => t.status === tab)

  const handleAdd = async (data) => {
    await addTask(data)
    setFormOpen(false)
    // §4でセリフモーダル（register）を呼び出す
    onDialogOpen?.('register', data.character)
  }

  const handleUpdate = async (data) => {
    await updateTask(editing.id, data)
    setEditing(null)
  }

  const handleToggle = async (task) => {
    await toggleDone(task)
    // §4でセリフモーダル（complete）を呼び出す
    if (task.status === 'active') {
      onDialogOpen?.('complete', task.character)
    }
  }

  const handleDelete = async (task) => {
    await deleteTask(task.id)
    // §4でセリフモーダル（cancel）を呼び出す
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

      {formOpen && (
        <TaskForm onSubmit={handleAdd} onCancel={() => setFormOpen(false)} />
      )}
      {editing && (
        <TaskForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      )}
    </main>
  )
}
