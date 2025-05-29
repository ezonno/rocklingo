import React from 'react';
import { GameSession } from '../services/sessionManager';

interface SessionSummaryProps {
  session: GameSession;
  onStartNew: () => void;
  onBackToMenu: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  session,
  onStartNew,
  onBackToMenu
}) => {
  const accuracy = session.questionsAnswered > 0 
    ? Math.round((session.correctAnswers / session.questionsAnswered) * 100) 
    : 0;

  const sessionDuration = session.endTime 
    ? Math.round((session.endTime - session.startTime) / 1000 / 60)
    : 0;

  const averageTimePerQuestion = session.questionsAnswered > 0
    ? Math.round(session.attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / session.questionsAnswered)
    : 0;

  const getPerformanceMessage = (accuracy: number, score: number): string => {
    if (accuracy >= 90 && score >= 150) return "🌟 Fantastisch! Je bent een echte Franse woordenmeester!";
    if (accuracy >= 80) return "🎉 Geweldig gedaan! Je Franse vocabulaire wordt steeds beter!";
    if (accuracy >= 70) return "👏 Goed werk! Blijf oefenen en je wordt nog beter!";
    if (accuracy >= 60) return "💪 Niet slecht! Met meer oefening wordt het steeds makkelijker!";
    return "🌱 Goede poging! Elke sessie helpt je om te verbeteren!";
  };

  const getBadges = (session: GameSession): string[] => {
    const badges: string[] = [];
    
    if (accuracy === 100) badges.push("🎯 Perfect!");
    if (session.correctAnswers >= 20) badges.push("🏆 Vraag Champion");
    if (session.score >= 200) badges.push("⭐ Hoge Score");
    if (averageTimePerQuestion <= 5) badges.push("⚡ Snelle Denker");
    if (session.questionsAnswered >= 30) badges.push("📚 Volhardend");

    return badges;
  };

  const performanceMessage = getPerformanceMessage(accuracy, session.score);
  const badges = getBadges(session);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sessie Voltooid!</h2>
        <p className="text-lg text-gray-600">{performanceMessage}</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{session.score}</div>
          <div className="text-sm text-gray-600">Totale Punten</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
          <div className="text-sm text-gray-600">Juist</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{session.questionsAnswered}</div>
          <div className="text-sm text-gray-600">Vragen</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{sessionDuration}</div>
          <div className="text-sm text-gray-600">Minuten</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Gedetailleerde Statistieken</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Juiste antwoorden:</span>
            <span className="font-medium ml-2">{session.correctAnswers}/{session.questionsAnswered}</span>
          </div>
          <div>
            <span className="text-gray-600">Gemiddelde tijd:</span>
            <span className="font-medium ml-2">{averageTimePerQuestion}s per vraag</span>
          </div>
          <div>
            <span className="text-gray-600">Categorieën:</span>
            <span className="font-medium ml-2">{session.categories.length}</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Behaalde Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onStartNew}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🔄 Nieuwe Sessie
        </button>
        <button
          onClick={onBackToMenu}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          🏠 Hoofdmenu
        </button>
      </div>
    </div>
  );
};