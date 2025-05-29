import { useState, FormEvent } from 'react';
import { BaseQuestionProps, BaseQuestionLayout, useQuestionTimer } from './BaseQuestion';

export function ReverseTranslation({ question, onAnswer, onSkip }: BaseQuestionProps) {
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { getTimeSpent } = useQuestionTimer();

  const normalizeAnswer = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/^(de|het|een)\s+/i, '') // Remove Dutch articles
      .replace(/[.,!?;:]/g, ''); // Remove punctuation
  };

  const checkAnswer = (input: string): boolean => {
    const normalizedInput = normalizeAnswer(input);
    const normalizedAnswer = normalizeAnswer(question.dutch);
    
    // Exact match
    if (normalizedInput === normalizedAnswer) return true;
    
    // Check with article variations
    const articles = ['de', 'het', 'een'];
    for (const article of articles) {
      if (normalizeAnswer(`${article} ${input}`) === normalizedAnswer) return true;
      if (normalizedInput === normalizeAnswer(`${article} ${question.dutch}`)) return true;
    }
    
    return false;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || showFeedback) return;
    
    const correct = checkAnswer(userInput);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Auto-proceed after showing feedback
    setTimeout(() => {
      onAnswer(correct, getTimeSpent());
    }, correct ? 1500 : 2500);
  };

  const getFrenchWithArticle = (): string => {
    if (!question.gender) return question.french;
    
    // Add appropriate article based on gender
    const article = question.gender === 'm' ? 'le' : 'la';
    return `${article} ${question.french}`;
  };

  return (
    <BaseQuestionLayout
      question={question}
      instruction="Vertaal naar het Nederlands"
      showSkipButton={!showFeedback}
      onSkip={onSkip}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">{getFrenchWithArticle()}</h2>
        <p className="text-sm text-gray-500 mt-2">Frans → Nederlands</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showFeedback}
            placeholder="Type je Nederlandse vertaling..."
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors
              ${showFeedback && isCorrect ? 'border-green-500 bg-green-50' : ''}
              ${showFeedback && !isCorrect ? 'border-red-500 bg-red-50' : ''}
              ${!showFeedback ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' : ''}
            `}
            autoFocus
          />
        </div>

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
            {isCorrect ? 'Perfect! 🎉' : `Het juiste antwoord is: "${question.dutch}"`}
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