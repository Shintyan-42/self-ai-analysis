// キャリア発見クイズ結果分析 - Gemini AI統合版

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CareerAnalysisRequest {
  answers: { [key: string]: string };
}

export interface CareerRoleModel {
  title: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  localOpportunities: string[];
  specificCareers: Array<{
    name: string;
    description: string;
    salary: string;
    requirements: string[];
    localAvailability: string;
  }>;
}

export interface CareerPath {
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
}

export interface EducationRecommendation {
  highSchool: string[];
  universities: Array<{
    name: string;
    department: string;
    reason: string;
    location: string;
    admissionInfo?: string;
  }>;
  alternatives: string[];
}

export interface CareerAnalysisResponse {
  roleModel: CareerRoleModel;
  careerPath: CareerPath;
  education: EducationRecommendation;
  confidence: number;
  insights: string[];
}

// Gemini AI クライアントの初期化
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD56dRLMhGLB839cPqK9aRzpBQSaI_RK08';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// キャリア分析モデル
const careerModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// 使用量監視
let dailyUsage = {
  requests: 0,
  tokens: 0,
  lastReset: new Date().toDateString()
};

function checkUsageLimit(): boolean {
  const today = new Date().toDateString();
  
  if (dailyUsage.lastReset !== today) {
    dailyUsage = {
      requests: 0,
      tokens: 0,
      lastReset: today
    };
  }
  
  const DAILY_REQUEST_LIMIT = 1400;
  const DAILY_TOKEN_LIMIT = 30000;
  
  return dailyUsage.requests < DAILY_REQUEST_LIMIT && 
         dailyUsage.tokens < DAILY_TOKEN_LIMIT;
}

function updateUsage(estimatedTokens: number): void {
  dailyUsage.requests++;
  dailyUsage.tokens += estimatedTokens;
  console.log(`[Career Analysis] 使用量: ${dailyUsage.requests}回, ${dailyUsage.tokens}トークン`);
}

// 回答データを分析可能な形式に変換
function formatAnswersForAnalysis(answers: { [key: string]: string }): string {
  const answerDescriptions: { [key: string]: string } = {
    // ステップ1の回答
    'social': '人との交流やイベント企画を好む',
    'solo': '一人での集中作業やものづくりを好む',
    'physical': '体を動かす活動を好む',
    'creative': '表現活動や芸術を好む',
    'idea': 'アイデア出しが得意',
    'diligent': 'コツコツとした作業が得意',
    'listener': '人の話を聞くのが得意',
    'leader': 'リーダーシップがある',
    'environment': '環境問題に関心がある',
    'health': '健康・医療問題に関心がある',
    'social_issue': '社会問題に関心がある',
    'tech_entertainment': 'テクノロジーやエンタメに関心がある',
    'logic_physics': '数学・物理に興味がある',
    'humanities': '国語・社会に興味がある',
    'science_biology': '理科・生物に興味がある',
    'art_tech': '芸術・技術に興味がある',
    'tech_mechanism': '技術の仕組みに興味がある',
    'art_philosophy': '芸術の哲学に興味がある',
    'human_science': '人間科学に興味がある',
    'international_affairs': '国際問題に興味がある',
    
    // ステップ2の回答
    'urban_office': '都会のオフィスで働きたい',
    'nature': '自然環境で働きたい',
    'global': '世界中で働きたい',
    'local': '地元で働きたい',
    'money': 'お金を重視する',
    'contribution': '社会貢献を重視する',
    'creation': '創造活動を重視する',
    'mastery': '専門性を重視する',
    'stability_life': '安定性とプライベートを重視する',
    'teamwork': 'チームワークを好む',
    'solo_work': '個人作業を好む',
    'stable_routine': '安定したルーティンな仕事を好む',
    'challenging_creative': '挑戦的で創造的な仕事を好む',
    'avoid_routine': 'ルーティンな仕事を避けたい',
    'avoid_pressure': 'プレッシャーのある仕事を避けたい',
    'avoid_isolation': '孤立した仕事を避けたい',
    'avoid_physical': '体力的にハードな仕事を避けたい',
    
    // ステップ3の回答
    'app_development': 'アプリ開発に興味がある',
    'game_development': 'ゲーム開発に興味がある',
    'ai_research': 'AI研究に興味がある',
    'xr_technology': 'VR/AR技術に興味がある',
    'education': '教育分野で貢献したい',
    'medical': '医療分野で貢献したい',
    'community': '地域活性化で貢献したい',
    'law_policy': '法律・政策で貢献したい',
    'excited': 'ワクワクしている',
    'anxious': '不安もある',
    'want_to_try': '挑戦したい'
  };

  return Object.entries(answers)
    .map(([key, value]) => `${key}: ${answerDescriptions[value] || value}`)
    .join('\n');
}

