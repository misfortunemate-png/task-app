// タスク登録・編集フォーム — キャラ選択（必須）追加 — spec-phase3.md §3
// dueDate（§5）は別途追加予定
import { useState } from 'react'
import { CHARACTERS } from '../data/characters.js'

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
  const [title, setTitle]       = useState(initial?.title     ?? '')
  const [category, setCategory] = useState(initial?.category  ?? '')
  const [note, setNote]         = useState(initial?.note      ?? '')
  // キャラ選択は必須。既存タスクの編集時は初期値を引き継ぐ
  const [character, setCharacter] = useState(initial?.character ?? '')
  const [charError, setCharError] = useState(false)

  const isEdit = !!initial

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (!character) {
      setCharError(true)
      return
    }
    onSubmit({ title: title.trim(), category, note: note.trim(), character })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-sheet">
        <h2 className="modal-title">{isEdit ? 'タスクを編集' : 'タスクを追加'}</h2>
        <form onSubmit={handleSubmit}>

          {/* タイトル */}
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

          {/* 担当キャラ（必須）— CHARACTERS配列から動的生成 */}
          <div className="form-group">
            <label className="form-label">
              担当キャラ <span style={{ color: 'var(--color-hakone)' }}>*</span>
            </label>
            <div className="char-select-grid">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`char-select-btn${character === c.id ? ' selected' : ''}`}
                  style={character === c.id ? { borderColor: c.color, background: c.colorBg } : {}}
                  onClick={() => { setCharacter(c.id); setCharError(false) }}
                >
                  <span className="char-select-emoji">{c.emoji}</span>
                  <span className="char-select-name">{c.name}</span>
                </button>
              ))}
            </div>
            {charError && (
              <p className="form-error">担当キャラを選択してください</p>
            )}
          </div>

          {/* カテゴリ */}
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

          {/* メモ */}
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
