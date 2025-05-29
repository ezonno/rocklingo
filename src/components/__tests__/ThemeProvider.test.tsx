import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { ThemeProvider, useTheme, colors, getFrenchIcon, getColorFromTheme } from '../ThemeProvider';

// Test component that uses the theme
const TestComponent = () => {
  const { theme, frenchElements, isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div>
      <div data-testid="primary-color">{theme.colors.primary}</div>
      <div data-testid="dark-mode">{isDarkMode ? 'dark' : 'light'}</div>
      <div data-testid="french-flag">{frenchElements.icons.flag}</div>
      <button onClick={toggleDarkMode} data-testid="toggle-dark-mode">
        Toggle Dark Mode
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  test('provides theme context to children', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('primary-color')).toHaveTextContent('#0055A4');
    expect(screen.getByTestId('dark-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('french-flag')).toHaveTextContent('🇫🇷');
  });

  test('toggles dark mode correctly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-dark-mode');
    const darkModeIndicator = screen.getByTestId('dark-mode');

    expect(darkModeIndicator).toHaveTextContent('light');

    fireEvent.click(toggleButton);
    expect(darkModeIndicator).toHaveTextContent('dark');

    fireEvent.click(toggleButton);
    expect(darkModeIndicator).toHaveTextContent('light');
  });

  test('throws error when useTheme is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});

describe('Color utilities', () => {
  test('colors object contains expected French-themed colors', () => {
    expect(colors.primary).toBe('#0055A4'); // French Blue
    expect(colors.secondary).toBe('#FF6B35'); // Dutch Orange
    expect(colors.success).toBe('#10B981');
    expect(colors.error).toBe('#EF4444');
    expect(colors.background).toBe('#F9FAFB');
  });

  test('getColorFromTheme returns correct colors', () => {
    expect(getColorFromTheme('primary')).toBe('#0055A4');
    expect(getColorFromTheme('gray.500')).toBe('#6B7280');
    expect(getColorFromTheme('nonexistent')).toBe('#0055A4'); // fallback to primary
  });

  test('getFrenchIcon returns correct icons', () => {
    expect(getFrenchIcon('flag')).toBe('🇫🇷');
    expect(getFrenchIcon('eiffelTower')).toBe('🗼');
    expect(getFrenchIcon('croissant')).toBe('🥐');
    expect(getFrenchIcon('nonexistent' as any)).toBe('⭐'); // fallback to star
  });
});

describe('Theme structure', () => {
  test('theme object has required properties', () => {
    const { theme } = require('../ThemeProvider');
    
    expect(theme).toHaveProperty('colors');
    expect(theme).toHaveProperty('animations');
    expect(theme).toHaveProperty('fonts');
    expect(theme).toHaveProperty('spacing');
    expect(theme).toHaveProperty('borderRadius');
    expect(theme).toHaveProperty('shadows');
  });

  test('animations have correct durations', () => {
    const { animations } = require('../ThemeProvider');
    
    expect(animations.durations.fast).toBe(150);
    expect(animations.durations.normal).toBe(300);
    expect(animations.durations.slow).toBe(500);
    expect(animations.durations.confetti).toBe(3000);
  });

  test('french elements contain expected icons', () => {
    const { frenchElements } = require('../ThemeProvider');
    
    expect(frenchElements.icons).toHaveProperty('eiffelTower', '🗼');
    expect(frenchElements.icons).toHaveProperty('croissant', '🥐');
    expect(frenchElements.icons).toHaveProperty('baguette', '🥖');
    expect(frenchElements.icons).toHaveProperty('cheese', '🧀');
    expect(frenchElements.icons).toHaveProperty('wine', '🍷');
    expect(frenchElements.icons).toHaveProperty('flag', '🇫🇷');
  });
});