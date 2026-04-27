// キャラ画面エントリー — 2層目選択(charId or 'ranking')に応じて中身を切り替える
// spec-phase4.md §2 §3
import CharIndividualScreen from './CharIndividualScreen.jsx'
import RankingScreen from './RankingScreen.jsx'

// tasks: App.jsx から lift up（二重購読解消 _STATUS.md PG指摘#4）
// charKey: characterId | 'ranking'
// userDoc / updateUserDoc は App.jsx から渡される（lifted）
export default function CharScreen({ user, tasks, charKey, showToast, userDoc, updateUserDoc }) {

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
