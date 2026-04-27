// タスク登録・編集フォーム — キャラ選択（必須）+ 完了予定日（任意）
// spec-phase3.md §3 §5
import { useState } from 'react'
import { CHARACTERS } from '../data/characters.js'
import { CATEGORIES } from '../data/categories.js'
import { toLocalDateStr, tsToLocalDateStr } from '../utils/date.js'

const todayStr = () => toLocalDateStr(new Date())
const tomorrowStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toLocalDateStr(d)
}

export default function TaskForm({ initial, onSubmit, onCancel }) {
  // §1: プリフィルか編集かを区別。編集はFirestore docを持つ（id付き）、プリフィルは _prefilled フラグ
  const isPrefilled = !!initial?._prefilled
  const isEdit = !!initial && !isPrefilled

  // initial.dueDate は編集時はTimestamp、プリフィル時はYYYY-MM-DD文字列。両対応
  const initialDueDate = (() => {
    if (!initial?.dueDate) return ''
    if (typeof initial.dueDate === 'string') return initial.dueDate
    return tsToLocalDateStr(initial.dueDate) ?? ''
  })()

  const [title, setTitle]       = useState(initial?.title     ?? '')
  const [category, setCategory] = useState(initial?.category  ?? '')
  const [note, setNote]         = useState(initial?.note      ?? '')
  const [character, setCharacter] = useState(initial?.character ?? '')
  const [charError, setCharError] = useState(false)
  const [dueDate, setDueDate]   = useState(initialDueDate)
  const [dueDateError, setDueDateError] = useState('')
  // §1: rewardPromptはフォームでは編集UIを出さないが、プリフィル値はsubmit時に転送する
  const [rewardPrompt] = useState(initial?.rewardPrompt ?? '')
  // 画像添付 — 選択ファイルを保持（仕様書 Phase5 §4.1）
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? null)

  // プリフィルされたフィールドは背景色で視覚的に区別する（§1）
  const prefilledStyle = (key) => {
    if (!isPrefilled) return {}
    if (!initial?.[key]) return {}
    return { background: 'var(--char-color-bg, #fffbe8)' }
  }

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
      const origStr = tsToLocalDateStr(initial.dueDate) ?? initial.dueDate
      if (dueDate > origStr) {
        setDueDateError('なでなでで期限延長のロックを解除してください')
        return
      }
    }
    const payload = { title: title.trim(), category, note: note.trim(), character, dueDate: dueDate || null }
    // §1: rewardPromptはあれば付与（編集時の既存値も保持）
    const rp = (rewardPrompt ?? initial?.rewardPrompt ?? '').toString()
    if (rp) payload.rewardPrompt = rp
    // 画像添付: 選択されたファイルをペイロードに含める（useTasks 側で圧縮・アップロード）
    if (imageFile) payload.imageFile = imageFile
    onSubmit(payload)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-sheet">
        <h2 className="modal-title">
          {isEdit ? 'タスクを編集' : (isPrefilled ? 'タスクを追加（インポート）' : 'タスクを追加')}
        </h2>
        {isPrefilled && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: -12, marginBottom: 16 }}>
            背景色付きの項目はURLからプリフィルされています
          </p>
        )}
        <form onSubmit={handleSubmit}>

          {/* タイトル */}
          <div className="form-group">
            <label className="form-label">タイトル <span style={{ color: 'var(--color-hakone)' }}>*</span></label>
            <input
              className="form-input"
              style={prefilledStyle('title')}
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
            <div className="due-date-row">
              <input
                type="date"
                className="form-input"
                value={dueDate}
                min={todayStr()}
                onChange={(e) => { setDueDate(e.target.value); setDueDateError('') }}
              />
              <button type="button" className="btn-date-shortcut" onClick={() => { setDueDate(todayStr()); setDueDateError('') }}>今日</button>
              <button type="button" className="btn-date-shortcut" onClick={() => { setDueDate(tomorrowStr()); setDueDateError('') }}>明日</button>
            </div>
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
              style={prefilledStyle('note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="メモ（任意）"
            />
          </div>

          {/* 画像添付 — カメラ撮影またはファイル選択（仕様書 Phase5 §4.1）*/}
          <div className="form-group">
            <label className="form-label">画像（任意）</label>
            {imagePreview && (
              <div style={{ marginBottom: 8 }}>
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn-icon danger"
                  style={{ marginLeft: 8, verticalAlign: 'top' }}
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  aria-label="画像を削除"
                >🗑️</button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ fontSize: '0.85rem' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
              }}
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
