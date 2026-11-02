import { SceneDefinitionSchema, SceneTemplateType } from '../src/types';

export function testSceneSchemas() {
  console.log('🧪 Testing Scene Zod Schemas across all 12 motion templates...');

  const templates: SceneTemplateType[] = [
    'headline',
    'key-statistic',
    'quote',
    'timeline',
    'comparison',
    'process-flow',
    'network-nodes',
    'architecture',
    'device-mockup',
    'article-highlight',
    'code-snippet',
    'conclusion',
  ];

  for (const template of templates) {
    const mockScene = {
      id: `test-${template}`,
      sceneNumber: 1,
      startTime: 0,
      endTime: 5,
      duration: 5,
      startFrame: 0,
      durationInFrames: 150,
      spokenSegment: 'Test spoken Tamil segment தமிழ் உரை',
      visualConcept: `Test visual concept for ${template}`,
      template,
      mainText: 'OpenAI Reasoning Model Announcement',
      supportingText: 'Sub-second latency benchmarks for developers',
      categoryTag: 'AI UPDATE',
      sourceAttribution: 'TechCrunch',
      animationPreset: 'editorial-spring',
      visualData: { testKey: 'testValue' },
    };

    const parsed = SceneDefinitionSchema.safeParse(mockScene);
    if (!parsed.success) {
      throw new Error(`Zod validation failed for template "${template}": ${parsed.error.message}`);
    }
  }

  console.log(`✅ All 12 scene templates passed Zod schema validation`);
}
