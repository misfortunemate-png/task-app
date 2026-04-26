// 2層目ナビ（汎用 SubNav） — spec-phase4.md §B0
// タスク画面（キャラフィルタ）とキャラ画面（個別キャラ + ランキング）で共用する
// applyCharThemeはCharTab使用側で呼び出す
import '../styles/CharTab.css'

// tabs:    [{ key, label, color? }, ...]
// activeKey: string | null
// onChange:  (key) => void
export default function CharTab({ tabs, activeKey, onChange }) {
  return (
    <div className="char-tab">
      <div className="char-tab-nav">
        {tabs.map((t) => {
          const isActive = activeKey === t.key
          return (
            <button
              key={t.key ?? '__null__'}
              className={`char-tab-btn${isActive ? ' active' : ''}`}
              onClick={() => onChange(t.key)}
              style={isActive && t.color ? { color: t.color, borderBottomColor: t.color } : {}}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
