// Gemini AI統合版 - 実際のAI機能

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysisRequest {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  currentStep: number;
  previousAnalysis?: string;
}

export interface AIAnalysisResponse {
  nextQuestion?: string;
  analysis: string;
  confidence: number;
  recommendations?: {
    careers: string[];
    universities: string[];
    roadmap: string[];
  };
}

// Gemini AI クライアントの初期化
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD56dRLMhGLB839cPqK9aRzpBQSaI_RK08';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 使用量監視（無料枠管理用）
let dailyUsage = {
  requests: 0,
  tokens: 0,
  lastReset: new Date().toDateString()
};

// 使用量チェック関数
function checkUsageLimit(): boolean {
  const today = new Date().toDateString();
  
  // 日付が変わったらリセット
  if (dailyUsage.lastReset !== today) {
    dailyUsage = {
      requests: 0,
      tokens: 0,
      lastReset: today
    };
  }
  
  // 制限チェック
  const DAILY_REQUEST_LIMIT = 1400; // 安全マージン付き
  const DAILY_TOKEN_LIMIT = 30000;  // 安全マージン付き
  
  return dailyUsage.requests < DAILY_REQUEST_LIMIT && 
         dailyUsage.tokens < DAILY_TOKEN_LIMIT;
}

// 使用量更新関数
function updateUsage(estimatedTokens: number): void {
  dailyUsage.requests++;
  dailyUsage.tokens += estimatedTokens;
  
  console.log(`[Gemini API] 使用量: ${dailyUsage.requests}回, ${dailyUsage.tokens}トークン`);
}

// モデルの選択（無料枠で利用可能）
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp", // 動作するモデル名に修正
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 256,  // レスポンス時間短縮のため削減
  }
});

