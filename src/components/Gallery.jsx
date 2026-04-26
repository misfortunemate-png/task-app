// ギャラリーセクション — spec-phase4.md §7
// IndexedDBから画像を読み、3列グリッド表示。+セルでファイル取込。タップで拡大表示(M8)
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { listImages, putImage, deleteImage } from '../utils/indexeddb.js'
import { processGalleryFile } from '../utils/image.js'
import '../styles/Gallery.css'

export default function Gallery({ characterId, showToast }) {
  const [images, setImages] = useState([])
  const [busy, setBusy]     = useState(false)
  const [viewer, setViewer] = useState(null) // {index} | null

  const reload = useCallback(async () => {
    const items = await listImages({ characterId })
    setImages(items)
  }, [characterId])

  useEffect(() => { reload() }, [reload])

  const handlePick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const { fullData, thumbData } = await processGalleryFile(file)
      const id = (crypto.randomUUID?.() ?? `img-${Date.now()}`)
      await putImage({
        id, taskId: null, characterId,
        thumbData, fullData,
        createdAt: Date.now(),
      })
      await reload()
      showToast?.('画像を追加しました', 'success')
    } catch (err) {
      console.error(err)
      showToast?.('画像の追加に失敗しました', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('この画像を削除しますか？')) return
    await deleteImage(id)
    setViewer(null)
    await reload()
  }

  const goPrev = () => setViewer((v) => v && { index: (v.index - 1 + images.length) % images.length })
  const goNext = () => setViewer((v) => v && { index: (v.index + 1) % images.length })

  return (
    <section className="gallery-section">
      <div className="gallery-head">
        <h3 className="gallery-title">ギャラリー（{images.length}件）</h3>
      </div>

      <div className="gallery-grid">
        {/* +セル */}
        <label className="gallery-cell gallery-add">
          <input type="file" accept="image/*" onChange={handlePick} hidden disabled={busy} />
          <span className="gallery-add-icon">＋</span>
        </label>

        {images.map((img, i) => (
          <button
            key={img.id}
            className="gallery-cell"
            onClick={() => setViewer({ index: i })}
          >
            <img src={img.thumbData} alt="" />
          </button>
        ))}
      </div>

      {/* M8 拡大表示 */}
      <AnimatePresence>
        {viewer && images[viewer.index] && (
          <motion.div
            className="gallery-viewer-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setViewer(null)}
          >
            <button className="gallery-viewer-btn gallery-viewer-prev" onClick={goPrev}>‹</button>
            <motion.img
              key={images[viewer.index].id}
              className="gallery-viewer-img"
              src={images[viewer.index].fullData}
              alt=""
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            />
            <button className="gallery-viewer-btn gallery-viewer-next" onClick={goNext}>›</button>
            <button className="gallery-viewer-close" onClick={() => setViewer(null)}>✕</button>
            <button className="gallery-viewer-delete" onClick={() => handleDelete(images[viewer.index].id)}>削除</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
