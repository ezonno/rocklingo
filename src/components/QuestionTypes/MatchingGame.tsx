import { useState, useEffect } from 'react';
import { BaseQuestionProps, BaseQuestionLayout, useQuestionTimer } from './BaseQuestion';
import { Question } from '../../types';
import { QuestionBankService } from '../../services/questionBank';

interface MatchPair {
  id: string;
  dutch: string;
  french: string;
}

export function MatchingGame({ question, onAnswer, onSkip }: BaseQuestionProps) {
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [selectedDutch, setSelectedDutch] = useState<string | null>(null);
  const [selectedFrench, setSelectedFrench] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [incorrectMatch, setIncorrectMatch] = useState<boolean>(false);
  const [completed, setCompleted] = useState(false);
  const { getTimeSpent } = useQuestionTimer();

  useEffect(() => {
    // Generate pairs for matching
    const generatePairs = async () => {
      const allQuestions = await QuestionBankService.getRandomQuestions(3, [question.category]);
      
      // Include the current question
      const questionsToUse = [question];
      
      // Add 2 more questions from the same category, avoiding duplicates
      for (const q of allQuestions) {
        if (questionsToUse.length >= 3) break;
        if (q.id !== question.id) {
          questionsToUse.push(q);
        }
      }
      
      // If we don't have enough, create some fallback pairs
      while (questionsToUse.length < 3) {
        const fallbackPairs = [
          { dutch: 'boek', french: 'livre' },
          { dutch: 'huis', french: 'maison' },
          { dutch: 'water', french: 'eau' },
        ];
        const fallback = fallbackPairs[questionsToUse.length - 1];
        questionsToUse.push({
          id: `fallback-${questionsToUse.length}`,
          ...fallback,
          category: question.category,
          difficulty: 1,
        } as Question);
      }
      
      setPairs(questionsToUse.map(q => ({
        id: q.id,
        dutch: q.dutch,
        french: q.french,
      })));
    };
    
    generatePairs();
  }, [question]);

  useEffect(() => {
    if (!selectedDutch || !selectedFrench) return;
    
    const dutchPair = pairs.find(p => p.dutch === selectedDutch);
    const frenchPair = pairs.find(p => p.french === selectedFrench);
    
    if (dutchPair && frenchPair && dutchPair.id === frenchPair.id) {
      // Correct match
      setMatches(new Set([...matches, dutchPair.id]));
      setSelectedDutch(null);
      setSelectedFrench(null);
      setIncorrectMatch(false);
      
      // Check if all matched
      if (matches.size + 1 === pairs.length) {
        setCompleted(true);
        setTimeout(() => {
          onAnswer(true, getTimeSpent());
        }, 1500);
      }
    } else {
      // Incorrect match
      setIncorrectMatch(true);
      setTimeout(() => {
        setSelectedDutch(null);
        setSelectedFrench(null);
        setIncorrectMatch(false);
      }, 1000);
    }
  }, [selectedDutch, selectedFrench, pairs, matches, getTimeSpent, onAnswer]);

  const handleDutchClick = (dutch: string) => {
    if (incorrectMatch || completed) return;
    const pairId = pairs.find(p => p.dutch === dutch)?.id;
    if (pairId && matches.has(pairId)) return; // Already matched
    
    setSelectedDutch(dutch === selectedDutch ? null : dutch);
  };

  const handleFrenchClick = (french: string) => {
    if (incorrectMatch || completed) return;
    const pairId = pairs.find(p => p.french === french)?.id;
    if (pairId && matches.has(pairId)) return; // Already matched
    
    setSelectedFrench(french === selectedFrench ? null : french);
  };

  // Shuffle arrays for display
  const shuffledDutch = [...pairs].sort(() => Math.random() - 0.5);
  const shuffledFrench = [...pairs].sort(() => Math.random() - 0.5);

  return (
    <BaseQuestionLayout
      question={question}
      instruction="Koppel de Nederlandse woorden aan hun Franse vertalingen"
      showSkipButton={!completed}
      onSkip={onSkip}
    >
      <div className="grid grid-cols-2 gap-8">
        {/* Dutch words */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Nederlands</h3>
          {shuffledDutch.map((pair) => {
            const isMatched = matches.has(pair.id);
            const isSelected = selectedDutch === pair.dutch;
            
            return (
              <button
                key={pair.dutch}
                onClick={() => handleDutchClick(pair.dutch)}
                disabled={isMatched || incorrectMatch}
                className={`
                  w-full p-3 rounded-lg font-medium text-left transition-all
                  ${isMatched ? 'bg-green-100 text-green-700 cursor-not-allowed' : ''}
                  ${!isMatched && isSelected ? 'bg-blue-500 text-white' : ''}
                  ${!isMatched && !isSelected ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : ''}
                  ${incorrectMatch && isSelected ? 'bg-red-500 text-white animate-pulse' : ''}
                `}
              >
                {pair.dutch}
              </button>
            );
          })}
        </div>

        {/* French words */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Frans</h3>
          {shuffledFrench.map((pair) => {
            const isMatched = matches.has(pair.id);
            const isSelected = selectedFrench === pair.french;
            
            return (
              <button
                key={pair.french}
                onClick={() => handleFrenchClick(pair.french)}
                disabled={isMatched || incorrectMatch}
                className={`
                  w-full p-3 rounded-lg font-medium text-left transition-all
                  ${isMatched ? 'bg-green-100 text-green-700 cursor-not-allowed' : ''}
                  ${!isMatched && isSelected ? 'bg-blue-500 text-white' : ''}
                  ${!isMatched && !isSelected ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : ''}
                  ${incorrectMatch && isSelected ? 'bg-red-500 text-white animate-pulse' : ''}
                `}
              >
                {pair.french}
              </button>
            );
          })}
        </div>
      </div>

      {completed && (
        <div className="mt-6 text-center text-green-600">
          <p className="font-semibold text-lg">
            Alle koppels gevonden! 🎉
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        {matches.size} van {pairs.length} gekoppeld
      </div>
    </BaseQuestionLayout>
  );
}