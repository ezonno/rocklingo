import { Link } from 'react-router-dom';
import { User } from '../types';

interface SessionViewProps {
  user: User;
}

function SessionView({ user }: SessionViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-french-blue mb-4">Oefensessie</h1>
          <p className="text-gray-600 mb-4">
            Welkom {user.name}! Sessie functionaliteit komt binnenkort...
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

export default SessionView;