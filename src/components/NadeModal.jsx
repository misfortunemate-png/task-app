// なでなでモーダル — 放置判定時に表示。タップでなでなでカウント→ロック解除
// spec-phase3.md §6
import { useState } from 'react'
import { NADE_LINES, FACE_MAP } from '../data/lines.js'
import { getCharacterById } from '../data/characters.js'
import CharImage from './CharImage.jsx'
import '../styles/NadeModal.css'

// task: 放置対象のタスクオブジェクト
// neglectLine: pickLine()で選択済みの放置セリフ { text, face }
// nadeThreshold: なでなで解除しきい値（設定画面から）
// debugMode: デバッグモードフラグ
// onClose: () => void — モーダルを閉じる
// onUnlock: (taskId) => Promise<void> — FirestoreのdueDateUnlockedをtrueに更新
export default function NadeModal({ task, neglectLine, nadeThreshold, debugMode, onClose, onUnlock }) {
  const [nadeCount, setNadeCount] = useState(0)
  const [unlocked, setUnlocked]   = useState(false)

  const chara = getCharacterById(task.character)
  if (!chara) return null

  const faceEmoji = FACE_MAP[neglectLine?.face] ?? '😊'

  // なでなでセリフを段階で返す
  // 序盤: 1〜floor(threshold/2)、途中: floor(threshold/2)+1〜threshold-1、解除: threshold到達時
  const getNadeStage = (count) => {
    if (count === 0) return null
    const half = Math.floor(nadeThreshold / 2)
    if (count >= nadeThreshold) return 'unlock'
    if (count > half) return 'mid'
    return 'early'
  }

  const nadeLine = NADE_LINES[task.character]
  const stage = getNadeStage(nadeCount)
  const currentNadeLine = stage ? nadeLine?.[stage] : null

  const handleNade = async () => {
    if (unlocked) return
    const next = nadeCount + 1
    setNadeCount(next)
    if (next >= nadeThreshold) {
      setUnlocked(true)
      await onUnlock(task.id)
    }
  }

  return (
    <div
      className="nade-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="nade-modal">
        {/* 放置セリフ（上部） */}
        <div className="nade-neglect-speech">
          <span className="nade-face">{faceEmoji}</span>
          <p className="nade-neglect-text">{neglectLine?.text}</p>
        </div>

        {/* タスク名 */}
        <p className="nade-task-title">「{task.title}」</p>

        {/* キャラ画像 — タップでなでなで */}
        <button
          className={`nade-chara-btn${unlocked ? ' unlocked' : ''}`}
          onClick={handleNade}
          style={{ color: chara.color }}
          aria-label="なでなで"
          disabled={unlocked}
        >
          <CharImage
            characterId={chara.id}
            faceKey={currentNadeLine?.face ?? neglectLine?.face ?? 'normal'}
            faceEmoji={currentNadeLine ? (FACE_MAP[currentNadeLine.face] ?? '😊') : faceEmoji}
            charEmoji={chara.emoji}
            size={110}
            className="nade-chara-image"
          />
        </button>

        {/* なでなでセリフ表示 */}
        {currentNadeLine && (
          <div className="nade-speech">
            <span>{FACE_MAP[currentNadeLine.face] ?? '😊'}</span>
            <p>{currentNadeLine.text}</p>
          </div>
        )}

        {/* デバッグモード: カウンター表示 */}
        {debugMode && (
          <p className="nade-debug">なでなで {nadeCount} / {nadeThreshold}</p>
        )}

        {unlocked ? (
          <p className="nade-unlock-msg">期限延長が解除されました</p>
        ) : (
          <p className="nade-hint">タップしてなでなで</p>
        )}

        <button className="nade-close" onClick={onClose}>閉じる</button>
      </div>
    </div>
  )
}
