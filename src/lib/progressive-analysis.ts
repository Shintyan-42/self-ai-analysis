// プログレッシブ分析 - 段階的な分析でレスポンス時間を短縮

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD56dRLMhGLB839cPqK9aRzpBQSaI_RK08';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 高速分析モデル
const fastModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp", // 動作するモデル名に修正
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 128,  // 最小限のトークンで高速化
  }
});

// 段階的分析
export async function progressiveAnalysis(
  answers: Array<{ questionId: string; answer: string }>
): Promise<any> {
  try {
    console.log('[DEBUG] progressiveAnalysis called with answers:', answers.length);
    console.log('[DEBUG] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('[DEBUG] Using demo mode - API key not set');
      return getDemoResult();
    }

    // 第1段階: 職業推薦（中速）
    const careerRecommendations = await recommendCareers(answers);
    
    // 第2段階: 大学推薦（中速）
    const universityRecommendations = await recommendUniversities(answers);
    
    // 第3段階: ロードマップ（高速）
    const roadmap = await generateRoadmap(answers);

    return {
      analysis: 'あなたの回答に基づくキャリア適性分析です。',
      confidence: 85,
      recommendations: {
        careers: careerRecommendations,
        universities: universityRecommendations,
        roadmap: roadmap
      }
    };

  } catch (error) {
    console.error('Progressive analysis error:', error);
    return getDemoResult();
  }
}


// 職業推薦（中速）
async function recommendCareers(answers: Array<{ questionId: string; answer: string }>): Promise<string[]> {
  const prompt = `
【回答】
${answers.map(a => `${a.questionId}: ${a.answer}`).join('\n')}

【出力】
["職業1", "職業2", "職業3"]
`;

  const result = await Promise.race([
    fastModel.generateContent(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Career recommendation timeout')), 5000)
    )
  ]) as any;

  const response = await result.response;
  const responseText = response.text();
  
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    return ['公務員', '銀行員', '事務職'];
  }
}

// 大学推薦（中速）
async function recommendUniversities(answers: Array<{ questionId: string; answer: string }>): Promise<string[]> {
  const prompt = `
【回答】
${answers.map(a => `${a.questionId}: ${a.answer}`).join('\n')}

【出力】
["大学1 学部1", "大学2 学部2", "大学3 学部3"]
`;

  const result = await Promise.race([
    fastModel.generateContent(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('University recommendation timeout')), 5000)
    )
  ]) as any;

  const response = await result.response;
  const responseText = response.text();
  
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    return ['東京大学 法学部', '早稲田大学 政治経済学部', '慶應義塾大学 法学部'];
  }
}

// ロードマップ生成（高速）
async function generateRoadmap(answers: Array<{ questionId: string; answer: string }>): Promise<string[]> {
  const prompt = `
【出力】
["短期目標", "中期目標", "長期目標"]
`;

  const result = await Promise.race([
    fastModel.generateContent(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Roadmap generation timeout')), 3000)
    )
  ]) as any;

  const response = await result.response;
  const responseText = response.text();
  
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    return ['基礎学力向上', '志望校研究', 'キャリア形成'];
  }
}

// デモ結果
function getDemoResult(): any {
  return {
    analysis: 'デモモード: 安定性を重視し、人とのつながりを大切にする性格です。',
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
