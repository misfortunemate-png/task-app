// ランキング画面 — spec-phase4.md §3
// 今週(月-日)の完了数を3キャラで比較。1位はchampion表示。
import { useMemo } from 'react'
import { CHARACTERS } from '../data/characters.js'
import { RANKING_LINES, FACE_MAP } from '../data/lines.js'
import { startOfWeek, endOfWeek, formatWeekRange } from '../utils/week.js'
import CharImage from './CharImage.jsx'
import '../styles/CharScreen.css'

export default function RankingScreen({ tasks }) {
  const data = useMemo(() => {
    const start = startOfWeek().getTime()
    const end   = endOfWeek().getTime()
    const counts = {}
    for (const c of CHARACTERS) counts[c.id] = 0
    for (const t of tasks) {
      if (t.status !== 'done') continue
      const ms = t.completedAt?.toMillis?.()
      if (ms == null || ms < start || ms > end) continue
      if (counts[t.character] != null) counts[t.character] += 1
    }
    const ranked = CHARACTERS.map((c) => ({ char: c, count: counts[c.id] }))
                              .sort((a, b) => b.count - a.count)
    const champion = ranked[0]
    const total = ranked.reduce((s, x) => s + x.count, 0)
    return { ranked, champion, total }
  }, [tasks])

  const max = Math.max(1, ...data.ranked.map((x) => x.count))

  // championセリフ（同率1位はCHARACTERS配列順で先のほうを採用 — sort安定性に依存しない処理:
  // ranked[0].countが0でないかつ重複count上位の中で最初のCHARACTERS順を選ぶ）
  const championChar = (() => {
    if (data.champion.count === 0) return null
    const top = data.champion.count
    return CHARACTERS.find((c) => data.ranked.find((r) => r.char.id === c.id && r.count === top))
  })()
  const championLine = useMemo(() => {
    if (!championChar) return null
    const pool = RANKING_LINES[championChar.id] ?? []
    return pool[Math.floor(Math.random() * pool.length)] ?? null
  }, [championChar])

  return (
    <div className="ranking-screen">
      <h2 className="ranking-title">今週のランキング</h2>
      <p className="ranking-period">{formatWeekRange()}</p>

      <div className="ranking-bars">
        {data.ranked.map(({ char, count }) => (
          <div key={char.id} className="ranking-row">
            <span className="ranking-name" style={{ color: char.color }}>{char.emoji} {char.name}</span>
            <span className="ranking-bar-track">
              <span
                className="ranking-bar-fill"
                style={{
                  width: `${(count / max) * 100}%`,
                  background: char.color,
                }}
              />
            </span>
            <span className="ranking-count">{count}</span>
          </div>
        ))}
      </div>
      <p className="ranking-total">合計: {data.total} 件</p>

      {championChar && championLine && (
        <div className="ranking-champion" style={{ borderColor: championChar.color }}>
          <CharImage
            characterId={championChar.id}
            faceKey={championLine.face}
            faceEmoji={FACE_MAP[championLine.face]}
            charEmoji={championChar.emoji}
            size={120}
          />
          <p className="ranking-champion-name" style={{ color: championChar.color }}>
            👑 {championChar.name}
          </p>
          <p className="ranking-champion-line">{championLine.text}</p>
        </div>
      )}

      <p className="ranking-note">月曜リセット・完了済みタスクも消去</p>
    </div>
  )
}
