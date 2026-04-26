// タスク画面 — 2層目（キャラタブ）+ タスクリスト本体 — spec-phase3.md §2 §3
// §3でキャラタブを追加する。§2時点ではTaskListをそのまま委譲する。
import TaskList from './TaskList.jsx'

export default function TaskScreen({ user, onCharColorChange }) {
  return (
    <TaskList user={user} onCharColorChange={onCharColorChange} />
  )
}
