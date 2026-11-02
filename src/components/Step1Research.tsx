import React, { useState } from 'react';
import { Project } from '@/types';
import { Search, Globe, Sparkles, ExternalLink, ShieldCheck, AlertTriangle, ArrowRight, Clock } from 'lucide-react';

interface Props {
  project: Project;
  onUpdateProject: (p: Project) => void;
  onNext: () => void;
  isLoading: boolean;
  onRunResearch: () => void;
}

const TRENDING_TOPICS = [
  'OpenAI launches a new AI model with autonomous reasoning',
  'DeepSeek-V3 Architecture: 671B MoE with Multi-Head Latent Attention',
  'NVIDIA Blackwell Architecture: 30x AI Inference Acceleration',
  'Anthropic Claude 3.7 Hybrid Reasoning & Real-time Coding',
  'Apple Intelligence: On-Device Small Language Models & Privacy',
];

export const Step1Research: React.FC<Props> = ({
  project,
  onUpdateProject,
  onNext,
  isLoading,
  onRunResearch,
}) => {
  const [topicInput, setTopicInput] = useState(project.topic || '');
  const [urlInput, setUrlInput] = useState(project.url || '');
  const [inputType, setInputType] = useState<'topic' | 'url'>(project.url ? 'url' : 'topic');

  const handleApplyTrending = (t: string) => {
    setTopicInput(t);
    onUpdateProject({ ...project, topic: t, url: undefined });
  };

  const handleSaveInputs = () => {
    onUpdateProject({
      ...project,
      topic: topicInput,
      url: inputType === 'url' ? urlInput : undefined,
    });
  };

  const research = project.research;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header Card */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="flex items-center justify-between pb-6 border-b border-paper-border">
          <div>
            <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
              STEP 01 // FACT VERIFICATION
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
              Topic Input & Autonomous Research
            </h1>
            <p className="text-charcoal-muted text-sm mt-1">
              Input a headline, trending subject, or article URL. Our engine retrieves official sources and builds fact-checked briefs for scriptwriting.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-charcoal-muted">Target Duration:</span>
            {[30, 45, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateProject({ ...project, targetDuration: sec })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  project.targetDuration === sec
                    ? 'bg-crimson-accent text-white shadow-sm'
                    : 'bg-paper-subtle text-charcoal hover:bg-paper-border'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setInputType('topic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              inputType === 'topic'
                ? 'bg-charcoal text-white'
                : 'bg-paper-subtle text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Search className="w-4 h-4" /> Topic / Headline
          </button>
          <button
            onClick={() => setInputType('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              inputType === 'url'
                ? 'bg-charcoal text-white'
                : 'bg-paper-subtle text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Globe className="w-4 h-4" /> Article URL Extraction
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          {inputType === 'topic' ? (
            <div>
              <label className="block text-xs font-bold tracking-wider text-charcoal uppercase mb-2">
                Subject or News Headline
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onBlur={handleSaveInputs}
                  placeholder="e.g. OpenAI launches a new AI model..."
                  className="flex-1 bg-paper px-4 py-3 rounded-xl border border-paper-border font-serif text-lg text-charcoal placeholder-charcoal-light focus:outline-none focus:ring-2 focus:ring-crimson-accent"
                />
                <button
                  onClick={onRunResearch}
                  disabled={isLoading || !topicInput.trim()}
                  className="bg-crimson-accent hover:bg-crimson-deep text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span>Research Source</span>
                </button>
              </div>

              {/* Trending suggestions */}
              <div className="mt-4">
                <span className="text-xs font-bold text-charcoal-light uppercase tracking-wider block mb-2">
                  Trending Tech Subjects:
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TOPICS.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyTrending(t)}
                      className="text-xs bg-paper-subtle hover:bg-crimson-50 hover:text-crimson-accent border border-paper-border px-3 py-1.5 rounded-full transition-all text-charcoal text-left"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold tracking-wider text-charcoal uppercase mb-2">
                Target Publication URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onBlur={handleSaveInputs}
                  placeholder="https://techcrunch.com/2026/03/openai-announces-new-model..."
                  className="flex-1 bg-paper px-4 py-3 rounded-xl border border-paper-border font-mono text-sm text-charcoal placeholder-charcoal-light focus:outline-none focus:ring-2 focus:ring-crimson-accent"
                />
                <button
                  onClick={onRunResearch}
                  disabled={isLoading || !urlInput.trim()}
                  className="bg-crimson-accent hover:bg-crimson-deep text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                  <span>Extract & Verify</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Research Results Brief */}
      {research && (
        <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {research.verified ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  OFFICIAL SOURCES VERIFIED
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  UNVERIFIED TOPIC - CONFIRMATION REQUIRED
                </div>
              )}
              <span className="text-xs text-charcoal-muted">
                {research.sources.length} Verified Sources Found
              </span>
            </div>

            <button
              onClick={onNext}
              className="bg-charcoal hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <span>Advance to Script Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Research Summary Box */}
          <div className="bg-paper rounded-xl p-6 border border-paper-border">
            <h3 className="text-xs font-bold tracking-widest text-charcoal-light uppercase mb-2">
              Verified Executive Brief:
            </h3>
            <p className="font-serif text-charcoal text-lg leading-relaxed">
              {research.summary}
            </p>
          </div>

          {/* Key Facts & Numbers */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-charcoal uppercase mb-3">
              Extracted Benchmark Data & Claims
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {research.keyFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className="bg-paper-subtle p-3.5 rounded-lg border border-paper-border text-sm text-charcoal flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-crimson-accent mt-1.5 flex-shrink-0" />
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Attribution Cards with Clickable Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-charcoal uppercase mb-3">
              Source Citations & Documentation
            </h4>
            <div className="space-y-2">
              {research.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-3.5 bg-paper rounded-xl border border-paper-border hover:border-crimson-300 hover:bg-crimson-50/30 transition-all text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-paper-subtle text-xs font-bold flex items-center justify-center text-charcoal-muted group-hover:text-crimson-accent">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-charcoal group-hover:text-crimson-accent">
                        {src.title}
                      </span>
                      <span className="text-xs text-charcoal-muted ml-3">
                        [{src.sourceName}]
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-charcoal-light group-hover:text-crimson-accent" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
