import { Project, SceneDefinition, SceneTemplateType } from '@/types';

export class ScenePlanner {
  planScenes(project: Project): SceneDefinition[] {
    const transcript = project.transcript || [];
    // User requirement: In the video, visuals and on-screen text must ALWAYS show the English version
    // while the audio voiceover can be in Tamil or Tanglish.
    const englishSections = project.scripts?.english?.sections;
    const fallbackSections = project.scripts?.approvedScript?.sections || project.scripts?.[project.selectedLanguage]?.sections;
    const sections = englishSections || fallbackSections;

    const totalAudioDuration = project.audio?.duration || 30;
    const fps = 30;

    // We plan 5 to 7 varied scenes depending on the narrative structure (strictly English on-screen)
    const sceneConfigs: Array<{
      key: string;
      fallbackText: string;
      preferredTemplates: SceneTemplateType[];
      category: string;
      visualConcept: string;
    }> = [
      {
        key: 'hook',
        fallbackText: sections?.hook || project.topic,
        preferredTemplates: ['headline'],
        category: 'BREAKING TECH',
        visualConcept: 'Editorial Breaking Headline Card with crimson badge',
      },
      {
        key: 'introduction',
        fallbackText: sections?.introduction || 'Tech Architecture Deep Dive',
        preferredTemplates: ['article-highlight', 'device-mockup'],
        category: 'OVERVIEW',
        visualConcept: 'Official Publication Card with kinetic marker highlight sweep',
      },
      {
        key: 'explanation',
        fallbackText: sections?.explanation || 'Neural Reasoning and Latency Architecture',
        preferredTemplates: ['network-nodes', 'architecture'],
        category: 'AI SYSTEM',
        visualConcept: 'Interconnected Graph Nodes with pulsing data packets',
      },
      {
        key: 'facts',
        fallbackText: sections?.facts || '10x Faster Inference Benchmarks',
        preferredTemplates: ['key-statistic', 'comparison'],
        category: 'BENCHMARK METRICS',
        visualConcept: 'Massive animated stat counter with delta performance badge',
      },
      {
        key: 'impact',
        fallbackText: sections?.impact || 'Streamlined Developer Pipelines',
        preferredTemplates: ['process-flow', 'code-snippet', 'timeline'],
        category: 'PIPELINE',
        visualConcept: 'Three-stage developer workflow with active node highlighting',
      },
      {
        key: 'conclusion',
        fallbackText: sections?.conclusion || 'Follow for Daily Tech Breakdowns',
        preferredTemplates: ['conclusion'],
        category: 'SUMMARY',
        visualConcept: 'Checklist verdict card with pulsing follow CTA',
      },
    ];

    const numScenes = sceneConfigs.length;
    const sceneDuration = totalAudioDuration / numScenes;

    const usedTemplates: SceneTemplateType[] = [];

    const scenes: SceneDefinition[] = sceneConfigs.map((cfg, idx) => {
      const startTime = Number((idx * sceneDuration).toFixed(2));
      const endTime = Number((idx === numScenes - 1 ? totalAudioDuration : (idx + 1) * sceneDuration).toFixed(2));
      const duration = Number((endTime - startTime).toFixed(2));
      const startFrame = Math.round(startTime * fps);
      const durationInFrames = Math.round(duration * fps);

      // Select template with variety engine
      let chosenTemplate: SceneTemplateType = cfg.preferredTemplates[0];
      for (const t of cfg.preferredTemplates) {
        if (!usedTemplates.slice(-2).includes(t)) {
          chosenTemplate = t;
          break;
        }
      }
      usedTemplates.push(chosenTemplate);

      // Ensure English text for on-screen visual presentation
      const englishText = englishSections ? (englishSections as any)[cfg.key] || cfg.fallbackText : cfg.fallbackText;

      // Gather matching spoken segment for timing attribution
      const matchingSegments = transcript.filter(
        (seg: any) => (seg.start >= startTime && seg.start < endTime) || (seg.end > startTime && seg.end <= endTime)
      );
      const spokenSegment = matchingSegments.length > 0
        ? matchingSegments.map((s: any) => s.text).join(' ')
        : englishText;

      // Build visual data payload strictly in English
      const visualData = this.buildVisualData(chosenTemplate, englishText, project);

      return {
        id: `scene-${idx + 1}`,
        sceneNumber: idx + 1,
        startTime,
        endTime,
        duration,
        startFrame,
        durationInFrames,
        spokenSegment,
        visualConcept: cfg.visualConcept,
        template: chosenTemplate,
        mainText: this.extractMainText(chosenTemplate, englishText),
        supportingText: this.extractSupportingText(chosenTemplate, englishText, spokenSegment),
        categoryTag: cfg.category,
        sourceAttribution: project.research?.sources?.[0]?.sourceName || 'Tech Dispatch',
        animationPreset: 'editorial-spring',
        visualData,
      };
    });

    return scenes;
  }

