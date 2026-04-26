// キャラテーマCSS変数をdocument.documentElementに適用するユーティリティ
// 将来イラスト差し替え等の拡張もここを起点にする
export function applyCharTheme(character) {
  const root = document.documentElement
  if (!character) {
    root.style.removeProperty('--char-color')
    root.style.removeProperty('--char-color-bg')
    root.style.removeProperty('--char-color-accent')
  } else {
    root.style.setProperty('--char-color', character.color)
    root.style.setProperty('--char-color-bg', character.colorBg)
    root.style.setProperty('--char-color-accent', character.colorAccent)
  }
}
