// タスク登録・編集フォーム — キャラ選択（必須）+ 完了予定日（任意）
// spec-phase3.md §3 §5
import { useState } from 'react'
import { CHARACTERS } from '../data/characters.js'

// "YYYY-MM-DD" 文字列を今日以降に制限するための最小値
const todayStr = () => new Date().toISOString().split('T')[0]

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
  // dueDate: "YYYY-MM-DD" 文字列 or '' （空 = 設定なし）
  // Firestoreには Timestamp または null で保存。変換は onSubmit 呼び出し側で行う
  const [dueDate, setDueDate] = useState(
    initial?.dueDate?.toDate
      ? initial.dueDate.toDate().toISOString().split('T')[0]
      : (initial?.dueDate ?? '')
  )
  const [dueDateError, setDueDateError] = useState('')

  const isEdit = !!initial

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (!character) {
      setCharError(true)
      return
    }
    // 完了予定日バリデーション: 過去日は不可
    if (dueDate && dueDate < todayStr()) {
      setDueDateError('過去の日付は設定できません')
      return
    }
    // 編集時の後方延長チェック: dueDateUnlocked=falseかつ元の日付より後は不可
    if (isEdit && dueDate && initial.dueDate && !initial.dueDateUnlocked) {
      const origStr = initial.dueDate?.toDate
        ? initial.dueDate.toDate().toISOString().split('T')[0]
        : initial.dueDate
      if (dueDate > origStr) {
        setDueDateError('なでなでで期限延長のロックを解除してください')
        return
      }
    }
    onSubmit({ title: title.trim(), category, note: note.trim(), character, dueDate: dueDate || null })
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

          {/* 完了予定日（任意）*/}
          <div className="form-group">
            <label className="form-label">完了予定日（任意）</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              min={todayStr()}
              onChange={(e) => { setDueDate(e.target.value); setDueDateError('') }}
            />
            {/* 編集時の後方延長制限の注記 */}
            {isEdit && initial?.dueDate && !initial?.dueDateUnlocked && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4 }}>
                期限の延長にはなでなでが必要です
              </p>
            )}
            {dueDateError && <p className="form-error">{dueDateError}</p>}
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
