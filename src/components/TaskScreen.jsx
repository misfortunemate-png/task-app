// タスク画面 — CharTab（2層目）+ TaskList を束ねる — spec-phase3.md §2 §3
import { useState } from 'react'
import CharTab from './CharTab.jsx'
import TaskList from './TaskList.jsx'
import { getCharacterById } from '../data/characters.js'

// onCharColorChange: MainMenuのアクセントカラー更新用（App.jsx経由）
export default function TaskScreen({ user, onCharColorChange }) {
  const [activeChar, setActiveChar] = useState(null) // null = 全員

  const handleCharChange = (charId) => {
    setActiveChar(charId)
    // MainMenuのアクセントカラーを連動させる
    const color = charId ? (getCharacterById(charId)?.color ?? null) : null
    onCharColorChange(color)
  }

  return (
    <div className="task-screen">
      <CharTab activeChar={activeChar} onCharChange={handleCharChange} />
      <TaskList user={user} characterFilter={activeChar} />
    </div>
  )
}
