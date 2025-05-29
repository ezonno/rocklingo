import React from 'react';
import { Session } from '../types';

interface StatsGridProps {
  sessions: Session[];
  totalQuestionProgress?: { [questionId: string]: { correct: number; total: number } };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ 
  sessions, 
  totalQuestionProgress = {} 
}) => {
  // Calculate statistics
  const totalSessions = sessions.length;
  const totalPoints = sessions.reduce((sum, session) => sum + session.score, 0);
  const averageScore = totalSessions > 0 ? Math.round(totalPoints / totalSessions) : 0;
  const bestScore = totalSessions > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
  
  // Calculate total time practiced (in minutes)
  const totalTimePracticed = sessions.reduce((sum, session) => sum + session.duration, 0);
  const totalHours = Math.floor(totalTimePracticed / 60);
  const totalMinutes = totalTimePracticed % 60;
  
  // Calculate words mastered (questions with >70% accuracy)
  const wordsMastered = Object.values(totalQuestionProgress).filter(
    progress => progress.total > 0 && (progress.correct / progress.total) >= 0.7
  ).length;
  
  // Calculate current streak (consecutive sessions with >70% accuracy)
  let currentStreak = 0;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const session = sessions[i];
    const accuracy = session.questionsAnswered > 0 
      ? (session.correctAnswers / session.questionsAnswered) 
      : 0;
    
    if (accuracy >= 0.7) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate total questions answered
  const totalQuestionsAnswered = sessions.reduce((sum, session) => sum + session.questionsAnswered, 0);
  const totalCorrectAnswers = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
    : 0;

  const stats = [
    {
      label: 'Gemiddelde Score',
      value: averageScore,
      icon: '📊',
      color: 'bg-blue-50 text-blue-600',
      trend: sessions.length >= 2 ? (
        sessions[sessions.length - 1].score > sessions[sessions.length - 2].score ? '↗️' : 
        sessions[sessions.length - 1].score < sessions[sessions.length - 2].score ? '↘️' : '➡️'
      ) : null
    },
    {
      label: 'Beste Score',
      value: bestScore,
      icon: '🏆',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      label: 'Tijd Geoefend',
      value: totalHours > 0 ? `${totalHours}u ${totalMinutes}m` : `${totalMinutes}m`,
      icon: '⏱️',
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Woorden Geleerd',
      value: wordsMastered,
      icon: '📚',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Huidige Reeks',
      value: currentStreak,
      icon: currentStreak >= 3 ? '🔥' : '⭐',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      label: 'Totale Nauwkeurigheid',
      value: `${overallAccuracy}%`,
      icon: '🎯',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: 'Totale Sessies',
      value: totalSessions,
      icon: '📈',
      color: 'bg-gray-50 text-gray-600'
    },
    {
      label: 'Totale Vragen',
      value: totalQuestionsAnswered,
      icon: '❓',
      color: 'bg-pink-50 text-pink-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Gedetailleerde Statistieken</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-4 text-center relative`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold mb-1">
              {stat.value}
              {stat.trend && (
                <span className="text-sm ml-1">{stat.trend}</span>
              )}
            </div>
            <div className="text-xs opacity-75">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* Additional insights */}
      {totalSessions > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">💡 Inzichten</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {overallAccuracy >= 80 && (
              <p>🌟 Uitstekend! Je nauwkeurigheid is erg hoog.</p>
            )}
            {currentStreak >= 5 && (
              <p>🔥 Geweldig! Je hebt een goede reeks gaande.</p>
            )}
            {totalHours >= 1 && (
              <p>⏰ Je hebt al meer dan een uur geoefend - goed bezig!</p>
            )}
            {wordsMastered >= 10 && (
              <p>📚 Fantastisch! Je hebt al {wordsMastered} woorden onder de knie.</p>
            )}
            {totalSessions >= 10 && (
              <p>🎯 Je bent een echte volhouder met {totalSessions} sessies!</p>
            )}
            {totalSessions < 3 && (
              <p>🚀 Blijf oefenen om je voortgang te zien groeien!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};