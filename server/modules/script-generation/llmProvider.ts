import { CONFIG } from '../../config';
import { ResearchResult, ScriptPackage } from '@/types';
import { smartScriptEngine } from './smartScriptEngine';

export class LLMService {
  async generateScripts(research: ResearchResult, targetDuration: number = 60): Promise<ScriptPackage> {
    // If live API key is provided and LLM_PROVIDER is not 'mock', we can attempt live generation
    if (CONFIG.OPENAI_API_KEY && (CONFIG.LLM_PROVIDER === 'openai' || CONFIG.LLM_PROVIDER === 'auto')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert Tamil & English tech video scriptwriter.
Generate 3 scripts:
1. Tamil: Conversational Sri Lankan/Tamil tech-creator narration written in Tamil script with natural English technical terms.
2. Tanglish: Casual conversational Tamil + English mix written in Tamil script with English technical terms.
3. English: Clear, friendly, dynamic tech explainer.
Each script must have 6 sections: hook, introduction, explanation, facts, impact, conclusion.
Output strictly valid JSON matching { tamil: { hook, introduction, explanation, facts, impact, conclusion }, tanglish: {...}, english: {...} }.`,
              },
              {
                role: 'user',
                content: `Topic: ${research.topic}\nSummary: ${research.summary}\nTarget Duration: ${targetDuration} seconds\nKey Facts: ${research.keyFacts.join(', ')}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed.tamil && parsed.tanglish && parsed.english) {
            const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;
            const tamilText = Object.values(parsed.tamil).join(' ');
            const tanglishText = Object.values(parsed.tanglish).join(' ');
            const englishText = Object.values(parsed.english).join(' ');

            return {
              tamil: {
                language: 'tamil',
                fullText: tamilText,
                sections: parsed.tamil,
                estimatedDuration: Math.round((countWords(tamilText) / 125) * 60),
              },
              tanglish: {
                language: 'tanglish',
                fullText: tanglishText,
                sections: parsed.tanglish,
                estimatedDuration: Math.round((countWords(tanglishText) / 135) * 60),
              },
              english: {
                language: 'english',
                fullText: englishText,
                sections: parsed.english,
                estimatedDuration: Math.round((countWords(englishText) / 145) * 60),
              },
            };
          }
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to SmartScriptEngine:', err);
      }
    }

    // Default high-performance built-in script generator
    return smartScriptEngine.generateScripts(research, targetDuration);
  }
}

export const llmService = new LLMService();
