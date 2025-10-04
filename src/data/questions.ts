// questions.ts

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  step: number;
  text: string;
  options: QuestionOption[];
  // 分岐条件を定義するためのキー（任意）
  condition?: (answers: { [key: string]: any }) => boolean;
}

export const questions: Question[] = [
  // --- ステップ1: 自分の「好き」のタネを見つけよう ---
  {
    id: 'q1',
    step: 1,
    text: '放課後や休日、何をしている時が一番「自分らしい」と感じる？',
    options: [
      { label: '友達と話したり、イベントを企画したりしている時', value: 'social' },
      { label: '一人でじっくりゲームや読書、ものづくりに没頭している時', value: 'solo' },
      { label: '部活や運動で体を動かしている時', value: 'physical' },
      { label: '絵を描いたり、音楽を聴いたり、何かを表現している時', value: 'creative' },
    ],
  },
  {
    id: 'q2',
    step: 1,
    text: '人からよく褒められたり、頼られたりすることはどれ？',
    options: [
      { label: 'いつも面白いアイデアを出すね', value: 'idea' },
      { label: 'コツコツ丁寧な作業が得意だね', value: 'diligent' },
      { label: '人の話を聞いたり、相談に乗ったりするのが上手だね', value: 'listener' },
      { label: 'リーダーシップがあって頼りになる', value: 'leader' },
    ],
  },
  {
    id: 'q3',
    step: 1,
    text: 'もし魔法が使えたら、どんな社会課題を解決したい？',
    options: [
      { label: '地球環境の問題', value: 'environment' },
      { label: '人々の健康や医療の問題', value: 'health' },
      { label: '貧困や格差の問題', value: 'social_issue' },
      { label: 'もっと面白いエンタメや便利な技術を生み出したい', value: 'tech_entertainment' },
    ],
  },
  {
    id: 'q4',
    step: 1,
    text: '学校の勉強で、内容そのものに「知的好奇心」がわくのはどれ？（成績は関係なく）',
    options: [
      { label: '数学や物理（仕組みや法則の解明）', value: 'logic_physics' },
      { label: '国語や社会（歴史や文化、社会の成り立ち）', value: 'humanities' },
      { label: '理科（生命や物質のナゾの探求）', value: 'science_biology' },
      { label: '芸術や技術（新しいもののデザインや創造）', value: 'art_tech' },
    ],
  },
  {
    id: 'q5',
    step: 1,
    text: '次の中で、思わず「なぜだろう？」と考えてしまうのはどれ？',
    options: [
      { label: '最新のスマホやアプリの仕組み', value: 'tech_mechanism' },
      { label: '有名な絵画や音楽が人の心を動かす理由', value: 'art_philosophy' },
      { label: '人間の体や心の機能', value: 'human_science' },
      { label: 'ニュースで見る国際問題の原因', value: 'international_affairs' },
    ],
  },
  // --- ステップ2: 「どんな大人になりたい？」を想像しよう ---
  {
    id: 'q6',
    step: 2,
    text: 'どんな場所で働く自分を想像するとワクワクする？',
    options: [
      { label: '最新設備が整った都会のオフィス', value: 'urban_office' },
      { label: '自然に囲まれた静かな場所', value: 'nature' },
      { label: '世界中を飛び回るような場所', value: 'global' },
      { label: '自分の地元や慣れ親しんだ場所', value: 'local' },
    ],
  },
  {
    id: 'q7',
    step: 2,
    text: '仕事を選ぶ上で、これだけは譲れない！というものは？',
    options: [
      { label: 'とにかくたくさんのお金を稼ぐこと', value: 'money' },
      { label: '困っている人や社会の役に立つこと', value: 'contribution' },
      { label: '自分のアイデアを形にすること', value: 'creation' },
      { label: '専門的な知識やスキルをとことん極めること', value: 'mastery' },
      { label: '安定した環境で、プライベートを大切にすること', value: 'stability_life' },
    ],
  },
  {
    id: 'q8',
    step: 2,
    text: '理想の働き方はどっち？',
    options: [
      { label: 'チームで協力し、一つの目標を達成する', value: 'teamwork' },
      { label: '一人で黙々と、自分のペースで仕事を進める', value: 'solo_work' },
    ],
  },
  {
    id: 'q9',
    step: 2,
    text: '挑戦するならどっち？',
    options: [
      { label: 'ルールやマニュアルがしっかり決まっている仕事', value: 'stable_routine' },
      { label: '正解がなく、常に新しいことに挑戦し続ける仕事', value: 'challenging_creative' },
    ],
  },
  {
    id: 'q10',
    step: 2,
    text: '将来、絶対に「避けたい」と思う働き方は？',
    options: [
      { label: '毎日同じことの繰り返しで、変化がない', value: 'avoid_routine' },
      { label: '厳しいノルマや成果に常に追われる', value: 'avoid_pressure' },
      { label: '人とほとんど関わらない', value: 'avoid_isolation' },
      { label: '体力的にハードな仕事', value: 'avoid_physical' },
    ],
  },
  // --- ステップ3: 未来への「一歩」を決めよう（分岐） ---
  // 例: テクノロジー × 創造 に興味があるユーザー向け
  {
    id: 'q11_tech',
    step: 3,
    text: '「テクノロジーでアイデアを形にする」ことに興味があるんだね！特にどれに関心がある？',
    options: [
      { label: '生活を便利にするアプリやWebサービス開発', value: 'app_development' },
      { label: '人々を熱中させるゲームの世界観やシステム制作', value: 'game_development' },
      { label: '人間のように考えるAI（人工知能）の研究開発', value: 'ai_research' },
      { label: '現実と仮想空間を融合させるVR/AR技術', value: 'xr_technology' },
    ],
    condition: (answers) => answers.q4 === 'art_tech' && answers.q7 === 'creation',
  },
  // 例: 人 × 貢献 に興味があるユーザー向け
  {
    id: 'q11_social',
    step: 3,
    text: '「人の役に立つこと」に関心があるんだね！どんな形で貢献したい？',
    options: [
      { label: '子どもたちの教育に関わる', value: 'education' },
      { label: '病気や怪我で苦しむ人を助ける医療', value: 'medical' },
      { label: '地域の活性化や街づくり', value: 'community' },
      { label: '法律や制度を通じて社会のルールを作る', value: 'law_policy' },
    ],
    condition: (answers) => answers.q2 === 'listener' && answers.q7 === 'contribution',
  },
  // --- 最後の共通質問 ---
  {
    id: 'q15',
    step: 3,
    text: '最後に、今のあなたの気持ちに一番近いのは？',
    options: [
      { label: 'ワクワクしてきた！もっと色々な可能性を知りたい', value: 'excited' },
      { label: '少しイメージが湧いてきたけど、まだ不安もある', value: 'anxious' },
      { label: '自分にできるか分からないけど、挑戦してみたい', value: 'want_to_try' },
    ],
    // すべての分岐の最後にこの質問が表示されるようにする
    condition: (answers) => answers.hasOwnProperty('q11_tech') || answers.hasOwnProperty('q11_social'),
  },
];
