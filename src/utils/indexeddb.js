// IndexedDB ユーティリティ — spec-phase4.md §B2 §7
// ギャラリー画像（task-app-gallery / images ストア）のCRUDを提供
// prompt-vault-v2 の db.js 相当

const DB_NAME = 'task-app-gallery'
const DB_VERSION = 1
const STORE = 'images'

let dbPromise = null

const openDB = () => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('taskId', 'taskId', { unique: false })
        store.createIndex('characterId', 'characterId', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
    req.onsuccess  = () => resolve(req.result)
    req.onerror    = () => reject(req.error)
  })
  return dbPromise
}

const tx = async (mode) => {
  const db = await openDB()
  return db.transaction(STORE, mode).objectStore(STORE)
}

const reqToPromise = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result)
  req.onerror   = () => reject(req.error)
})

// 保存: { id, taskId, characterId, thumbData, fullData, createdAt }
export const putImage = async (image) => {
  const store = await tx('readwrite')
  return reqToPromise(store.put(image))
}

export const getImage = async (id) => {
  const store = await tx('readonly')
  return reqToPromise(store.get(id))
}

export const deleteImage = async (id) => {
  const store = await tx('readwrite')
  return reqToPromise(store.delete(id))
}

// 全件取得（createdAt降順）
export const listImages = async (filter = {}) => {
  const store = await tx('readonly')
  const items = await reqToPromise(store.getAll())
  return items
    .filter((it) => {
      if (filter.characterId && it.characterId !== filter.characterId) return false
      if (filter.taskId && it.taskId !== filter.taskId) return false
      return true
    })
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}
