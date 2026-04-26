// キャラ画像コンポーネント — 3ステート表示
// face画像あり → face画像のみ
// face画像なし・default.pngあり → default.png + 表情emoji overlay
// どちらもなし → emoji のみ（従来動作）
import { resolveCharImage } from '../utils/charImage.js'

// characterId: string
// faceKey: string — FACE_MAPのキー（"normal" など）
// faceEmoji: string — 表情emoji（overlayおよびfallback用）
// charEmoji: string — キャラemoji（fallback用）
// size: number — 画像の幅/高さ px（デフォルト 96）
// className: string — 外側ラッパーに追加するクラス
export default function CharImage({ characterId, faceKey = 'default', faceEmoji, charEmoji, size = 96, className = '' }) {
  const result = resolveCharImage(characterId, faceKey)

  const imgStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
  }

  if (result.type === 'face') {
    return (
      <div className={`char-image-wrap ${className}`} style={{ width: size, height: size }}>
        <img src={result.src} alt={characterId} style={imgStyle} />
      </div>
    )
  }

  if (result.type === 'default') {
    return (
      <div className={`char-image-wrap char-image-with-overlay ${className}`} style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
        <img src={result.src} alt={characterId} style={imgStyle} />
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

  // fallback: emoji のみ
  return (
    <div className={`char-image-wrap char-image-emoji-only ${className}`} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: Math.round(size * 0.75), lineHeight: 1 }}>{charEmoji}</span>
    </div>
  )
}
