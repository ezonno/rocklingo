import { useState, useEffect, FormEvent } from 'react';
import { BaseQuestionProps, BaseQuestionLayout, useQuestionTimer } from './BaseQuestion';

export function SpellingChallenge({ question, onAnswer, onSkip }: BaseQuestionProps) {
  const [userInput, setUserInput] = useState('');
  const [showWord, setShowWord] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [playedAudio, setPlayedAudio] = useState(false);
  const { getTimeSpent } = useQuestionTimer();

  useEffect(() => {
    // Show word briefly then hide it
    const timer = setTimeout(() => {
      setShowWord(false);
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const playAudio = () => {
    // Use browser's speech synthesis as a simple solution
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.french);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8; // Slightly slower for learning
      window.speechSynthesis.speak(utterance);
      setPlayedAudio(true);
    }
  };

  const normalizeAnswer = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, ''); // Remove punctuation
  };

  const checkAnswer = (input: string): boolean => {
    return normalizeAnswer(input) === normalizeAnswer(question.french);
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

  return (
    <BaseQuestionLayout
      question={question}
      instruction="Luister en schrijf het Franse woord"
      showSkipButton={!showFeedback}
      onSkip={onSkip}
    >
      <div className="mb-8 text-center">
        {showWord ? (
          <div>
            <p className="text-sm text-gray-500 mb-2">Onthoud dit woord:</p>
            <h2 className="text-4xl font-bold text-blue-600">{question.french}</h2>
            <p className="text-sm text-gray-500 mt-2">Het woord verdwijnt over {3} seconden...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-700 mb-4">Betekenis: <strong>{question.dutch}</strong></p>
            <button
              onClick={playAudio}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
              type="button"
            >
              <span className="text-2xl">🔊</span>
              {playedAudio ? 'Luister opnieuw' : 'Luister naar de uitspraak'}
            </button>
          </div>
        )}
      </div>

      {!showWord && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={showFeedback}
              placeholder="Schrijf het Franse woord..."
              className={`
                w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors
                ${showFeedback && isCorrect ? 'border-green-500 bg-green-50' : ''}
                ${showFeedback && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                ${!showFeedback ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' : ''}
              `}
              autoFocus={!showWord}
            />
          </div>

          {!showFeedback && (
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Controleer spelling
            </button>
          )}
        </form>
      )}

      {showFeedback && (
        <div className={`mt-6 text-center ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          <p className="font-semibold text-lg">
            {isCorrect ? 'Perfect gespeld! 🎉' : `De juiste spelling is: "${question.french}"`}
          </p>
          {!isCorrect && userInput && (
            <p className="text-sm mt-2">
              Je schreef: "{userInput}"
            </p>
          )}
        </div>
      )}
    </BaseQuestionLayout>
  );
}