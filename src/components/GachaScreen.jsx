// ガチャ画面 — spec-phase4.md §4
// チケット表示 + ガチャボタン + 排出演出 + アイテム倉庫
import { useState } from 'react'
import { motion } from 'motion/react'
import { drawGacha, getPrizeById } from '../data/gachaPrizes.js'
import { getCharacterById } from '../data/characters.js'
import GachaResultModal from './GachaResultModal.jsx'
import '../styles/GachaScreen.css'

export default function GachaScreen({ userDoc, updateUserDoc, showToast }) {
  const [result, setResult] = useState(null)
  const [expanded, setExpanded] = useState(null) // 倉庫アイテム展開用

  const tickets = userDoc.gachaTickets ?? 0
  const inventory = userDoc.gachaInventory ?? []

  // ガチャを引く（masterMode: true でチケット消費なし）
  const handleDraw = async (masterMode = false) => {
    if (!masterMode && tickets <= 0) {
      showToast?.('チケットが足りません', 'error')
      return
    }
    const prize = drawGacha()
    setResult(prize)
    const newTickets = masterMode ? tickets : tickets - 1
    const newInv = inventory.includes(prize.id) ? inventory : [...inventory, prize.id]
    await updateUserDoc({ gachaTickets: newTickets, gachaInventory: newInv })
  }

  const owned = inventory
    .map((id) => getPrizeById(id))
    .filter(Boolean)
    .sort((a, b) => b.rarity - a.rarity)

  return (
    <div className="gacha-screen">
      <div className="gacha-tickets">
        🎫 チケット <strong>{tickets}</strong> 枚
      </div>

      <div className="gacha-buttons">
        <motion.button
          className="gacha-btn"
          whileTap={{ scale: 0.92 }}
          disabled={tickets <= 0}
          onClick={() => handleDraw(false)}
        >
          ガチャを引く
        </motion.button>
        <button
          className="gacha-master-btn"
          onClick={() => handleDraw(true)}
        >
          🔓 マスター権限: 無制限
        </button>
      </div>

      <hr className="char-divider" />

      <h3 className="gacha-inventory-title">アイテム倉庫（{owned.length}件）</h3>
      {owned.length === 0 ? (
        <p className="gacha-inventory-empty">まだ何も持っていません</p>
      ) : (
        <div className="gacha-inventory-grid">
          {owned.map((p) => {
            const chara = getCharacterById(p.character)
            const isOpen = expanded === p.id
            return (
              <button
                key={p.id}
                className={`gacha-inv-cell rare-${p.rarity}`}
                onClick={() => setExpanded(isOpen ? null : p.id)}
                style={{ borderColor: chara?.color }}
              >
                <span className="gacha-inv-rarity">{'★'.repeat(p.rarity)}</span>
                <span className="gacha-inv-emoji">{chara?.emoji}</span>
                <span className="gacha-inv-title">{p.title}</span>
                {isOpen && (
                  <p className="gacha-inv-content">{p.content}</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {result && <GachaResultModal prize={result} onClose={() => setResult(null)} />}
    </div>
  )
}
