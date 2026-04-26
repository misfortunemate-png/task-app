// キャラ画像解決ユーティリティ — import.meta.glob でビルド時に解決
// パス規則: src/assets/characters/{charId}/{faceKey}.png
// 存在しないキーは undefined を返す
const imageModules = import.meta.glob('../assets/characters/**/*.png', { eager: true })

// モジュールマップを { "charId/faceKey": url } 形式に正規化
const IMAGE_MAP = {}
for (const [path, mod] of Object.entries(imageModules)) {
  // ../assets/characters/hakone/default.png → "hakone/default"
  const match = path.match(/characters\/([^/]+)\/([^/]+)\.png$/)
  if (match) {
    IMAGE_MAP[`${match[1]}/${match[2]}`] = mod.default
  }
}

// 3ステート画像解決
// 戻り値: { type: 'face'|'default'|'emoji', src?: string }
export const resolveCharImage = (charId, faceKey = 'default') => {
  const faceUrl = IMAGE_MAP[`${charId}/${faceKey}`]
  if (faceUrl) return { type: 'face', src: faceUrl }

  const defaultUrl = IMAGE_MAP[`${charId}/default`]
  if (defaultUrl) return { type: 'default', src: defaultUrl }

  return { type: 'emoji' }
}
