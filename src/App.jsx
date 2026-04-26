// ルートコンポーネント — onAuthStateChanged で認証状態を監視し画面を切り替える
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase.js'
import Login from './components/Login.jsx'
import TaskList from './components/TaskList.jsx'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = 初期化中

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  if (user === undefined) return null // 認証状態確認中は何も表示しない

  if (!user) return <Login />

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">三姉妹タスクアプリ</h1>
        <div className="app-header-right">
          <span className="app-username">{user.displayName}</span>
          <button className="btn-logout" onClick={() => signOut(auth)}>ログアウト</button>
        </div>
      </header>
      <TaskList user={user} />
    </div>
  )
}
