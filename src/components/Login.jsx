// 未ログイン時に表示するログイン画面
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase.js'

export default function Login() {
  const handleLogin = () => signInWithPopup(auth, provider)

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-title">三姉妹タスクアプリ</h1>
        <p className="login-subtitle">家族のタスクをリアルタイムで管理</p>
        <button className="btn-google-login" onClick={handleLogin}>
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
