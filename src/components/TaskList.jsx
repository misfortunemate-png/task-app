// タスク一覧 — タブ切り替え（進行中/完了/すべて）とFABボタンを管理する
import { useState } from 'react'
import { useTasks } from '../hooks/useTasks.js'
import TaskCard from './TaskCard.jsx'
import TaskForm from './TaskForm.jsx'

const TABS = [
  { key: 'active', label: '進行中' },
  { key: 'done',   label: '完了' },
  { key: 'all',    label: 'すべて' },
]

export default function TaskList({ user }) {
  const { tasks, addTask, updateTask, toggleDone, deleteTask } = useTasks(user.uid)
  const [tab, setTab] = useState('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null or task object

  const filtered = tab === 'all' ? tasks : tasks.filter((t) => t.status === tab)

  const handleAdd = async (data) => {
    await addTask(data)
    setFormOpen(false)
  }

  const handleUpdate = async (data) => {
    await updateTask(editing.id, data)
    setEditing(null)
  }

  const handleEdit = (task) => setEditing(task)

  return (
    <main className="task-list">
      <div className="tabs">
        {TABS.map((t) => (
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
            onToggle={() => toggleDone(task)}
            onEdit={() => handleEdit(task)}
            onDelete={() => deleteTask(task.id)}
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
