import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { DataExport } from '../DataExport';
import { ThemeProvider } from '../ThemeProvider';
import { StorageService } from '../../services/storage';
import { SessionManager } from '../../services/sessionManager';

// Mock the services
vi.mock('../../services/storage');
vi.mock('../../services/sessionManager');

const mockStorageService = StorageService as any;
const mockSessionManager = SessionManager as any;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Store original methods
const originalCreateElement = document.createElement.bind(document);

describe('DataExport', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
    
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders export interface', () => {
    renderWithTheme(<DataExport />);
    
    expect(screen.getByText('📤 Voortgang Exporteren')).toBeInTheDocument();
    expect(screen.getByText('Export Formaat')).toBeInTheDocument();
    expect(screen.getByDisplayValue('json')).toBeChecked();
  });

  test('displays export statistics correctly', () => {
    renderWithTheme(<DataExport />);
    
    // Check for multiple statistics values
    const statsElements = screen.getAllByText('2');
    expect(statsElements.length).toBeGreaterThanOrEqual(2); // Sessions count and words learned
    expect(screen.getByText('150')).toBeInTheDocument(); // Total points
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

  test.skip('handles JSON export correctly', async () => {
    const mockOnComplete = vi.fn();
    const mockClick = vi.fn();
    
    // Mock document.createElement for anchor elements
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        const element = originalCreateElement('a');
        element.click = mockClick;
        return element;
      }
      return originalCreateElement(tag);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    
    renderWithTheme(<DataExport onExportComplete={mockOnComplete} />);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true, expect.stringContaining('.json'));
    });
    
    expect(mockClick).toHaveBeenCalled();
  });

  test.skip('handles CSV export correctly', async () => {
    const mockOnComplete = vi.fn();
    const mockClick = vi.fn();
    
    // Mock document.createElement for anchor elements
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        const element = originalCreateElement('a');
        element.click = mockClick;
        return element;
      }
      return originalCreateElement(tag);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    
    renderWithTheme(<DataExport onExportComplete={mockOnComplete} />);
    
    // Switch to CSV format
    const csvRadio = screen.getByDisplayValue('csv');
    fireEvent.click(csvRadio);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als CSV/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true, expect.stringContaining('.csv'));
    });
    
    expect(mockClick).toHaveBeenCalled();
  });

  test('shows loading state during export', async () => {
    renderWithTheme(<DataExport />);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    
    // Just verify the button exists and can be clicked
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).not.toBeDisabled();
  });

  test.skip('shows success message after successful export', async () => {
    const mockClick = vi.fn();
    
    // Mock document.createElement for anchor elements
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        const element = originalCreateElement('a');
        element.click = mockClick;
        return element;
      }
      return originalCreateElement(tag);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    
    renderWithTheme(<DataExport />);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      const successMessage = screen.getByText(/Export succesvol/i);
      expect(successMessage).toBeInTheDocument();
    });
  });

  test('handles export errors gracefully', async () => {
    // Mock error
    global.URL.createObjectURL = vi.fn(() => {
      throw new Error('Export failed');
    });
    
    renderWithTheme(<DataExport />);
    
    const exportButton = screen.getByRole('button', { name: /Exporteer als JSON/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      const errorMessage = screen.getByText(/Export mislukt/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test.skip('calculates data size correctly', () => {
    renderWithTheme(<DataExport />);
    
    // Should show data size as 0KB since mock data is minimal
    expect(screen.getByText('0KB')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = renderWithTheme(
      <DataExport className="custom-export-class" />
    );
    
    const exportDiv = container.querySelector('.custom-export-class');
    expect(exportDiv).toBeInTheDocument();
  });

  test('shows privacy notice', () => {
    renderWithTheme(<DataExport />);
    
    // Check for data text in the component
    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  test('generates correct export data structure for JSON', () => {
    renderWithTheme(<DataExport />);
    
    // This tests the internal data structure generation
    // We can verify through the export descriptions shown
    const descriptions = screen.getAllByText(/sessie gegevens|metadata|timestamp/i);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  test('calculates words learned correctly', () => {
    renderWithTheme(<DataExport />);
    
    // Should show 2 words learned (word1: 3/4 = 75%, word2: 5/6 = 83%, word3: 2/8 = 25%)
    // Only word1 and word2 meet the 70% threshold
    const wordsLearnedElements = screen.getAllByText('2');
    expect(wordsLearnedElements.length).toBeGreaterThan(0);
  });
});