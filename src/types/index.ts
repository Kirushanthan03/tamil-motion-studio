import { z } from 'zod';

export type ProjectStatus =
  | 'DRAFT_TOPIC'
  | 'RESEARCH_READY'
  | 'SCRIPTS_READY'
  | 'SCRIPT_APPROVED'
  | 'WAITING_FOR_VOICEOVER'
  | 'AUDIO_ALIGNED'
  | 'SCENES_GENERATED'
  | 'PREVIEW_READY'
  | 'RENDERING'
  | 'COMPLETED'
  | 'FAILED';

export type LanguageType = 'tamil' | 'tanglish' | 'english';

export const ResearchSourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  sourceName: z.string(),
  verified: z.boolean().default(true),
  date: z.string().optional(),
});
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

export const ResearchResultSchema = z.object({
  topic: z.string(),
  summary: z.string(),
  sources: z.array(ResearchSourceSchema),
  keyFacts: z.array(z.string()),
  technicalTerms: z.array(z.string()),
  verified: z.boolean(),
  extractedFromUrl: z.boolean().optional(),
});
export type ResearchResult = z.infer<typeof ResearchResultSchema>;

export const ScriptSectionsSchema = z.object({
  hook: z.string(),
  introduction: z.string(),
  explanation: z.string(),
  facts: z.string(),
  impact: z.string(),
  conclusion: z.string(),
});
export type ScriptSections = z.infer<typeof ScriptSectionsSchema>;

export const ScriptVariantSchema = z.object({
  language: z.enum(['tamil', 'tanglish', 'english']),
  fullText: z.string(),
  sections: ScriptSectionsSchema,
  estimatedDuration: z.number(), // in seconds
  notes: z.string().optional(),
});
export type ScriptVariant = z.infer<typeof ScriptVariantSchema>;

export const PlannedSceneBlueprintSchema = z.object({
  sceneNumber: z.number(),
  template: z.enum([
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
  ]),
  mainText: z.string(),
  supportingText: z.string(),
  categoryTag: z.string().optional(),
  entityName: z.string().optional(),
  entityType: z.enum(['person', 'company', 'crypto', 'tech']).optional(),
  visualData: z.record(z.string(), z.any()).optional(),
});
export type PlannedSceneBlueprint = z.infer<typeof PlannedSceneBlueprintSchema>;

export const ScriptPackageSchema = z.object({
  tamil: ScriptVariantSchema,
  tanglish: ScriptVariantSchema,
  english: ScriptVariantSchema,
  visualPlan: z.array(PlannedSceneBlueprintSchema).optional(),
  approvedScript: z.object({
    language: z.enum(['tamil', 'tanglish', 'english']),
    text: z.string(),
    sections: ScriptSectionsSchema,
    approvedAt: z.string(),
  }).optional(),
});
export type ScriptPackage = z.infer<typeof ScriptPackageSchema>;

export const WordTimestampSchema = z.object({
  word: z.string(),
  start: z.number(), // in seconds
  end: z.number(),   // in seconds
  confidence: z.number().optional(),
});
export type WordTimestamp = z.infer<typeof WordTimestampSchema>;

export const TranscriptSegmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  start: z.number(),
  end: z.number(),
  words: z.array(WordTimestampSchema),
});
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

export const AudioMetaSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  path: z.string(),
  duration: z.number(), // seconds
  sampleRate: z.number().optional(),
  channels: z.number().optional(),
  format: z.string().optional(),
  fileSize: z.number().optional(),
  waveformPeaks: z.array(z.number()),
});
export type AudioMeta = z.infer<typeof AudioMetaSchema>;

export type SceneTemplateType =
  | 'headline'
  | 'key-statistic'
  | 'quote'
  | 'timeline'
  | 'comparison'
  | 'process-flow'
  | 'network-nodes'
  | 'architecture'
  | 'device-mockup'
  | 'article-highlight'
  | 'code-snippet'
  | 'conclusion';

export const SceneDefinitionSchema = z.object({
  id: z.string(),
  sceneNumber: z.number(),
  startTime: z.number(),
  endTime: z.number(),
  duration: z.number(),
  startFrame: z.number(),
  durationInFrames: z.number(),
  spokenSegment: z.string(),
  visualConcept: z.string(),
  template: z.enum([
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
  ]),
  mainText: z.string(),
  supportingText: z.string(),
  categoryTag: z.string().optional(),
  sourceAttribution: z.string().optional(),
  animationPreset: z.string().default('editorial-fade'),
  visualData: z.record(z.string(), z.any()).default({}),
});
export type SceneDefinition = z.infer<typeof SceneDefinitionSchema>;

export const VideoThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  background: z.string(),
  paperTexture: z.boolean(),
  accent: z.string(),
  accentSecondary: z.string(),
  textPrimary: z.string(),
  textSecondary: z.string(),
  cardBg: z.string(),
  cardBorder: z.string(),
  cardShadow: z.string(),
  serifFont: z.string(),
  sansFont: z.string(),
});
export type VideoTheme = z.infer<typeof VideoThemeSchema>;

export type AspectRatioType = '9:16' | '16:9';

export const SubtitleSettingsSchema = z.object({
  enabled: z.boolean(),
  fontSize: z.number(),
  bottomMargin: z.number(),
  highlightColor: z.string(),
  textColor: z.string(),
  backgroundColor: z.string(),
  style: z.enum(['pill', 'editorial', 'minimal']),
});
export type SubtitleSettings = z.infer<typeof SubtitleSettingsSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  url: z.string().optional(),
  aspectRatio: z.enum(['9:16', '16:9']).default('9:16'),
  targetDuration: z.number().default(60),
  selectedLanguage: z.enum(['tamil', 'tanglish', 'english']).default('tanglish'),
  status: z.enum([
    'DRAFT_TOPIC',
    'RESEARCH_READY',
    'SCRIPTS_READY',
    'SCRIPT_APPROVED',
    'WAITING_FOR_VOICEOVER',
    'AUDIO_ALIGNED',
    'SCENES_GENERATED',
    'PREVIEW_READY',
    'RENDERING',
    'COMPLETED',
    'FAILED',
  ]),
  research: ResearchResultSchema.optional(),
  scripts: ScriptPackageSchema.optional(),
  audio: AudioMetaSchema.optional(),
  transcript: z.array(TranscriptSegmentSchema).optional(),
  scenes: z.array(SceneDefinitionSchema).optional(),
  themeId: z.string().default('editorial-crimson'),
  subtitleSettings: SubtitleSettingsSchema.default({
    enabled: true,
    fontSize: 48,
    bottomMargin: 320,
    highlightColor: '#C8102E',
    textColor: '#18181B',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    style: 'editorial',
  }),
  renderOutput: z.object({
    videoPath: z.string().optional(),
    videoUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    renderedAt: z.string().optional(),
    fileSize: z.number().optional(),
    renderDurationMs: z.number().optional(),
  }).optional(),
  socialPackage: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    description: z.string(),
    chapters: z.array(z.object({
      time: z.string(),
      title: z.string(),
    })).optional(),
  }).optional(),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;
