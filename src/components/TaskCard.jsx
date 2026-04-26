// タスクカード — キャラアクセントボーダー・完了予定日表示 — spec-phase3.md §3 §5
import { CATEGORIES } from './TaskForm.jsx'
import { getCharacterById } from '../data/characters.js'

// Firestore Timestamp or null を "YYYY/MM/DD" 文字列に変換
const formatDate = (ts) => {
  if (!ts) return null
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

// 期限超過かどうかを判定（完了済みタスクは除外）
const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'done') return false
  const d = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate)
  return d < new Date()
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cat    = CATEGORIES.find((c) => c.id === task.category)
  const chara  = getCharacterById(task.character)
  const dueDateStr = formatDate(task.dueDate)
  const overdue    = isOverdue(task)

  const handleDelete = () => {
    if (window.confirm(`「${task.title}」を削除しますか？`)) onDelete()
  }

  return (
    <div
      className={`task-card${task.status === 'done' ? ' done' : ''}${overdue ? ' overdue' : ''}`}
      style={chara ? { borderLeft: `4px solid ${chara.colorAccent}` } : {}}
    >
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.status === 'done'}
        onChange={onToggle}
      />
      <div className="task-body">
        <p className="task-title">{task.title}</p>
        <div className="task-meta">
          {chara && (
            <span className="task-chara-tag" style={{ color: chara.color }}>
              {chara.emoji} {chara.name}
            </span>
          )}
          {cat && (
            <span className="task-category">{cat.emoji} {cat.label}</span>
          )}
          {dueDateStr && (
            <span className={`task-due${overdue ? ' task-due-overdue' : ''}`}>
              {overdue ? '⚠️ ' : '📅 '}{dueDateStr}
            </span>
          )}
        </div>
        {task.note && <p className="task-note">{task.note}</p>}
      </div>
      <div className="task-actions">
        <button className="btn-icon" onClick={onEdit} aria-label="編集">✏️</button>
        <button className="btn-icon danger" onClick={handleDelete} aria-label="削除">🗑️</button>
      </div>
    </div>
  )
}
