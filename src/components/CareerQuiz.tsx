'use client';

import { useState, useEffect, useCallback } from 'react';
import { questions, Question } from '@/data/questions';
import CareerQuizResults from './CareerQuizResults';

interface Answers {
  [key: string]: string;
}

interface CareerQuizProps {
  onComplete?: (results: any) => void;
}

export default function CareerQuiz({ onComplete }: CareerQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  // 分岐ロジック関数
  const getNextQuestion = useCallback((answers: Answers, currentIndex: number): Question | null => {
    // ステップ1と2の質問は順番に表示
    if (currentIndex < 10) {
      return questions[currentIndex];
    }

    // ステップ3の分岐質問をチェック
    const conditionalQuestions = questions.filter(q => q.condition);
    
    for (const question of conditionalQuestions) {
      if (question.condition && question.condition(answers)) {
        // まだ回答していない質問かチェック
        if (!answers.hasOwnProperty(question.id)) {
          return question;
        }
      }
    }

    return null;
  }, []);

  // 現在の質問を更新
  useEffect(() => {
    const nextQuestion = getNextQuestion(answers, currentQuestionIndex);
    setCurrentQuestion(nextQuestion);

    // プログレス計算
    const totalQuestions = 15; // 最大質問数
    const answeredCount = Object.keys(answers).length;
    setProgress((answeredCount / totalQuestions) * 100);

    // 完了チェック
    if (!nextQuestion && Object.keys(answers).length > 0) {
      setIsCompleted(true);
      setShowResults(true);
      console.log('診断完了 - 収集した回答:', answers);
      // 親コンポーネントに結果を渡す
      if (onComplete) {
        onComplete({ answers, completed: true });
      }
    }
  }, [answers, currentQuestionIndex, getNextQuestion]);

  // 回答処理
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // 次の質問のインデックスを計算
    let nextIndex = currentQuestionIndex + 1;
    
    // ステップ3の分岐質問の場合は、適切なインデックスに調整
    if (questionId.startsWith('q11_')) {
      // 分岐質問の場合は最後の質問へ
      nextIndex = questions.length - 1;
    } else if (questionId === 'q15') {
      // 最後の質問の場合は完了
      nextIndex = questions.length;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  // ステップ表示用の関数
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return '自分の「好き」のタネを見つけよう';
      case 2:
        return '「どんな大人になりたい？」を想像しよう';
      case 3:
        return '未来への「一歩」を決めよう';
      default:
        return '';
    }
  };

  // 再開始処理
  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setShowResults(false);
  };

  // 結果画面
  if (showResults && isCompleted) {
    return <CareerQuizResults answers={answers} onRestart={handleRestart} />;
  }

  // 完了画面（結果画面に遷移する前の表示）
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">診断完了！</h2>
            <p className="text-gray-600">あなたの回答を分析して、最適なキャリアロールモデルを見つけました。</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">収集した回答</h3>
            <div className="text-left space-y-2">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowResults(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
          >
            AI分析結果を見る
          </button>
          <button
            onClick={handleRestart}
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }

  // 質問画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">キャリア発見クイズ</h1>
          <p className="text-gray-600">あなたにぴったりのキャリアロールモデルを見つけましょう</p>
        </div>

        {/* プログレスバー */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{currentQuestion?.step || 1}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {getStepTitle(currentQuestion?.step || 1)}
                </h2>
                <p className="text-sm text-gray-500">
                  質問 {Object.keys(answers).length + 1} / 15
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(progress)}%
              </span>
              <p className="text-xs text-gray-500">完了</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 質問カード */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 leading-relaxed">
                {currentQuestion.text}
              </h3>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className="w-full p-6 text-left bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                      <span className="text-gray-600 group-hover:text-white font-semibold text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <span className="text-gray-800 font-medium text-lg group-hover:text-blue-800 transition-colors duration-300">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            あなたの回答は安全に保存され、分析にのみ使用されます
          </p>
        </div>
      </div>
    </div>
  );
}
