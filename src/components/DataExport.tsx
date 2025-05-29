import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { SessionManager } from '../services/sessionManager';
import { useTheme } from './ThemeProvider';

interface ExportData {
  exportDate: string;
  appVersion: string;
  userData: {
    user: any;
    sessions: any[];
    settings: any;
    questionProgress: any;
    achievements: any[];
  };
  statistics: {
    totalSessions: number;
    totalPoints: number;
    totalTimeSpent: number;
    wordsLearned: number;
    averageScore: number;
    bestScore: number;
  };
}

interface DataExportProps {
  onExportComplete?: (success: boolean, filename?: string) => void;
  className?: string;
}

export const DataExport: React.FC<DataExportProps> = ({ 
  onExportComplete,
  className = '' 
}) => {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const generateExportData = (): ExportData => {
    const user = StorageService.getUser();
    const sessions = StorageService.getSessions();
    const settings = StorageService.getSettings();
    const questionProgress = StorageService.getQuestionProgress();
    const stats = SessionManager.getSessionStats();

    return {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      userData: {
        user: user || null,
        sessions,
        settings,
        questionProgress,
        achievements: [] // Will be implemented when achievement storage is added
      },
      statistics: {
        totalSessions: stats.totalSessions,
        totalPoints: user?.totalPoints || 0,
        totalTimeSpent: stats.totalTimeSpent,
        wordsLearned: Object.values(questionProgress).filter(
          (progress: any) => progress.total >= 3 && (progress.correct / progress.total) >= 0.7
        ).length,
        averageScore: stats.averageScore,
        bestScore: stats.bestScore
      }
    };
  };

  const generateCSVData = (data: ExportData): string => {
    const sessions = data.userData.sessions;
    const csv = [
      // Header
      'Sessie ID,Datum,Duur (sec),Score,Vragen Beantwoord,Juiste Antwoorden,Nauwkeurigheid (%)',
      // Data rows
      ...sessions.map(session => [
        session.id,
        new Date(session.date).toLocaleDateString('nl-NL'),
        session.duration,
        session.score,
        session.questionsAnswered,
        session.correctAnswers,
        session.questionsAnswered > 0 
          ? Math.round((session.correctAnswers / session.questionsAnswered) * 100)
          : 0
      ].join(','))
    ].join('\n');

    return csv;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const exportData = generateExportData();
      const timestamp = new Date().toISOString().slice(0, 10);
      
      if (exportFormat === 'json') {
        const content = JSON.stringify(exportData, null, 2);
        const filename = `rocklingo-export-${timestamp}.json`;
        downloadFile(content, filename, 'application/json');
        onExportComplete?.(true, filename);
      } else {
        const content = generateCSVData(exportData);
        const filename = `rocklingo-sessions-${timestamp}.csv`;
        downloadFile(content, filename, 'text/csv');
        onExportComplete?.(true, filename);
      }

      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStats = () => {
    const user = StorageService.getUser();
    const sessions = StorageService.getSessions();
    const questionProgress = StorageService.getQuestionProgress();

    return {
      sessionsCount: sessions.length,
      totalPoints: user?.totalPoints || 0,
      wordsLearned: Object.values(questionProgress).filter(
        (progress: any) => progress.total >= 3 && (progress.correct / progress.total) >= 0.7
      ).length,
      dataSize: JSON.stringify({
        user,
        sessions,
        settings: StorageService.getSettings(),
        questionProgress
      }).length
    };
  };

  const stats = getExportStats();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          📤 Voortgang Exporteren
        </h3>
        <div className="text-sm text-gray-500">
          Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
        </div>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.sessionsCount}</div>
          <div className="text-xs text-gray-600">Sessies</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
          <div className="text-xs text-gray-600">Punten</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.wordsLearned}</div>
          <div className="text-xs text-gray-600">Woorden</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(stats.dataSize / 1024)}KB
          </div>
          <div className="text-xs text-gray-600">Data</div>
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Export Formaat
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="exportFormat"
              value="json"
              checked={exportFormat === 'json'}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="mr-3"
            />
            <div>
              <div className="font-medium">JSON</div>
              <div className="text-xs text-gray-500">Volledige data export</div>
            </div>
          </label>
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="exportFormat"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="mr-3"
            />
            <div>
              <div className="font-medium">CSV</div>
              <div className="text-xs text-gray-500">Alleen sessie data</div>
            </div>
          </label>
        </div>
      </div>

      {/* Export Description */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Wat wordt geëxporteerd?</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {exportFormat === 'json' ? (
            <>
              <p>✅ Alle sessie gegevens en scores</p>
              <p>✅ Leervoortgang per woord</p>
              <p>✅ Persoonlijke instellingen</p>
              <p>✅ Gebruikersprofiel en statistieken</p>
              <p>✅ Export metadata en timestamp</p>
            </>
          ) : (
            <>
              <p>✅ Sessie overzicht (datum, score, nauwkeurigheid)</p>
              <p>✅ Geschikt voor Excel/Google Sheets</p>
              <p>❌ Geen gedetailleerde woordvoortgang</p>
              <p>❌ Geen instellingen of profiel data</p>
            </>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={handleExport}
          disabled={isExporting || stats.sessionsCount === 0}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            ${isExporting || stats.sessionsCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }
          `}
        >
          {isExporting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporteren...
            </div>
          ) : (
            `Exporteer als ${exportFormat.toUpperCase()}`
          )}
        </button>

        {stats.sessionsCount === 0 && (
          <p className="text-sm text-gray-500 text-center">
            Geen data om te exporteren. Start eerst een oefensessie!
          </p>
        )}
      </div>

      {/* Status Messages */}
      {exportStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-600 mr-2">✅</div>
            <div className="text-sm text-green-800">
              Export succesvol! Het bestand is gedownload.
            </div>
          </div>
        </div>
      )}

      {exportStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">❌</div>
            <div className="text-sm text-red-800">
              Export mislukt. Probeer het opnieuw.
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-600 mr-2 mt-0.5">🔒</div>
          <div className="text-xs text-blue-800">
            <strong>Privacy:</strong> Je data wordt alleen lokaal opgeslagen en geëxporteerd. 
            Niets wordt naar externe servers gestuurd.
          </div>
        </div>
      </div>
    </div>
  );
};