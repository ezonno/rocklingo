import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface FrenchAccentKeypadProps {
  onCharacterInsert: (character: string) => void;
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const FRENCH_CHARACTERS = {
  lowercase: ['à', 'è', 'é', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'ç', 'œ', 'æ'],
  uppercase: ['À', 'È', 'É', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ', 'Ç', 'Œ', 'Æ'],
};

export const FrenchAccentKeypad: React.FC<FrenchAccentKeypadProps> = ({
  onCharacterInsert,
  isVisible,
  onClose,
  position,
  inputRef,
}) => {
  const [showUppercase, setShowUppercase] = useState(false);
  const keypadRef = useRef<HTMLDivElement>(null);
  const [keypadPosition, setKeypadPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible && inputRef?.current && keypadRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const keypadRect = keypadRef.current.getBoundingClientRect();
      
      let x = inputRect.left;
      let y = inputRect.bottom + 8;

      // Ensure keypad doesn't go off-screen
      if (x + keypadRect.width > window.innerWidth) {
        x = window.innerWidth - keypadRect.width - 16;
      }
      if (y + keypadRect.height > window.innerHeight) {
        y = inputRect.top - keypadRect.height - 8;
      }

      setKeypadPosition({ x, y });
    }
  }, [isVisible, inputRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (keypadRef.current && !keypadRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!inputRef?.current?.contains(target)) {
          onClose();
        }
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose, inputRef]);

  if (!isVisible) return null;

  const characters = showUppercase ? FRENCH_CHARACTERS.uppercase : FRENCH_CHARACTERS.lowercase;
  const { isDarkMode } = useTheme();
  const isDark = isDarkMode;

  const handleCharacterClick = (char: string) => {
    onCharacterInsert(char);
    
    // Keep focus on input after character insertion
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      ref={keypadRef}
      className={`fixed z-50 p-3 rounded-lg shadow-lg transition-all duration-200 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
      style={{
        left: position?.x ?? keypadPosition.x,
        top: position?.y ?? keypadPosition.y,
      }}
      role="toolbar"
      aria-label="French accent keypad"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Accents français
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUppercase(!showUppercase)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              showUppercase
                ? isDark
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={showUppercase}
            aria-label="Toggle uppercase"
          >
            ⇧
          </button>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Close keypad"
          >
            ×
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {characters.map((char) => (
          <button
            key={char}
            onClick={() => handleCharacterClick(char)}
            className={`p-2 min-w-[2.5rem] text-lg rounded transition-all transform hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 active:bg-gray-500'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 active:bg-gray-300'
            }`}
            aria-label={`Insert ${char}`}
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
};