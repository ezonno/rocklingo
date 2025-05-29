import { Question, QuestionBank, Category } from '../types';
import { StorageService } from './storage';
import { WorkbookParser } from './workbookParser';

export class QuestionBankService {
  private static workbookQuestionsPromise: Promise<QuestionBank> | null = null;

  static async loadWorkbookQuestions(): Promise<QuestionBank> {
    if (this.workbookQuestionsPromise) {
      return this.workbookQuestionsPromise;
    }

    this.workbookQuestionsPromise = fetch('/rocklingo/french_dutch_workbook.md')
      .then(response => response.text())
      .then(content => WorkbookParser.parseWorkbook(content))
      .catch(async error => {
        console.error('Failed to load workbook, falling back to default questions:', error);
        // Fallback to default questions
        return fetch('/rocklingo/data/default-questions.json')
          .then(response => response.json())
          .catch(() => ({ version: '1.0', categories: [] }));
      });

    return this.workbookQuestionsPromise;
  }

  static async getAllQuestions(): Promise<QuestionBank> {
    const customQuestions = StorageService.getCustomQuestions();
    if (customQuestions && customQuestions.categories.length > 0) {
      return customQuestions;
    }
    return this.loadWorkbookQuestions();
  }

  static async getQuestionsByCategory(categoryId: string): Promise<Question[]> {
    const questionBank = await this.getAllQuestions();
    const category = questionBank.categories.find(cat => cat.id === categoryId);
    return category ? category.questions : [];
  }

  static async getCategories(): Promise<Category[]> {
    const questionBank = await this.getAllQuestions();
    return questionBank.categories;
  }

  static async getRandomQuestions(count: number, categoryIds?: string[]): Promise<Question[]> {
    const questionBank = await this.getAllQuestions();
    let allQuestions: Question[] = [];

    if (categoryIds && categoryIds.length > 0) {
      allQuestions = questionBank.categories
        .filter(cat => categoryIds.includes(cat.id))
        .flatMap(cat => cat.questions);
    } else {
      allQuestions = questionBank.categories.flatMap(cat => cat.questions);
    }

    // Shuffle and return requested count
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static uploadCustomQuestions(fileContent: string): void {
    try {
      const questionBank: QuestionBank = JSON.parse(fileContent);
      if (!questionBank.version || !questionBank.categories) {
        throw new Error('Invalid question bank format');
      }
      StorageService.setCustomQuestions(questionBank);
    } catch (error) {
      console.error('Failed to parse question bank:', error);
      throw new Error('Ongeldig bestandsformaat. Controleer of het een geldig JSON-bestand is.');
    }
  }

  static getDistractors(correctAnswer: string, category: Category, count: number = 3): string[] {
    const otherAnswers = category.questions
      .filter(q => q.french !== correctAnswer)
      .map(q => q.french);
    
    // Shuffle and return requested count
    const shuffled = [...otherAnswers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}