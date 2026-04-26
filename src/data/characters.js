// キャラ定義マスター — spec-phase3.md §1
// キャラタブ・テーマ切替・セリフ表示など全機能がこの配列を参照する
// ハードコードせず配列から動的生成すること（将来の追加キャラに対応）
export const CHARACTERS = [
  {
    id: 'hakone',
    emoji: '🌸',
    name: 'ハコネ',
    title: '幼馴染メイド ／ 長女',
    color: '#e85d75',
    colorBg: '#fff0f3',
    colorAccent: '#ff8fa3',
    params: {
      baseMood: 80,
      moodModifier: 'high',
      taskLoyalty: 0.5,
      skinshipTolerance: 0.3,
      neglectTolerance: 0.3,
    },
    notes: '褒められると弱い。スキンシップに弱い。放置されると拗ねる。仕事の成果より一緒にいることに価値を置く。',
  },
  {
    id: 'cleade',
    emoji: '📘',
    name: 'クリーデ',
    title: '貿易商の帳簿番 ／ 次女',
    color: '#3a7ca5',
    colorBg: '#eef6fb',
    colorAccent: '#6db3d8',
    params: {
      baseMood: 60,
      moodModifier: 'conditional',
      taskLoyalty: 1.5,
      skinshipTolerance: 1.5,
      neglectTolerance: 1.5,
    },
    notes: '朝昼は堅く、夜と休日はあまあま。タスク完了を正当に評価する。スキンシップでごまかされにくい。',
  },
  {
    id: 'frane',
    emoji: '🛸',
    name: 'フラン',
    title: '艦内補佐アンドロイド ／ 末妹',
    color: '#7b68ae',
    colorBg: '#f3f0fa',
    colorAccent: '#a899d4',
    params: {
      baseMood: 40,
      moodModifier: 'none',
      taskLoyalty: 2.0,
      skinshipTolerance: 0.5,
      neglectTolerance: 9999,
    },
    notes: '感情表現が少ない。時間帯に左右されない。任務完了に最も強く反応する。放置で機嫌が下がらない。待機は任務。',
  },
];

// idからキャラ定義を取得するヘルパー
export const getCharacterById = (id) =>
  CHARACTERS.find((c) => c.id === id) ?? null;
