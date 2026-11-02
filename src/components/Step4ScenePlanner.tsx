import React from 'react';
import { Project, SceneDefinition, SceneTemplateType } from '@/types';
import { LayoutGrid, Sparkles, ArrowRight, RefreshCw, Layers, Edit3 } from 'lucide-react';

interface Props {
  project: Project;
  onPlanScenes: () => void;
  onUpdateScenes: (scenes: SceneDefinition[]) => void;
  onNext: () => void;
  isLoading: boolean;
}

const TEMPLATE_OPTIONS: Array<{ value: SceneTemplateType; label: string; icon: string }> = [
  { value: 'headline', label: 'Breaking Headline Card', icon: '📰' },
  { value: 'key-statistic', label: 'Key Statistic Counter', icon: '📊' },
  { value: 'quote', label: 'Editorial Quote Card', icon: '💬' },
  { value: 'timeline', label: 'Chronological Timeline', icon: '⏳' },
  { value: 'comparison', label: 'Side-by-Side Comparison', icon: '⚖️' },
  { value: 'process-flow', label: 'Multi-Step Process Flow', icon: '🔄' },
  { value: 'network-nodes', label: 'AI Architecture & Nodes', icon: '🧠' },
  { value: 'architecture', label: 'System Stack Layers', icon: '🏢' },
  { value: 'device-mockup', label: 'Device / UI Mockup', icon: '📱' },
  { value: 'article-highlight', label: 'Article Highlight Sweep', icon: '🖍️' },
  { value: 'code-snippet', label: 'Terminal / Code Snippet', icon: '💻' },
  { value: 'conclusion', label: 'Verdict & Summary Card', icon: '🎯' },
];

export const Step4ScenePlanner: React.FC<Props> = ({
  project,
  onPlanScenes,
  onUpdateScenes,
  onNext,
  isLoading,
}) => {
  const scenes = project.scenes || [];

  const handleTemplateChange = (sceneIndex: number, newTemplate: SceneTemplateType) => {
    const updated = [...scenes];
    updated[sceneIndex] = {
      ...updated[sceneIndex],
      template: newTemplate,
    };
    onUpdateScenes(updated);
  };

  const handleTextChange = (sceneIndex: number, field: 'mainText' | 'supportingText', val: string) => {
    const updated = [...scenes];
    updated[sceneIndex] = {
      ...updated[sceneIndex],
      [field]: val,
    };
    onUpdateScenes(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="flex items-center justify-between pb-6 border-b border-paper-border">
          <div>
            <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
              STEP 04 // AI SCENE COMPOSITION
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
              Semantic Scene Planning
            </h1>
            <p className="text-charcoal-muted text-sm mt-1">
              Your video is automatically segmented into meaningful scenes synchronized with the voiceover. Adjust templates, headlines, and visual concepts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPlanScenes}
              disabled={isLoading}
              className="bg-paper-subtle hover:bg-paper-border text-charcoal px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-paper-border"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{scenes.length > 0 ? 'Regenerate Scenes' : 'Plan Scenes'}</span>
            </button>

            {scenes.length > 0 && (
              <button
                onClick={onNext}
                className="bg-charcoal hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm"
              >
                <span>Advance to Preview Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {scenes.length === 0 ? (
          <div className="mt-8 text-center py-12 bg-paper rounded-2xl border border-dashed border-paper-border space-y-4">
            <Layers className="w-12 h-12 text-crimson-accent mx-auto" />
            <h3 className="font-serif font-bold text-xl text-charcoal">
              No Scenes Planned Yet
            </h3>
            <p className="text-charcoal-muted text-sm max-w-md mx-auto">
              Click the button below to segment your audio and assign semantic motion graphic templates automatically.
            </p>
            <button
              onClick={onPlanScenes}
              disabled={isLoading}
              className="bg-crimson-accent hover:bg-crimson-deep text-white px-6 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 shadow-crimson-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Plan Motion Scenes</span>
            </button>
          </div>
        ) : (
          /* Scene Cards List */
          <div className="mt-6 space-y-5">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id || idx}
                className="bg-paper rounded-2xl border border-paper-border p-6 space-y-4 hover:border-crimson-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-crimson-accent text-white text-xs font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                        {scene.categoryTag || 'SCENE'}
                      </span>
                      <span className="text-xs font-mono text-charcoal-muted ml-3">
                        {scene.startTime.toFixed(1)}s → {scene.endTime.toFixed(1)}s ({scene.duration.toFixed(1)}s)
                      </span>
                    </div>
                  </div>

                  {/* Template Picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-charcoal-muted">Template:</span>
                    <select
                      value={scene.template}
                      onChange={(e) => handleTemplateChange(idx, e.target.value as SceneTemplateType)}
                      className="bg-paper-pure text-xs font-bold text-charcoal border border-paper-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-crimson-accent"
                    >
                      {TEMPLATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Spoken segment citation */}
                <div className="text-xs text-charcoal-muted bg-paper-subtle p-2.5 rounded-lg border border-paper-border font-serif italic">
                  Narration: "{scene.spokenSegment}"
                </div>

                {/* Main Headline */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                    On-Screen Headline
                  </label>
                  <input
                    type="text"
                    value={scene.mainText}
                    onChange={(e) => handleTextChange(idx, 'mainText', e.target.value)}
                    className="w-full bg-paper-pure p-3 rounded-lg border border-paper-border font-serif text-lg font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-crimson-accent"
                  />
                </div>

                {/* Supporting Text */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                    Supporting Text
                  </label>
                  <input
                    type="text"
                    value={scene.supportingText}
                    onChange={(e) => handleTextChange(idx, 'supportingText', e.target.value)}
                    className="w-full bg-paper-pure p-2.5 rounded-lg border border-paper-border font-sans text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-crimson-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
