// タスク画面2層目 — キャラタブ（フィルタ + テーマ切替 + キャラ絵表示）
// spec-phase3.md §3
import { CHARACTERS, getCharacterById } from '../data/characters.js'
import { applyCharTheme } from '../utils/theme.js'
import '../styles/CharTab.css'

// activeChar: null（全員）| character.id string
// onCharChange: (charId | null) => void
export default function CharTab({ activeChar, onCharChange }) {
  const handleSelect = (charId) => {
    const chara = charId ? getCharacterById(charId) : null
    // CSS変数をキャラテーマに切り替え（nullでニュートラルにリセット）
    applyCharTheme(chara)
    onCharChange(charId)
  }

  const activeChara = activeChar ? getCharacterById(activeChar) : null

  return (
    <div className="char-tab">
      {/* 2層目ナビ */}
      <div className="char-tab-nav">
        <button
          className={`char-tab-btn${!activeChar ? ' active' : ''}`}
          onClick={() => handleSelect(null)}
        >
          全員
        </button>
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            className={`char-tab-btn${activeChar === c.id ? ' active' : ''}`}
            onClick={() => handleSelect(c.id)}
            style={activeChar === c.id ? { color: c.color, borderBottomColor: c.color } : {}}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* キャラ絵表示エリア */}
      <div className="char-tab-display">
        {!activeChar ? (
          // 全員タブ: 三人のemojiを並べる
          <div className="char-display-all">
            {CHARACTERS.map((c) => (
              <span key={c.id} className="char-display-emoji-sm">{c.emoji}</span>
            ))}
          </div>
        ) : (
          // キャラタブ: emoji大表示
          <div className="char-display-single" style={{ color: activeChara?.color }}>
            <span className="char-display-emoji-lg">{activeChara?.emoji}</span>
            <span className="char-display-name">{activeChara?.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