export async function generateQuestion(
  answers: Array<{ questionId: string; answer: string }>,
  step: number
): Promise<string> {
  try {
    // APIキーが設定されていない場合はデモモード
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return 'デモモード: 次の質問を生成中...';
    }

    // 使用量制限チェック
    if (!checkUsageLimit()) {
      console.warn('[Gemini API] 無料枠の制限に達しました。デモモードに切り替えます。');
      return 'デモモード: 次の質問を生成中...';
    }

    const prompt = `
あなたは経験豊富なキャリアカウンセラーです。ユーザーの回答を分析して、より深い洞察を得るための次の質問を生成してください。

【ユーザーの回答履歴】
${answers.map(a => `・${a.questionId}: ${a.answer}`).join('\n')}

【現在のステップ】${step}/9

【質問生成の指針】
1. ユーザーの価値観、興味、適性を深く探る
2. キャリア選択に重要な要素（スキル、環境、報酬等）を明確にする
3. 具体的で選択しやすい質問形式
4. 前の回答との関連性を考慮
5. ユーザーの成長段階に適した質問
6. 多様な観点から質問を生成（性格、能力、環境、目標等）
7. 段階的に深掘りしていく質問設計

【質問形式】
選択肢付きの質問を1つ生成してください。選択肢は4つ程度とし、それぞれが明確に異なる価値観や方向性を表すようにしてください。

質問のみを返してください。説明文は不要です。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 使用量更新（質問生成は約300トークン）
    updateUsage(300);
    
    return response.text();
  } catch (error) {
    console.error('Error generating question:', error);
    return 'デモモード: 次の質問を生成中...';
  }
}

export async function analyzeProfile(
  answers: Array<{ questionId: string; answer: string }>
): Promise<AIAnalysisResponse> {
  try {
    console.log('[DEBUG] analyzeProfile called with answers:', answers.length);
    console.log('[DEBUG] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('[DEBUG] GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');
    
    // APIキーが設定されていない場合はデモモード
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('[DEBUG] Using demo mode - API key not set');
      return {
        analysis: 'デモモード: あなたの回答を分析しました。安定性を重視し、人とのつながりを大切にするキャリア適性です。',
        confidence: 75,
        recommendations: {
          careers: ['公務員', '銀行員', '事務職', '学校教員'],
          universities: ['東京大学 法学部', '早稲田大学 政治経済学部', '慶應義塾大学 法学部'],
          roadmap: [
            '高校で基礎学力を固める',
            '大学受験に向けた学習計画を立てる',
            '志望校のオープンキャンパスに参加する'
          ]
        }
      };
    }

    const prompt = `
キャリアカウンセラーとして、ユーザーの回答を分析してください。

【回答データ】
${answers.map(a => `${a.questionId}: ${a.answer}`).join('\n')}

【出力形式】
{
  "analysis": "キャリア適性の分析（200文字以内）",
  "confidence": 85,
  "recommendations": {
    "careers": ["職業1", "職業2", "職業3"],
    "universities": ["大学1 学部1", "大学2 学部2", "大学3 学部3"],
    "roadmap": ["短期目標", "中期目標", "長期目標"]
  }
}
`;

    // 使用量制限チェック
    if (!checkUsageLimit()) {
      console.warn('[Gemini API] 無料枠の制限に達しました。デモモードに切り替えます。');
      return {
        analysis: 'デモモード: あなたの回答を分析しました。安定性を重視し、人とのつながりを大切にするキャリア適性です。',
        confidence: 75,
        recommendations: {
          careers: ['公務員', '銀行員', '事務職', '学校教員'],
          universities: ['東京大学 法学部', '早稲田大学 政治経済学部', '慶應義塾大学 法学部'],
          roadmap: [
            '高校で基礎学力を固める',
            '大学受験に向けた学習計画を立てる',
            '志望校のオープンキャンパスに参加する'
          ]
        }
      };
    }

    // タイムアウト処理付きでAPI呼び出し
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 10000) // 10秒タイムアウト
      )
    ]) as any;
    
    const response = await result.response;
    const responseText = response.text();
    
    // 使用量更新（分析は約400トークン）
    updateUsage(400);
    
    // JSONレスポンスをパース
    try {
      const parsedResponse = JSON.parse(responseText);
      return {
        analysis: parsedResponse.analysis || '分析結果を取得できませんでした。',
        confidence: parsedResponse.confidence || 70,
        recommendations: parsedResponse.recommendations || {
          careers: ['公務員', '事務職'],
          universities: ['東京大学', '早稲田大学'],
          roadmap: ['基礎学力向上', '志望校研究']
        }
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // JSONパースに失敗した場合はフォールバック
      return {
        analysis: responseText || '分析中にエラーが発生しました。',
        confidence: 70,
        recommendations: {
          careers: ['公務員', '事務職'],
          universities: ['東京大学', '早稲田大学'],
          roadmap: ['基礎学力向上', '志望校研究']
        }
      };
    }
  } catch (error) {
    console.error('Error analyzing profile:', error);
    // エラー時はデモ結果を返す
    return {
      analysis: '分析中にエラーが発生しました。デモ結果を表示します。',
      confidence: 70,
      recommendations: {
        careers: ['公務員', '事務職'],
        universities: ['東京大学', '早稲田大学'],
        roadmap: ['基礎学力向上', '志望校研究']
      }
    };
  }
}

// AI強化大学推薦機能
export async function recommendUniversities(
  profile: string,
  interests: string[]
): Promise<any[]> {
  try {
    // 大学データを取得
    const response = await fetch('/api/universities');
    const data = await response.json();
    
    if (!data.success) {
      return [];
    }

    // APIキーが設定されている場合はAI推薦を使用
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      return await getAIUniversityRecommendations(profile, interests, data.universities);
    }
    
    // フォールバック: 従来のルールベース推薦
    return getRuleBasedRecommendations(interests, data.universities);
  } catch (error) {
    console.error('Error recommending universities:', error);
    return [];
  }
}

// AI推薦機能
async function getAIUniversityRecommendations(
  profile: string,
  interests: string[],
  universities: any[]
): Promise<any[]> {
  try {
    const prompt = `
あなたは大学進学の専門家です。ユーザーのプロファイルと興味に基づいて、最適な大学を推薦してください。

ユーザープロファイル: ${profile}
興味・関心: ${interests.join(', ')}

利用可能な大学データ:
${universities.slice(0, 20).map(uni => 
  `- ${uni.name} (${uni.type}): ${uni.departments.join(', ')}`
).join('\n')}

以下の条件で大学を5校推薦してください:
1. ユーザーの興味・関心に合致する学部がある
2. ユーザーの性格・価値観に適している
3. 実現可能性を考慮している
4. 多様性を考慮している（国立・私立のバランス）

推薦理由も含めて、以下のJSON形式で回答してください:
{
  "recommendations": [
    {
      "university": "大学名",
      "reason": "推薦理由",
      "match_score": 85
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    try {
      const parsedResponse = JSON.parse(responseText);
      return parsedResponse.recommendations || [];
    } catch (parseError) {
      console.error('Error parsing AI university recommendations:', parseError);
      return getRuleBasedRecommendations(interests, universities);
    }
  } catch (error) {
    console.error('Error getting AI university recommendations:', error);
    return getRuleBasedRecommendations(interests, universities);
  }
}

// ルールベース推薦機能（フォールバック）
function getRuleBasedRecommendations(interests: string[], universities: any[]): any[] {
  let recommended = [...universities];
  
  // 興味に基づくフィルタリング
  if (interests.some(interest => ['法学', '政治'].includes(interest))) {
    recommended = recommended.filter((uni: any) => 
      uni.departments.some((dept: string) => 
        dept.includes('法') || dept.includes('政治')
      )
    );
  }
  
  if (interests.some(interest => ['経済', '商学'].includes(interest))) {
    recommended = recommended.filter((uni: any) => 
      uni.departments.some((dept: string) => 
        dept.includes('経済') || dept.includes('商')
      )
    );
  }
  
  // 上位5校を返す
  return recommended.slice(0, 5);
}
