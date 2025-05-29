import React from 'react';
import { Session } from '../types';

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  questions: number;
  mastered: number;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
}

interface CategoryProgressProps {
  sessions: Session[];
  questionProgress?: { [questionId: string]: { correct: number; total: number; category?: string } };
}

export const CategoryProgress: React.FC<CategoryProgressProps> = ({ 
  questionProgress = {} 
}) => {
  // Define categories with their metadata
  const categoryMetadata: { [key: string]: { name: string; icon: string } } = {
    'animals': { name: 'Dieren', icon: '🐾' },
    'colors': { name: 'Kleuren', icon: '🎨' },
    'family': { name: 'Familie', icon: '👨‍👩‍👧‍👦' },
    'food': { name: 'Voedsel', icon: '🍽️' },
    'school': { name: 'School', icon: '🏫' },
    'body': { name: 'Lichaam', icon: '👤' },
    'clothing': { name: 'Kleding', icon: '👕' },
    'transportation': { name: 'Vervoer', icon: '🚗' },
    'general': { name: 'Algemeen', icon: '📚' }
  };

  // Process question progress by category
  const categoryStats: { [key: string]: CategoryData } = {};
  
  // Initialize categories
  Object.keys(categoryMetadata).forEach(categoryId => {
    categoryStats[categoryId] = {
      id: categoryId,
      name: categoryMetadata[categoryId].name,
      icon: categoryMetadata[categoryId].icon,
      questions: 0,
      mastered: 0,
      accuracy: 0,
      totalAttempts: 0,
      correctAttempts: 0
    };
  });

  // Process question progress data
  Object.entries(questionProgress).forEach(([questionId, progress]) => {
    // Extract category from question ID or use default
    const categoryId = progress.category || questionId.split('_')[0] || 'general';
    
    if (!categoryStats[categoryId]) {
      categoryStats[categoryId] = {
        id: categoryId,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        icon: '❓',
        questions: 0,
        mastered: 0,
        accuracy: 0,
        totalAttempts: 0,
        correctAttempts: 0
      };
    }
    
    categoryStats[categoryId].questions++;
    categoryStats[categoryId].totalAttempts += progress.total;
    categoryStats[categoryId].correctAttempts += progress.correct;
    
    // Consider a question "mastered" if accuracy >= 70% and attempted at least 3 times
    if (progress.total >= 3 && (progress.correct / progress.total) >= 0.7) {
      categoryStats[categoryId].mastered++;
    }
  });

  // Calculate accuracy percentages
  Object.values(categoryStats).forEach(category => {
    if (category.totalAttempts > 0) {
      category.accuracy = Math.round((category.correctAttempts / category.totalAttempts) * 100);
    }
  });

  // Filter out categories with no questions
  const activeCategories = Object.values(categoryStats).filter(category => category.questions > 0);
  
  // Sort by mastery percentage (mastered/total questions)
  activeCategories.sort((a, b) => {
    const aPercentage = a.questions > 0 ? (a.mastered / a.questions) : 0;
    const bPercentage = b.questions > 0 ? (b.mastered / b.questions) : 0;
    return bPercentage - aPercentage;
  });

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMasteryColor = (masteredPercentage: number) => {
    if (masteredPercentage >= 70) return 'bg-green-500';
    if (masteredPercentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (activeCategories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorie Voortgang</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-gray-500">Begin met oefenen om categorie voortgang te zien!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorie Voortgang</h3>
      
      <div className="space-y-4">
        {activeCategories.map(category => {
          const masteryPercentage = category.questions > 0 
            ? Math.round((category.mastered / category.questions) * 100) 
            : 0;
          
          return (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{category.name}</h4>
                    <p className="text-sm text-gray-600">
                      {category.mastered}/{category.questions} woorden geleerd
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(category.accuracy)}`}>
                    {category.accuracy}% nauwkeurig
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {category.totalAttempts} pogingen
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getMasteryColor(masteryPercentage)}`}
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">
                  {masteryPercentage}% beheerst
                </span>
                <div className="flex space-x-4 text-xs">
                  <span className="text-green-600">
                    ✓ {category.correctAttempts} juist
                  </span>
                  <span className="text-red-600">
                    ✗ {category.totalAttempts - category.correctAttempts} fout
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">📊 Overzicht</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-blue-600">
              {activeCategories.length}
            </div>
            <div className="text-gray-600">Categorieën</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">
              {activeCategories.reduce((sum, cat) => sum + cat.mastered, 0)}
            </div>
            <div className="text-gray-600">Geleerd</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-purple-600">
              {activeCategories.reduce((sum, cat) => sum + cat.questions, 0)}
            </div>
            <div className="text-gray-600">Totaal Woorden</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-orange-600">
              {activeCategories.length > 0 
                ? Math.round(activeCategories.reduce((sum, cat) => sum + cat.accuracy, 0) / activeCategories.length)
                : 0}%
            </div>
            <div className="text-gray-600">Gem. Nauwkeurigheid</div>
          </div>
        </div>
      </div>
    </div>
  );
};