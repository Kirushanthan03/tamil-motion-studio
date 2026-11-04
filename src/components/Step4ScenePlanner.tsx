import React, { useRef, useState } from 'react';
import { Project, SceneDefinition, SceneTemplateType } from '@/types';
import { LayoutGrid, Sparkles, ArrowRight, RefreshCw, Layers, Edit3, Image as ImageIcon, Trash2, Upload, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

interface Props {
  project: Project;
  onPlanScenes: () => void;
  onUpdateScenes: (scenes: SceneDefinition[]) => void;
  onProjectRefresh: () => Promise<void> | void;
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
  onProjectRefresh,
  onNext,
  isLoading,
}) => {
  const scenes = project.scenes || [];
  const [uploadingSceneId, setUploadingSceneId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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

  const handleImageFileSelected = async (sceneId: string, file: File) => {
    try {
      setUploadingSceneId(sceneId);
      await api.uploadSceneImage(project.id, sceneId, file);
      await onProjectRefresh();
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingSceneId(null);
    }
  };

  const handleRemoveImage = async (sceneId: string) => {
    if (!confirm('Are you sure you want to remove this attached image?')) return;
    try {
      setUploadingSceneId(sceneId);
      await api.removeSceneImage(project.id, sceneId);
      await onProjectRefresh();
    } catch (err: any) {
      alert(`Could not remove image: ${err.message}`);
    } finally {
      setUploadingSceneId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="flex items-center justify-between pb-6 border-b border-paper-border">
          <div>
            <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
              STEP 04 // AI SCENE COMPOSITION & FRAME EDITING
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
              Semantic Scene Planning & Visual Frames
            </h1>
            <p className="text-charcoal-muted text-sm mt-1">
              Your video is segmented into meaningful scenes synchronized with the voiceover. Customize headlines, switch templates, or attach custom diagrams & images.
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
          <div className="mt-6 space-y-6">
            {scenes.map((scene, idx) => {
              const hasImage = Boolean(scene.visualData?.imageUrl);
              const isUploadingThis = uploadingSceneId === scene.id;

              return (
                <div
                  key={scene.id || idx}
                  className="bg-paper rounded-2xl border border-paper-border p-6 space-y-5 hover:border-crimson-300 transition-all"
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

                  {/* Detected Entity Spotlight (Person Portrait or Company Logo) */}
                  {scene.visualData?.entity && (
                    <div className="flex items-center gap-2.5 bg-paper-pure border border-paper-border rounded-xl px-3.5 py-2 text-xs">
                      {scene.visualData.entity.imageUrl ? (
                        <img
                          src={scene.visualData.entity.imageUrl}
                          alt={scene.visualData.entity.name}
                          className="w-6 h-6 rounded-full object-cover border-2 border-crimson-500 shadow-sm"
                        />
                      ) : scene.visualData.entity.logoUrl ? (
                        <div className="w-6 h-6 rounded-md bg-white p-0.5 border border-paper-border flex items-center justify-center">
                          <img
                            src={scene.visualData.entity.logoUrl}
                            alt={scene.visualData.entity.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : null}
                      <div>
                        <span className="font-bold text-charcoal mr-2">
                          {scene.visualData.entity.name}
                        </span>
                        <span className="text-charcoal-muted text-[11px]">
                          {scene.visualData.entity.roleOrSubtitle}
                        </span>
                      </div>
                      <span className="ml-auto text-[10px] font-mono uppercase bg-crimson-50 text-crimson-accent border border-crimson-200 px-2 py-0.5 rounded font-bold">
                        {scene.visualData.entity.badge || (scene.visualData.entity.type === 'person' ? 'PORTRAIT' : 'LOGO')}
                      </span>
                    </div>
                  )}

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

                  {/* Frame Visual / Custom Image Attachment */}
                  <div className="pt-2 border-t border-paper-border/70">
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[scene.id] = el;
                      }}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFileSelected(scene.id, e.target.files[0]);
                        }
                      }}
                    />

                    {hasImage ? (
                      <div className="bg-paper-pure rounded-xl p-3 border border-paper-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-16 h-12 rounded-lg bg-black/10 overflow-hidden flex-shrink-0 border border-paper-border">
                            <img
                              src={scene.visualData.imageUrl}
                              alt="Scene graphic"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-charcoal block truncate">
                              Custom Attached Graphic
                            </span>
                            <span className="text-[11px] text-charcoal-muted font-mono truncate block">
                              {scene.visualData.imageUrl}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[scene.id]?.click()}
                            disabled={isUploadingThis}
                            className="bg-paper-subtle hover:bg-paper-border text-charcoal px-3 py-1.5 rounded-lg text-xs font-semibold border border-paper-border"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(scene.id)}
                            disabled={isUploadingThis}
                            className="text-crimson-accent hover:bg-crimson-50 p-1.5 rounded-lg border border-transparent hover:border-crimson-200 transition-all"
                            title="Remove Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-charcoal-muted">
                          Want to showcase a custom architecture diagram, screenshot, or product mockup?
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[scene.id]?.click()}
                          disabled={isUploadingThis}
                          className="bg-paper-pure hover:bg-paper-subtle text-charcoal border border-paper-border px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-crimson-accent" />
                          <span>Attach Diagram / Image</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
