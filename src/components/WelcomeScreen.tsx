import { useState } from 'react';

interface WelcomeScreenProps {
  onUserCreate: (name: string) => void;
}

function WelcomeScreen({ onUserCreate }: WelcomeScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUserCreate(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-french-blue to-blue-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-french-blue mb-2">RockLingo</h1>
          <p className="text-gray-600 text-lg">Leer Frans op een leuke manier!</p>
          <div className="text-6xl mt-4">🇫🇷</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Wat is je naam?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-french-blue focus:border-transparent transition-all text-lg"
              placeholder="Voer je naam in..."
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-french-blue text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors transform hover:scale-105 duration-200"
          >
            Start je avontuur! 🚀
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Gemaakt voor Nederlandse studenten die Frans willen leren</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;