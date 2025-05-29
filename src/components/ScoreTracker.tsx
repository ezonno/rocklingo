import React from 'react';

interface ScoreTrackerProps {
  score: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastQuestionPoints?: number;
}

export const ScoreTracker: React.FC<ScoreTrackerProps> = ({
  score,
  streak,
  questionsAnswered,
  correctAnswers,
  lastQuestionPoints
}) => {
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-sm text-gray-600">Punten</div>
          {lastQuestionPoints && lastQuestionPoints > 0 && (
            <div className="text-xs text-green-600 animate-bounce">
              +{lastQuestionPoints}
            </div>
          )}
        </div>

        {/* Streak */}
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
            {streak > 0 && '🔥'}
            {streak}
          </div>
          <div className="text-sm text-gray-600">Reeks</div>
        </div>

        {/* Accuracy */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
          <div className="text-sm text-gray-600">Juist</div>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {correctAnswers}/{questionsAnswered}
          </div>
          <div className="text-sm text-gray-600">Vragen</div>
        </div>
      </div>

      {/* Streak Bonus Indicator */}
      {streak > 0 && streak % 3 === 0 && (
        <div className="mt-2 text-center">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium animate-pulse">
            🎯 Reeks Bonus! +2 punten
          </span>
        </div>
      )}
    </div>
  );
};