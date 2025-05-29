import { Question, Category, QuestionBank } from '../types';

export class WorkbookParser {
  static parseWorkbook(content: string): QuestionBank {
    const categories: Category[] = [];
    const lines = content.split('\n');
    
    let currentCategory: Category | null = null;
    let questionId = 1;
    
    const categoryMap: Record<string, Category> = {
      'grammar': { id: 'grammar', name: 'Grammatica', icon: '📝', questions: [] },
      'daily': { id: 'daily', name: 'Dagelijkse Activiteiten', icon: '🏠', questions: [] },
      'places': { id: 'places', name: 'Plaatsen', icon: '📍', questions: [] },
      'transport': { id: 'transport', name: 'Vervoer', icon: '🚗', questions: [] },
      'sports': { id: 'sports', name: 'Sport', icon: '⚽', questions: [] },
      'time': { id: 'time', name: 'Tijd', icon: '⏰', questions: [] },
      'people': { id: 'people', name: 'Mensen', icon: '👥', questions: [] },
      'feelings': { id: 'feelings', name: 'Gevoelens', icon: '❤️', questions: [] },
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.startsWith('#') || line.startsWith('*')) continue;
      
      // Parse translation pairs (format: "- french → dutch")
      const match = line.match(/^-\s*(.+?)\s*→\s*(.+)$/);
      if (match) {
        const [, french, dutch] = match;
        
        // Determine category based on content
        const categoryId = this.determineCategory(french, dutch, lines, i);
        currentCategory = categoryMap[categoryId];
        
        // Clean up the text
        const cleanFrench = french.trim();
        const cleanDutch = dutch.trim();
        
        // Skip if either side is empty or too short
        if (cleanFrench.length < 2 || cleanDutch.length < 2) continue;
        
        // Extract gender if present (m/v/mv)
        const genderMatch = cleanFrench.match(/\s+(m|f|v|m\/v|mv)\s*$/);
        let gender: 'm' | 'f' | undefined;
        let frenchWord = cleanFrench;
        
        if (genderMatch) {
          frenchWord = cleanFrench.replace(/\s+(m|f|v|m\/v|mv)\s*$/, '').trim();
          gender = genderMatch[1] === 'f' || genderMatch[1] === 'v' ? 'f' : 'm';
        }
        
        // Determine difficulty based on word length and complexity
        const difficulty = this.calculateDifficulty(frenchWord, cleanDutch);
        
        const question: Question = {
          id: `q${questionId++}`,
          french: frenchWord,
          dutch: cleanDutch,
          gender,
          category: currentCategory.id,
          difficulty,
        };
        
        currentCategory.questions.push(question);
      }
    }
    
    // Add all non-empty categories
    Object.values(categoryMap).forEach(category => {
      if (category.questions.length > 0) {
        categories.push(category);
      }
    });
    
    return {
      version: '1.0',
      categories,
    };
  }
  
  private static determineCategory(french: string, dutch: string, lines: string[], currentIndex: number): string {
    // Look for nearby section headers to determine category
    for (let i = currentIndex - 1; i >= Math.max(0, currentIndex - 10); i--) {
      const line = lines[i].toLowerCase();
      
      if (line.includes('grammar') || line.includes('verb') || line.includes('adjective')) {
        return 'grammar';
      }
      if (line.includes('daily') || line.includes('activities') || line.includes('dagen')) {
        return 'daily';
      }
      if (line.includes('place') || line.includes('navigation') || line.includes('ville')) {
        return 'places';
      }
      if (line.includes('transport') || line.includes('voiture') || line.includes('bus')) {
        return 'transport';
      }
      if (line.includes('sport') || line.includes('hobbies')) {
        return 'sports';
      }
      if (line.includes('time') || line.includes('frequency') || line.includes('tijd')) {
        return 'time';
      }
      if (line.includes('people') || line.includes('relationship')) {
        return 'people';
      }
      if (line.includes('feeling') || line.includes('state')) {
        return 'feelings';
      }
    }
    
    // Default category based on content analysis
    const content = (french + ' ' + dutch).toLowerCase();
    
    if (content.includes('voetbal') || content.includes('zwem') || content.includes('sport')) {
      return 'sports';
    }
    if (content.includes('station') || content.includes('auto') || content.includes('bus') || content.includes('vélo')) {
      return 'transport';
    }
    if (content.includes('ville') || content.includes('stad') || content.includes('gare')) {
      return 'places';
    }
    if (content.includes('jour') || content.includes('dag') || content.includes('semaine')) {
      return 'time';
    }
    if (content.includes('mensen') || content.includes('gens') || content.includes('habitant')) {
      return 'people';
    }
    
    return 'grammar'; // Default category
  }
  
  private static calculateDifficulty(french: string, dutch: string): number {
    const totalLength = french.length + dutch.length;
    const wordCount = french.split(' ').length + dutch.split(' ').length;
    
    if (totalLength < 10 || wordCount <= 2) return 1;
    if (totalLength < 20 || wordCount <= 4) return 2;
    return 3;
  }
}