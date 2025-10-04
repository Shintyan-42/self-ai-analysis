import { NextRequest, NextResponse } from 'next/server';
import { performAdvancedAnalysis } from '@/lib/ai-enhanced';

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    const analysis = await performAdvancedAnalysis(answers);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Advanced analysis API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Advanced analysis failed',
        analysis: {
          personality: {
            type: '分析エラー',
            traits: ['エラーが発生しました'],
            strengths: ['再試行してください'],
            growthAreas: ['システム管理者にお問い合わせください']
          },
          career: {
            primary: 'エラー',
            alternatives: ['再試行'],
            reasoning: '分析中にエラーが発生しました',
            marketTrend: 'システムを再起動してください'
          },
          education: {
            recommended: ['エラー'],
            pathways: ['再試行'],
            timeline: 'エラーが発生しました'
          },
          development: {
            shortTerm: ['再試行'],
            longTerm: ['システム確認'],
            skills: ['エラー対応']
          },
          confidence: 0,
          insights: ['分析中にエラーが発生しました']
        }
      },
      { status: 500 }
    );
  }
}
