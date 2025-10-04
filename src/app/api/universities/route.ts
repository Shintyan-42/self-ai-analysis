import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchUniversitiesWithCache, 
  searchUniversities, 
  getUniversityStatistics 
} from '@/lib/university-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータを取得
    const name = searchParams.get('name');
    const department = searchParams.get('department');
    const prefecture = searchParams.get('prefecture');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');
    const includeStats = searchParams.get('stats') === 'true';
    
    // キャッシュ機能付きで大学データを取得
    const allUniversities = await fetchUniversitiesWithCache();
    
    // 検索・フィルタリング
    const universities = searchUniversities(allUniversities, {
      name: name || undefined,
      department: department || undefined,
      prefecture: prefecture || undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit) : undefined
    });
    
    // レスポンスデータを構築
    const responseData: any = {
      success: true,
      universities,
      total: universities.length,
      totalAvailable: allUniversities.length,
      filters: {
        name,
        department,
        prefecture,
        type,
        limit
      }
    };
    
    // 統計情報を含める場合
    if (includeStats) {
      responseData.statistics = getUniversityStatistics(allUniversities);
    }
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Universities API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
