import { NextRequest, NextResponse } from 'next/server';
import { progressiveAnalysis } from '@/lib/progressive-analysis';

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // プログレッシブ分析を実行（タイムアウト処理付き）
    const analysis = await Promise.race([
      progressiveAnalysis(answers),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Progressive analysis timeout')), 20000) // 20秒タイムアウト
      )
    ]) as any;

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Progressive analysis API error:', error);
    
    // タイムアウトエラーの場合はデモ結果を返す
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({
        success: true,
        analysis: {
          analysis: '分析に時間がかかっているため、デモ結果を表示します。安定性を重視し、人とのつながりを大切にする性格です。',
          confidence: 70,
          recommendations: {
            careers: ['公務員', '銀行員', '事務職', '学校教員'],
            universities: ['東京大学 法学部', '早稲田大学 政治経済学部', '慶應義塾大学 法学部'],
            roadmap: [
              '高校で基礎学力を固める',
              '大学受験に向けた学習計画を立てる',
              '志望校のオープンキャンパスに参加する'
            ]
          }
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Progressive analysis failed',
        analysis: {
          analysis: '分析中にエラーが発生しました。デモ結果を表示します。',
          confidence: 60,
          recommendations: {
            careers: ['公務員', '事務職'],
            universities: ['東京大学', '早稲田大学'],
            roadmap: ['基礎学力向上', '志望校研究']
          }
        }
      },
      { status: 500 }
    );
  }
}
