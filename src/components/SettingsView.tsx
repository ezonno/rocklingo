import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Settings } from '../types';

function SettingsView() {
  const [settings, setSettings] = useState<Settings>({
    sessionDuration: 15,
    questionTypes: {
      multipleChoice: true,
      translation: true,
      spelling: true,
      matching: true,
    },
    difficulty: 'medium',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Instellingen opgeslagen!');
  };

  const handleReset = () => {
    if (confirm('Weet je zeker dat je al je voortgang wilt resetten?')) {
      localStorage.clear();
      window.location.href = '/rocklingo/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-french-blue mb-8">Instellingen</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessie Duur (minuten)
              </label>
              <select
                value={settings.sessionDuration}
                onChange={(e) => setSettings({ ...settings, sessionDuration: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-french-blue focus:border-transparent"
              >
                <option value={5}>5 minuten</option>
                <option value={10}>10 minuten</option>
                <option value={15}>15 minuten</option>
                <option value={20}>20 minuten</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeilijkheidsgraad
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings({ ...settings, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-french-blue focus:border-transparent"
              >
                <option value="easy">Makkelijk</option>
                <option value="medium">Gemiddeld</option>
                <option value="hard">Moeilijk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vraag Types
              </label>
              <div className="space-y-2">
                {Object.entries(settings.questionTypes).map(([type, enabled]) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        questionTypes: {
                          ...settings.questionTypes,
                          [type]: e.target.checked,
                        },
                      })}
                      className="mr-2 h-4 w-4 text-french-blue focus:ring-french-blue border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      {type === 'multipleChoice' && 'Meerkeuze'}
                      {type === 'translation' && 'Vertaling'}
                      {type === 'spelling' && 'Spelling'}
                      {type === 'matching' && 'Matching'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              className="bg-french-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Opslaan
            </button>
            <Link
              to="/menu"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Terug
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Alle Voortgang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;