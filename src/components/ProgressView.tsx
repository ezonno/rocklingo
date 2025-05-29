import { Link } from 'react-router-dom';
import { User } from '../types';

interface ProgressViewProps {
  user: User;
}

function ProgressView({ user }: ProgressViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-french-blue mb-4">Je Voortgang</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-french-blue">{user.totalPoints}</p>
              <p className="text-sm text-gray-600">Totale Punten</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{user.totalSessions}</p>
              <p className="text-sm text-gray-600">Sessies</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-dutch-orange">0</p>
              <p className="text-sm text-gray-600">Streak</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600">Woorden Geleerd</p>
            </div>
          </div>
          <p className="text-gray-600 mb-8">
            Gedetailleerde statistieken komen binnenkort...
          </p>
          <Link
            to="/menu"
            className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Terug naar menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProgressView;