import { Link } from 'react-router-dom';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { ProgressChart } from './ProgressChart';
import { StatsGrid } from './StatsGrid';
import { AchievementBadges } from './AchievementBadges';
import { CategoryProgress } from './CategoryProgress';

interface ProgressViewProps {
  user: User;
}

function ProgressView({ user }: ProgressViewProps) {
  const sessions = StorageService.getSessions();
  const questionProgress = StorageService.getQuestionProgress();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-french-blue mb-2">Je Voortgang</h1>
              <p className="text-gray-600">
                Bekijk je prestaties en leervoortgang, {user.name}!
              </p>
            </div>
            <Link
              to="/menu"
              className="mt-4 md:mt-0 inline-block bg-french-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Terug naar menu
            </Link>
          </div>
        </div>

        {/* Main content grid */}
        <div className="space-y-6">
          {/* Progress Chart and Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart sessions={sessions} />
            <StatsGrid sessions={sessions} totalQuestionProgress={questionProgress} />
          </div>

          {/* Achievement Badges */}
          <AchievementBadges 
            sessions={sessions} 
            questionProgress={questionProgress}
            showProgress={true}
          />

          {/* Category Progress */}
          <CategoryProgress 
            sessions={sessions} 
            questionProgress={questionProgress}
          />
        </div>

        {/* Empty state for new users */}
        {sessions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Begin je leerreis!
            </h3>
            <p className="text-gray-600 mb-6">
              Start je eerste oefensessie om je voortgang te gaan volgen.
            </p>
            <Link
              to="/session"
              className="inline-block bg-french-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Oefenen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressView;