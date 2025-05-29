import { describe, it, expect } from 'vitest';
import { WorkbookParser } from '../workbookParser';

describe('WorkbookParser', () => {
  it('parses simple translation pairs', () => {
    const content = `
# Test Section
- bonjour → hallo
- merci → bedankt
- au revoir → tot ziens
    `;

    const result = WorkbookParser.parseWorkbook(content);
    
    expect(result.version).toBe('1.0');
    expect(result.categories.length).toBeGreaterThan(0);
    
    const questions = result.categories.flatMap(c => c.questions);
    expect(questions).toHaveLength(3);
    
    // Find the specific question
    const bonjourQuestion = questions.find(q => q.french === 'bonjour');
    expect(bonjourQuestion).toBeDefined();
    expect(bonjourQuestion?.dutch).toBe('hallo');
  });

  it('extracts gender information', () => {
    const content = `
# Grammar
- le chat m → de kat
- la maison f → het huis
- l'homme m → de man
    `;

    const result = WorkbookParser.parseWorkbook(content);
    const questions = result.categories.flatMap(c => c.questions);
    
    expect(questions[0].french).toBe('le chat');
    expect(questions[0].gender).toBe('m');
    
    expect(questions[1].french).toBe('la maison');
    expect(questions[1].gender).toBe('f');
  });

  it('categorizes questions based on content', () => {
    const content = `
## Sports
- nager → zwemmen
- jouer au foot → voetballen

## Transport
- en voiture → met de auto
- le bus → de bus
    `;

    const result = WorkbookParser.parseWorkbook(content);
    
    const sportsCategory = result.categories.find(c => c.id === 'sports');
    const transportCategory = result.categories.find(c => c.id === 'transport');
    
    expect(sportsCategory).toBeDefined();
    expect(sportsCategory?.questions).toHaveLength(2);
    
    expect(transportCategory).toBeDefined();
    expect(transportCategory?.questions).toHaveLength(2);
  });

  it('calculates difficulty based on length', () => {
    const content = `
# Test
- oui → ja
- C'est une grande ville → Het is een grote stad
- Qu'est-ce qu'on va faire aujourd'hui? → Wat gaan wij vandaag doen?
    `;

    const result = WorkbookParser.parseWorkbook(content);
    const questions = result.categories.flatMap(c => c.questions);
    
    // Check each question's difficulty
    const ouiQuestion = questions.find(q => q.french === 'oui');
    const grandeVilleQuestion = questions.find(q => q.french.includes('grande ville'));
    const longQuestion = questions.find(q => q.french.includes("Qu'est-ce"));
    
    expect(ouiQuestion?.difficulty).toBe(1); // "oui" + "ja" = 5 chars, 2 words -> 1
    expect(grandeVilleQuestion?.difficulty).toBe(3); // Long sentence -> 3  
    expect(longQuestion?.difficulty).toBe(3); // Very long sentence -> 3
  });

  it('skips invalid entries', () => {
    const content = `
# Test
- valid → geldig
- → empty french
- empty dutch → 
- a → b
- also valid → ook geldig
    `;

    const result = WorkbookParser.parseWorkbook(content);
    const questions = result.categories.flatMap(c => c.questions);
    
    // Should only include valid entries (length >= 2)
    expect(questions).toHaveLength(2);
    expect(questions[0].dutch).toBe('geldig');
    expect(questions[1].dutch).toBe('ook geldig');
  });

  it('handles complex workbook format', () => {
    const content = `
# French-Dutch Language Learning Workbook Extract

## Page 1 - Grammar and Verbs

### Frans ↔ Nederlands

**Adjectives:**
- mogelijk → belangrijk
- vroeg → stom

**Verbs:**
- venir → komen
- améliorer → verbeteren
    `;

    const result = WorkbookParser.parseWorkbook(content);
    const questions = result.categories.flatMap(c => c.questions);
    
    expect(questions).toHaveLength(4);
    expect(questions.find(q => q.french === 'venir')).toBeDefined();
    expect(questions.find(q => q.dutch === 'komen')).toBeDefined();
  });
});