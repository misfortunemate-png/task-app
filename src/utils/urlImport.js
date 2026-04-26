// URLハッシュフラグメント インポート — spec-phase4.md §1
// フォーマット: #import/<URLセーフBase64(JSON)>
// JSONスキーマ: { title, character, category?, dueDate?, note?, lines?, rewardPrompt? }

import { CHARACTERS } from '../data/characters.js'

const VALID_CHAR_IDS = CHARACTERS.map((c) => c.id)

// URLセーフBase64 → 通常Base64 → UTF-8文字列
const decodeUrlSafeBase64 = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  // atobはLatin1。UTF-8として解釈し直す
  const bin = atob(b64 + pad)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

// 解析結果の最小バリデーション
const validate = (data) => {
  if (!data || typeof data !== 'object') return null
  if (typeof data.title !== 'string' || !data.title.trim()) return null
  if (!VALID_CHAR_IDS.includes(data.character)) return null
  if (data.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)) return null
  if (data.lines && !Array.isArray(data.lines)) return null
  return {
    title:        data.title.trim(),
    character:    data.character,
    category:     typeof data.category === 'string' ? data.category : '',
    dueDate:      data.dueDate ?? '',
    note:         typeof data.note === 'string' ? data.note : '',
    lines:        data.lines ?? [],
    rewardPrompt: typeof data.rewardPrompt === 'string' ? data.rewardPrompt : '',
  }
}

// location.hash を解析し、有効な import データを返す。失敗時は null
// errorCallback: メッセージ文字列を受け取る（トースト用）
export const parseImportHash = (hash, errorCallback) => {
  if (!hash || !hash.startsWith('#import/')) return null
  const payload = hash.slice('#import/'.length)
  if (!payload) return null
  try {
    const json = decodeUrlSafeBase64(payload)
    const data = JSON.parse(json)
    const valid = validate(data)
    if (!valid) {
      errorCallback?.('インポートURLの内容が不正です')
      return null
    }
    return valid
  } catch {
    errorCallback?.('インポートURLの解析に失敗しました')
    return null
  }
}

// 現在のhashをクリーンにする（履歴を汚さない）
export const clearImportHash = () => {
  history.replaceState(null, '', location.pathname + location.search)
}
