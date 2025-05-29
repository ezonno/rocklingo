import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { StorageService } from '../services/storage';
import { useTheme } from './ThemeProvider';
import { DataExport } from './DataExport';
import { DataImport } from './DataImport';
import { FrenchMascot } from './FrenchMascot';
import { AnimatedIcon } from './AnimatedIcon';
import { ConfettiCelebration } from './ConfettiCelebration';

function SettingsView() {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
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
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'appearance'>('general');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDataSection, setShowDataSection] = useState(false);

  useEffect(() => {
    const savedSettings = StorageService.getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleSave = () => {
    StorageService.setSettings(settings);
    setShowConfetti(true);
    // Auto-hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Weet je zeker dat je al je voortgang wilt resetten? Deze actie kan niet ongedaan worden gemaakt.')) {
      StorageService.clearAllData();
      window.location.href = '/rocklingo/';
    }
  };

  const handleExportComplete = (success: boolean, filename?: string) => {
    if (success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleImportComplete = (success: boolean) => {
    if (success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      // Refresh settings from storage
      const updatedSettings = StorageService.getSettings();
      if (updatedSettings) {
        setSettings(updatedSettings);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header with Mascot */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FrenchMascot size="md" mood="happy" showMessage={false} className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                  <AnimatedIcon icon="star" trigger="auto" size="lg" className="mr-2" />
                  Instellingen
                </h1>
                <p className="text-gray-600 mt-1">Personaliseer je leerervaring</p>
              </div>
            </div>
            <Link
              to="/menu"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              ← Terug
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-2xl shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', label: 'Algemeen', icon: '⚙️' },
                { id: 'appearance', label: 'Uiterlijk', icon: '🎨' },
                { id: 'data', label: 'Data Beheer', icon: '💾' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AnimatedIcon icon="book" size="sm" className="mr-1" />
                    Sessie Duur (minuten)
                  </label>
                  <select
                    value={settings.sessionDuration}
                    onChange={(e) => setSettings({ ...settings, sessionDuration: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ focusRingColor: theme.colors.primary }}
                  >
                    <option value={5}>5 minuten</option>
                    <option value={10}>10 minuten</option>
                    <option value={15}>15 minuten</option>
                    <option value={20}>20 minuten</option>
                    <option value={30}>30 minuten</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AnimatedIcon icon="flag" size="sm" className="mr-1" />
                    Moeilijkheidsgraad
                  </label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => setSettings({ ...settings, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ focusRingColor: theme.colors.primary }}
                  >
                    <option value="easy">🟢 Makkelijk (Débutant)</option>
                    <option value="medium">🟡 Gemiddeld (Intermédiaire)</option>
                    <option value="hard">🔴 Moeilijk (Avancé)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <AnimatedIcon icon="art" size="sm" className="mr-1" />
                  Vraag Types
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(settings.questionTypes).map(([type, enabled]) => (
                    <label key={type} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
                        className="mr-3 h-4 w-4 rounded focus:ring-2"
                        style={{ accentColor: theme.colors.primary }}
                      />
                      <div>
                        <div className="font-medium text-gray-700">
                          {type === 'multipleChoice' && '📝 Meerkeuze'}
                          {type === 'translation' && '🔄 Vertaling'}
                          {type === 'spelling' && '✏️ Spelling'}
                          {type === 'matching' && '🎯 Matching'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {type === 'multipleChoice' && 'Kies het juiste antwoord'}
                          {type === 'translation' && 'Vertaal woorden en zinnen'}
                          {type === 'spelling' && 'Typ de juiste spelling'}
                          {type === 'matching' && 'Koppel woorden aan betekenissen'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  style={{ backgroundColor: theme.colors.primary, color: theme.colors.white }}
                >
                  <AnimatedIcon icon="star" trigger="hover" size="sm" className="mr-2" />
                  Instellingen Opslaan
                </button>
              </div>
            </div>
          )}

          {/* Appearance Settings Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="text-center">
                <AnimatedIcon icon="art" animation="float" size="xl" className="mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Uiterlijk Instellingen</h2>
                <p className="text-gray-600">Personaliseer het uiterlijk van RockLingo</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">
                    <AnimatedIcon icon="eiffelTower" size="sm" className="mr-2" />
                    Thema
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        checked={!isDarkMode}
                        onChange={() => !isDarkMode || toggleDarkMode()}
                        className="mr-3"
                        style={{ accentColor: theme.colors.primary }}
                      />
                      <div>
                        <div className="font-medium">☀️ Licht Thema</div>
                        <div className="text-xs text-gray-500">Klassiek licht uiterlijk</div>
                      </div>
                    </label>
                    <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        checked={isDarkMode}
                        onChange={() => isDarkMode || toggleDarkMode()}
                        className="mr-3"
                        style={{ accentColor: theme.colors.primary }}
                      />
                      <div>
                        <div className="font-medium">🌙 Donker Thema</div>
                        <div className="text-xs text-gray-500">Donker uiterlijk voor de avond</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">
                    <AnimatedIcon icon="flag" size="sm" className="mr-2" />
                    Franse Elementen
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✨ Franse kleurenpalet</p>
                    <p>🗼 Geanimeerde Franse iconen</p>
                    <p>🐱 Interactieve Franse mascotte</p>
                    <p>🎊 Franse confetti effecten</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  🎨 Kleurenpalet Preview
                </h3>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.primary }} title="French Blue"></div>
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.secondary }} title="Dutch Orange"></div>
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.success }} title="Success Green"></div>
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.error }} title="Error Red"></div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="text-center">
                <AnimatedIcon icon="book" animation="pulse" size="xl" className="mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Beheer</h2>
                <p className="text-gray-600">Beheer je leervoortgang en instellingen</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <DataExport onExportComplete={handleExportComplete} />
                <DataImport onImportComplete={handleImportComplete} />
              </div>

              {/* Danger Zone */}
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-3">
                  ⚠️ Danger Zone
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Deze actie wist alle opgeslagen data, inclusief voortgang, sessies, en instellingen.
                  Dit kan niet ongedaan worden gemaakt!
                </p>
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  🗑️ Reset Alle Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confetti Celebration */}
        <ConfettiCelebration
          isActive={showConfetti}
          trigger="achievement"
          customMessage="🎉 Instellingen opgeslagen!"
          onComplete={() => setShowConfetti(false)}
        />
      </div>
    </div>
  );
}

export default SettingsView;