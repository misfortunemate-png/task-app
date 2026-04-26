// プレースホルダー画面 — 通知/キャラ/ガチャの3画面で使用 — spec-phase3.md §2
import { useMemo } from 'react'
import { PLACEHOLDER_LINES, FACE_MAP } from '../data/lines.js'
import { getCharacterById } from '../data/characters.js'
import '../styles/PlaceholderScreen.css'

// screenKey: 'notification' | 'character' | 'gacha'
export default function PlaceholderScreen({ screenKey }) {
  // マウント時にランダム1件選択。再レンダリングで変わらないようuseMemoで固定
  const line = useMemo(() => {
    const pool = PLACEHOLDER_LINES[screenKey] ?? []
    return pool[Math.floor(Math.random() * pool.length)] ?? null
  }, [screenKey])

  const chara = line ? getCharacterById(line.character) : null

  return (
    <div className="placeholder-screen">
      <p className="placeholder-coming-soon">Coming Soon</p>
      {line && chara && (
        <div className="placeholder-balloon">
          <span className="placeholder-chara-emoji">{chara.emoji}</span>
          <div className="placeholder-speech">
            <span className="placeholder-face">{FACE_MAP[line.face] ?? '😊'}</span>
            <p className="placeholder-text">{line.text}</p>
            <span className="placeholder-name">{chara.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}
