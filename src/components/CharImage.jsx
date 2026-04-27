// キャラ画像コンポーネント — onError 3段階フォールバック（仕様書 Phase5 §7.3）
// フォールバックチェーン: faceSrc → defaultSrc → emoji表示
// propsインターフェースは変更しない（§7.2依存関係確認済み）
import { useState } from 'react'
import { getCharImageSrc } from '../utils/charImage.js'

// characterId: string
// faceKey: string — 表情キー（"normal" など）
// faceEmoji: string — 表情emoji（overlayおよびfallback用）
// charEmoji: string — キャラemoji（fallback用）
// size: number — 画像の幅/高さ px（デフォルト 96）
// className: string — 外側ラッパーに追加するクラス
export default function CharImage({ characterId, faceKey = 'default', faceEmoji, charEmoji, size = 96, className = '' }) {
  // 0: faceSrc試行中, 1: defaultSrc試行中, 2: emoji表示
  const [stage, setStage] = useState(0)
  const { faceSrc, defaultSrc } = getCharImageSrc(characterId, faceKey)

  const imgStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
  }

  // stage 2: emoji のみ表示
  if (stage === 2) {
    return (
      <div className={`char-image-wrap char-image-emoji-only ${className}`} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: Math.round(size * 0.75), lineHeight: 1 }}>{charEmoji}</span>
      </div>
    )
  }

  // stage 1: defaultSrc（faceEmoji overlay付き）
  if (stage === 1) {
    return (
      <div className={`char-image-wrap char-image-with-overlay ${className}`} style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
        <img
          src={defaultSrc}
          alt={characterId}
          style={imgStyle}
          onError={() => setStage(2)}
        />
        {faceEmoji && (
          <span className="char-image-face-overlay" style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            fontSize: Math.round(size * 0.33),
            lineHeight: 1,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }}>
            {faceEmoji}
          </span>
        )}
      </div>
    )
  }

  // stage 0: faceSrc試行（faceKey === 'default' のときは stage 1 と同じ表示になるが動作は同一）
  return (
    <div className={`char-image-wrap ${className}`} style={{ width: size, height: size }}>
      <img
        src={faceSrc}
        alt={characterId}
        style={imgStyle}
        onError={() => setStage(faceKey === 'default' ? 2 : 1)}
      />
    </div>
  )
}
