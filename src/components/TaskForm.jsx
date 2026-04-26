// タスク登録・編集フォーム（モーダル形式）
import { useState } from 'react'

export const CATEGORIES = [
  { id: 'cleaning',    emoji: '🧹', label: '掃除' },
  { id: 'shopping',   emoji: '🛒', label: '買い物' },
  { id: 'cooking',    emoji: '🍳', label: '料理' },
  { id: 'maintenance',emoji: '🔧', label: '整備' },
  { id: 'plants',     emoji: '🪴', label: '植物' },
  { id: 'rearrange',  emoji: '📦', label: '模様替え' },
  { id: 'dev',        emoji: '💻', label: '開発' },
  { id: 'study',      emoji: '📚', label: '勉強' },
  { id: 'health',     emoji: '🏃', label: '運動' },
  { id: 'admin',      emoji: '📋', label: '事務' },
  { id: 'play',       emoji: '🎮', label: '遊び' },
  { id: 'other',      emoji: '🌟', label: 'その他' },
]

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle]       = useState(initial?.title    ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [note, setNote]         = useState(initial?.note     ?? '')

  const isEdit = !!initial

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), category, note: note.trim() })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-sheet">
        <h2 className="modal-title">{isEdit ? 'タスクを編集' : 'タスクを追加'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">タイトル <span style={{ color: 'var(--color-hakone)' }}>*</span></label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクを入力..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">カテゴリ</label>
            <div className="category-grid">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`category-btn${category === c.id ? ' selected' : ''}`}
                  onClick={() => setCategory(category === c.id ? '' : c.id)}
                >
                  <span className="cat-emoji">{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">メモ</label>
            <textarea
              className="form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="メモ（任意）"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>キャンセル</button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              {isEdit ? '保存' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
