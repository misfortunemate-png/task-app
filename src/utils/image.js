// 画像リサイズユーティリティ — spec-phase4.md §7
// prompt-vault-v2 の resizeImage / makeThumb 相当
// File → 縮小したJPEG dataURL を返す

const fileToImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(reader.error)
  reader.onload = () => {
    const img = new Image()
    img.onerror = () => reject(new Error('画像読み込み失敗'))
    img.onload  = () => resolve(img)
    img.src = reader.result
  }
  reader.readAsDataURL(file)
})

const drawAndExport = (img, maxLong, quality) => {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const long = Math.max(w, h)
  const scale = long > maxLong ? maxLong / long : 1
  const cw = Math.round(w * scale)
  const ch = Math.round(h * scale)
  const canvas = document.createElement('canvas')
  canvas.width = cw; canvas.height = ch
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, cw, ch)
  return canvas.toDataURL('image/jpeg', quality)
}

// 長辺800px / quality75% — フル表示用
export const resizeImage = async (file) => {
  const img = await fileToImage(file)
  return drawAndExport(img, 800, 0.75)
}

// 長辺400px / quality60% — サムネイル用
export const makeThumb = async (file) => {
  const img = await fileToImage(file)
  return drawAndExport(img, 400, 0.6)
}

// 1ファイルから {fullData, thumbData} を生成
export const processGalleryFile = async (file) => {
  const img = await fileToImage(file)
  return {
    fullData:  drawAndExport(img, 800, 0.75),
    thumbData: drawAndExport(img, 400, 0.6),
  }
}
