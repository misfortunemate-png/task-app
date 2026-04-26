// メインメニュー（1層目）— 上部固定5タブバー — spec-phase3.md §2
import '../styles/MainMenu.css'

const TABS = [
  { key: 'task',         label: 'タスク', icon: '🏠' },
  { key: 'notification', label: '通知',   icon: '🔔' },
  { key: 'character',    label: 'キャラ', icon: '👧' },
  { key: 'gacha',        label: 'ガチャ', icon: '🎰' },
  { key: 'settings',     label: '設定',   icon: '⚙️' },
]

// activeTab: 現在選択中のタブkey
// charColor: キャラタブ選択時のアクセントカラー（全員タブ時はnull）
export default function MainMenu({ activeTab, onTabChange, charColor }) {
  return (
    <nav className="main-menu" style={charColor ? { '--menu-accent': charColor } : {}}>
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`main-menu-tab${activeTab === t.key ? ' active' : ''}`}
          onClick={() => onTabChange(t.key)}
          aria-current={activeTab === t.key ? 'page' : undefined}
        >
          <span className="main-menu-icon">{t.icon}</span>
          <span className="main-menu-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
