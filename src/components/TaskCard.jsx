// タスクカード — チェックボックス（完了切替）、編集・削除ボタン、削除確認を担当
import { CATEGORIES } from './TaskForm.jsx'

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cat = CATEGORIES.find((c) => c.id === task.category)

  const handleDelete = () => {
    if (window.confirm(`「${task.title}」を削除しますか？`)) onDelete()
  }

  return (
    <div className={`task-card${task.status === 'done' ? ' done' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.status === 'done'}
        onChange={onToggle}
      />
      <div className="task-body">
        <p className="task-title">{task.title}</p>
        {cat && (
          <div className="task-meta">
            <span className="task-category">{cat.emoji} {cat.label}</span>
          </div>
        )}
        {task.note && <p className="task-note">{task.note}</p>}
      </div>
      <div className="task-actions">
        <button className="btn-icon" onClick={onEdit} aria-label="編集">✏️</button>
        <button className="btn-icon danger" onClick={handleDelete} aria-label="削除">🗑️</button>
      </div>
    </div>
  )
}
