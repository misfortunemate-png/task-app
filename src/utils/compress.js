// 画像圧縮ユーティリティ — Canvas API でリサイズ+JPEG変換（仕様書 Phase5 §4.3）
// 入力: File/Blob → 出力: Blob（JPEG）
//
// 最適化:
//   - createImageBitmap は1回のみ（寸法取得と描画を同一 bitmap で行う）
//   - 長辺 800px にリサイズ後、品質 0.7 で JPEG 変換
//   - 300KB 超の場合のみ 0.65→0.60 と最大2回再試行（超過時はそのまま採用）

const MAX_LONG_SIDE = 800
const MAX_SIZE_BYTES = 300 * 1024  // 300KB
const QUALITIES = [0.7, 0.65, 0.60]

export const compressImage = async (file) => {
  // 1. デコードは1回だけ — bitmap を寸法取得と描画の両方に使い回す
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  // 2. 長辺 800px にリサイズ比率を計算
  const scale = Math.min(1, MAX_LONG_SIDE / Math.max(width, height))
  const dstW = Math.round(width * scale)
  const dstH = Math.round(height * scale)

  // 3. 縮小後サイズの Canvas に描画（drawImage の src→dst スケーリングで GPU リサイズ）
  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH
  canvas.getContext('2d').drawImage(bitmap, 0, 0, dstW, dstH)
  bitmap.close()

  // 4. 品質ループ（300KB 以内なら即終了、超過時のみ最大2段階下げる）
  let blob = null
  for (const quality of QUALITIES) {
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob || blob.size <= MAX_SIZE_BYTES) break
  }

  return blob
}
