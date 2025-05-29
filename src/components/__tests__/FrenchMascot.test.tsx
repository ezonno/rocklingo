import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  FrenchMascot, 
  WelcomeMascot, 
  SuccessMascot, 
  ThinkingMascot,
  EncouragingMascot,
  SleepingMascot,
  InteractiveMascot
} from '../FrenchMascot';
import { ThemeProvider } from '../ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('FrenchMascot', () => {
  test('renders with default props', () => {
    renderWithTheme(<FrenchMascot />);
    
    const mascot = screen.getByRole('img');
    expect(mascot).toBeInTheDocument();
    expect(mascot).toHaveAttribute('aria-label', 'French learning mascot cat');
  });

  test('displays correct mood expressions', () => {
    const moods = {
      happy: '😸',
      excited: '😻',
      thinking: '🤔',
      sleeping: '😴',
      surprised: '😺',
      encouraging: '😽'
    };

    Object.entries(moods).forEach(([mood, expression]) => {
      const { unmount } = renderWithTheme(
        <FrenchMascot mood={mood as any} showMessage={false} />
      );
      
      expect(screen.getByText(expression)).toBeInTheDocument();
      unmount();
    });
  });

  test('applies correct size classes', () => {
    const sizes = {
      sm: 'w-16 h-16 text-4xl',
      md: 'w-24 h-24 text-6xl',
      lg: 'w-32 h-32 text-8xl',
      xl: 'w-40 h-40 text-9xl'
    };

    Object.entries(sizes).forEach(([size, expectedClass]) => {
      const { unmount } = renderWithTheme(
        <FrenchMascot size={size as any} showMessage={false} />
      );
      
      const mascot = screen.getByRole('img');
      expect(mascot).toHaveClass(...expectedClass.split(' '));
      unmount();
    });
  });

  test('shows custom message when provided', () => {
    const customMessage = "Custom test message";
    renderWithTheme(
      <FrenchMascot message={customMessage} showMessage={true} />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('auto-generates appropriate messages for mood', () => {
    renderWithTheme(
      <FrenchMascot mood="excited" showMessage={true} autoMessage={true} />
    );
    
    // Should display one of the excited mood messages
    const messageText = screen.getByText(/Fantastisch!|Magnifique!|Wauw!|Tres bien!/);
    expect(messageText).toBeInTheDocument();
  });

  test('handles click events', () => {
    const onClickMock = jest.fn();
    renderWithTheme(
      <FrenchMascot onClick={onClickMock} showMessage={false} />
    );
    
    const mascot = screen.getByRole('button');
    fireEvent.click(mascot);
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test('keyboard navigation works when clickable', () => {
    const onClickMock = jest.fn();
    renderWithTheme(
      <FrenchMascot onClick={onClickMock} showMessage={false} />
    );
    
    const mascot = screen.getByRole('button');
    fireEvent.keyDown(mascot, { key: 'Enter' });
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test('displays speech bubble with correct styling', () => {
    renderWithTheme(
      <FrenchMascot message="Test message" showMessage={true} />
    );
    
    const speechBubble = screen.getByText("Test message").closest('div');
    expect(speechBubble).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg');
  });

  test('shows French cultural elements', () => {
    renderWithTheme(<FrenchMascot showMessage={false} />);
    
    // Should show French flag emoji
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    // Should show beret
    expect(screen.getByText('🎩')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    renderWithTheme(
      <FrenchMascot className="custom-class" showMessage={false} />
    );
    
    const container = screen.getByRole('img').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

describe('Predefined Mascot Variants', () => {
  test('WelcomeMascot has happy mood', () => {
    renderWithTheme(<WelcomeMascot showMessage={false} />);
    expect(screen.getByText('😸')).toBeInTheDocument();
  });

  test('SuccessMascot has excited mood', () => {
    renderWithTheme(<SuccessMascot showMessage={false} />);
    expect(screen.getByText('😻')).toBeInTheDocument();
  });

  test('ThinkingMascot has thinking mood', () => {
    renderWithTheme(<ThinkingMascot showMessage={false} />);
    expect(screen.getByText('🤔')).toBeInTheDocument();
  });

  test('EncouragingMascot has encouraging mood', () => {
    renderWithTheme(<EncouragingMascot showMessage={false} />);
    expect(screen.getByText('😽')).toBeInTheDocument();
  });

  test('SleepingMascot has sleeping mood', () => {
    renderWithTheme(<SleepingMascot showMessage={false} />);
    expect(screen.getByText('😴')).toBeInTheDocument();
  });
});

describe('InteractiveMascot', () => {
  test('shows sleeping mood when inactive', () => {
    renderWithTheme(
      <InteractiveMascot isActive={false} />
    );
    
    expect(screen.getByText('😴')).toBeInTheDocument();
  });

  test('shows excited mood for correct answers', () => {
    renderWithTheme(
      <InteractiveMascot isCorrect={true} isActive={true} />
    );
    
    expect(screen.getByText('😻')).toBeInTheDocument();
  });

  test('shows encouraging mood for incorrect answers', () => {
    renderWithTheme(
      <InteractiveMascot isCorrect={false} isActive={true} />
    );
    
    expect(screen.getByText('😽')).toBeInTheDocument();
  });

  test('adjusts mood based on user score', () => {
    // High score should show excited mood
    const { rerender } = renderWithTheme(
      <InteractiveMascot userScore={250} isActive={true} />
    );
    expect(screen.getByText('😻')).toBeInTheDocument();

    // Medium score should show happy mood
    rerender(
      <ThemeProvider>
        <InteractiveMascot userScore={150} isActive={true} />
      </ThemeProvider>
    );
    expect(screen.getByText('😸')).toBeInTheDocument();

    // Low score should show encouraging mood
    rerender(
      <ThemeProvider>
        <InteractiveMascot userScore={50} isActive={true} />
      </ThemeProvider>
    );
    expect(screen.getByText('😽')).toBeInTheDocument();
  });
});

describe('Mascot Animations', () => {
  test('triggers thinking bubbles for thinking mood', () => {
    renderWithTheme(
      <FrenchMascot mood="thinking" animate={true} showMessage={false} />
    );
    
    // Check for thinking bubble dots
    const thinkingDots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-blue-300') && el.className.includes('rounded-full')
    );
    expect(thinkingDots.length).toBeGreaterThan(0);
  });

  test('triggers floating hearts for excited mood', () => {
    renderWithTheme(
      <FrenchMascot mood="excited" animate={true} showMessage={false} />
    );
    
    // Check for heart emojis
    const hearts = screen.getAllByText('❤️');
    expect(hearts.length).toBeGreaterThan(0);
  });

  test('disables animations when animate is false', () => {
    renderWithTheme(
      <FrenchMascot mood="excited" animate={false} showMessage={false} />
    );
    
    // Should not show floating hearts
    const hearts = screen.queryAllByText('❤️');
    expect(hearts).toHaveLength(0);
  });
});

describe('Message System', () => {
  test('generates different messages for different moods', () => {
    const moods = ['happy', 'excited', 'thinking', 'sleeping', 'surprised', 'encouraging'];
    
    moods.forEach(mood => {
      const { unmount } = renderWithTheme(
        <FrenchMascot mood={mood as any} showMessage={true} autoMessage={true} />
      );
      
      // Should display some message text
      const messageContainer = screen.getByText(/./);
      expect(messageContainer).toBeInTheDocument();
      unmount();
    });
  });

  test('hides messages when showMessage is false', () => {
    renderWithTheme(
      <FrenchMascot message="This should not appear" showMessage={false} />
    );
    
    expect(screen.queryByText("This should not appear")).not.toBeInTheDocument();
  });
});