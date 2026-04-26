// 週次（月曜始まり）ユーティリティ — spec-phase4.md §3 §B2
import { toLocalDateStr } from './date.js'

// 指定日(またはnow)を含む週の月曜0:00（ローカル）Date
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // getDay: 0(日)〜6(土)。月曜始まりにするため、日曜は-6、それ以外は1-getDay
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}

// 同週の日曜23:59:59
export const endOfWeek = (date = new Date()) => {
  const s = startOfWeek(date)
  const e = new Date(s)
  e.setDate(e.getDate() + 6)
  e.setHours(23, 59, 59, 999)
  return e
}

// ISO週番号文字列（"2026-W17"のような形）— 週リセット判定用
// 簡易実装（厳密なISO 8601ではないが、週単位の一意性は確保）
export const weekKey = (date = new Date()) => {
  const s = startOfWeek(date)
  return toLocalDateStr(s) // 月曜日付をそのままキーに使う
}

// 表示用: "4/22 (月) - 4/28 (日)"
export const formatWeekRange = (date = new Date()) => {
  const s = startOfWeek(date)
  const e = endOfWeek(date)
  const f = (d) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${f(s)} - ${f(e)}`
}
