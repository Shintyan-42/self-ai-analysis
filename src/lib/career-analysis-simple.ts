// 簡潔なキャリア分析 - Gemini AI連携

import { GoogleGenerativeAI } from '@google/generative-ai';

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

// 使用量管理
let dailyUsage = 0;
const MAX_DAILY_USAGE = 1000; // 1日1000リクエスト制限

function checkUsageLimit(): boolean {
  return dailyUsage < MAX_DAILY_USAGE;
}

function updateUsage(tokens: number): void {
  dailyUsage += tokens;
}

// 回答を分析用にフォーマット
function formatAnswersForAnalysis(answers: { [key: string]: string }): string {
  const answerDescriptions: { [key: string]: string } = {
    'social': '人との交流を好む',
    'solo': '一人での作業を好む',
    'physical': '体を動かす活動を好む',
    'creative': '表現活動を好む',
    'tech_mechanism': '技術の仕組みに興味がある',
    'art_philosophy': '芸術の哲学に興味がある',
    'human_science': '人間科学に興味がある',
    'international_affairs': '国際問題に興味がある',
    'contribution': '社会貢献を重視する',
    'creation': '創造活動を重視する',
    'mastery': '専門性を重視する',
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
    
    const prompt = `地方在住の中高生のキャリア分析を行ってください。

【回答】
${formattedAnswers}

【出力形式】
以下のJSON形式で回答してください。Markdownコードブロックは使用せず、純粋なJSONのみを返してください。

{
  "roleModel": {
    "title": "キャリアロールモデルのタイトル",
    "description": "ロールモデルの説明",
    "characteristics": ["特徴1", "特徴2", "特徴3"],
    "strengths": ["強み1", "強み2", "強み3"],
    "challenges": ["課題1", "課題2"],
    "localOpportunities": ["地方での機会1", "地方での機会2"],
    "specificCareers": [
      {
        "name": "具体的な職業名",
        "description": "職業の説明",
        "salary": "年収目安",
        "requirements": ["必要なスキル1", "必要なスキル2"],
        "localAvailability": "地方での就職可能性"
      }
    ]
  },
  "careerPath": {
    "shortTerm": ["短期目標1", "短期目標2"],
    "mediumTerm": ["中期目標1", "中期目標2"],
    "longTerm": ["長期目標1", "長期目標2"]
  },
  "education": {
    "highSchool": ["高校での取り組み1", "高校での取り組み2"],
    "universities": [
      {
        "name": "大学名",
        "department": "学部・学科",
        "reason": "推薦理由",
        "location": "地方",
        "admissionInfo": "入試情報"
      }
    ]
  },
  "confidence": 85,
  "insights": ["インサイト1", "インサイト2"]
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
    ]) as any;

    const response = await result.response;
    const responseText = response.text();

    // 使用量更新
    updateUsage(800);

    // JSONレスポンスをパース
    try {
      // Markdownのコードブロック形式を処理
      let cleanResponse = responseText.trim();
      
      // ```json と ``` を削除
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // 末尾の不完全なJSONを処理
      cleanResponse = cleanResponse.replace(/,\s*$/, '');
      cleanResponse = cleanResponse.replace(/,\s*"[^"]*$/, '');
      cleanResponse = cleanResponse.replace(/,\s*[^,}]*$/, '');
      
      // 不完全なJSONオブジェクトを閉じる
      if (cleanResponse.includes('{') && !cleanResponse.endsWith('}')) {
        const openBraces = (cleanResponse.match(/\{/g) || []).length;
        const closeBraces = (cleanResponse.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        cleanResponse += '}'.repeat(missingBraces);
      }
      
      const parsedResponse = JSON.parse(cleanResponse);
      console.log('✅ AI分析成功 - Gemini API使用');
      return parsedResponse;
    } catch (jsonError) {
      console.error('Error parsing career analysis response JSON:', jsonError);
      console.error('Raw AI response:', responseText);
      console.log('⚠️ デモデータを使用します');
      return getDemoCareerAnalysis(answers);
    }

  } catch (error) {
    console.error('Error analyzing career quiz:', error);
    return getDemoCareerAnalysis(answers);
  }
}

// デモ分析結果
function getDemoCareerAnalysis(answers: { [key: string]: string }): CareerAnalysisResponse {
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
        localOpportunities: ["地方企業のDX支援", "地域課題のIT解決", "リモートワーク活用"],
        specificCareers: [
          {
            name: "システムエンジニア",
            description: "企業のITシステムの設計・開発・保守を行う技術者",
            salary: "年収400万円〜800万円（地方では350万円〜600万円）",
            requirements: ["プログラミングスキル", "システム設計能力", "コミュニケーション能力"],
            localAvailability: "地方でも需要が高い、リモートワーク可能"
          },
          {
            name: "Webデザイナー",
            description: "Webサイトのデザインとユーザー体験を担当するクリエイター",
            salary: "年収300万円〜600万円（地方では250万円〜500万円）",
            requirements: ["デザインスキル", "HTML/CSS/JavaScript", "UI/UX知識"],
            localAvailability: "フリーランスとして地方からでも活動可能"
          }
        ]
      },
      careerPath: {
        shortTerm: ["プログラミング基礎学習", "地域IT企業でのインターン", "オンライン学習の活用"],
        mediumTerm: ["専門学校・大学進学", "資格取得", "個人プロジェクト開発"],
        longTerm: ["テクノロジー専門職就職", "地方起業", "技術コンサルタント"]
      },
      education: {
        highSchool: ["プログラミング部活動", "IT関連の資格取得", "地域のITイベント参加"],
        universities: [
          {
            name: "信州大学",
            department: "工学部情報工学科",
            reason: "地方大学ながら情報工学の研究が盛んで、地域との連携も多い",
            location: "地方",
            admissionInfo: "偏差値55程度。一般選抜の他、総合型選抜も実施"
          }
        ]
      },
      confidence: 85,
      insights: [
        "技術分野は地方でもリモートワークで活躍可能",
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
        localOpportunities: ["地方自治体職員", "地域企業の管理職", "NPO・NGO活動"],
        specificCareers: [
          {
            name: "地方公務員",
            description: "地方自治体で住民の生活を支える公務員",
            salary: "年収350万円〜600万円（安定した収入）",
            requirements: ["公務員試験合格", "地域への理解", "奉仕精神"],
            localAvailability: "地方での需要が高い、安定した職業"
          }
        ]
      },
      careerPath: {
        shortTerm: ["地域ボランティア活動", "リーダーシップ研修参加", "地域イベント企画"],
        mediumTerm: ["大学・専門学校進学", "地域インターンシップ", "資格取得"],
        longTerm: ["地方公務員", "地域企業就職", "地域起業"]
      },
      education: {
        highSchool: ["生徒会活動", "地域ボランティア", "リーダーシップ研修"],
        universities: [
          {
            name: "新潟大学",
            department: "人文学部",
            reason: "地域研究が盛んで、地方自治体との連携が多い",
            location: "地方",
            admissionInfo: "偏差値52程度。一般選抜の他、学校推薦型選抜も実施"
          }
        ]
      },
      confidence: 80,
      insights: [
        "地方でのリーダーシップは大きな価値があります",
        "地域密着型の活動が将来のキャリアに直結します"
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
        localOpportunities: ["地方企業の総合職", "公務員", "多様な専門職"],
        specificCareers: [
          {
            name: "総合職（地方企業）",
            description: "営業、企画、管理など幅広い業務を担当する総合職",
            salary: "年収300万円〜550万円（地方では手当ても充実）",
            requirements: ["コミュニケーション能力", "学習意欲", "適応力"],
            localAvailability: "地方企業での需要が高い、多様な経験が積める"
          }
        ]
      },
      careerPath: {
        shortTerm: ["様々な分野の基礎学習", "地域インターンシップ", "資格取得検討"],
        mediumTerm: ["大学・専門学校進学", "専門分野の探索", "実務経験"],
        longTerm: ["専門職就職", "キャリア発展", "地域貢献"]
      },
      education: {
        highSchool: ["様々な部活動参加", "地域イベント参加", "資格取得"],
        universities: [
          {
            name: "長野県短期大学",
            department: "総合文化学科",
            reason: "幅広い教養と実践的なスキルを身につけられる",
            location: "地方",
            admissionInfo: "偏差値45程度。一般選抜の他、推薦入試も実施"
          }
        ]
      },
      confidence: 75,
      insights: [
        "幅広い経験が将来の選択肢を広げます",
        "地方公務員や地域企業での活躍の場が広がっています"
      ]
    };
  }
}
