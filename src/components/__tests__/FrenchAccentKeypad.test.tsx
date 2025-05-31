import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FrenchAccentKeypad } from '../FrenchAccentKeypad';
import { ThemeProvider } from '../ThemeProvider';

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('FrenchAccentKeypad', () => {
  const mockOnCharacterInsert = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when visible', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('toolbar', { name: 'French accent keypad' })).toBeInTheDocument();
    expect(screen.getByText('Accents français')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={false}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('displays lowercase characters by default', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    // Check for some lowercase characters
    expect(screen.getByLabelText('Insert à')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert é')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert ç')).toBeInTheDocument();
  });

  it('toggles to uppercase characters when shift is pressed', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    const shiftButton = screen.getByLabelText('Toggle uppercase');
    fireEvent.click(shiftButton);

    // Check for uppercase characters
    expect(screen.getByLabelText('Insert À')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert É')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert Ç')).toBeInTheDocument();
  });

  it('calls onCharacterInsert when a character is clicked', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    const accentButton = screen.getByLabelText('Insert à');
    fireEvent.click(accentButton);

    expect(mockOnCharacterInsert).toHaveBeenCalledWith('à');
  });

  it('calls onClose when close button is clicked', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close keypad');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders all expected French characters', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    const expectedCharacters = ['à', 'è', 'é', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'ç', 'œ', 'æ'];
    
    expectedCharacters.forEach(char => {
      expect(screen.getByLabelText(`Insert ${char}`)).toBeInTheDocument();
    });
  });

  it('maintains proper toggle state for uppercase/lowercase', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    const shiftButton = screen.getByLabelText('Toggle uppercase');
    
    // Initially should be lowercase
    expect(shiftButton).toHaveAttribute('aria-pressed', 'false');
    
    // Click to toggle to uppercase
    fireEvent.click(shiftButton);
    expect(shiftButton).toHaveAttribute('aria-pressed', 'true');
    
    // Click again to toggle back to lowercase
    fireEvent.click(shiftButton);
    expect(shiftButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('closes when clicking outside the keypad', () => {
    renderWithTheme(
      <>
        <div data-testid="outside-element">Outside</div>
        <FrenchAccentKeypad
          isVisible={true}
          onCharacterInsert={mockOnCharacterInsert}
          onClose={mockOnClose}
        />
      </>
    );

    // Click outside the keypad
    fireEvent.mouseDown(screen.getByTestId('outside-element'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close when clicking inside the keypad', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    const keypad = screen.getByRole('toolbar');
    fireEvent.mouseDown(keypad);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('responds to theme changes', () => {
    renderWithTheme(
      <FrenchAccentKeypad
        isVisible={true}
        onCharacterInsert={mockOnCharacterInsert}
        onClose={mockOnClose}
      />
    );

    // Initially renders with light theme
    const keypad = screen.getByRole('toolbar');
    expect(keypad).toHaveClass('bg-white');

    // Check that the component receives theme context
    const heading = screen.getByText('Accents français');
    expect(heading).toHaveClass('text-gray-700');
  });
});