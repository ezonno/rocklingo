import React from 'react';
import { Session } from '../types';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedIcon: string;
  condition: (sessions: Session[], questionProgress?: { [key: string]: { correct: number; total: number } }) => boolean;
  progress?: (sessions: Session[], questionProgress?: { [key: string]: { correct: number; total: number } }) => { current: number; target: number };
}

interface AchievementBadgesProps {
  sessions: Session[];
  questionProgress?: { [questionId: string]: { correct: number; total: number } };
  showProgress?: boolean;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  sessions, 
  questionProgress = {},
  showProgress = true 
}) => {
  const achievements: Achievement[] = [
    {
      id: 'first_session',
      name: 'Eerste Stappen',
      description: 'Voltooi je eerste oefensessie',
      icon: '⭐',
      unlockedIcon: '🌟',
      condition: (sessions) => sessions.length >= 1
    },
    {
      id: 'perfect_session',
      name: 'Perfect!',
      description: 'Behaal 100% nauwkeurigheid in een sessie',
      icon: '🎯',
      unlockedIcon: '🏆',
      condition: (sessions) => sessions.some(s => 
        s.questionsAnswered > 0 && s.correctAnswers === s.questionsAnswered
      )
    },
    {
      id: 'high_score',
      name: 'Hoge Score',
      description: 'Behaal 200+ punten in één sessie',
      icon: '🏅',
      unlockedIcon: '👑',
      condition: (sessions) => sessions.some(s => s.score >= 200),
      progress: (sessions) => ({
        current: Math.max(...sessions.map(s => s.score), 0),
        target: 200
      })
    },
    {
      id: 'streak_7',
      name: 'Volhardend',
      description: 'Oefen 7 dagen achter elkaar',
      icon: '🔥',
      unlockedIcon: '🚀',
      condition: (sessions) => {
        if (sessions.length < 7) return false;
        const sortedSessions = [...sessions].sort((a, b) => a.date - b.date);
        let streak = 1;
        let maxStreak = 1;
        
        for (let i = 1; i < sortedSessions.length; i++) {
          const currentDate = new Date(sortedSessions[i].date);
          const prevDate = new Date(sortedSessions[i - 1].date);
          const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
          } else if (dayDiff > 1) {
            streak = 1;
          }
        }
        
        return maxStreak >= 7;
      },
      progress: (sessions) => {
        const sortedSessions = [...sessions].sort((a, b) => a.date - b.date);
        let currentStreak = 1;
        
        for (let i = sortedSessions.length - 2; i >= 0; i--) {
          const currentDate = new Date(sortedSessions[i + 1].date);
          const prevDate = new Date(sortedSessions[i].date);
          const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        return { current: Math.min(currentStreak, 7), target: 7 };
      }
    },
    {
      id: 'words_mastered_10',
      name: 'Woordenkenner',
      description: 'Leer 10 woorden (70%+ nauwkeurigheid)',
      icon: '📚',
      unlockedIcon: '🧠',
      condition: (_, questionProgress) => {
        const mastered = Object.values(questionProgress || {}).filter(
          progress => progress.total >= 3 && (progress.correct / progress.total) >= 0.7
        ).length;
        return mastered >= 10;
      },
      progress: (_, questionProgress) => {
        const mastered = Object.values(questionProgress || {}).filter(
          progress => progress.total >= 3 && (progress.correct / progress.total) >= 0.7
        ).length;
        return { current: mastered, target: 10 };
      }
    },
    {
      id: 'words_mastered_50',
      name: 'Woordenmeester',
      description: 'Leer 50 woorden (70%+ nauwkeurigheid)',
      icon: '🎓',
      unlockedIcon: '🌟',
      condition: (_, questionProgress) => {
        const mastered = Object.values(questionProgress || {}).filter(
          progress => progress.total >= 3 && (progress.correct / progress.total) >= 0.7
        ).length;
        return mastered >= 50;
      },
      progress: (_, questionProgress) => {
        const mastered = Object.values(questionProgress || {}).filter(
          progress => progress.total >= 3 && (progress.correct / progress.total) >= 0.7
        ).length;
        return { current: mastered, target: 50 };
      }
    },
    {
      id: 'speed_demon',
      name: 'Snelheidsduivel',
      description: 'Gemiddeld <3 seconden per vraag in een sessie',
      icon: '⚡',
      unlockedIcon: '💨',
      condition: (sessions) => {
        return sessions.some(session => {
          if (session.questionsAnswered === 0) return false;
          const avgTime = session.duration / session.questionsAnswered;
          return avgTime < 3;
        });
      }
    },
    {
      id: 'marathon',
      name: 'Marathon',
      description: 'Voltooi 25 oefensessies',
      icon: '🏃',
      unlockedIcon: '🏁',
      condition: (sessions) => sessions.length >= 25,
      progress: (sessions) => ({
        current: sessions.length,
        target: 25
      })
    }
  ];

  const unlockedAchievements = achievements.filter(achievement => 
    achievement.condition(sessions, questionProgress)
  );

  const lockedAchievements = achievements.filter(achievement => 
    !achievement.condition(sessions, questionProgress)
  );

  const renderProgressBar = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{current}</span>
          <span>{target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Prestaties ({unlockedAchievements.length}/{achievements.length})
      </h3>
      
      {/* Unlocked achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-green-600 mb-3">🏆 Behaald</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unlockedAchievements.map(achievement => (
              <div 
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-3 text-center animate-pulse-slow"
              >
                <div className="text-2xl mb-1">{achievement.unlockedIcon}</div>
                <div className="font-semibold text-sm text-gray-800">{achievement.name}</div>
                <div className="text-xs text-gray-600 mt-1">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Locked achievements with progress */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-600 mb-3">🔒 Te Behalen</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lockedAchievements.map(achievement => {
              const progress = achievement.progress 
                ? achievement.progress(sessions, questionProgress)
                : null;
              
              return (
                <div 
                  key={achievement.id}
                  className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center opacity-75 hover:opacity-90 transition-opacity"
                >
                  <div className="text-2xl mb-1 grayscale">{achievement.icon}</div>
                  <div className="font-semibold text-sm text-gray-700">{achievement.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
                  
                  {showProgress && progress && (
                    renderProgressBar(progress.current, progress.target)
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {unlockedAchievements.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-500">Begin met oefenen om prestaties te behalen!</p>
        </div>
      )}
    </div>
  );
};