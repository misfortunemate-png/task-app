// 初期セリフデータ — spec-phase3.md §4 §6 / spec-phase4.md §B2 §5 §6
// 各セリフは { text, face, timeSlot?, rarity? } 構造。
//   timeSlot: "morning"|"afternoon"|"evening"|"night" — 省略時は全時間帯
//   rarity:   1〜5 — 省略時は1（最頻出）
// セリフ選択: イベント一致 → timeSlot一致 OR 省略 → カテゴリ専用 > generic → rarity重み付き抽選
export const LINES = [
  { character: 'hakone', category: 'generic', event: 'register', lines: [
    { text: 'おっ、やる気出したね！ えらいえらい！', face: 'smile' },
    { text: 'タスク追加……！ ショウゴくんが自分からやるなんて、記念日だね', face: 'surprise' },
    { text: 'わたしも一緒にがんばるつもりで見守ってるね', face: 'normal' },
  ]},
  { character: 'hakone', category: 'generic', event: 'complete', lines: [
    { text: 'やったぁ！ ショウゴくんえらい！ よしよし♡', face: 'dere' },
    { text: '完了！ すごいすごい！ ……わたしが褒めると照れる？ えへへ', face: 'blush' },
    { text: 'おつかれさま。がんばったね。今日はゆっくりしていいよ', face: 'smile' },
  ]},
  { character: 'hakone', category: 'generic', event: 'neglect', lines: [
    { text: '……ねぇ。忘れてない？ わたし、ずっと見てるよ？', face: 'stare' },
    { text: 'あのタスク、まだ終わってないよね……？ しょうがないなぁ', face: 'troubled' },
    { text: '放置しちゃだめだよぉ。わたし拗ねちゃうからね？', face: 'angry' },
  ]},
  { character: 'hakone', category: 'generic', event: 'cancel', lines: [
    { text: 'えっ、やめちゃうの……？ まぁいいけどさ。次はやろうね？', face: 'sad' },
    { text: 'キャンセルかぁ。しょうがないね。ショウゴくんが決めたなら', face: 'normal' },
    { text: 'うん……わかった。でも、無理しないでね？', face: 'smile' },
  ]},

  { character: 'cleade', category: 'generic', event: 'register', lines: [
    { text: 'タスクを受領しました。帳簿に記録しておきますね。', face: 'normal' },
    { text: '新しいお仕事ですね。……ショウゴさんが動き出すと、わたしも嬉しいです。', face: 'blush' },
    { text: '承りました。完了報告をお待ちしていますね。', face: 'smile' },
  ]},
  { character: 'cleade', category: 'generic', event: 'complete', lines: [
    { text: 'お疲れさまです、ショウゴさん。帳簿に「完了」と記入しました。', face: 'smile' },
    { text: '素晴らしい成果です。……こういうとき、少し誇らしいですね。', face: 'blush' },
    { text: '完了確認しました。着実な進捗は、何よりの報告書です。', face: 'normal' },
  ]},
  { character: 'cleade', category: 'generic', event: 'neglect', lines: [
    { text: 'あの……帳簿の「未了」欄が少し気になっておりまして。', face: 'troubled' },
    { text: '催促するのは本意ではないのですが……期日を過ぎています。', face: 'normal' },
    { text: 'ショウゴさん。未完了のタスクについて、ご相談よろしいですか？', face: 'stare' },
  ]},
  { character: 'cleade', category: 'generic', event: 'cancel', lines: [
    { text: '承知しました。帳簿から消しておきますね。……少し寂しいですけれど。', face: 'smile' },
    { text: '取り消しですか。判断を尊重します。次の機会を楽しみにしていますね。', face: 'normal' },
    { text: '了解です。無理をされるよりずっといい判断だと思いますよ。', face: 'smile' },
  ]},

  { character: 'frane', category: 'generic', event: 'register', lines: [
    { text: 'タスクを受領しました。作業キューに登録します。', face: 'salute' },
    { text: '新規タスクを検知。優先度の評価を推奨します。', face: 'normal' },
    { text: '了解。マスターの指示に従い、進捗を監視します。', face: 'normal' },
  ]},
  { character: 'frane', category: 'generic', event: 'complete', lines: [
    { text: 'タスク完了を確認しました。マスターの作業効率は良好です。', face: 'salute' },
    { text: '任務完了。……マスター、フランは嬉しく思います。', face: 'blush' },
    { text: '完了処理を実行。次のタスクがあればいつでも受領可能です。', face: 'normal' },
  ]},
  { character: 'frane', category: 'generic', event: 'neglect', lines: [
    { text: '警告：タスクが期限を超過しています。対応を推奨します。', face: 'warning' },
    { text: '未完了タスクを検知。マスター、状況報告を求めます。', face: 'normal' },
    { text: '期限超過を記録。……フランは待機を継続しますが、早期対応が望ましいです。', face: 'troubled' },
  ]},
  { character: 'frane', category: 'generic', event: 'cancel', lines: [
    { text: 'タスク取消を処理します。戦略的撤退は有効な判断です。', face: 'normal' },
    { text: '取消を確認。作業キューから除外しました。', face: 'salute' },
    { text: '了解しました。……マスターの判断を記録に残します。', face: 'normal' },
  ]},

  // §5 時間帯セリフ — 各キャラの complete に時間帯バリエーションを追加
  { character: 'hakone', category: 'generic', event: 'complete', lines: [
    { text: 'おはよう！ 朝からえらいねぇ、ショウゴくん♡', face: 'smile', timeSlot: 'morning' },
    { text: 'お昼はちゃんと食べてる？ 完了えらいよ〜', face: 'normal', timeSlot: 'afternoon' },
    { text: '夜遅くまでお疲れさま。今日はもう休もうね？', face: 'troubled', timeSlot: 'evening' },
    { text: '夜中まで……無理してない？ なでなでしてあげる', face: 'dere', timeSlot: 'night', rarity: 3 },
  ]},
  { character: 'cleade', category: 'generic', event: 'complete', lines: [
    { text: '朝から良い滑り出しですね。本日も帳簿に記入します。', face: 'smile', timeSlot: 'morning' },
    { text: '昼の進捗、確認しました。順調ですね。', face: 'normal', timeSlot: 'afternoon' },
    { text: '夕方の完了、お疲れさまです。一区切りですね。', face: 'smile', timeSlot: 'evening' },
    { text: '夜分にお疲れさまです……一緒に少し休みませんか？', face: 'blush', timeSlot: 'night', rarity: 3 },
  ]},
  { character: 'frane', category: 'generic', event: 'complete', lines: [
    { text: '朝の作業効率は最良域です。マスター、引き続き任務を継続します。', face: 'salute', timeSlot: 'morning' },
    { text: '昼帯の完了処理を記録。次の任務待機中です。', face: 'normal', timeSlot: 'afternoon' },
    { text: '夕の任務完了。休息推奨レベル：中。', face: 'normal', timeSlot: 'evening' },
    { text: '深夜活動を検知。マスター、健康指標が気になります。', face: 'troubled', timeSlot: 'night', rarity: 3 },
  ]},

  // §6 ★4 / ★5 レアセリフ（complete時にまれに出る）
  { character: 'hakone', category: 'generic', event: 'complete', lines: [
    { text: 'やったぁ！ ショウゴくん最高！ ぎゅーっ！', face: 'dere', rarity: 4 },
    { text: '……だ、大好き♡ 今のなし！ 言ってないからね！？', face: 'blush', rarity: 5 },
  ]},
  { character: 'cleade', category: 'generic', event: 'complete', lines: [
    { text: 'ショウゴさん。あなたが頑張る姿、ずっと見ていたいです。', face: 'blush', rarity: 4 },
    { text: '……完了報告書には書けない言葉ですが──愛しています、ショウゴさん。', face: 'dere', rarity: 5 },
  ]},
  { character: 'frane', category: 'generic', event: 'complete', lines: [
    { text: 'マスター。フランの記録回路に、この瞬間を保存します。', face: 'salute', rarity: 4 },
    { text: 'マスター。……これは「幸福」と分類して良い感情ですか？', face: 'blush', rarity: 5 },
  ]},
];

