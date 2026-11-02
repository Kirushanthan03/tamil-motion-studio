import { smartScriptEngine } from '../server/modules/script-generation/smartScriptEngine';
import { ResearchResult } from '../src/types';

export function testScriptGeneration() {
  console.log('🧪 Testing Tamil, Tanglish, and English script generation...');

  const mockResearch: ResearchResult = {
    topic: 'OpenAI launches a new AI model',
    summary: 'OpenAI officially introduced a next-generation reasoning model with enhanced multi-step logic.',
    sources: [
      {
        title: 'OpenAI Research',
        url: 'https://openai.com/research',
        snippet: 'Official architecture disclosure and benchmark tests.',
        sourceName: 'openai.com',
        verified: true,
      },
    ],
    keyFacts: ['10x compute efficiency during verification', 'Sub-second first-token latency'],
    technicalTerms: ['Reasoning Engine', 'Token Latency', 'Chain-of-Thought'],
    verified: true,
  };

  const scripts = smartScriptEngine.generateScripts(mockResearch, 60);

  // Check Tamil
  if (!scripts.tamil.fullText.includes('OpenAI') || !/[\u0B80-\u0BFF]/.test(scripts.tamil.fullText)) {
    throw new Error('Tamil script failed Unicode Tamil or English technical term verification');
  }

  // Check Tanglish
  if (!scripts.tanglish.fullText.includes('Guys') || !/[\u0B80-\u0BFF]/.test(scripts.tanglish.fullText)) {
    throw new Error('Tanglish script failed conversational Tanglish verification');
  }

  // Check English
  if (!scripts.english.fullText.includes('OpenAI') || scripts.english.fullText.length < 50) {
    throw new Error('English script failed quality length verification');
  }

  // Check all 6 sections exist
  const sections = ['hook', 'introduction', 'explanation', 'facts', 'impact', 'conclusion'] as const;
  for (const s of sections) {
    if (!scripts.tamil.sections[s] || !scripts.tanglish.sections[s] || !scripts.english.sections[s]) {
      throw new Error(`Missing section ${s} in generated scripts`);
    }
  }

  console.log('✅ Tamil, Tanglish, and English scripts successfully generated & verified');
}
