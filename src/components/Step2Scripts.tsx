import React, { useState } from 'react';
import { LanguageType, Project, ScriptPackage, ScriptSections } from '@/types';
import { Copy, Check, RefreshCw, CheckCircle, Clock, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  project: Project;
  onUpdateScripts: (scripts: ScriptPackage) => void;
  onApproveScript: (lang: LanguageType) => void;
  onRegenerateAll: () => void;
  isLoading: boolean;
}

export const Step2Scripts: React.FC<Props> = ({
  project,
  onUpdateScripts,
  onApproveScript,
  onRegenerateAll,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<LanguageType>(project.selectedLanguage || 'tanglish');
  const [copied, setCopied] = useState(false);

  const scripts = project.scripts;
  if (!scripts) {
    return (
      <div className="max-w-4xl mx-auto bg-paper-pure rounded-2xl border border-paper-border p-12 text-center space-y-4 shadow-editorial">
        <Sparkles className="w-12 h-12 text-crimson-accent mx-auto animate-bounce" />
        <h2 className="text-2xl font-serif font-bold text-charcoal">
          Scripts Have Not Been Generated Yet
        </h2>
        <p className="text-charcoal-muted text-sm max-w-md mx-auto">
          Generate fact-based conversational scripts across Tamil, Tanglish, and English tailored to your verified research brief.
        </p>
        <button
          onClick={onRegenerateAll}
          disabled={isLoading}
          className="bg-crimson-accent hover:bg-crimson-deep text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-crimson-glow"
        >
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          <span>Generate 3 Scripts</span>
        </button>
      </div>
    );
  }

  const currentVariant = scripts[activeTab];

  const handleSectionChange = (sectionKey: keyof ScriptSections, val: string) => {
    const updatedSections = {
      ...currentVariant.sections,
      [sectionKey]: val,
    };
    const updatedFullText = Object.values(updatedSections).join(' ');
    const countWords = updatedFullText.split(/\s+/).filter(Boolean).length;
    const rate = activeTab === 'english' ? 145 : 130;

    const updatedPackage: ScriptPackage = {
      ...scripts,
      [activeTab]: {
        ...currentVariant,
        sections: updatedSections,
        fullText: updatedFullText,
        estimatedDuration: Math.round((countWords / rate) * 60),
      },
    };

    onUpdateScripts(updatedPackage);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(currentVariant.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isApproved = project.scripts?.approvedScript?.language === activeTab;

  const sectionLabels: Array<{ key: keyof ScriptSections; label: string; badge: string }> = [
    { key: 'hook', label: 'First 3-Second Hook', badge: '00:00 - 00:03' },
    { key: 'introduction', label: 'Context & Announcement', badge: 'INTRO' },
    { key: 'explanation', label: 'Architecture & Working', badge: 'EXPLANATION' },
    { key: 'facts', label: 'Hard Numbers & Benchmarks', badge: 'KEY FACTS' },
    { key: 'impact', label: 'Why This Matters for Developers', badge: 'IMPACT' },
    { key: 'conclusion', label: 'Takeaway & Follow CTA', badge: 'OUTRO' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="flex items-center justify-between pb-6 border-b border-paper-border">
          <div>
            <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
              STEP 02 // SCRIPT EDITING & APPROVAL
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
              Spoken Script Studio
            </h1>
            <p className="text-charcoal-muted text-sm mt-1">
              Select your spoken language, edit individual narrative sections, and approve the authoritative voiceover reference.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRegenerateAll}
              disabled={isLoading}
              className="bg-paper-subtle hover:bg-paper-border text-charcoal px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-paper-border"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate All</span>
            </button>
            <button
              onClick={handleCopyScript}
              className="bg-paper-subtle hover:bg-paper-border text-charcoal px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-paper-border"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>
        </div>

        {/* 3 Script Tabs */}
        <div className="mt-6 flex border-b border-paper-border">
          <button
            onClick={() => setActiveTab('tanglish')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'tanglish'
                ? 'border-crimson-accent text-crimson-accent bg-crimson-50/20'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <span>Casual Tanglish (Reels Creator)</span>
            <span className="text-xs bg-paper-subtle px-2 py-0.5 rounded text-charcoal-muted">
              {scripts.tanglish.estimatedDuration}s est
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tamil')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'tamil'
                ? 'border-crimson-accent text-crimson-accent bg-crimson-50/20'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <span>Spoken Tamil (Tech Terminology)</span>
            <span className="text-xs bg-paper-subtle px-2 py-0.5 rounded text-charcoal-muted">
              {scripts.tamil.estimatedDuration}s est
            </span>
          </button>

          <button
            onClick={() => setActiveTab('english')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'english'
                ? 'border-crimson-accent text-crimson-accent bg-crimson-50/20'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <span>Conversational English</span>
            <span className="text-xs bg-paper-subtle px-2 py-0.5 rounded text-charcoal-muted">
              {scripts.english.estimatedDuration}s est
            </span>
          </button>
        </div>

        {/* Script Notes and Approver Action Bar */}
        <div className="mt-6 flex items-center justify-between bg-paper p-4 rounded-xl border border-paper-border">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-crimson-accent" />
            <div>
              <span className="text-xs font-bold text-charcoal block">
                {currentVariant.notes || 'Natural tech explainer voiceover script.'}
              </span>
              <span className="text-xs text-charcoal-muted flex items-center gap-1">
                <Clock className="w-3 h-3" /> Estimated reading speed: ~{currentVariant.estimatedDuration} seconds
              </span>
            </div>
          </div>

          <button
            onClick={() => onApproveScript(activeTab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              isApproved
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-crimson-accent hover:bg-crimson-deep text-white shadow-crimson-glow'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isApproved ? 'Approved for Voiceover ✓' : `Approve & Record ${activeTab.toUpperCase()}`}</span>
          </button>
        </div>

        {/* Section by Section Editable Cards */}
        <div className="mt-6 space-y-4">
          {sectionLabels.map(({ key, label, badge }) => (
            <div
              key={key}
              className="bg-paper rounded-xl border border-paper-border p-4 hover:border-paper-border transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    {label}
                  </span>
                  <span className="text-[10px] font-mono bg-paper-border/60 text-charcoal-muted px-2 py-0.5 rounded">
                    {badge}
                  </span>
                </div>
              </div>
              <textarea
                rows={key === 'hook' ? 2 : 3}
                value={currentVariant.sections[key]}
                onChange={(e) => handleSectionChange(key, e.target.value)}
                className="w-full bg-paper-pure p-3.5 rounded-lg border border-paper-border font-serif text-charcoal text-base focus:outline-none focus:ring-2 focus:ring-crimson-accent leading-relaxed resize-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
