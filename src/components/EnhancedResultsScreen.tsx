'use client';

import { useState, useEffect } from 'react';

interface EnhancedResultsScreenProps {
  results: any;
  onRestart: () => void;
}

export default function EnhancedResultsScreen({ results, onRestart }: EnhancedResultsScreenProps) {
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (results && results.answers) {
      fetchEnhancedAnalysis();
    }
  }, [results]);

  const fetchEnhancedAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/advanced-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: results.answers || []
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEnhancedAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Enhanced analysis error:', error);
    }
    setIsLoading(false);
  };


  const renderCareerCard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-green-600 text-lg">💼</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">キャリア推薦</h3>
      </div>
      
      {enhancedAnalysis ? (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">最適な職業</h4>
            <p className="text-green-700 text-lg font-semibold">{enhancedAnalysis.career.primary}</p>
            <p className="text-green-600 text-sm mt-2">{enhancedAnalysis.career.reasoning}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">代替職業</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {enhancedAnalysis.career.alternatives.map((career: string, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{career}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">市場動向</h4>
            <p className="text-yellow-700 text-sm">{enhancedAnalysis.career.marketTrend}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">キャリア分析中...</p>
        </div>
      )}
    </div>
  );

  const renderEducationCard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-purple-600 text-lg">🎓</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">教育・進路</h3>
      </div>
      
      {enhancedAnalysis ? (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">推薦大学</h4>
            <div className="space-y-2">
              {enhancedAnalysis.education.recommended.map((uni: string, index: number) => (
                <div key={index} className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-purple-700">{uni}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">学習タイムライン</h4>
            <p className="text-purple-700 text-sm">{enhancedAnalysis.education.timeline}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">進路分析中...</p>
        </div>
      )}
    </div>
  );

  const renderDevelopmentCard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-orange-600 text-lg">📈</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">成長計画</h3>
      </div>
      
      {enhancedAnalysis ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">短期目標（1-2年）</h4>
              <ul className="space-y-1">
                {enhancedAnalysis.development.shortTerm.map((goal: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">長期目標（3-5年）</h4>
              <ul className="space-y-1">
                {enhancedAnalysis.development.longTerm.map((goal: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">習得すべきスキル</h4>
            <div className="flex flex-wrap gap-2">
              {enhancedAnalysis.development.skills.map((skill: string, index: number) => (
                <span key={index} className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">成長計画作成中...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI分析結果</h1>
          <p className="text-gray-600">あなたに最適化されたキャリアアドバイス</p>
        </div>

        {/* 分析結果カード */}
        <div className="space-y-6">
          {renderCareerCard()}
          {renderEducationCard()}
          {renderDevelopmentCard()}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            新しい分析を開始
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            結果を印刷
          </button>
        </div>
      </div>
    </div>
  );
}