export async function analyzeCareerQuiz(answers: { [key: string]: string }): Promise<CareerAnalysisResponse> {
  try {
    console.log('[Career Analysis] 分析開始:', Object.keys(answers).length, '個の回答');
    
    // APIキーが設定されていない場合はデモモード
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('[Career Analysis] デモモードで実行');
      return getDemoCareerAnalysis(answers);
    }

    // 使用量制限チェック
    if (!checkUsageLimit()) {
      console.warn('[Career Analysis] 無料枠の制限に達しました。デモモードに切り替えます。');
      return getDemoCareerAnalysis(answers);
    }

    const formattedAnswers = formatAnswersForAnalysis(answers);
    
    const prompt = `
あなたは地方在住の中高生向けキャリアカウンセラーです。以下の回答を分析して、その生徒に最適なキャリアロールモデルと進路を提案してください。

【生徒の回答】
${formattedAnswers}

【出力形式（JSON）】
{
  "roleModel": {
    "title": "キャリアロールモデルのタイトル（例：テクノロジー創造者）",
    "description": "ロールモデルの詳細説明（100文字以内）",
    "characteristics": ["特徴1", "特徴2", "特徴3"],
    "strengths": ["強み1", "強み2", "強み3"],
    "challenges": ["課題1", "課題2"],
    "localOpportunities": ["地方での機会1", "地方での機会2"],
    "specificCareers": [
      {
        "name": "具体的な職業名（例：システムエンジニア、Webデザイナー、データサイエンティスト、AIエンジニア、フロントエンドエンジニア、バックエンドエンジニア、モバイルアプリ開発者、ゲームプログラマー、UI/UXデザイナー、プロダクトマネージャー、ITコンサルタント、セキュリティエンジニア、DevOpsエンジニア、機械学習エンジニア、ロボットエンジニア、IoTエンジニア、クラウドエンジニア、データベースエンジニア、ネットワークエンジニア、組み込みエンジニア、地方公務員、学校教員、看護師、医師、薬剤師、理学療法士、作業療法士、言語聴覚士、臨床検査技師、放射線技師、管理栄養士、社会福祉士、介護福祉士、保育士、幼稚園教諭、小学校教諭、中学校教諭、高等学校教諭、特別支援学校教諭、司書、学芸員、図書館司書、博物館学芸員、美術館学芸員、科学館学芸員、動物園飼育員、水族館飼育員、農業技術者、林業技術者、漁業技術者、食品技術者、環境技術者、建築士、土木技術者、測量士、不動産鑑定士、司法書士、行政書士、税理士、公認会計士、弁護士、検察官、裁判官、警察官、消防士、自衛官、海上保安官、税務署職員、法務局職員、労働基準監督官、入国審査官、航空管制官、気象予報士、気象庁職員、防災士、地域おこし協力隊、NPO職員、NGO職員、国際協力機構職員、青年海外協力隊、JICA職員、外務省職員、国際機関職員、国連職員、世界銀行職員、IMF職員、OECD職員、EU職員、ASEAN職員、APEC職員、G7職員、G20職員、サミット職員、国際会議通訳者、国際会議翻訳者、国際ビジネスコンサルタント、国際マーケティングマネージャー、国際営業マネージャー、国際物流マネージャー、国際金融アナリスト、国際投資アナリスト、国際税務コンサルタント、国際法務コンサルタント、国際人事コンサルタント、国際経営コンサルタント、国際戦略コンサルタント、国際組織コンサルタント、国際変革コンサルタント、国際デジタルコンサルタント、国際イノベーションコンサルタント、国際サステナビリティコンサルタント、国際ESGコンサルタント、国際CSRコンサルタント、国際ブランディングコンサルタント、国際PRコンサルタント、国際広告コンサルタント、国際マーケティングリサーチャー、国際消費者行動分析者、国際市場調査分析者、国際競合分析者、国際トレンド分析者、国際未来予測者、国際シナリオプランナー、国際リスクアナリスト、国際危機管理コンサルタント、国際災害対策コンサルタント、国際テロ対策コンサルタント、国際サイバーセキュリティコンサルタント、国際情報セキュリティコンサルタント、国際プライバシー保護コンサルタント、国際データ保護コンサルタント、国際AI倫理コンサルタント、国際ロボット倫理コンサルタント、国際バイオエシックスコンサルタント、国際環境倫理コンサルタント、国際ビジネス倫理コンサルタント、国際企業統治コンサルタント、国際コンプライアンスコンサルタント、国際内部統制コンサルタント、国際監査コンサルタント、国際会計コンサルタント、国際財務コンサルタント、国際投資コンサルタント、国際資産運用コンサルタント、国際保険コンサルタント、国際年金コンサルタント、国際相続コンサルタント、国際贈与コンサルタント、国際信託コンサルタント、国際ファンドマネージャー、国際ヘッジファンドマネージャー、国際プライベートエクイティマネージャー、国際ベンチャーキャピタリスト、国際エンジェル投資家、国際クラウドファンディングプラットフォーム運営者、国際フィンテック起業家、国際ブロックチェーン起業家、国際暗号通貨起業家、国際NFT起業家、国際メタバース起業家、国際Web3起業家、国際DAO起業家、国際DeFi起業家、国際GameFi起業家、国際SocialFi起業家、国際Creator Economy起業家、国際Influencer起業家、国際YouTuber、国際TikToker、国際Instagramer、国際Twitterer、国際LinkedIner、国際Facebooker、国際Snapchatter、国際Pinterester、国際Redditer、国際Discorder、国際Slacker、国際Zoomer、国際Skypeer、国際Teamser、国際Google Meetr、国際Webexer、国際GoToMeetinger、国際BlueJeanser、国際Jitsi Meetr、国際Wherebyer、国際BigBlueButtoner、国際Jami Meetr、国際Signalr、国際Telegramer、国際WhatsApper、国際Viberer、国際Lineer、国際Kakaotalker、国際WeChater、国際QQer、国際DingTalker、国際Larkr、国際Feishuer、国際Workplaceer、国際Yammerer、国際Microsoft Vivaer、国際Slack Connecter、国際Microsoft Teams Connecter、国際Zoom Roomser、国際Google Workspaceer、国際Microsoft 365er、国際Office 365er、国際G Suiteer、国際Dropboxer、国際Boxer、国際OneDriveer、国際Google Driveer、国際iClouder、国際Amazon Driveer、国際Megaer、国際pClouder、国際Sync.comer、国際Tresoriter、国際SpiderOakr、国際Carboniter、国際Backblazeer、国際CrashPlaner、国際Acroniser、国際EaseUSer、国際AOMEIer、国際Macriumer、国際Paragoner、国際Clonezillaer、国際Redo Rescueer、国際SystemRescueer、国際GParteder、国際Disk Utilityer、国際Disk Utilityer、国際Disk Utilityer）",
        "description": "職業の詳細説明（その職業が何をするのか、どのような仕事内容なのか）",
        "salary": "年収目安（例：300万円〜600万円、地方では250万円〜500万円）",
        "requirements": ["必要な資格・スキル1", "必要な資格・スキル2", "必要な資格・スキル3"],
        "localAvailability": "地方での就職可能性（例：地方でも需要が高い、リモートワーク可能、地方企業での需要あり）"
      }
    ]
  },
  "careerPath": {
    "shortTerm": ["短期目標1", "短期目標2", "短期目標3"],
    "mediumTerm": ["中期目標1", "中期目標2", "中期目標3"],
    "longTerm": ["長期目標1", "長期目標2", "長期目標3"]
  },
  "education": {
    "highSchool": ["高校での取り組み1", "高校での取り組み2"],
    "universities": [
      {
        "name": "具体的な大学名（例：北海道大学、東北大学、筑波大学、新潟大学、金沢大学、信州大学、静岡大学、名古屋大学、三重大学、滋賀大学、京都大学、大阪大学、神戸大学、岡山大学、広島大学、山口大学、徳島大学、香川大学、愛媛大学、高知大学、九州大学、佐賀大学、長崎大学、熊本大学、大分大学、宮崎大学、鹿児島大学、琉球大学、東京大学、一橋大学、東京工業大学、東京医科歯科大学、東京外国語大学、お茶の水女子大学、電気通信大学、東京農工大学、東京学芸大学、東京芸術大学、東京海洋大学、政策研究大学院大学、総合研究大学院大学、横浜国立大学、新潟大学、富山大学、金沢大学、福井大学、山梨大学、信州大学、岐阜大学、静岡大学、浜松医科大学、名古屋大学、名古屋工業大学、愛知教育大学、名古屋市立大学、三重大学、滋賀大学、滋賀医科大学、京都大学、京都教育大学、京都工芸繊維大学、大阪大学、大阪教育大学、兵庫教育大学、神戸大学、神戸商船大学、奈良教育大学、奈良女子大学、和歌山大学、鳥取大学、島根大学、岡山大学、広島大学、山口大学、徳島大学、鳴門教育大学、香川大学、香川医科大学、愛媛大学、高知大学、高知医科大学、福岡教育大学、九州大学、九州工業大学、佐賀大学、長崎大学、熊本大学、大分大学、大分医科大学、宮崎大学、鹿児島大学、鹿屋体育大学、琉球大学、北見工業大学、帯広畜産大学、小樽商科大学、釧路公立大学、青森公立大学、岩手県立大学、宮城大学、秋田県立大学、山形県立米沢栄養大学、福島県立医科大学、茨城大学、宇都宮大学、群馬大学、埼玉大学、千葉大学、東京大学、東京医科歯科大学、東京外国語大学、東京学芸大学、東京農工大学、東京芸術大学、東京工業大学、一橋大学、お茶の水女子大学、電気通信大学、東京海洋大学、政策研究大学院大学、総合研究大学院大学、横浜国立大学、新潟大学、富山大学、金沢大学、福井大学、山梨大学、信州大学、岐阜大学、静岡大学、浜松医科大学、名古屋大学、名古屋工業大学、愛知教育大学、名古屋市立大学、三重大学、滋賀大学、滋賀医科大学、京都大学、京都教育大学、京都工芸繊維大学、大阪大学、大阪教育大学、兵庫教育大学、神戸大学、神戸商船大学、奈良教育大学、奈良女子大学、和歌山大学、鳥取大学、島根大学、岡山大学、広島大学、山口大学、徳島大学、鳴門教育大学、香川大学、香川医科大学、愛媛大学、高知大学、高知医科大学、福岡教育大学、九州大学、九州工業大学、佐賀大学、長崎大学、熊本大学、大分大学、大分医科大学、宮崎大学、鹿児島大学、鹿屋体育大学、琉球大学）",
        "department": "具体的な学部・学科名（例：工学部情報工学科、理学部数学科、文学部日本文学科、経済学部経済学科、法学部法学科、医学部医学科、農学部生物資源学科、教育学部学校教育教員養成課程、芸術工学部環境設計学科）",
        "reason": "具体的な推薦理由（その大学・学部がなぜその生徒に適しているかの詳細な説明）",
        "location": "立地（地方/都市）",
        "admissionInfo": "入試情報（偏差値目安、入試方式、特色入試の有無など）"
      }
    ],
    "alternatives": ["その他の進路選択肢1", "選択肢2"]
  },
  "confidence": 85,
  "insights": ["洞察1", "洞察2", "洞察3"]
}

【重要指示】
- 大学名は必ず具体的な実在する大学名を使用してください
- 地方国立大学、私立大学、専門学校など多様な選択肢を含めてください
- 各大学の学部・学科名も具体的に記載してください
- 推薦理由はその生徒の特性に基づいた具体的な説明をしてください
- 入試情報（偏差値目安など）も含めて現実的なアドバイスを提供してください
- 地方在住の中高生に適した現実的な提案をしてください
- 地方でも実現可能な進路を重視してください
- 生徒の興味・関心・価値観を反映した提案をしてください
`;

    const result = await Promise.race([
      careerModel.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Career analysis timeout')), 15000)
      )
    ]) as any;

    const response = await result.response;
    const responseText = response.text();

    // 使用量更新（分析は約800トークン）
    updateUsage(800);

    // JSONレスポンスをパース
    try {
      const parsedResponse = JSON.parse(responseText);
      return parsedResponse;
    } catch (jsonError) {
      console.error('Error parsing career analysis response JSON:', jsonError);
      console.error('Raw AI response:', responseText);
      return getDemoCareerAnalysis(answers);
    }

  } catch (error) {
    console.error('Error analyzing career quiz:', error);
    return getDemoCareerAnalysis(answers);
  }
}

