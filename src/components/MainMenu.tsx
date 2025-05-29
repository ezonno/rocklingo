import { Link } from 'react-router-dom';
import { User } from '../types';

interface MainMenuProps {
  user: User;
}

function MainMenu({ user }: MainMenuProps) {
  const menuItems = [
    {
      title: 'Start Sessie',
      description: 'Begin een nieuwe oefensessie',
      icon: '📚',
      link: '/session',
      color: 'bg-blue-400 hover:bg-blue-600',
    },
    {
      title: 'Voortgang',
      description: 'Bekijk je statistieken',
      icon: '📊',
      link: '/progress',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Instellingen',
      description: 'Pas je voorkeuren aan',
      icon: '⚙️',
      link: '/settings',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-french-blue mb-2">
            Bonjour, {user.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Wat wil je vandaag doen?</p>
          
          <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>{user.totalPoints} punten</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span>{user.totalSessions} sessies</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className={`${item.color} text-white rounded-2xl p-8 text-center transform transition-all duration-200 hover:scale-105 hover:shadow-xl block`}
            >
              <div className="text-6xl mb-4">{item.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              <p className="text-white/80">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
            <span className="text-3xl">🔥</span>
            <div className="text-left">
              <p className="text-sm text-gray-500">Huidige streak</p>
              <p className="text-xl font-bold text-dutch-orange">0 dagen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;