// クリップボードコピーユーティリティ（仕様書 Phase5 §6）
// navigator.clipboard.writeText を使用（HTTPS 必須・Firebase Hosting で利用可能）
import { CATEGORIES } from '../data/categories.js'
import { getCharacterById } from '../data/characters.js'
import { tsToLocalDateStr } from './date.js'

// タスクオブジェクトを仕様書フォーマットの文字列に変換してクリップボードにコピーする
export const copyTaskToClipboard = async (task) => {
  const cat   = CATEGORIES.find((c) => c.id === task.category)
  const chara = getCharacterById(task.character)
  const due   = tsToLocalDateStr(task.dueDate)

  const text = [
    `【タスク】${task.title}`,
    `【カテゴリ】${cat ? `${cat.emoji} ${cat.label}` : 'なし'}`,
    `【担当】${chara ? `${chara.emoji} ${chara.name}` : 'なし'}`,
    `【期限】${due ?? 'なし'}`,
    `【メモ】${task.note || 'なし'}`,
    `【画像】${task.imageUrl ? '添付あり' : 'なし'}`,
  ].join('\n')

  await navigator.clipboard.writeText(text)
}
