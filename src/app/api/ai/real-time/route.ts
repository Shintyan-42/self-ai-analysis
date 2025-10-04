import { NextRequest, NextResponse } from 'next/server';
import { analyzeInRealTime } from '@/lib/ai-enhanced';

export async function POST(request: NextRequest) {
  try {
    const { answers, currentStep } = await request.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    const analysis = await analyzeInRealTime(answers, currentStep);

    return NextResponse.json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error('Real-time analysis API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analysis failed',
        insights: ['分析中...'],
        nextQuestion: '次の質問を準備中...',
        progress: 0
      },
      { status: 500 }
    );
  }
}
