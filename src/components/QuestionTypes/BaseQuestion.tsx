import { ReactNode } from 'react';
import { Question } from '../../types';

export interface BaseQuestionProps {
  question: Question;
  onAnswer: (correct: boolean, timeSpent: number, attemptCount?: number) => void;
  onSkip?: () => void;
}

interface BaseQuestionLayoutProps {
  question: Question;
  children: ReactNode;
  instruction: string;
  showSkipButton?: boolean;
  onSkip?: () => void;
}

export function BaseQuestionLayout({ 
  question, 
  children, 
  instruction,
  showSkipButton = true,
  onSkip 
}: BaseQuestionLayoutProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">{instruction}</p>
        <div className="flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {question.category}
          </span>
          {question.difficulty && (
            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              Niveau {question.difficulty}
            </span>
          )}
        </div>
      </div>

      {children}

      {showSkipButton && onSkip && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Sla over
          </button>
        </div>
      )}
    </div>
  );
}

export function useQuestionTimer() {
  const startTime = Date.now();
  
  const getTimeSpent = () => {
    return Math.floor((Date.now() - startTime) / 1000);
  };
  
  return { getTimeSpent };
}