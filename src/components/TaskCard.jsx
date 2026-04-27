// タスクカード — キャラアクセントボーダー・完了予定日表示 — spec-phase3.md §3 §5
import { CATEGORIES } from '../data/categories.js'
import { getCharacterById } from '../data/characters.js'
import { toLocalDateStr, tsToLocalDateStr } from '../utils/date.js'

// Firestore Timestamp or null を "YYYY/MM/DD" 表示文字列に変換
const formatDate = (ts) => {
  const s = tsToLocalDateStr(ts)
  return s ? s.replace(/-/g, '/') : null
}

// 日付のみ比較で期限超過を判定（時刻を除外）
// 期限当日は超過扱いにしない — dueDate < 今日の日付 のときのみtrue
const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'done') return false
  const dueDateStr = tsToLocalDateStr(task.dueDate)
  return dueDateStr !== null && dueDateStr < toLocalDateStr(new Date())
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
        {/* 画像サムネイル — thumbnailUrl（200px軽量）を表示、タップで imageUrl を新タブに拡大（仕様書 Phase5 §4.4）
            thumbnailUrl がない既存タスクは imageUrl にフォールバック。loading="lazy" で画面外は遅延ロード */}
        {task.imageUrl && (
          <a href={task.imageUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 6 }}>
            <img
              src={task.thumbnailUrl ?? task.imageUrl}
              alt="添付画像"
              loading="lazy"
              style={{ height: 64, width: 'auto', maxWidth: '100%', borderRadius: 6, objectFit: 'cover', display: 'block' }}
            />
          </a>
        )}
      </div>
      <div className="task-actions">
        <button className="btn-icon" onClick={onEdit} aria-label="編集">✏️</button>
        <button className="btn-icon danger" onClick={handleDelete} aria-label="削除">🗑️</button>
      </div>
    </div>
  )
}
