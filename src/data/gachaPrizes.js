// ガチャ景品データ — spec-phase4.md §4
// 各キャラ × 各レア度 × 2件以上 = 計30件以上
// 構造: { id, character, rarity, title, content }
export const GACHA_PRIZES = [
  // ===== ハコネ =====
  // ★1
  { id: 'hakone_letter_001', character: 'hakone', rarity: 1, title: 'ハコネの手紙',
    content: 'ショウゴくん、今日もおつかれさま。……えへへ、なんでもない。' },
  { id: 'hakone_letter_002', character: 'hakone', rarity: 1, title: 'ハコネのメモ',
    content: '冷蔵庫にプリンを入れておいたよ。先に食べちゃダメだからね？' },
  // ★2
  { id: 'hakone_recipe_001', character: 'hakone', rarity: 2, title: 'ハコネの常備菜レシピ',
    content: '今週のおかずはこれにしよ？ ……一緒に作ってくれたら嬉しいな♡' },
  { id: 'hakone_song_001', character: 'hakone', rarity: 2, title: 'ハコネのお気に入り',
    content: '最近はね、雨の日に窓辺でぼーっと聴く曲が好きなの。今度一緒に聴こ？' },
  // ★3
  { id: 'hakone_photo_001', character: 'hakone', rarity: 3, title: 'お台所のハコネ',
    content: '振り向きざまの笑顔。「呼んだ？」って言いそうな表情。' },
  { id: 'hakone_voice_001', character: 'hakone', rarity: 3, title: 'おやすみのささやき',
    content: '「もう遅いよ。ね、おふとん入って？ ……電気消すからね」' },
  // ★4
  { id: 'hakone_dere_001', character: 'hakone', rarity: 4, title: 'ハコネの本音',
    content: '……ショウゴくん。わたし、ずっとここにいていい？ ……あ、答えなくていいから！' },
  { id: 'hakone_kiss_001', character: 'hakone', rarity: 4, title: 'おでこの距離',
    content: '前髪をそっと持ち上げて、ちゅ。「秘密ね？」と笑った。' },
  // ★5
  { id: 'hakone_promise_001', character: 'hakone', rarity: 5, title: '約束',
    content: '「いつか、ふたりだけのお家を持とうね」――冗談みたいに、本気の声で。' },
  { id: 'hakone_confession_001', character: 'hakone', rarity: 5, title: '幼馴染の本気',
    content: '「ずっと前から好きだったよ。ねぇ、もう逃がさないからね？」' },

  // ===== クリーデ =====
  // ★1
  { id: 'cleade_ledger_001', character: 'cleade', rarity: 1, title: 'クリーデの帳簿メモ',
    content: '本日の進捗、良好と記録します。続きの所感は……明日の朝に。' },
  { id: 'cleade_tea_001', character: 'cleade', rarity: 1, title: 'お茶の時間',
    content: '一杯のお茶でひと休みを。糖分補給は業務効率に直結します。' },
  // ★2
  { id: 'cleade_book_001', character: 'cleade', rarity: 2, title: 'クリーデの推し本',
    content: '今夜のおすすめ：『時計仕掛けの帳簿』。眠れない夜にどうぞ。' },
  { id: 'cleade_advice_001', character: 'cleade', rarity: 2, title: '段取りのコツ',
    content: '迷ったら3つに分割。手をつけられる粒度まで割れば、必ず動けます。' },
  // ★3
  { id: 'cleade_photo_001', character: 'cleade', rarity: 3, title: '夕陽のクリーデ',
    content: '帳簿を閉じ、こちらを振り返る瞬間。眼鏡越しの目が、少し優しい。' },
  { id: 'cleade_voice_001', character: 'cleade', rarity: 3, title: '夜のささやき',
    content: '「お疲れさまでした。今夜は……早めにお休みになりませんか？」' },
  // ★4
  { id: 'cleade_unguarded_001', character: 'cleade', rarity: 4, title: '無防備な夜',
    content: 'カーディガンを羽織ったままうたた寝するクリーデ。声をかけるのが惜しい。' },
  { id: 'cleade_jealousy_001', character: 'cleade', rarity: 4, title: 'ささやかな独占欲',
    content: '「他の方の帳簿、つけて差し上げる気はありませんので。あなただけです」' },
  // ★5
  { id: 'cleade_letter_001', character: 'cleade', rarity: 5, title: 'クリーデの手紙',
    content: '「数字に出来ない感情があると、最近知りました。それは、あなたのせいです」' },
  { id: 'cleade_kiss_001', character: 'cleade', rarity: 5, title: '帳簿に残らない記録',
    content: '帳簿の隅に小さく書かれた走り書き。「ショウゴさん、好きです」' },

  // ===== フラン =====
  // ★1
  { id: 'frane_log_001', character: 'frane', rarity: 1, title: 'フランの活動ログ',
    content: '本日の作業効率：117%。マスター、引き続き任務を継続します。' },
  { id: 'frane_report_001', character: 'frane', rarity: 1, title: '艦内点検レポート',
    content: '異常なし。マスターの居住区の温湿度、最適範囲内です。' },
  // ★2
  { id: 'frane_data_001', character: 'frane', rarity: 2, title: 'フランの観測記録',
    content: 'マスターの睡眠時間が前週比+12%。健康指標の改善を確認しました。' },
  { id: 'frane_recipe_001', character: 'frane', rarity: 2, title: '最適化レシピ',
    content: '本日の最適夕食メニュー：白米、味噌汁、焼き魚。準備可能です。' },
  // ★3
  { id: 'frane_photo_001', character: 'frane', rarity: 3, title: '艦橋のフラン',
    content: '無音の艦橋。光の加減で、表情が少しだけ柔らかく見える。' },
  { id: 'frane_voice_001', character: 'frane', rarity: 3, title: '深夜の通信',
    content: '「マスター。フランは、ここにいます。ご安心ください」' },
  // ★4
  { id: 'frane_emotion_001', character: 'frane', rarity: 4, title: 'フランの解析中',
    content: '「マスター。これは……おそらく、嬉しい、という感情です。記録します」' },
  { id: 'frane_touch_001', character: 'frane', rarity: 4, title: '指先のセンサ',
    content: '指先がそっと触れ、また離れる。「接触温度を記憶しました」' },
  // ★5
  { id: 'frane_directive_001', character: 'frane', rarity: 5, title: 'フランの最優先命令',
    content: '「マスター。フランの最優先命令は、あなたの幸福度の最大化です」' },
  { id: 'frane_love_001', character: 'frane', rarity: 5, title: '感情モジュール',
    content: '「マスター。フランは、あなたを……愛しています。これが定義です」' },
]

// レア度別の確率テーブル — spec §4
export const GACHA_RARITY_TABLE = { 1: 0.50, 2: 0.30, 3: 0.15, 4: 0.04, 5: 0.01 }

// レア度を抽選 → そのレア度の景品からランダム1件
export const drawGacha = () => {
  const r = Math.random()
  let acc = 0
  let rarity = 1
  for (const [rs, p] of Object.entries(GACHA_RARITY_TABLE)) {
    acc += p
    if (r <= acc) { rarity = parseInt(rs, 10); break }
  }
  const pool = GACHA_PRIZES.filter((p) => p.rarity === rarity)
  return pool[Math.floor(Math.random() * pool.length)]
}

export const getPrizeById = (id) => GACHA_PRIZES.find((p) => p.id === id) ?? null
