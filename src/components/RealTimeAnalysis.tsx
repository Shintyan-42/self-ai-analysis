'use client';

import { useState, useEffect } from 'react';

interface RealTimeAnalysisProps {
  answers: Array<{ questionId: string; answer: string }>;
  currentStep: number;
  onInsightsUpdate: (insights: string[]) => void;
}

export default function RealTimeAnalysis({ 
  answers, 
  currentStep, 
  onInsightsUpdate 
}: RealTimeAnalysisProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (answers.length > 0) {
      performRealTimeAnalysis();
    }
  }, [answers, currentStep]);

  const performRealTimeAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/real-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          currentStep
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights || []);
        setProgress(data.progress || 0);
        onInsightsUpdate(data.insights || []);
      }
    } catch (error) {
      console.error('Real-time analysis error:', error);
      setInsights(['分析中...']);
    }
    setIsAnalyzing(false);
  };

  if (insights.length === 0 && !isAnalyzing) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
      <div className="flex items-center mb-3">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium text-blue-800">
            {isAnalyzing ? 'AI分析中...' : 'AI分析結果'}
          </span>
        </div>
        <div className="ml-auto">
          <div className="text-xs text-blue-600">
            {progress}% 完了
          </div>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="w-full bg-blue-200 rounded-full h-1 mb-3">
        <div 
          className="bg-blue-600 h-1 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* 洞察表示 */}
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="flex items-start space-x-2 text-sm text-blue-700"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <span>{insight}</span>
          </div>
        ))}
      </div>

      {/* 分析ステータス */}
      <div className="mt-3 text-xs text-blue-600">
        {isAnalyzing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AIがあなたの回答を分析中...
          </span>
        ) : (
          <span>✅ 分析完了</span>
        )}
      </div>
    </div>
  );
}
