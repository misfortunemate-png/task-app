// セリフモーダル — 登録/完了/放置/キャンセル時にキャラのセリフを表示
// spec-phase3.md §4
import { FACE_MAP } from '../data/lines.js'
import { getCharacterById } from '../data/characters.js'
import '../styles/DialogModal.css'

// characterId: string
// line: { text, face } — pickLine()で選択済みのもの
// onClose: () => void
export default function DialogModal({ characterId, line, onClose }) {
  const chara = getCharacterById(characterId)
  if (!chara || !line) return null

  const faceEmoji = FACE_MAP[line.face] ?? '😊'

  return (
    <div
      className="dialog-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dialog-modal">
        {/* キャラemoji（大表示 — 将来イラストに差し替え可能） */}
        <div className="dialog-chara-emoji">{chara.emoji}</div>

        {/* 表情 + セリフ */}
        <div className="dialog-speech">
          <span className="dialog-face">{faceEmoji}</span>
          <p className="dialog-text">{line.text}</p>
          <span className="dialog-char-name" style={{ color: chara.color }}>
            {chara.name}
          </span>
        </div>

        <button className="dialog-close" onClick={onClose} aria-label="閉じる">✕</button>
      </div>
    </div>
  )
}
