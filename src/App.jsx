// ルートコンポーネント — 認証管理・上部メニュー（1層目+2層目）・画面ルーティング
// spec-phase4.md §B0
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'
import Login from './components/Login.jsx'
import MainMenu from './components/MainMenu.jsx'
import CharTab from './components/CharTab.jsx'
import TaskScreen from './components/TaskScreen.jsx'
import CharScreen from './components/CharScreen.jsx'
import GachaScreen from './components/GachaScreen.jsx'
import PlaceholderScreen from './components/PlaceholderScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'
import { ToastContainer } from './components/Toast.jsx'
import { useToast } from './hooks/useToast.js'
import { useUserDoc } from './hooks/useUserDoc.js'
import { useTasks } from './hooks/useTasks.js'
import { CHARACTERS, getCharacterById } from './data/characters.js'
import { registerImportedLines } from './data/lines.js'
import { applyCharTheme } from './utils/theme.js'
import { parseImportHash, clearImportHash } from './utils/urlImport.js'

// 2層目ナビ定義 — 1層目タブ別に切り替える
const TASK_SUBNAV = [
  { key: null,      label: '全員' },
  ...CHARACTERS.map((c) => ({ key: c.id, label: `${c.emoji} ${c.name}`, color: c.color })),
]
const CHAR_SUBNAV = [
  ...CHARACTERS.map((c) => ({ key: c.id, label: `${c.emoji} ${c.name}`, color: c.color })),
  { key: 'ranking', label: '📊' },
]

export default function App() {
  const [user, setUser]           = useState(undefined)
  const [activeTab, setActiveTab] = useState('task')

  // 2層目選択状態（タブごとに独立保持）
  const [taskCharFilter, setTaskCharFilter] = useState(null)         // null | charId
  const [charScreenKey, setCharScreenKey]   = useState(CHARACTERS[0].id) // charId | 'ranking'

  // §7設定値
  const [debugMode, setDebugMode]         = useState(localStorage.getItem('debugMode') === 'true')
  const [nadeThreshold, setNadeThreshold] = useState(parseInt(localStorage.getItem('nadeThreshold') ?? '5', 10))
  const { toasts, showToast, removeToast } = useToast()

  // §4 §B2: ユーザー設定（chickets, pokeCount, gachaInventory）
  const { userDoc, updateUserDoc } = useUserDoc(user?.uid, showToast)
  // タスク購読を App.jsx に一本化（_STATUS.md PG指摘#4 — 二重購読解消）
  const { tasks, addTask, updateTask, toggleDone, deleteTask } = useTasks(user?.uid, showToast)

  // §1 URLインポート: マウント時にハッシュを解析。成功なら追加モーダルをプリフィル起動
  const [pendingImport, setPendingImport] = useState(null)

  const handleSettingsChange = (s) => {
    setDebugMode(s.debugMode)
    setNadeThreshold(s.nadeThreshold)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  // §1 ハッシュ解析 — 認証完了後に1度だけ実行
  useEffect(() => {
    if (!user) return
    const data = parseImportHash(location.hash, (msg) => showToast(msg, 'error'))
    clearImportHash()
    if (!data) return
    if (data.lines?.length) registerImportedLines(data.lines)
    setActiveTab('task')
    setPendingImport(data)
  }, [user, showToast])

  // 2層目選択 → CSSテーマ反映
  useEffect(() => {
    if (activeTab === 'task') {
      applyCharTheme(taskCharFilter ? getCharacterById(taskCharFilter) : null)
    } else if (activeTab === 'character' && charScreenKey !== 'ranking') {
      applyCharTheme(getCharacterById(charScreenKey))
    } else {
      applyCharTheme(null)
    }
  }, [activeTab, taskCharFilter, charScreenKey])

  if (user === undefined) return null
  if (!user) return <Login />

  // 1層目タブのアクセントカラー（active時の色）
  const menuAccent = (() => {
    if (activeTab === 'task' && taskCharFilter) return getCharacterById(taskCharFilter)?.color
    if (activeTab === 'character' && charScreenKey !== 'ranking') return getCharacterById(charScreenKey)?.color
    return null
  })()

  // 2層目ナビ — 1層目に応じて中身を切り替える
  const renderSubNav = () => {
    if (activeTab === 'task') {
      return <CharTab tabs={TASK_SUBNAV} activeKey={taskCharFilter} onChange={setTaskCharFilter} />
    }
    if (activeTab === 'character') {
      return <CharTab tabs={CHAR_SUBNAV} activeKey={charScreenKey} onChange={setCharScreenKey} />
    }
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'task':
        return (
          <TaskScreen
            user={user}
            tasks={tasks}
            addTask={addTask}
            updateTask={updateTask}
            toggleDone={toggleDone}
            deleteTask={deleteTask}
            characterFilter={taskCharFilter}
            debugMode={debugMode}
            nadeThreshold={nadeThreshold}
            showToast={showToast}
            userDoc={userDoc}
            updateUserDoc={updateUserDoc}
            pendingImport={pendingImport}
            onImportConsumed={() => setPendingImport(null)}
          />
        )
      case 'notification':
        return <PlaceholderScreen screenKey="notification" />
      case 'character':
        return (
          <CharScreen
            user={user}
            tasks={tasks}
            charKey={charScreenKey}
            showToast={showToast}
            userDoc={userDoc}
            updateUserDoc={updateUserDoc}
          />
        )
      case 'gacha':
        return <GachaScreen userDoc={userDoc} updateUserDoc={updateUserDoc} showToast={showToast} />
      case 'settings':
        return <SettingsScreen onSettingsChange={handleSettingsChange} user={user} showToast={showToast} userDoc={userDoc} updateUserDoc={updateUserDoc} />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <MainMenu activeTab={activeTab} onTabChange={setActiveTab} charColor={menuAccent} />
      {renderSubNav()}
      <div className="app-content">
        {renderContent()}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
