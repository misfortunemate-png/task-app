// キャラ画面 — 個別キャラタブ — spec-phase4.md §2 + 修正指示書 修正1/修正2
// 縦スクロール: つんつんエリア → 機嫌+キャラ情報 → ギャラリー
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { getCharacterById, CHARACTERS } from '../data/characters.js'
import { POKE_LINES, POKE_THRESHOLDS, FACE_MAP } from '../data/lines.js'
import { startOfWeek } from '../utils/week.js'
import CharImage from './CharImage.jsx'
import Gallery from './Gallery.jsx'
import '../styles/CharScreen.css'

const SS_KEY_POKE = 'pokeSession'
const POKE_COOLDOWN_MS = 30_000  // 修正1: 最終タップから30秒で session を 0 にリセット

const stageOf = (taps) => {
  let stage = -1
  POKE_THRESHOLDS.forEach((th, i) => { if (taps >= th) stage = i })
  return stage
}

const readSessionTaps = (charId) => {
  try {
    const pool = JSON.parse(sessionStorage.getItem(SS_KEY_POKE) ?? '{}')
    return pool[charId] ?? 0
  } catch { return 0 }
}
const writeSessionTaps = (charId, n) => {
  let pool = {}
  try { pool = JSON.parse(sessionStorage.getItem(SS_KEY_POKE) ?? '{}') } catch { /* noop */ }
  pool[charId] = n
  sessionStorage.setItem(SS_KEY_POKE, JSON.stringify(pool))
}

// 修正2: 機嫌値計算 — baseMood + skinship*tap + taskLoyalty*週内完了 + moodModifier時間帯
// 引数: chara定義, sessionTaps（クールダウンでリセットされる）, weekDoneCount, now
const computeMood = (chara, sessionTaps, weekDoneCount, now = new Date()) => {
  const p = chara.params
  let mood = p.baseMood ?? 50
  // スキンシップ: タップ1回ごとに +1 を skinshipTolerance で係数化
  mood += sessionTaps * 1 * (p.skinshipTolerance ?? 1)
  // 完了タスク: 1件ごとに +2 を taskLoyalty で係数化
  mood += weekDoneCount * 2 * (p.taskLoyalty ?? 1)
  // 時間帯モディファイア
  const h = now.getHours()
  const isMorning = h >= 5 && h < 11
  const isEvening = (h >= 17 && h < 23) || h < 5  // 夜帯
  if (p.moodModifier === 'high') {
    if (isMorning) mood += 10
    if (isEvening) mood -= 5
  } else if (p.moodModifier === 'conditional') {
    if (isEvening) mood += 10
  }
  return Math.max(0, Math.min(100, Math.round(mood)))
}

const moodLabel = (m) => {
  if (m >= 80) return 'ご機嫌'
  if (m >= 60) return 'あまあま'
  if (m >= 40) return '普通'
  if (m >= 20) return 'むっすり'
  return '拗ね'
}

export default function CharIndividualScreen({ charId, tasks, userDoc, updateUserDoc, showToast }) {
  const chara = getCharacterById(charId)

  // 修正1: charId切替を検知し、sessionStorageから該当キャラのカウントを再読み込み
  const [sessionTaps, setSessionTaps] = useState(() => readSessionTaps(charId))
  useEffect(() => {
    setSessionTaps(readSessionTaps(charId))
  }, [charId])

  // 修正1: クールダウン用タイマー
  const cooldownTimer = useRef(null)
  // 累計のFirestore反映を簡易デバウンス
  const writePending = useRef(0)
  const writeTimer   = useRef(null)

  const cumulative = userDoc.pokeCount?.[charId] ?? 0
  const stage = stageOf(sessionTaps)
  const currentLine = stage >= 0 ? POKE_LINES[charId]?.[stage] : null
  const nextThreshold = POKE_THRESHOLDS[stage + 1]
  const remainingToNext = nextThreshold ? nextThreshold - sessionTaps : null

  const resetSession = useCallback(() => {
    setSessionTaps(0)
    writeSessionTaps(charId, 0)
  }, [charId])

  const handlePoke = () => {
    const newSession = sessionTaps + 1
    setSessionTaps(newSession)
    writeSessionTaps(charId, newSession)

    // 修正1: クールダウン延長
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(resetSession, POKE_COOLDOWN_MS)

    // 累計はバッチ反映
    writePending.current += 1
    if (writeTimer.current) clearTimeout(writeTimer.current)
    writeTimer.current = setTimeout(() => {
      const inc = writePending.current
      writePending.current = 0
      if (inc <= 0) return
      updateUserDoc({
        pokeCount: { ...userDoc.pokeCount, [charId]: (userDoc.pokeCount?.[charId] ?? 0) + inc },
      })
    }, 400)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
      if (writeTimer.current)    clearTimeout(writeTimer.current)
    }
  }, [])

  // キャラ統計
  const stats = useMemo(() => {
    const myDone = tasks.filter((t) => t.character === charId && t.status === 'done')
    const byCat = new Map()
    for (const t of myDone) {
      const c = t.category || 'other'
      byCat.set(c, (byCat.get(c) ?? 0) + 1)
    }
    const top3 = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    // 今週の完了数（機嫌計算用）
    const ws = startOfWeek().getTime()
    const weekDone = myDone.filter((t) => (t.completedAt?.toMillis?.() ?? 0) >= ws).length
    return { doneCount: myDone.length, top3, weekDone }
  }, [tasks, charId])

  // 修正2: 機嫌値・ラベル
  const mood = chara ? computeMood(chara, sessionTaps, stats.weekDone) : 0
  const label = moodLabel(mood)

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

        {/* 修正2: 機嫌表記（バーの上） */}
        <div className="char-mood-row" style={{ borderColor: chara.color, color: chara.color }}>
          <span className="char-mood-label">{chara.emoji} {label}</span>
          <span className="char-mood-value">{mood}/100</span>
        </div>

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
            const isNum = typeof v === 'number'
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
