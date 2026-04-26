// キャラ画面 — 個別キャラタブ — spec-phase4.md §2
// 縦スクロール: つんつんエリア → キャラ情報 → ギャラリー（§7はB6で実装）
import { useState, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import { getCharacterById, CHARACTERS } from '../data/characters.js'
import { POKE_LINES, POKE_THRESHOLDS, FACE_MAP } from '../data/lines.js'
import CharImage from './CharImage.jsx'
import Gallery from './Gallery.jsx'
import '../styles/CharScreen.css'

const SS_KEY_POKE = 'pokeSession' // sessionStorageキー（charId別）

// charId に応じた段階index（0-4）を返す
const stageOf = (taps) => {
  let stage = -1
  POKE_THRESHOLDS.forEach((th, i) => { if (taps >= th) stage = i })
  return stage
}

// charId, tasks, userDoc, updateUserDoc, showToast を受け取って描画
export default function CharIndividualScreen({ charId, tasks, userDoc, updateUserDoc, showToast }) {
  const chara = getCharacterById(charId)

  // セッションタップ数（sessionStorage） — リロードでリセット
  const [sessionTaps, setSessionTaps] = useState(() => {
    const raw = sessionStorage.getItem(SS_KEY_POKE)
    if (!raw) return 0
    try { return JSON.parse(raw)[charId] ?? 0 } catch { return 0 }
  })

  const cumulative = userDoc.pokeCount?.[charId] ?? 0
  const stage = stageOf(sessionTaps)
  const currentLine = stage >= 0 ? POKE_LINES[charId]?.[stage] : null
  const nextThreshold = POKE_THRESHOLDS[stage + 1]
  const remainingToNext = nextThreshold ? nextThreshold - sessionTaps : null

  const writePending = useRef(0)

  const handlePoke = () => {
    const newSession = sessionTaps + 1
    setSessionTaps(newSession)
    // sessionStorage更新（charId別）
    let pool = {}
    try { pool = JSON.parse(sessionStorage.getItem(SS_KEY_POKE) ?? '{}') } catch {}
    pool[charId] = newSession
    sessionStorage.setItem(SS_KEY_POKE, JSON.stringify(pool))

    // 累計はFirestoreにバッチで反映（タップ連打を考慮し簡易デバウンス）
    writePending.current += 1
    setTimeout(() => {
      if (writePending.current === 0) return
      const inc = writePending.current
      writePending.current = 0
      updateUserDoc({
        pokeCount: { ...userDoc.pokeCount, [charId]: (userDoc.pokeCount?.[charId] ?? 0) + inc },
      })
    }, 400)
  }

  // キャラ情報: 完了タスク数 + カテゴリTOP3
  const stats = useMemo(() => {
    const myDone = tasks.filter((t) => t.character === charId && t.status === 'done')
    const byCat = new Map()
    for (const t of myDone) {
      const c = t.category || 'other'
      byCat.set(c, (byCat.get(c) ?? 0) + 1)
    }
    const top3 = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    return { doneCount: myDone.length, top3 }
  }, [tasks, charId])

  if (!chara) return null

  return (
    <div className="char-individual">
      {/* つんつんエリア */}
      <section className="poke-section">
        <motion.div
          className="poke-image-wrap"
          whileTap={{ scale: 0.95 }}
          onClick={handlePoke}
          role="button"
          aria-label={`${chara.name}をつんつん`}
        >
          <CharImage
            characterId={chara.id}
            faceKey={currentLine?.face ?? 'default'}
            faceEmoji={currentLine ? FACE_MAP[currentLine.face] : null}
            charEmoji={chara.emoji}
            size={220}
            className="poke-image"
          />
        </motion.div>

        {/* セリフ吹き出し */}
        {currentLine && (
          <motion.div
            key={`${charId}-${stage}`}
            className="poke-bubble"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ borderColor: chara.color }}
          >
            <span className="poke-bubble-face">{FACE_MAP[currentLine.face]}</span>
            <p className="poke-bubble-text">{currentLine.text}</p>
          </motion.div>
        )}

        <div className="poke-counters">
          <div>段階 <strong>{Math.max(stage + 1, 0)} / 5</strong></div>
          <div>セッション <strong>{sessionTaps}</strong> 回</div>
          <div>累計 <strong>{cumulative + sessionTaps}</strong> 回</div>
          {remainingToNext != null && (
            <div className="poke-next">次の段階まで {remainingToNext} 回</div>
          )}
        </div>
      </section>

      <hr className="char-divider" />

      {/* キャラ情報カード */}
      <section className="char-info-card" style={{ borderColor: chara.color }}>
        <h3 className="char-info-name" style={{ color: chara.color }}>{chara.emoji} {chara.name}</h3>
        <p className="char-info-title">{chara.title}</p>
        <p className="char-info-bio">{chara.bio ?? chara.notes}</p>

        <div className="char-info-stats">
          <div className="char-stat">
            <span className="char-stat-label">完了タスク数</span>
            <span className="char-stat-value">{stats.doneCount}</span>
          </div>
          <div className="char-stat">
            <span className="char-stat-label">累計つんつん</span>
            <span className="char-stat-value">{cumulative + sessionTaps}</span>
          </div>
        </div>

        <div className="char-top3">
          <div className="char-top3-label">得意カテゴリ TOP3</div>
          {stats.top3.length === 0 ? (
            <p className="char-top3-empty">完了タスクがまだありません</p>
          ) : (
            <ol className="char-top3-list">
              {stats.top3.map(([cat, count]) => (
                <li key={cat}><span className="char-top3-cat">{cat}</span><span className="char-top3-count">{count}件</span></li>
              ))}
            </ol>
          )}
        </div>

        <div className="char-params">
          <div className="char-params-label">ステータス</div>
          {Object.entries(chara.params).map(([k, v]) => {
            // 数値以外（"high"等）はそのまま表示。数値は0-100スケールに収めてバー表示
            const isNum = typeof v === 'number'
            // baseMoodは0-100。それ以外は0-2程度なのでそのまま50倍など簡略化
            let pct = 0
            if (isNum) {
              if (k === 'baseMood') pct = Math.min(100, v)
              else if (k === 'neglectTolerance') pct = Math.min(100, v / 100)
              else pct = Math.min(100, v * 50)
            }
            return (
              <div key={k} className="char-param-row">
                <span className="char-param-key">{k}</span>
                {isNum ? (
                  <span className="char-param-bar">
                    <span className="char-param-fill" style={{ width: `${pct}%`, background: chara.color }} />
                    <span className="char-param-val">{v}</span>
                  </span>
                ) : (
                  <span className="char-param-text">{v}</span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ギャラリーセクション — §7 */}
      <Gallery characterId={charId} showToast={showToast} />
    </div>
  )
}

CharIndividualScreen.CHARS = CHARACTERS
