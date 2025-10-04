'use client';

import { useState, useEffect } from 'react';
import { analyzeCareerQuiz, CareerAnalysisResponse } from '@/lib/career-analysis';

interface CareerQuizResultsProps {
  answers: { [key: string]: string };
  onRestart: () => void;
}

export default function CareerQuizResults({ answers, onRestart }: CareerQuizResultsProps) {
  const [analysis, setAnalysis] = useState<CareerAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const result = await analyzeCareerQuiz(answers);
        setAnalysis(result);
      } catch (err) {
        console.error('Career analysis error:', err);
        setError('分析中にエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [answers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">AI分析中...</h2>
          <p className="text-gray-600 mb-6">あなたの回答を分析して、最適なキャリアロールモデルを見つけています</p>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-sm text-blue-600 mt-2">通常10秒以内で完了します</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error || '分析結果を取得できませんでした。'}</p>
          <button
            onClick={onRestart}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">キャリア分析結果</h1>
          <p className="text-gray-600">あなたに最適なキャリアロールモデルを見つけました</p>
          <div className="mt-4 inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            信頼度: {analysis.confidence}%
          </div>
        </div>

        {/* キャリアロールモデル */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">あなたのキャリアロールモデル</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{analysis.roleModel.title}</h3>
            <p className="text-gray-700 leading-relaxed">{analysis.roleModel.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                あなたの特徴
              </h4>
              <ul className="space-y-2">
                {analysis.roleModel.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-yellow-600 text-sm">⭐</span>
                </span>
                あなたの強み
              </h4>
              <ul className="space-y-2">
                {analysis.roleModel.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-purple-600 text-sm">🏠</span>
              </span>
              地方での機会
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.roleModel.localOpportunities.map((opportunity, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {opportunity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* キャリアパス */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 text-xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">あなたのキャリアロードマップ</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                短期目標（1-3年）
              </h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {analysis.careerPath.shortTerm.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                中期目標（3-7年）
              </h4>
              <div className="bg-green-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {analysis.careerPath.mediumTerm.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                長期目標（7年以上）
              </h4>
              <div className="bg-purple-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {analysis.careerPath.longTerm.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 教育・進路推薦 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-yellow-600 text-xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">おすすめの進路</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">高校での取り組み</h4>
              <div className="bg-yellow-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {analysis.education.highSchool.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">おすすめの大学・学部</h4>
              <div className="space-y-4">
                {analysis.education.universities.map((uni, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-800 text-lg">{uni.name}</h5>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {uni.location}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-2">{uni.department}</p>
                    <p className="text-gray-600 text-sm mb-2">{uni.reason}</p>
                    {uni.admissionInfo && (
                      <div className="bg-white rounded p-2 border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium">入試情報</p>
                        <p className="text-xs text-gray-600">{uni.admissionInfo}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">その他の選択肢</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.education.alternatives.map((alt, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI洞察 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-purple-600 text-xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AIからの洞察</h2>
          </div>
          
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              もう一度診断する
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
            >
              結果を印刷する
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            この結果は参考としてご活用ください。進路選択は慎重に検討してください。
          </p>
        </div>
      </div>
    </div>
  );
}
