import { ResearchResult, ScriptPackage, ScriptSections } from '@/types';

export class SmartScriptEngine {
  generateScripts(research: ResearchResult, targetDuration: number = 60): ScriptPackage {
    const topic = research.topic;
    const summary = research.summary;
    const keyFact = research.keyFacts[0] || '10x performance boost';

    // 1. Natural Spoken Tamil (Tech-creator style, conversational Tamil script with English tech terms)
    const tamilSections: ScriptSections = {
      hook: `OpenAI இப்போ ஒரு மிகப்பெரிய announcement பண்ணிருக்காங்க! இந்த புதிய AI model நிஜமாவே ஒரு game changer-ஆ?`,
      introduction: `ஹலோ techies! இன்னைக்கு tech உலகத்துல ரொம்ப பரபரப்பா பேசப்படுற ஒரு முக்கியமான விஷயத்தை பத்திதான் பாக்கப்போறோம்.`,
      explanation: `இந்த புதிய model-ல complex reasoning மற்றும் logic verification ரொம்பவே fast-ஆ வேலை செய்யுது. பழைய models விட latency ரொம்பவே குறைவு.`,
      facts: `Benchmark test-ல பார்த்தீங்கன்னா ${keyFact} கிடைச்சிருக்கு. அதோட API cost மற்றும் token efficiency முன்ன விட 40% optimize பண்ணிருக்காங்க.`,
      impact: `Developers-க்கு இது ஒரு மிகப்பெரிய advantage. Real-time coding, automated agents, மற்றும் data analysis ரொம்பவே smooth-ஆ மாறும்.`,
      conclusion: `இந்த புதிய model பத்தி நீங்க என்ன நினைக்கிறீங்க? Comment-ல சொல்லுங்க, follow பண்ண மறந்துடாதீங்க!`,
    };

    const tamilFullText = Object.values(tamilSections).join(' ');

    // 2. Casual Tanglish (Spoken Tamil + English mix, tech vocabulary kept natural)
    const tanglishSections: ScriptSections = {
      hook: `Guys, stop scrolling! OpenAI just dropped a brand new AI model, and its reasoning benchmark is absolutely insane!`,
      introduction: `Tech world-ல இன்னைக்கு hottest topic இதுதான். இந்த new architecture-ல அப்படி என்ன special இருக்குன்னு quickly பாக்கலாம்.`,
      explanation: `Normal LLMs விட இதுல chain-of-thought verification internal-ஆ நடக்குது. So coding மற்றும் math problems-ல accuracy ரொம்பவே high.`,
      facts: `Official benchmark data படி, ${keyFact}. Inference speed sub-second level-ல இருக்கு, and token cost-ஐயும் drastically cut பண்ணிருக்காங்க.`,
      impact: `இதனால software engineers மற்றும் startup founders-க்கு real-time autonomous pipelines build பண்றது super easy ஆயிடும்.`,
      conclusion: `இந்த புதிய AI upgrade உங்களுக்கு பயனுள்ளதா இருக்குமா? Let me know in the comments and follow for daily tech updates!`,
    };

    const tanglishFullText = Object.values(tanglishSections).join(' ');

    // 3. Clear Conversational English
    const englishSections: ScriptSections = {
      hook: `OpenAI just made a massive announcement that could change how we build AI applications forever!`,
      introduction: `Welcome back to the studio. Today we're breaking down the architecture and real-world benchmarks of this latest release.`,
      explanation: `Unlike previous generations, this model incorporates continuous autonomous reasoning with integrated verification loops.`,
      facts: `Key numbers you need to know: ${keyFact}, with sub-second time-to-first-token and significantly reduced API pricing.`,
      impact: `For software developers and enterprises, this means faster agent workflows and much more reliable code execution.`,
      conclusion: `What are your thoughts on this new model? Drop a comment below and hit follow for more editorial tech breakdowns!`,
    };

    const englishFullText = Object.values(englishSections).join(' ');

    const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

    return {
      tamil: {
        language: 'tamil',
        fullText: tamilFullText,
        sections: tamilSections,
        estimatedDuration: Math.round((countWords(tamilFullText) / 125) * 60),
        notes: 'Conversational Tamil with technical terms in natural English.',
      },
      tanglish: {
        language: 'tanglish',
        fullText: tanglishFullText,
        sections: tanglishSections,
        estimatedDuration: Math.round((countWords(tanglishFullText) / 135) * 60),
        notes: 'Tanglish tech-creator flow, ideal for Instagram Reels & YouTube Shorts.',
      },
      english: {
        language: 'english',
        fullText: englishFullText,
        sections: englishSections,
        estimatedDuration: Math.round((countWords(englishFullText) / 145) * 60),
        notes: 'Polished editorial English explainer.',
      },
    };
  }
}

export const smartScriptEngine = new SmartScriptEngine();
