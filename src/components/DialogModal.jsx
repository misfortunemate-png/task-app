// セリフモーダル — 登録/完了/放置/キャンセル時にキャラのセリフを表示
// spec-phase3.md §4 / spec-phase4.md §6 §7
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { FACE_MAP } from '../data/lines.js'
import { getCharacterById } from '../data/characters.js'
import CharImage from './CharImage.jsx'
import '../styles/DialogModal.css'

// ★4以上のレア演出 — confettiを発射
const fireConfettiByRarity = (rarity, charEmoji) => {
  if (rarity >= 5) {
    // 花火 + キャラemoji紙吹雪
    const shape = confetti.shapeFromText({ text: charEmoji ?? '✨', scalar: 2 })
    confetti({
      particleCount: 80, spread: 100, startVelocity: 45, origin: { y: 0.5 },
      shapes: [shape], scalar: 2, ticks: 220,
    })
    confetti({
      particleCount: 60, spread: 70, startVelocity: 55, origin: { y: 0.6 },
    })
  } else if (rarity >= 4) {
    // 控えめconfetti
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } })
  }
}

// characterId: string
// line: { text, face, rarity? }
// onClose: () => void
// onCopyPrompt: () => string | null  ご褒美プロンプト（任意）。指定時はコピーボタン表示 — §7
export default function DialogModal({ characterId, line, onClose, onCopyPrompt, showToast }) {
  const chara = getCharacterById(characterId)
  const fired = useRef(false)

  const rarity = line?.rarity ?? 1

  useEffect(() => {
    if (!chara || !line || fired.current) return
    fired.current = true
    fireConfettiByRarity(rarity, chara.emoji)
  }, [chara, line, rarity])

  if (!chara || !line) return null
  const faceEmoji = FACE_MAP[line.face] ?? '😊'

  // §6: ★4=光彩, ★5=金色枠 + バッジ
  const rareClass =
    rarity >= 5 ? ' dialog-modal-rare5' :
    rarity >= 4 ? ' dialog-modal-rare4' : ''

  // §7: プロンプトコピー
  const handleCopy = async () => {
    const text = onCopyPrompt?.()
    if (!text) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // フォールバック
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      showToast?.('コピーしました', 'success')
    } catch {
      showToast?.('コピーに失敗しました', 'error')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="dialog-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className={`dialog-modal${rareClass}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          {rarity >= 5 && <span className="dialog-rare-badge">★5</span>}

          <CharImage
            characterId={chara.id}
            faceKey={line.face}
            faceEmoji={faceEmoji}
            charEmoji={chara.emoji}
            size={100}
            className="dialog-chara-image"
          />

          <div className="dialog-speech">
            <span className="dialog-face">{faceEmoji}</span>
            <p className="dialog-text">{line.text}</p>
            <span className="dialog-char-name" style={{ color: chara.color }}>
              {chara.name}
            </span>
          </div>

          {/* §7: プロンプトコピーボタン */}
          {onCopyPrompt && (
            <button className="dialog-copy-btn" onClick={handleCopy}>
              📋 プロンプトをコピー
            </button>
          )}

          <button className="dialog-close" onClick={onClose} aria-label="閉じる">✕</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
