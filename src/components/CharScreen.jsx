// キャラ画面エントリー — 2層目選択(charId or 'ranking')に応じて中身を切り替える
// spec-phase4.md §2 §3
import { useTasks } from '../hooks/useTasks.js'
import CharIndividualScreen from './CharIndividualScreen.jsx'
import RankingScreen from './RankingScreen.jsx'

// charKey: characterId | 'ranking'
// userDoc / updateUserDoc は App.jsx から渡される（lifted）
export default function CharScreen({ user, charKey, showToast, userDoc, updateUserDoc }) {
  const { tasks } = useTasks(user.uid, showToast)

  if (charKey === 'ranking') {
    return <RankingScreen tasks={tasks} />
  }
  return (
    <CharIndividualScreen
      charId={charKey}
      tasks={tasks}
      userDoc={userDoc}
      updateUserDoc={updateUserDoc}
      showToast={showToast}
    />
  )
}