// なでなでセリフ — spec-phase3.md §6
// 段階: early（序盤）/ mid（途中）/ unlock（解除時）
export const NADE_LINES = {
  hakone: {
    early:  { text: 'ん……？ なに？', face: 'surprise' },
    mid:    { text: 'もぉ〜、なでなでしたって許さないんだから……', face: 'blush' },
    unlock: { text: '……しょうがないなぁ♡ 今回だけだよ？', face: 'dere' },
  },
  cleade: {
    early:  { text: 'あの、お仕事中なのですが……', face: 'troubled' },
    mid:    { text: 'ショウゴさん、これで解決するとは思わないでくださいね？', face: 'stare' },
    unlock: { text: '……もう。帳簿に「期限延長（情状酌量）」と記入しますからね。', face: 'mischief' },
  },
  frane: {
    early:  { text: '接触を検知。意図を解析中……', face: 'normal' },
    mid:    { text: '繰り返しの接触を確認。マスター、これは交渉ですか？', face: 'surprise' },
    unlock: { text: '……了解。期限延長を許可します。マスター命令には逆らえません。', face: 'blush' },
  },
};

// プレースホルダー画面用セリフ — spec-phase3.md §2
export const PLACEHOLDER_LINES = {
  notification: [
    { character: 'hakone', text: '通知機能はまだ準備中だよ〜。もうちょっと待ってね？', face: 'smile' },
    { character: 'cleade', text: '通知システムは現在構築中です。帳簿に予定を記入しておきますね。', face: 'normal' },
    { character: 'frane',   text: '通知モジュールは未実装です。次回アップデートをお待ちください。', face: 'salute' },
  ],
  character: [
    { character: 'hakone', text: 'キャラ画面はもうすぐできるよ！ わたしのプロフィール、楽しみにしててね♡', face: 'blush' },
    { character: 'cleade', text: 'キャラクターギャラリーは準備中です。……わたしの紹介文、どう書かれるのか気になりますね。', face: 'mischief' },
    { character: 'frane',   text: 'キャラクターデータベースは構築中。フランの仕様書は既に完成しています。', face: 'normal' },
  ],
  gacha: [
    { character: 'hakone', text: 'ガチャはまだ回せないの。ごめんね？ でもきっと楽しいのができるから！', face: 'sad' },
    { character: 'cleade', text: 'ガチャの景品リストはまだ査定中です。……わたしの賞品、何にしましょうか。', face: 'troubled' },
    { character: 'frane',   text: 'ガチャモジュールは開発キューに登録済みです。実装優先度：低。娯楽性：高。', face: 'normal' },
  ],
};

