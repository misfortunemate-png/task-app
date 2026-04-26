// タスクカード — 担当キャラのアクセントカラーを左ボーダーで表示 — spec-phase3.md §3
import { CATEGORIES } from './TaskForm.jsx'
import { getCharacterById } from '../data/characters.js'

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cat   = CATEGORIES.find((c) => c.id === task.category)
  const chara = getCharacterById(task.character)

  const handleDelete = () => {
    if (window.confirm(`「${task.title}」を削除しますか？`)) onDelete()
  }

  return (
    <div
      className={`task-card${task.status === 'done' ? ' done' : ''}`}
      // 担当キャラのアクセントカラーを左ボーダーで反映
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
