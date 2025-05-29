import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKBOOK_PATH = path.join(__dirname, '../workbooks/french_dutch_workbook.md');
const OUTPUT_PATH = path.join(__dirname, '../public/data/questions.json');

// Import WorkbookParser from compiled TypeScript
let WorkbookParser;
try {
  const workbookParserModule = await import('../dist/services/workbookParser.js');
  WorkbookParser = workbookParserModule.WorkbookParser;
} catch (error) {
  console.error('❌ Could not load WorkbookParser. Please run `npm run build` first.');
  process.exit(1);
}

async function convertWorkbook(options = {}) {
  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    
    // Read markdown file
    console.log('📖 Reading workbook...');
    const markdown = await fs.readFile(WORKBOOK_PATH, 'utf-8');
    
    // Parse markdown to questions
    console.log('🔄 Parsing questions...');
    const questionBank = WorkbookParser.parseWorkbook(markdown);
    
    // Validate if requested
    if (options.validate) {
      validateQuestionBank(questionBank);
    }
    
    // Add metadata
    const output = {
      ...questionBank,
      generatedAt: new Date().toISOString(),
      sourceFile: 'french_dutch_workbook.md',
      stats: {
        totalQuestions: questionBank.categories.reduce((sum, cat) => sum + cat.questions.length, 0),
        totalCategories: questionBank.categories.length,
        questionsByCategory: questionBank.categories.map(cat => ({
          category: cat.name,
          count: cat.questions.length
        }))
      }
    };
    
    // Write JSON file
    console.log('💾 Writing JSON file...');
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
    
    // Print summary
    console.log('\n✅ Conversion complete!');
    console.log(`📊 Total questions: ${output.stats.totalQuestions}`);
    console.log(`📁 Categories: ${output.stats.totalCategories}`);
    console.log('\n📈 Questions per category:');
    output.stats.questionsByCategory.forEach(stat => {
      console.log(`   - ${stat.category}: ${stat.count} questions`);
    });
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

function validateQuestionBank(questionBank) {
  let errors = 0;
  
  questionBank.categories.forEach(category => {
    category.questions.forEach(question => {
      // Validate required fields
      if (!question.dutch || !question.french) {
        console.error(`❌ Question ${question.id} missing translation`);
        errors++;
      }
      
      // Validate difficulty
      if (question.difficulty && (question.difficulty < 1 || question.difficulty > 3)) {
        console.error(`❌ Question ${question.id} has invalid difficulty: ${question.difficulty}`);
        errors++;
      }
      
      // Validate gender for nouns
      if (question.gender && !['m', 'f'].includes(question.gender)) {
        console.error(`❌ Question ${question.id} has invalid gender: ${question.gender}`);
        errors++;
      }
    });
  });
  
  if (errors > 0) {
    throw new Error(`Validation failed with ${errors} errors`);
  }
  
  console.log('✅ All questions validated successfully');
}

// Watch mode
async function watchWorkbook() {
  try {
    const chokidar = await import('chokidar');
    
    console.log('👀 Watching for changes...');
    
    const watcher = chokidar.default.watch(WORKBOOK_PATH, {
      persistent: true
    });
    
    watcher.on('change', async () => {
      console.log('\n🔄 Workbook changed, reconverting...');
      await convertWorkbook();
    });
  } catch (error) {
    console.error('❌ Watch mode requires chokidar. Install with: npm install --save-dev chokidar');
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const options = {
  validate: args.includes('--validate'),
  watch: args.includes('--watch')
};

if (options.watch) {
  convertWorkbook(options).then(() => watchWorkbook());
} else {
  convertWorkbook(options);
}