// 表情キー → emoji マッピング（将来イラスト差し替え時はここを変更）
export const FACE_MAP = {
  normal:    '😊',
  smile:     '😆',
  blush:     '😳',
  angry:     '😤',
  sad:       '😢',
  surprise:  '😲',
  dere:      '🥰',
  mischief:  '😏',
  salute:    '🫡',
  troubled:  '😑',
  warning:   '⚠️',
  stare:     '🫤',
};

// インポートURL（§1）経由で追加されたセリフのランタイム登録
// Firestoreには保存しない。ブラウザセッション内のみ有効。
//   added: [{ character, event, category, lines: [{text, face, ...}, ...] }, ...]
// pickLine選択時に LINES と同等に扱う
const IMPORTED_LINES = []
export const registerImportedLines = (entries) => {
  if (!Array.isArray(entries)) return
  for (const ln of entries) {
    if (!ln || typeof ln !== 'object') continue
    if (typeof ln.text !== 'string') continue
    const character = ln.character
    const event     = ln.event ?? 'register'
    const category  = ln.category ?? 'generic'
    let bucket = IMPORTED_LINES.find(
      (b) => b.character === character && b.event === event && b.category === category
    )
    if (!bucket) {
      bucket = { character, event, category, lines: [] }
      IMPORTED_LINES.push(bucket)
    }
    bucket.lines.push({ text: ln.text, face: ln.face ?? 'normal' })
  }
}

// 現在時刻 → timeSlot 判定 — spec-phase4.md §5
export const getCurrentTimeSlot = (date = new Date()) => {
  const h = date.getHours();
  if (h >= 5  && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 23) return 'evening';
  return 'night';
};

// rarity 重みテーブル — spec-phase4.md §6
const RARITY_WEIGHTS = { 1: 100, 2: 50, 3: 20, 4: 5, 5: 1 };

