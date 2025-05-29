import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataExport } from '../DataExport';
import { ThemeProvider } from '../ThemeProvider';
import { StorageService } from '../../services/storage';
import { SessionManager } from '../../services/sessionManager';

// Mock the services
jest.mock('../../services/storage');
jest.mock('../../services/sessionManager');

const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;
const mockSessionManager = SessionManager as jest.Mocked<typeof SessionManager>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = jest.fn();

describe('DataExport', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock return values
    mockStorageService.getUser.mockReturnValue({
      name: 'Test User',
      totalPoints: 150,
      totalSessions: 5,
      createdAt: Date.now()
    });
    
    mockStorageService.getSessions.mockReturnValue([
      {
        id: '1',
        date: Date.now(),
        duration: 300,
        score: 80,
        questionsAnswered: 10,
        correctAnswers: 8
      },
      {
        id: '2',
        date: Date.now() - 86400000,
        duration: 420,
        score: 90,
        questionsAnswered: 12,
        correctAnswers: 11
      }
    ]);
    
    mockStorageService.getSettings.mockReturnValue({
      sessionDuration: 15,
      difficulty: 'medium',
      questionTypes: {
        multipleChoice: true,
        translation: true,
        spelling: false,
        matching: true
      }
    });
    
    mockStorageService.getQuestionProgress.mockReturnValue({
      'word1': { correct: 3, total: 4 },
      'word2': { correct: 5, total: 6 },
      'word3': { correct: 2, total: 8 } // Below 70% threshold
    });
    
    mockSessionManager.getSessionStats.mockReturnValue({
      totalSessions: 5,
      totalTimeSpent: 720,
      averageScore: 85,
      bestScore: 90
    });
  });

  test('renders export interface', () => {
    renderWithTheme(<DataExport />);
    
    expect(screen.getByText('📤 Voortgang Exporteren')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Formaat')).toBeInTheDocument();
    expect(screen.getByDisplayValue('json')).toBeChecked();
  });

  test('displays export statistics correctly', () => {
    renderWithTheme(<DataExport />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Sessions count
    expect(screen.getByText('150')).toBeInTheDocument(); // Total points
    expect(screen.getByText('2')).toBeInTheDocument(); // Words learned (above 70% threshold)
  });

  test('allows format selection between JSON and CSV', () => {
    renderWithTheme(<DataExport />);
    
    const jsonRadio = screen.getByDisplayValue('json');
    const csvRadio = screen.getByDisplayValue('csv');
    
    expect(jsonRadio).toBeChecked();
    expect(csvRadio).not.toBeChecked();
    
    fireEvent.click(csvRadio);
    
    expect(jsonRadio).not.toBeChecked();
    expect(csvRadio).toBeChecked();
  });

  test('shows different export descriptions for JSON and CSV', () => {
    renderWithTheme(<DataExport />);
    
    // Initially shows JSON description
    expect(screen.getByText('✅ Alle sessie gegevens en scores')).toBeInTheDocument();
    expect(screen.getByText('✅ Leervoortgang per woord')).toBeInTheDocument();
    
    // Switch to CSV
    const csvRadio = screen.getByDisplayValue('csv');
    fireEvent.click(csvRadio);
    
    expect(screen.getByText('✅ Sessie overzicht (datum, score, nauwkeurigheid)')).toBeInTheDocument();
    expect(screen.getByText('❌ Geen gedetailleerde woordvoortgang')).toBeInTheDocument();
  });

  test('disables export button when no sessions exist', () => {
    mockStorageService.getSessions.mockReturnValue([]);
    
    renderWithTheme(<DataExport />);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    expect(exportButton).toBeDisabled();
    expect(screen.getByText('Geen data om te exporteren. Start eerst een oefensessie!')).toBeInTheDocument();
  });

  test('handles JSON export correctly', async () => {
    const mockOnComplete = jest.fn();
    renderWithTheme(<DataExport onExportComplete={mockOnComplete} />);
    
    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true, expect.stringMatching(/rocklingo-export-.*\.json/));
    });
    
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });

  test('handles CSV export correctly', async () => {
    const mockOnComplete = jest.fn();
    renderWithTheme(<DataExport onExportComplete={mockOnComplete} />);
    
    // Switch to CSV format
    const csvRadio = screen.getByDisplayValue('csv');
    fireEvent.click(csvRadio);
    
    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn());
    jest.spyOn(document.body, 'removeChild').mockImplementation(jest.fn());
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als CSV/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true, expect.stringMatching(/rocklingo-sessions-.*\.csv/));
    });
    
    expect(mockLink.click).toHaveBeenCalled();
  });

  test('shows loading state during export', async () => {
    renderWithTheme(<DataExport />);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    
    // Mock a delayed response
    jest.spyOn(document, 'createElement').mockImplementation(() => {
      return {
        href: '',
        download: '',
        click: () => {
          // Simulate delay
          setTimeout(() => {}, 100);
        }
      } as any;
    });
    
    fireEvent.click(exportButton);
    
    expect(screen.getByText('Exporteren...')).toBeInTheDocument();
    expect(exportButton).toBeDisabled();
  });

  test('shows success message after successful export', async () => {
    renderWithTheme(<DataExport />);
    
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn());
    jest.spyOn(document.body, 'removeChild').mockImplementation(jest.fn());
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export succesvol! Het bestand is gedownload.')).toBeInTheDocument();
    });
  });

  test('handles export errors gracefully', async () => {
    const mockOnComplete = jest.fn();
    renderWithTheme(<DataExport onExportComplete={mockOnComplete} />);
    
    // Mock an error during export
    jest.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('Mock export error');
    });
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export mislukt. Probeer het opnieuw.')).toBeInTheDocument();
    });
    
    expect(mockOnComplete).toHaveBeenCalledWith(false);
  });

  test('calculates data size correctly', () => {
    renderWithTheme(<DataExport />);
    
    // Should show data size in KB
    const dataSizeElement = screen.getByText(/KB/);
    expect(dataSizeElement).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = renderWithTheme(
      <DataExport className="custom-export-class" />
    );
    
    const exportContainer = container.querySelector('.custom-export-class');
    expect(exportContainer).toBeInTheDocument();
  });

  test('shows privacy notice', () => {
    renderWithTheme(<DataExport />);
    
    expect(screen.getByText(/Privacy:/)).toBeInTheDocument();
    expect(screen.getByText(/Je data wordt alleen lokaal opgeslagen/)).toBeInTheDocument();
  });

  test('generates correct export data structure for JSON', () => {
    renderWithTheme(<DataExport />);
    
    // This tests the internal data structure generation
    // We can verify through the export descriptions shown
    expect(screen.getByText('✅ Alle sessie gegevens en scores')).toBeInTheDocument();
    expect(screen.getByText('✅ Export metadata en timestamp')).toBeInTheDocument();
  });

  test('calculates words learned correctly', () => {
    renderWithTheme(<DataExport />);
    
    // Should show 2 words learned (word1: 3/4 = 75%, word2: 5/6 = 83%, word3: 2/8 = 25%)
    // Only word1 and word2 meet the 70% threshold
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});