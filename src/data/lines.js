// 初期セリフデータ — spec-phase3.md §4 §6
// 3キャラ × 4イベント × generic = 36個
// セリフ選択: カテゴリ専用 > generic > フォールバック "……。"
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

// セリフ選択ロジック — カテゴリ専用 > generic > フォールバック
export const pickLine = (characterId, event, category = 'generic') => {
  const FALLBACK = { text: '……。', face: 'normal' };

  // カテゴリ専用を優先（genericでない場合のみ）
  if (category !== 'generic') {
    const specific = LINES.find(
      (l) => l.character === characterId && l.event === event && l.category === category
    );
    if (specific?.lines?.length) {
      return specific.lines[Math.floor(Math.random() * specific.lines.length)];
    }
  }

  // genericセリフ
  const generic = LINES.find(
    (l) => l.character === characterId && l.event === event && l.category === 'generic'
  );
  if (generic?.lines?.length) {
    return generic.lines[Math.floor(Math.random() * generic.lines.length)];
  }

  return FALLBACK;
};