  private extractMainText(template: SceneTemplateType, text: string): string {
    const clean = text
      .replace(/Guys, stop scrolling!|Welcome back to the studio|Today we're breaking down/gi, '')
      .replace(/[\u0B80-\u0BFF]/g, '') // Strip any stray Tamil characters from visual headlines
      .trim();

    if (template === 'key-statistic') {
      return '10x Faster Inference Latency';
    }
    if (template === 'headline') {
      return (clean || 'Major Technology Announcement').slice(0, 75);
    }
    return (clean || 'Architecture & System Overview').slice(0, 65);
  }

  private extractSupportingText(template: SceneTemplateType, fallback: string, spoken: string): string {
    const source = (spoken && spoken.length > 20 && !/[\u0B80-\u0BFF]/.test(spoken)) ? spoken : fallback;
    const clean = source.replace(/[\u0B80-\u0BFF]/g, '').trim();
    if (clean.length > 20) {
      return clean.slice(0, 110) + (clean.length > 110 ? '...' : '');
    }
    return fallback.slice(0, 100);
  }

  private buildVisualData(template: SceneTemplateType, text: string, project: Project): Record<string, any> {
    switch (template) {
      case 'headline':
        return {
          badge: 'BREAKING TECH DISCLOSURE',
        };
      case 'key-statistic':
        return {
          statValue: '10x',
          statLabel: 'Reasoning Latency Reduction',
          delta: '+85% THROUGHPUT',
        };
      case 'network-nodes':
        return {
          nodes: [
            { id: '1', label: 'User Query', x: 140, y: 160, type: 'input' },
            { id: '2', label: 'Vector RAG Index', x: 420, y: 100, type: 'context' },
            { id: '3', label: 'Reasoning Model', x: 420, y: 220, type: 'model' },
            { id: '4', label: 'Verified Output', x: 700, y: 160, type: 'output' },
          ],
        };
      case 'comparison':
        return {
          leftTitle: 'Traditional LLM',
          rightTitle: 'Reasoning Architecture',
          leftPoints: ['Hallucination prone', 'High token costs', 'Fixed context'],
          rightPoints: ['Verified logic loops', '40% cost reduction', 'Sub-second latency'],
        };
      case 'process-flow':
        return {
          steps: [
            { num: '01', title: 'Data Ingestion', text: 'Live multi-source ingestion' },
            { num: '02', title: 'AI Verification', text: 'Automated benchmark checks' },
            { num: '03', title: 'Video Synthesis', text: 'Synchronized Remotion render' },
          ],
        };
      case 'article-highlight':
        return {
          publication: project.research?.sources?.[0]?.sourceName?.toUpperCase() || 'OFFICIAL RESEARCH DISCLOSURE',
          highlight: text.slice(0, 50),
        };
      case 'timeline':
        return {
          events: [
            { year: '2023', title: 'GPT-4 & LLM Boom', desc: 'Text-first chat assistants' },
            { year: '2024', title: 'Multimodal Frontier', desc: 'Audio, Vision, Code agents' },
            { year: '2026', title: 'Autonomous Reasoning', desc: 'Self-correcting pipelines' },
          ],
        };
      case 'code-snippet':
        return {
          filename: 'reasoningPipeline.ts',
          codeLines: [
            'const model = await OpenAI.models.create({',
            '  architecture: "reasoning-engine",',
            '  verificationLoop: true,',
            '  targetLatencyMs: 180',
            '});',
          ],
        };
      case 'conclusion':
        return {
          takeaways: [
            'Sub-second reasoning latency achieved',
            'Integrated verification reduces errors',
            'Enterprise APIs available immediately',
          ],
          cta: 'FOLLOW FOR TECH EXPLAINERS',
        };
      default:
        return {};
    }
  }
}

export const scenePlanner = new ScenePlanner();