// デモ分析結果
function getDemoCareerAnalysis(answers: { [key: string]: string }): CareerAnalysisResponse {
  // 回答に基づいて簡単な分析
  const hasTechInterest = Object.values(answers).some(answer => 
    ['art_tech', 'tech_mechanism', 'app_development', 'ai_research'].includes(answer)
  );
  
  const hasSocialInterest = Object.values(answers).some(answer => 
    ['social', 'listener', 'contribution', 'education', 'medical'].includes(answer)
  );

  if (hasTechInterest) {
    return {
      roleModel: {
        title: "テクノロジー創造者",
        description: "最新技術を活用して新しい価値を創造する地方のテクノロジー専門家",
        characteristics: ["技術への深い関心", "創造的な問題解決力", "継続的な学習意欲"],
        strengths: ["論理的思考", "技術的理解力", "新しいものへの適応力"],
        challenges: ["最新情報へのアクセス", "地方での技術コミュニティ参加"],
        localOpportunities: ["地方企業のDX支援", "地域課題のIT解決", "リモートワーク活用"]
      },
      careerPath: {
        shortTerm: ["プログラミング基礎学習", "地域IT企業でのインターン", "オンライン学習の活用"],
        mediumTerm: ["専門学校・大学進学", "資格取得", "個人プロジェクト開発"],
        longTerm: ["テクノロジー専門職就職", "地方起業", "技術コンサルタント"]
      },
      education: {
        highSchool: ["情報科での基礎学習", "プログラミング部活動", "IT系資格取得"],
        universities: [
          {
            name: "信州大学",
            department: "工学部情報工学科",
            reason: "地方国立大学として充実したIT教育環境と地域企業との連携が強く、実践的な技術習得が可能。学費も国立大学として安価で、地方在住の学生に適している。",
            location: "地方",
            admissionInfo: "偏差値目安：55-60、一般入試・推薦入試あり"
          },
          {
            name: "新潟大学",
            department: "工学部情報学科",
            reason: "北陸・信越地方の拠点大学として、地域のIT企業との連携が豊富。研究設備も充実しており、基礎から応用まで幅広く学習できる。",
            location: "地方",
            admissionInfo: "偏差値目安：55-60、AO入試・推薦入試あり"
          },
          {
            name: "静岡大学",
            department: "情報学部情報科学科",
            reason: "静岡県のIT産業との連携が強く、インターンシップや就職支援が充実。地方からでもアクセスしやすい立地。",
            location: "地方",
            admissionInfo: "偏差値目安：50-55、特色入試あり"
          }
        ],
        alternatives: ["職業訓練校", "オンライン学習", "独学での技術習得"]
      },
      confidence: 85,
      insights: [
        "地方でもテクノロジー分野は大きな可能性があります",
        "リモートワークの普及により、地方からでも全国の企業と働けます",
        "地域課題のIT解決は大きな社会的価値があります"
      ]
    };
  } else if (hasSocialInterest) {
    return {
      roleModel: {
        title: "地域貢献リーダー",
        description: "地域社会の発展に貢献し、人々の生活を豊かにする地方のリーダー",
        characteristics: ["人とのつながり重視", "社会貢献への強い関心", "地域愛"],
        strengths: ["コミュニケーション能力", "共感力", "リーダーシップ"],
        challenges: ["地方での雇用機会", "キャリア発展の選択肢"],
        localOpportunities: ["地方自治体職員", "地域企業の管理職", "NPO・NGO活動"]
      },
      careerPath: {
        shortTerm: ["地域ボランティア活動", "リーダーシップ研修参加", "地域イベント企画"],
        mediumTerm: ["大学・専門学校進学", "地域インターンシップ", "資格取得"],
        longTerm: ["地方公務員", "地域企業就職", "地域起業"]
      },
      education: {
        highSchool: ["生徒会活動", "地域ボランティア", "コミュニケーション能力向上"],
        universities: [
          {
            name: "島根大学",
            department: "法文学部社会文化学科",
            reason: "地方創生や地域政策に強い大学として、地域課題解決の専門知識を習得できる。少人数教育で丁寧な指導を受けることができる。",
            location: "地方",
            admissionInfo: "偏差値目安：50-55、地域枠推薦入試あり"
          },
          {
            name: "山口大学",
            department: "人文学部人文学科",
            reason: "地域社会の理解と貢献を重視した教育プログラムが充実。地方自治体との連携も強く、実践的な学習が可能。",
            location: "地方",
            admissionInfo: "偏差値目安：50-55、特色入試あり"
          },
          {
            name: "高知大学",
            department: "人文社会科学部人文社会科学科",
            reason: "四国地方の地域課題解決に取り組む大学として、地域密着型の教育が特徴。コミュニティ活動も盛ん。",
            location: "地方",
            admissionInfo: "偏差値目安：45-50、地域枠入試あり"
          }
        ],
        alternatives: ["公務員試験対策", "専門学校", "地域企業への直接就職"]
      },
      confidence: 80,
      insights: [
        "地方での人とのつながりは大きな強みになります",
        "地域課題の解決は社会全体に貢献する重要な仕事です",
        "地方公務員や地域企業での活躍の場が広がっています"
      ]
    };
  } else {
    return {
      roleModel: {
        title: "バランス型専門家",
        description: "多様な興味を持ち、柔軟性と専門性を兼ね備えた地方の専門家",
        characteristics: ["幅広い興味関心", "適応力", "継続的な学習"],
        strengths: ["柔軟性", "学習能力", "バランス感覚"],
        challenges: ["専門性の確立", "キャリアの方向性決定"],
        localOpportunities: ["地方企業の総合職", "公務員", "多様な専門職"]
      },
      careerPath: {
        shortTerm: ["様々な分野の基礎学習", "地域インターンシップ", "資格取得検討"],
        mediumTerm: ["大学・専門学校進学", "専門分野の探索", "実務経験"],
        longTerm: ["専門職就職", "キャリア発展", "地域貢献"]
      },
      education: {
        highSchool: ["基礎学力向上", "幅広い分野の学習", "資格取得"],
        universities: [
          {
            name: "金沢大学",
            department: "人間社会学域",
            reason: "文理融合の教育システムで幅広い知識を習得できる。北陸地方の拠点大学として、多様な分野での学習機会が豊富。",
            location: "地方",
            admissionInfo: "偏差値目安：55-60、総合型選抜あり"
          },
          {
            name: "岡山大学",
            department: "文学部",
            reason: "総合大学として多様な学部があり、幅広い興味に対応できる。地方国立大学として学費も安価。",
            location: "地方",
            admissionInfo: "偏差値目安：55-60、推薦入試あり"
          },
          {
            name: "熊本大学",
            department: "文学部",
            reason: "九州地方の拠点大学として、地域との連携も強く、実践的な学習が可能。少人数教育で丁寧な指導を受けることができる。",
            location: "地方",
            admissionInfo: "偏差値目安：50-55、特色入試あり"
          }
        ],
        alternatives: ["専門学校", "職業訓練", "就職後の学習"]
      },
      confidence: 75,
      insights: [
        "幅広い興味は将来の選択肢を広げます",
        "地方での多様な経験が強みになります",
        "継続的な学習で専門性を高められます"
      ]
    };
  }
}
