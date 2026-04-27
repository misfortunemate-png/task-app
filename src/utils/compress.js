// 画像圧縮ユーティリティ — Canvas API でリサイズ+JPEG変換（仕様書 Phase5 §4.3）
// 入力: File/Blob → 出力: Blob（JPEG）
// 長辺 1200px にリサイズし、品質 0.7 から始めて 300KB 以下になるまで 0.05 刻みで下げる（下限 0.3）

const MAX_LONG_SIDE = 1200
const MAX_SIZE_BYTES = 300 * 1024  // 300KB
const INITIAL_QUALITY = 0.7
const QUALITY_STEP = 0.05
const MIN_QUALITY = 0.3

// File/Blob を ImageBitmap 経由で Canvas に描画し、圧縮済み Blob を返す
export const compressImage = async (file) => {
  // 1. ファイルを ImageBitmap として読み込む
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  // 2. 長辺 1200px にリサイズ比率を計算
  const scale = Math.min(1, MAX_LONG_SIDE / Math.max(width, height))
  const dstW = Math.round(width * scale)
  const dstH = Math.round(height * scale)

  // 3. Canvas に描画
  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, dstW, dstH)
  bitmap.close()

  // 4. 品質を調整しながら 300KB 以下になるまで再試行
  let quality = INITIAL_QUALITY
  let blob = null

  while (quality >= MIN_QUALITY) {
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob || blob.size <= MAX_SIZE_BYTES) break
    quality = Math.round((quality - QUALITY_STEP) * 100) / 100
  }

  // 下限でもまだ大きい場合はそのまま返す（許容）
  return blob
}
