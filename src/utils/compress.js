// 画像圧縮ユーティリティ — Canvas API でリサイズ+JPEG変換（仕様書 Phase5 §4.3 / §4追加修正）
// 入力: File/Blob → 出力: Blob（JPEG）
//
// 最適化方針（§4追加修正）:
//   - 長辺 800px（1200px→800px。Pixel 10の約2.5MB画像を1発で300KB以内に収める確率を上げる）
//   - createImageBitmap にリサイズを委ねる（Canvas drawImage より高速なブラウザネイティブリサイズ）
//   - ループ上限3回: 品質 0.7 → 0.65 → 0.6 で打ち切り（超過してもそのまま採用）

const MAX_LONG_SIDE = 800
const MAX_SIZE_BYTES = 300 * 1024  // 300KB
const QUALITIES = [0.7, 0.65, 0.6] // 最大3回試行

export const compressImage = async (file) => {
  // 1. 元サイズを取得するために一度 ImageBitmap を読み込む
  const original = await createImageBitmap(file)
  const { width, height } = original
  original.close()

  // 2. 長辺 800px にリサイズ比率を計算
  const scale = Math.min(1, MAX_LONG_SIDE / Math.max(width, height))
  const dstW = Math.round(width * scale)
  const dstH = Math.round(height * scale)

  // 3. createImageBitmap のリサイズオプションでブラウザネイティブ縮小
  //    drawImage より高速（GPU側で処理されるケースがある）
  const bitmap = await createImageBitmap(file, {
    resizeWidth: dstW,
    resizeHeight: dstH,
    resizeQuality: 'medium',
  })

  // 4. Canvas に 1:1 で描画（既にリサイズ済みのため drawImage コストが最小）
  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH
  canvas.getContext('2d').drawImage(bitmap, 0, 0)
  bitmap.close()

  // 5. 品質ループ（最大3回 / 300KB以内になった時点で即終了）
  let blob = null
  for (const quality of QUALITIES) {
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob || blob.size <= MAX_SIZE_BYTES) break
  }

  return blob
}
