// ルートコンポーネント — 認証管理・メインメニュー・画面ルーティング
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'
import Login from './components/Login.jsx'
import MainMenu from './components/MainMenu.jsx'
import TaskScreen from './components/TaskScreen.jsx'
import PlaceholderScreen from './components/PlaceholderScreen.jsx'

export default function App() {
  const [user, setUser]         = useState(undefined)
  const [activeTab, setActiveTab] = useState('task')
  const [charColor, setCharColor] = useState(null)

  // §7設定画面から読む値。App起動時にlocalStorageから取得
  const debugMode     = localStorage.getItem('debugMode') === 'true'
  const nadeThreshold = parseInt(localStorage.getItem('nadeThreshold') ?? '5', 10)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  if (user === undefined) return null
  if (!user) return <Login />

  const renderContent = () => {
    switch (activeTab) {
      case 'task':
        return (
          <TaskScreen
            user={user}
            onCharColorChange={setCharColor}
            debugMode={debugMode}
            nadeThreshold={nadeThreshold}
          />
        )
      case 'notification':
        return <PlaceholderScreen screenKey="notification" />
      case 'character':
        return <PlaceholderScreen screenKey="character" />
      case 'gacha':
        return <PlaceholderScreen screenKey="gacha" />
      case 'settings':
        // §7で実装。暫定プレースホルダー
        return <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-muted)' }}>設定画面（準備中）</div>
      default:
        return null
    }
  }

  return (
    <div className="app">
      <MainMenu activeTab={activeTab} onTabChange={setActiveTab} charColor={charColor} />
      <div className="app-content">
        {renderContent()}
      </div>
    </div>
  )
}
