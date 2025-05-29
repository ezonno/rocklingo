import { useState, FormEvent } from 'react';
import { BaseQuestionProps, BaseQuestionLayout, useQuestionTimer } from './BaseQuestion';

export function TranslationInput({ question, onAnswer, onSkip }: BaseQuestionProps) {
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { getTimeSpent } = useQuestionTimer();

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
      onAnswer(correct, getTimeSpent());
    }, correct ? 1500 : 2500);
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
        <div>
          <input
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