// 画像圧縮ユーティリティ — Canvas API でリサイズ+JPEG変換（仕様書 Phase5 §4.3）
// 入力: File/Blob → 出力: Blob（JPEG）
// デコードは1回のみ（bitmap を寸法取得と描画に使い回す）

const MAX_SIZE_BYTES = 300 * 1024  // 300KB
const QUALITIES = [0.7, 0.65, 0.60]

// Canvas に bitmap を指定サイズで描画し JPEG Blob を返す（内部共通処理）
const _drawAndEncode = async (bitmap, dstW, dstH, qualities, maxBytes) => {
  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH
  canvas.getContext('2d').drawImage(bitmap, 0, 0, dstW, dstH)

  let blob = null
  for (const quality of qualities) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size <= maxBytes) break
  }
  return blob
}

// メイン画像: 長辺 800px・300KB 以下（仕様書 §4.3 / §4追加修正）
export const compressImage = async (file) => {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  const scale = Math.min(1, 800 / Math.max(width, height))
  const blob = await _drawAndEncode(bitmap, Math.round(width * scale), Math.round(height * scale), QUALITIES, MAX_SIZE_BYTES)
  bitmap.close()
  return blob
}

// サムネイル: 長辺 200px・軽量（タスク一覧の高速表示用）
// 約 8〜15KB になるため一覧ロードが大幅に速くなる
export const compressThumbnail = async (file) => {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  const scale = Math.min(1, 200 / Math.max(width, height))
  // 品質 0.65 固定・上限なし（サムネイルは画質より速度優先）
  const blob = await _drawAndEncode(bitmap, Math.round(width * scale), Math.round(height * scale), [0.65], Infinity)
  bitmap.close()
  return blob
}
