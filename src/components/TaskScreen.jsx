// タスク画面 — CharTab（2層目）+ TaskList + セリフモーダル管理
// spec-phase3.md §2 §3 §4
import { useState } from 'react'
import CharTab from './CharTab.jsx'
import TaskList from './TaskList.jsx'
import DialogModal from './DialogModal.jsx'
import { getCharacterById } from '../data/characters.js'
import { pickLine } from '../data/lines.js'

export default function TaskScreen({ user, onCharColorChange }) {
  const [activeChar, setActiveChar] = useState(null)

  // セリフモーダル表示状態 — { characterId, line } | null
  const [dialog, setDialog] = useState(null)

  const handleCharChange = (charId) => {
    setActiveChar(charId)
    const color = charId ? (getCharacterById(charId)?.color ?? null) : null
    onCharColorChange(color)
  }

  // TaskListから呼ばれる。event: 'register'|'complete'|'cancel'|'neglect'
  const handleDialogOpen = (event, characterId) => {
    if (!characterId) return
    const line = pickLine(characterId, event)
    setDialog({ characterId, line })
  }

  return (
    <div className="task-screen">
      <CharTab activeChar={activeChar} onCharChange={handleCharChange} />
      <TaskList
        user={user}
        characterFilter={activeChar}
        onDialogOpen={handleDialogOpen}
      />
      {dialog && (
        <DialogModal
          characterId={dialog.characterId}
          line={dialog.line}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}
