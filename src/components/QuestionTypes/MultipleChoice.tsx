import { useState, useEffect } from 'react';
import { BaseQuestionProps, BaseQuestionLayout, useQuestionTimer } from './BaseQuestion';
import { QuestionBankService } from '../../services/questionBank';

export function MultipleChoice({ question, onAnswer, onSkip }: BaseQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const { getTimeSpent } = useQuestionTimer();

  useEffect(() => {
    // Generate options when component mounts
    const generateOptions = async () => {
      const categories = await QuestionBankService.getCategories();
      const category = categories.find(cat => cat.id === question.category);
      
      if (category) {
        const distractors = QuestionBankService.getDistractors(question.french, category, 3);
        const allOptions = [question.french, ...distractors];
        // Shuffle options
        setOptions(allOptions.sort(() => Math.random() - 0.5));
      } else {
        // Fallback options if category not found
        setOptions([question.french, 'maison', 'voiture', 'livre'].sort(() => Math.random() - 0.5));
      }
    };
    
    generateOptions();
  }, [question]);

  const handleSelectAnswer = (answer: string) => {
    if (showFeedback) return; // Prevent changing answer after feedback
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === question.french;
    
    // Auto-proceed after showing feedback
    setTimeout(() => {
      onAnswer(isCorrect, getTimeSpent());
    }, isCorrect ? 1000 : 2000);
  };

  return (
    <BaseQuestionLayout
      question={question}
      instruction="Kies de juiste Franse vertaling"
      showSkipButton={!showFeedback}
      onSkip={onSkip}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">{question.dutch}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.french;
          const showAsCorrect = showFeedback && isCorrect;
          const showAsIncorrect = showFeedback && isSelected && !isCorrect;
          
          return (
            <button
              key={option}
              onClick={() => handleSelectAnswer(option)}
              disabled={showFeedback}
              className={`
                p-4 rounded-lg font-medium text-lg transition-all transform hover:scale-105
                ${!showFeedback && !isSelected ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : ''}
                ${!showFeedback && isSelected ? 'bg-blue-500 text-white' : ''}
                ${showAsCorrect ? 'bg-green-500 text-white' : ''}
                ${showAsIncorrect ? 'bg-red-500 text-white' : ''}
                ${showFeedback && !isSelected && !isCorrect ? 'bg-gray-100 text-gray-400' : ''}
                ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option}
              {showAsCorrect && ' ✓'}
              {showAsIncorrect && ' ✗'}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`mt-6 text-center ${selectedAnswer === question.french ? 'text-green-600' : 'text-red-600'}`}>
          <p className="font-semibold">
            {selectedAnswer === question.french ? 'Correct! 🎉' : `Fout. Het juiste antwoord is "${question.french}"`}
          </p>
        </div>
      )}
    </BaseQuestionLayout>
  );
}