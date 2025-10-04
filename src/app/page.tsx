'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import EnhancedResultsScreen from '@/components/EnhancedResultsScreen';
import HistoryScreen from '@/components/HistoryScreen';
import CareerQuiz from '@/components/CareerQuiz';

type AppState = 'career-quiz' | 'results' | 'menu' | 'history';

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>('career-quiz');
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setCurrentState('results');
  };

  const handleRestart = () => {
    setQuizResults(null);
    setCurrentState('career-quiz');
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    setQuizResults(null);
    setCurrentState('career-quiz');
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleMenuClick} />

      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50">
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-black">メニュー</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setCurrentState('career-quiz');
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors text-black font-medium"
                >
                  キャリア発見クイズ
                </button>
                
                <button
                  onClick={() => {
                    setCurrentState('history');
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors text-black font-medium"
                >
                  過去の診断結果
                </button>
                
                {quizResults && (
                  <button
                    onClick={() => {
                      setCurrentState('results');
                      setShowMenu(false);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors text-black font-medium"
                  >
                    前回の結果を見る
                  </button>
                )}
                
                <hr className="my-4" />
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        {currentState === 'career-quiz' && (
          <CareerQuiz onComplete={handleQuizComplete} />
        )}
        
        {currentState === 'results' && quizResults && (
          <EnhancedResultsScreen 
            results={quizResults} 
            onRestart={handleRestart}
          />
        )}
        
        {currentState === 'history' && (
          <HistoryScreen 
            onBack={() => setCurrentState('career-quiz')}
            onViewResult={(result) => {
              setQuizResults(result);
              setCurrentState('results');
            }}
          />
        )}
      </main>

    </div>
  );
}