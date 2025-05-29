import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storage';
import { useTheme } from './ThemeProvider';

interface ImportData {
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

interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: ImportData;
}

interface DataImportProps {
  onImportComplete?: (success: boolean, summary?: ImportSummary) => void;
  className?: string;
}

interface ImportSummary {
  sessionsImported: number;
  progressUpdated: number;
  settingsRestored: boolean;
  userDataRestored: boolean;
}

export const DataImport: React.FC<DataImportProps> = ({ 
  onImportComplete,
  className = '' 
}) => {
  const { theme } = useTheme();
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importPreview, setImportPreview] = useState<ImportData | null>(null);
  const [mergeOptions, setMergeOptions] = useState({
    overwriteUser: false,
    mergeSessions: true,
    overwriteSettings: false,
    mergeProgress: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImportData = (data: any): ImportValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check basic structure
    if (!data.userData) {
      errors.push('Ontbrekende gebruikersdata in export bestand');
    }

    if (!data.exportDate) {
      warnings.push('Geen export datum gevonden');
    }

    if (!data.appVersion) {
      warnings.push('Geen app versie informatie gevonden');
    }

    // Check data types and structure
    if (data.userData) {
      if (!Array.isArray(data.userData.sessions)) {
        errors.push('Sessie data heeft verkeerd formaat');
      }

      if (data.userData.questionProgress && typeof data.userData.questionProgress !== 'object') {
        errors.push('Voortgang data heeft verkeerd formaat');
      }
    }

    // Version compatibility check
    if (data.appVersion && data.appVersion !== '1.0.0') {
      warnings.push(`Export is van een andere app versie (${data.appVersion})`);
    }

    // Data integrity checks
    if (data.userData?.sessions) {
      const sessions = data.userData.sessions;
      if (sessions.length === 0) {
        warnings.push('Geen sessies gevonden in export');
      }

      // Check for required session fields
      const invalidSessions = sessions.filter((session: any) => 
        !session.id || !session.date || session.score === undefined
      );
      
      if (invalidSessions.length > 0) {
        errors.push(`${invalidSessions.length} sessies hebben onvolledige data`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? data as ImportData : undefined
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setValidationResult({
        isValid: false,
        errors: ['Alleen JSON bestanden worden ondersteund'],
        warnings: []
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        const validation = validateImportData(data);
        setValidationResult(validation);
        
        if (validation.isValid && validation.data) {
          setImportPreview(validation.data);
        }
      } catch (error) {
        setValidationResult({
          isValid: false,
          errors: ['Bestand kon niet worden gelezen. Controleer of het een geldig JSON bestand is.'],
          warnings: []
        });
      }
    };

    reader.readAsText(file);
  };

  const performImport = async (): Promise<ImportSummary> => {
    if (!importPreview) throw new Error('Geen import data beschikbaar');

    const summary: ImportSummary = {
      sessionsImported: 0,
      progressUpdated: 0,
      settingsRestored: false,
      userDataRestored: false
    };

    // Import user data
    if (importPreview.userData.user && (mergeOptions.overwriteUser || !StorageService.getUser())) {
      StorageService.setUser(importPreview.userData.user);
      summary.userDataRestored = true;
    }

    // Import sessions
    if (importPreview.userData.sessions && mergeOptions.mergeSessions) {
      const existingSessions = StorageService.getSessions();
      const existingIds = new Set(existingSessions.map(s => s.id));
      
      const newSessions = importPreview.userData.sessions.filter(session => 
        !existingIds.has(session.id)
      );
      
      for (const session of newSessions) {
        StorageService.addSession(session);
        summary.sessionsImported++;
      }
    }

    // Import settings
    if (importPreview.userData.settings && (mergeOptions.overwriteSettings || !StorageService.getSettings())) {
      StorageService.setSettings(importPreview.userData.settings);
      summary.settingsRestored = true;
    }

    // Import question progress
    if (importPreview.userData.questionProgress && mergeOptions.mergeProgress) {
      const existingProgress = StorageService.getQuestionProgress();
      const mergedProgress = { ...existingProgress };
      
      Object.entries(importPreview.userData.questionProgress).forEach(([key, value]: [string, any]) => {
        if (!mergedProgress[key] || (value.total > (mergedProgress[key]?.total || 0))) {
          mergedProgress[key] = value;
          summary.progressUpdated++;
        }
      });
      
      StorageService.setQuestionProgress(mergedProgress);
    }

    return summary;
  };

  const handleImport = async () => {
    if (!validationResult?.isValid || !importPreview) return;

    setIsImporting(true);
    setImportStatus('idle');

    try {
      const summary = await performImport();
      setImportStatus('success');
      onImportComplete?.(true, summary);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      onImportComplete?.(false);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setValidationResult(null);
    setImportPreview(null);
    setImportStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          📥 Voortgang Importeren
        </h3>
        {validationResult && (
          <button
            onClick={resetImport}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Nieuwe import
          </button>
        )}
      </div>

      {/* File Upload */}
      {!validationResult && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecteer export bestand
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
            />
            <label 
              htmlFor="import-file" 
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg font-medium text-gray-700 mb-1">
                Klik om bestand te selecteren
              </div>
              <div className="text-sm text-gray-500">
                Alleen JSON bestanden (van RockLingo export)
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="mb-6">
          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">❌ Fouten gevonden:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Waarschuwingen:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success validation */}
          {validationResult.isValid && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">✅</div>
                <div className="text-sm text-green-800">
                  Import bestand is geldig en klaar voor import
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Preview */}
      {importPreview && validationResult?.isValid && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Import overzicht:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {importPreview.userData.sessions?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Sessies</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {importPreview.statistics?.totalPoints || 0}
              </div>
              <div className="text-xs text-gray-600">Punten</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {importPreview.statistics?.wordsLearned || 0}
              </div>
              <div className="text-xs text-gray-600">Woorden</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {importPreview.exportDate ? new Date(importPreview.exportDate).toLocaleDateString('nl-NL') : 'Onbekend'}
              </div>
              <div className="text-xs text-gray-600">Export datum</div>
            </div>
          </div>

          {/* Import Options */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-3">Import opties:</h5>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={mergeOptions.overwriteUser}
                  onChange={(e) => setMergeOptions(prev => ({ ...prev, overwriteUser: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Gebruikersprofiel overschrijven</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={mergeOptions.mergeSessions}
                  onChange={(e) => setMergeOptions(prev => ({ ...prev, mergeSessions: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Sessies samenvoegen (duplicaten worden overgeslagen)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={mergeOptions.overwriteSettings}
                  onChange={(e) => setMergeOptions(prev => ({ ...prev, overwriteSettings: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Instellingen overschrijven</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={mergeOptions.mergeProgress}
                  onChange={(e) => setMergeOptions(prev => ({ ...prev, mergeProgress: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Woordvoortgang samenvoegen</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Import Button */}
      {validationResult?.isValid && (
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${isImporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
          >
            {isImporting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importeren...
              </div>
            ) : (
              'Data Importeren'
            )}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {importStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-600 mr-2">✅</div>
            <div className="text-sm text-green-800">
              Import succesvol voltooid! Je data is hersteld.
            </div>
          </div>
        </div>
      )}

      {importStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">❌</div>
            <div className="text-sm text-red-800">
              Import mislukt. Controleer het bestand en probeer opnieuw.
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📋 Instructies:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Gebruik alleen export bestanden van RockLingo</p>
          <p>• Bestaande data wordt samengevoegd, niet vervangen (tenzij aangegeven)</p>
          <p>• Maak een backup van je huidige voortgang voor de import</p>
          <p>• De app wordt automatisch ververst na succesvolle import</p>
        </div>
      </div>
    </div>
  );
};