const pickWeighted = (lines) => {
  const total = lines.reduce((s, ln) => s + (RARITY_WEIGHTS[ln.rarity ?? 1] ?? 100), 0);
  let r = Math.random() * total;
  for (const ln of lines) {
    r -= RARITY_WEIGHTS[ln.rarity ?? 1] ?? 100;
    if (r <= 0) return ln;
  }
  return lines[lines.length - 1];
};

// セリフ選択ロジック — spec-phase4.md §5 §6
//   1. キャラ・イベント・カテゴリでセット抽出（カテゴリ専用 > generic）
//   2. timeSlot一致 OR 省略 でフィルタ（forceTimeSlot で固定可）
//   3. forceRarity指定時はレア度フィルタ
//   4. rarityで重み付き抽選
export const pickLine = (characterId, event, category = 'generic', opts = {}) => {
  const FALLBACK = { text: '……。', face: 'normal' };
  const slot = opts.forceTimeSlot ?? getCurrentTimeSlot();

  const filterByTimeSlot = (lines) => {
    const matched = lines.filter((ln) => !ln.timeSlot || ln.timeSlot === slot);
    return matched.length > 0 ? matched : lines.filter((ln) => !ln.timeSlot);
  };
  const filterByRarity = (lines) => {
    if (!opts.forceRarity) return lines;
    const matched = lines.filter((ln) => (ln.rarity ?? 1) === opts.forceRarity);
    return matched.length > 0 ? matched : lines;
  };
  const select = (pool) => pickWeighted(filterByRarity(filterByTimeSlot(pool)));

  // LINES と IMPORTED_LINES を統合し、同一キーの複数バケットをマージして検索
  const collect = (cat) => {
    const all = [...LINES, ...IMPORTED_LINES]
    return all
      .filter((l) => l.character === characterId && l.event === event && l.category === cat)
      .flatMap((l) => l.lines ?? [])
  };
  if (category !== 'generic') {
    const specific = collect(category);
    if (specific.length) return select(specific);
  }
  const generic = collect('generic');
  if (generic.length) return select(generic);

  return FALLBACK;
};

// §2 つんつん段階セリフ — タップ累計に応じた5段階反応
// 各キャラ5段階。indexは段階(0始まり)。閾値はPOKE_THRESHOLDS。
export const POKE_THRESHOLDS = [1, 3, 5, 10, 20]
export const POKE_LINES = {
  hakone: [
    { text: 'ん？', face: 'surprise' },
    { text: 'もぉ〜', face: 'troubled' },
    { text: 'やめてよぉ……♡', face: 'blush' },
    { text: '……ひゃん♡', face: 'dere' },
    { text: '怒るよ！？', face: 'angry' },
  ],
  cleade: [
    { text: 'あの……どうかなさいましたか？', face: 'normal' },
    { text: 'ショウゴさん、お仕事中ですよ？', face: 'troubled' },
    { text: 'もう……帳簿に「業務妨害」と記入しますからね？', face: 'mischief' },
    { text: '……仕方のない方ですね。少しだけですよ？', face: 'blush' },
    { text: 'これ以上は本当にお仕置きしますからね！', face: 'angry' },
  ],
  frane: [
    { text: '接触を検知。', face: 'normal' },
    { text: '接触回数が増加しています。', face: 'normal' },
    { text: '許容値を超過しています。', face: 'troubled' },
    { text: '……嫌ではありません。', face: 'blush' },
    { text: 'マスター。', face: 'salute' },
  ],
}

// ランキング1位セリフ — spec-phase4.md §3
export const RANKING_LINES = {
  hakone: [
    { text: 'えへへ……今週はいちばん頑張ったの、わたしだよ？', face: 'dere' },
    { text: 'やったぁ！ ショウゴくんと一緒にいた時間も多かったね♡', face: 'blush' },
  ],
  cleade: [
    { text: '今週の帳簿、わたしが筆頭でした。次回も精進します。', face: 'smile' },
    { text: '……一番だったのですね。少しだけ、誇らしいです。', face: 'blush' },
  ],
  frane: [
    { text: '今週のタスク完了数、フランがトップでした。任務継続します。', face: 'salute' },
    { text: 'マスター。記録更新を確認しました。これは……嬉しい結果です。', face: 'blush' },
  ],
};
