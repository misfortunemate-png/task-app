// セリフモーダル — 登録/完了/放置/キャンセル時にキャラのセリフを表示
// spec-phase3.md §4
import { FACE_MAP } from '../data/lines.js'
import { getCharacterById } from '../data/characters.js'
import CharImage from './CharImage.jsx'
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
        <CharImage
          characterId={chara.id}
          faceKey={line.face}
          faceEmoji={faceEmoji}
          charEmoji={chara.emoji}
          size={100}
          className="dialog-chara-image"
        />

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
