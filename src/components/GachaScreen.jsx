// ガチャ画面 — spec-phase4.md §4 + 修正指示書 修正4
// gachaInventory はオブジェクト配列。type='gacha'(景品ID参照) | type='prompt'(タスクのご褒美プロンプト)
import { useState } from 'react'
import { motion } from 'motion/react'
import { drawGacha, getPrizeById } from '../data/gachaPrizes.js'
import { getCharacterById } from '../data/characters.js'
import GachaResultModal from './GachaResultModal.jsx'
import '../styles/GachaScreen.css'

// クリップボードコピー（フォールバック付き）
const copyText = async (text) => {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true }
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    return true
  } catch { return false }
}

export default function GachaScreen({ userDoc, updateUserDoc, showToast }) {
  const [result, setResult] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const tickets   = userDoc.gachaTickets ?? 0
  const inventory = userDoc.gachaInventory ?? []

  const handleDraw = async (masterMode = false) => {
    if (!masterMode && tickets <= 0) {
      showToast?.('チケットが足りません', 'error')
      return
    }
    const prize = drawGacha()
    setResult(prize)
    const newTickets = masterMode ? tickets : tickets - 1
    // 修正4: type='gacha' 形式で追加（既保有なら追加しない）
    const exists = inventory.some((it) => it.type === 'gacha' && it.prizeId === prize.id)
    const newInv = exists ? inventory : [...inventory, { type: 'gacha', prizeId: prize.id }]
    await updateUserDoc({ gachaTickets: newTickets, gachaInventory: newInv })
  }

  // 修正4: type別に表示用オブジェクトに正規化、レア度降順 + promptは末尾
  const owned = inventory.map((it, idx) => {
    if (it.type === 'gacha') {
      const p = getPrizeById(it.prizeId)
      if (!p) return null
      return {
        key: `gacha-${idx}-${p.id}`, kind: 'gacha',
        rarity: p.rarity, character: p.character,
        title: p.title, content: p.content,
      }
    }
    if (it.type === 'prompt') {
      return {
        key: `prompt-${it.id ?? idx}`, kind: 'prompt',
        rarity: 0, character: it.character,
        title: it.title || 'ご褒美プロンプト',
        prompt: it.prompt ?? '',
      }
    }
    return null
  }).filter(Boolean)
    .sort((a, b) => b.rarity - a.rarity)

  const handleCopy = async (text) => {
    const ok = await copyText(text)
    showToast?.(ok ? 'コピーしました' : 'コピーに失敗しました', ok ? 'success' : 'error')
  }

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
        <button className="gacha-master-btn" onClick={() => handleDraw(true)}>
          🔓 マスター権限: 無制限
        </button>
      </div>

      <hr className="char-divider" />

      <h3 className="gacha-inventory-title">アイテム倉庫（{owned.length}件）</h3>
      {owned.length === 0 ? (
        <p className="gacha-inventory-empty">まだ何も持っていません</p>
      ) : (
        <div className="gacha-inventory-grid">
          {owned.map((it) => {
            const chara = getCharacterById(it.character)
            const isOpen = expanded === it.key
            const cellCls = it.kind === 'prompt'
              ? 'gacha-inv-cell gacha-inv-prompt'
              : `gacha-inv-cell rare-${it.rarity}`
            return (
              <button
                key={it.key}
                className={cellCls}
                onClick={() => setExpanded(isOpen ? null : it.key)}
                style={{ borderColor: chara?.color }}
              >
                <span className="gacha-inv-rarity">
                  {it.kind === 'prompt' ? '📋' : '★'.repeat(it.rarity)}
                </span>
                <span className="gacha-inv-emoji">{chara?.emoji}</span>
                <span className="gacha-inv-title">{it.title}</span>
                {isOpen && it.kind === 'gacha' && (
                  <p className="gacha-inv-content">{it.content}</p>
                )}
                {isOpen && it.kind === 'prompt' && (
                  <>
                    <p className="gacha-inv-content">{it.prompt}</p>
                    <span
                      className="gacha-inv-copy"
                      onClick={(e) => { e.stopPropagation(); handleCopy(it.prompt) }}
                    >
                      📋 コピー
                    </span>
                  </>
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
