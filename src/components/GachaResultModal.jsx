// ガチャ排出演出モーダル — spec-phase4.md §4 (M7)
// レア度に応じた motion + canvas-confetti 演出
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { getCharacterById } from '../data/characters.js'

const fireByRarity = (rarity, charEmoji) => {
  if (rarity >= 5) {
    const shape = confetti.shapeFromText({ text: charEmoji ?? '✨', scalar: 2 })
    confetti({ particleCount: 80, spread: 100, startVelocity: 45, origin: { y: 0.5 }, shapes: [shape], scalar: 2, ticks: 220 })
    confetti({ particleCount: 60, spread: 70, startVelocity: 55, origin: { y: 0.6 } })
  } else if (rarity >= 4) {
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } })
  } else if (rarity >= 3) {
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } })
  }
}

export default function GachaResultModal({ prize, onClose }) {
  const fired = useRef(false)
  const chara = getCharacterById(prize?.character)

  useEffect(() => {
    if (!prize || fired.current) return
    fired.current = true
    fireByRarity(prize.rarity, chara?.emoji)
  }, [prize, chara])

  if (!prize) return null

  const stars = '★'.repeat(prize.rarity) + '☆'.repeat(5 - prize.rarity)
  const cls =
    prize.rarity >= 5 ? ' gacha-result-rare5' :
    prize.rarity >= 4 ? ' gacha-result-rare4' : ''

  return (
    <AnimatePresence>
      <motion.div
        className="gacha-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`gacha-result-modal${cls}`}
          initial={{ scale: 0.4, y: -50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <p className="gacha-stars" style={{ color: prize.rarity >= 4 ? '#f0a500' : 'var(--color-muted)' }}>{stars}</p>
          <p className="gacha-char">{chara?.emoji} <span style={{ color: chara?.color }}>{chara?.name}</span></p>
          <h3 className="gacha-title">{prize.title}</h3>
          <p className="gacha-content">{prize.content}</p>
          <button className="btn-cancel gacha-close-btn" onClick={onClose}>閉じる</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
