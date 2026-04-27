// タスクカード — キャラアクセントボーダー・完了予定日表示 — spec-phase3.md §3 §5
// Phase5: 画像サムネイル(§4)・コピーボタン(§6)・復活ボタン(§8)・Markdownメモ(§9)追加
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CATEGORIES } from '../data/categories.js'
import { getCharacterById } from '../data/characters.js'
import { toLocalDateStr, tsToLocalDateStr } from '../utils/date.js'
import { copyTaskToClipboard } from '../utils/clipboard.js'

// Firestore Timestamp or null を "YYYY/MM/DD" 表示文字列に変換
const formatDate = (ts) => {
  const s = tsToLocalDateStr(ts)
  return s ? s.replace(/-/g, '/') : null
}

// 日付のみ比較で期限超過を判定（時刻を除外）
const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'done') return false
  const dueDateStr = tsToLocalDateStr(task.dueDate)
  return dueDateStr !== null && dueDateStr < toLocalDateStr(new Date())
}

// §9: react-markdown のリンクを新タブで開くカスタムコンポーネント
const markdownComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
}

// onToggle: チェックボックス（完了/未完了）
// onEdit: 編集ボタン
// onDelete: 削除ボタン
// onRestore: 復活ボタン（完了タスクのみ表示・§8）
// showToast: コピー完了通知（§6）
export default function TaskCard({ task, onToggle, onEdit, onDelete, onRestore, showToast }) {
  const cat    = CATEGORIES.find((c) => c.id === task.category)
  const chara  = getCharacterById(task.character)
  const dueDateStr = formatDate(task.dueDate)
  const overdue    = isOverdue(task)

  // §6: コピー中の連打防止
  const [copying, setCopying] = useState(false)

  const handleDelete = () => {
    if (window.confirm(`「${task.title}」を削除しますか？`)) onDelete()
  }

  // §6: クリップボードコピー → Toast 通知
  const handleCopy = async () => {
    if (copying) return
    setCopying(true)
    try {
      await copyTaskToClipboard(task)
      showToast?.('コピーしました', 'success')
    } catch {
      showToast?.('コピーに失敗しました', 'error')
    } finally {
      setCopying(false)
    }
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

        {/* §9: メモを react-markdown でレンダリング。リンクは新タブで開く */}
        {task.note && (
          <div className="task-note task-note-md">
            <ReactMarkdown components={markdownComponents}>{task.note}</ReactMarkdown>
          </div>
        )}

        {/* §4: 画像サムネイル — thumbnailUrl（軽量200px）表示、タップで imageUrl を拡大 */}
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
        {/* §6: クリップボードコピー */}
        <button className="btn-icon" onClick={handleCopy} aria-label="コピー" disabled={copying}>📋</button>
        {/* §8: 復活ボタン — 完了タスクのみ表示。toggleDone を呼ぶだけ（新規メソッド不要） */}
        {task.status === 'done' && onRestore && (
          <button className="btn-icon" onClick={onRestore} aria-label="復活">🔄</button>
        )}
        <button className="btn-icon" onClick={onEdit} aria-label="編集">✏️</button>
        <button className="btn-icon danger" onClick={handleDelete} aria-label="削除">🗑️</button>
      </div>
    </div>
  )
}
