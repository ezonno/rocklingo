import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimatedIcon, CelebrationIcon, WelcomeIcon, FrenchIconGallery } from '../AnimatedIcon';
import { ThemeProvider } from '../ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AnimatedIcon', () => {
  test('renders with default props', () => {
    renderWithTheme(<AnimatedIcon />);
    
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-label', 'French themed icon: star');
  });

  test('renders custom icon', () => {
    renderWithTheme(<AnimatedIcon customIcon="🎉" />);
    
    const icon = screen.getByText('🎉');
    expect(icon).toBeInTheDocument();
  });

  test('renders French-themed icons correctly', () => {
    renderWithTheme(<AnimatedIcon icon="eiffelTower" />);
    
    const icon = screen.getByText('🗼');
    expect(icon).toBeInTheDocument();
  });

  test('applies correct size classes', () => {
    const { rerender } = renderWithTheme(<AnimatedIcon size="sm" />);
    let icon = screen.getByRole('img');
    expect(icon).toHaveClass('text-lg');

    rerender(
      <ThemeProvider>
        <AnimatedIcon size="xl" />
      </ThemeProvider>
    );
    icon = screen.getByRole('img');
    expect(icon).toHaveClass('text-6xl');
  });

  test('handles click trigger correctly', () => {
    const onClickMock = jest.fn();
    renderWithTheme(
      <AnimatedIcon trigger="click" onClick={onClickMock} />
    );
    
    const icon = screen.getByRole('button');
    fireEvent.click(icon);
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test('handles hover trigger', () => {
    renderWithTheme(<AnimatedIcon trigger="hover" />);
    
    const icon = screen.getByRole('img');
    fireEvent.mouseEnter(icon);
    fireEvent.mouseLeave(icon);
    
    // Icon should be present and hoverable
    expect(icon).toBeInTheDocument();
  });

  test('handles keyboard navigation when clickable', () => {
    const onClickMock = jest.fn();
    renderWithTheme(
      <AnimatedIcon onClick={onClickMock} />
    );
    
    const icon = screen.getByRole('button');
    fireEvent.keyDown(icon, { key: 'Enter' });
    expect(onClickMock).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(icon, { key: ' ' });
    expect(onClickMock).toHaveBeenCalledTimes(2);
  });

  test('applies custom className', () => {
    renderWithTheme(<AnimatedIcon className="custom-class" />);
    
    const icon = screen.getByRole('img');
    expect(icon).toHaveClass('custom-class');
  });

  test('disables animation when isActive is false', () => {
    renderWithTheme(<AnimatedIcon trigger="manual" isActive={false} />);
    
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
  });
});

describe('Predefined Icon Components', () => {
  test('CelebrationIcon renders with correct props', () => {
    renderWithTheme(<CelebrationIcon />);
    
    const icon = screen.getByText('⭐');
    expect(icon).toBeInTheDocument();
  });

  test('WelcomeIcon renders with correct props', () => {
    renderWithTheme(<WelcomeIcon />);
    
    const icon = screen.getByText('🗼');
    expect(icon).toBeInTheDocument();
  });

  test('predefined components accept additional props', () => {
    renderWithTheme(<CelebrationIcon size="xl" className="test-class" />);
    
    const icon = screen.getByRole('img');
    expect(icon).toHaveClass('text-6xl', 'test-class');
  });
});

describe('FrenchIconGallery', () => {
  test('renders all French icons', () => {
    const onSelectMock = jest.fn();
    renderWithTheme(<FrenchIconGallery onIconSelect={onSelectMock} />);
    
    // Check for presence of main icons
    expect(screen.getByText('🗼')).toBeInTheDocument(); // Eiffel Tower
    expect(screen.getByText('🥐')).toBeInTheDocument(); // Croissant
    expect(screen.getByText('🧀')).toBeInTheDocument(); // Cheese
    expect(screen.getByText('🇫🇷')).toBeInTheDocument(); // Flag
  });

  test('calls onIconSelect when icon is clicked', () => {
    const onSelectMock = jest.fn();
    renderWithTheme(<FrenchIconGallery onIconSelect={onSelectMock} />);
    
    const eiffelTowerContainer = screen.getByText('Eiffel Tower').closest('div');
    fireEvent.click(eiffelTowerContainer!);
    
    expect(onSelectMock).toHaveBeenCalledWith('eiffelTower');
  });

  test('highlights selected icon', () => {
    renderWithTheme(
      <FrenchIconGallery selectedIcon="croissant" />
    );
    
    const croissantContainer = screen.getByText('Croissant').closest('div');
    expect(croissantContainer).toHaveClass('bg-blue-100', 'ring-2', 'ring-blue-500');
  });

  test('shows icon names correctly', () => {
    renderWithTheme(<FrenchIconGallery />);
    
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
    expect(screen.getByText('French Flag')).toBeInTheDocument();
    expect(screen.getByText('Baguette')).toBeInTheDocument();
  });
});

describe('Animation Types', () => {
  test('applies different animation types', () => {
    const animations = ['bounce', 'pulse', 'spin', 'float', 'wiggle', 'glow', 'shake'];
    
    animations.forEach(animation => {
      const { unmount } = renderWithTheme(
        <AnimatedIcon animation={animation as any} />
      );
      
      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
      
      unmount();
    });
  });
});