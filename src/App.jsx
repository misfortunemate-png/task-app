// ルートコンポーネント — 認証管理・メインメニュー・画面ルーティング
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'
import Login from './components/Login.jsx'
import MainMenu from './components/MainMenu.jsx'
import TaskScreen from './components/TaskScreen.jsx'
import PlaceholderScreen from './components/PlaceholderScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'

export default function App() {
  const [user, setUser]         = useState(undefined)
  const [activeTab, setActiveTab] = useState('task')
  const [charColor, setCharColor] = useState(null)

  // §7設定値。設定変更時に再レンダリングするためstateで管理
  const [debugMode, setDebugMode]         = useState(localStorage.getItem('debugMode') === 'true')
  const [nadeThreshold, setNadeThreshold] = useState(parseInt(localStorage.getItem('nadeThreshold') ?? '5', 10))

  const handleSettingsChange = (s) => {
    setDebugMode(s.debugMode)
    setNadeThreshold(s.nadeThreshold)
  }

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
        return <SettingsScreen onSettingsChange={handleSettingsChange} />
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
