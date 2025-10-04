import { NextRequest, NextResponse } from 'next/server';
import { stmts } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // 全ての分析結果を取得
    const analyses = stmts.getAllAnalyses.all();
    
    // 履歴データを整形
    const history = analyses.map((analysis: any) => {
      let recommendations;
      try {
        recommendations = JSON.parse(analysis.recommendations);
      } catch (error) {
        recommendations = {
          careers: ['公務員', '事務職'],
          universities: ['東京大学', '早稲田大学'],
          roadmap: ['基礎学力向上', '志望校研究']
        };
      }

      return {
        id: analysis.id,
        date: analysis.created_at,
        analysis: analysis.analysis || '分析結果がありません',
        confidence: 85, // デフォルト値
        careers: recommendations.careers || [],
        universities: recommendations.universities || []
      };
    });

    // 日付順でソート（新しい順）
    history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
