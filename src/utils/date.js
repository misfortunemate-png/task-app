// 日付ユーティリティ — ローカルタイムゾーン基準で操作する
// toISOString()はUTC基準のためJST(+9h)環境で前日になるバグを防ぐ

// DateをローカルタイムゾーンでYYYY-MM-DD文字列に変換する
export const toLocalDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// FirestoreのTimestampまたはDateをローカル日付文字列に変換する
export const tsToLocalDateStr = (ts) => {
  if (!ts) return null
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return toLocalDateStr(d)
}
