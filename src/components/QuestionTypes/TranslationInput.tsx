import { useState, FormEvent, useRef } from 'react';
import { BaseQuestionProps, BaseQuestionLayout, useQuestionTimer } from './BaseQuestion';
import { FrenchAccentKeypad } from '../FrenchAccentKeypad';
import { StorageService } from '../../services/storage';

export function TranslationInput({ question, onAnswer, onSkip }: BaseQuestionProps) {
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const { getTimeSpent } = useQuestionTimer();
  const inputRef = useRef<HTMLInputElement>(null);
  const settings = StorageService.getSettings();

  const normalizeAnswer = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/^(le|la|les|un|une|des)\s+/i, '') // Remove articles
      .replace(/[.,!?;:]/g, ''); // Remove punctuation
  };

  const checkAnswer = (input: string): boolean => {
    const normalizedInput = normalizeAnswer(input);
    const normalizedAnswer = normalizeAnswer(question.french);
    
    // Exact match
    if (normalizedInput === normalizedAnswer) return true;
    
    // Check with article variations
    const articles = ['le', 'la', 'les', 'un', 'une', 'des'];
    for (const article of articles) {
      if (normalizeAnswer(`${article} ${input}`) === normalizedAnswer) return true;
      if (normalizedInput === normalizeAnswer(`${article} ${question.french}`)) return true;
    }
    
    return false;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || showFeedback) return;
    
    const correct = checkAnswer(userInput);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (!correct) {
      setAttempts(attempts + 1);
      if (attempts >= 1) { // Show hint after 2 attempts
        setShowHint(true);
      }
    }
    
    // Auto-proceed after showing feedback
    setTimeout(() => {
      onAnswer(correct, getTimeSpent(), attempts + 1);
    }, correct ? 1500 : 2500);
  };

  const handleCharacterInsert = (character: string) => {
    if (!inputRef.current) return;
    
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    
    const newValue = userInput.slice(0, start) + character + userInput.slice(end);
    setUserInput(newValue);
    
    // Set cursor position after the inserted character
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const getHint = (): string => {
    const french = question.french;
    if (french.length <= 3) return french[0] + '...';
    
    // Show first letter and some middle letters
    const hint = french[0] + french.slice(1, -1).replace(/[a-zA-ZÀ-ÿ]/g, '_') + french[french.length - 1];
    return hint;
  };

  return (
    <BaseQuestionLayout
      question={question}
      instruction="Vertaal naar het Frans"
      showSkipButton={!showFeedback}
      onSkip={onSkip}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">{question.dutch}</h2>
        {question.gender && (
          <p className="text-sm text-gray-500 mt-2">
            ({question.gender === 'm' ? 'mannelijk' : 'vrouwelijk'})
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showFeedback}
            placeholder="Type je antwoord hier..."
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors
              ${showFeedback && isCorrect ? 'border-green-500 bg-green-50' : ''}
              ${showFeedback && !isCorrect ? 'border-red-500 bg-red-50' : ''}
              ${!showFeedback ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' : ''}
            `}
            autoFocus
          />
          {settings.accentKeypad?.enabled && (
            <button
              type="button"
              onClick={() => setShowKeypad(!showKeypad)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Toggle French accent keypad"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        {showHint && !showFeedback && (
          <div className="text-sm text-gray-600">
            <p>Hint: {getHint()}</p>
          </div>
        )}

        {!showFeedback && (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Controleer
          </button>
        )}
      </form>

      {settings.accentKeypad?.enabled && (
        <FrenchAccentKeypad
          isVisible={showKeypad}
          onCharacterInsert={handleCharacterInsert}
          onClose={() => setShowKeypad(false)}
          inputRef={inputRef}
        />
      )}

      {showFeedback && (
        <div className={`mt-6 text-center ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          <p className="font-semibold text-lg">
            {isCorrect ? 'Uitstekend! 🎉' : `Het juiste antwoord is: "${question.french}"`}
          </p>
          {!isCorrect && userInput && (
            <p className="text-sm mt-2">
              Je antwoord: "{userInput}"
            </p>
          )}
        </div>
      )}
    </BaseQuestionLayout>
  );
}