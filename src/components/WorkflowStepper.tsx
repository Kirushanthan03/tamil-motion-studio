import React from 'react';
import { ProjectStatus } from '@/types';
import { Search, FileText, Mic, LayoutGrid, PlayCircle, Download, CheckCircle2 } from 'lucide-react';

interface Props {
  currentStatus: ProjectStatus;
  activeStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
}

export const WorkflowStepper: React.FC<Props> = ({
  currentStatus,
  activeStepIndex,
  onSelectStep,
}) => {
  const steps = [
    { label: 'Topic & Research', icon: Search, id: 0 },
    { label: 'Scripts Studio', icon: FileText, id: 1 },
    { label: 'Voiceover & Timing', icon: Mic, id: 2 },
    { label: 'Scene Planner', icon: LayoutGrid, id: 3 },
    { label: 'Preview & Styles', icon: PlayCircle, id: 4 },
    { label: 'Export & Render', icon: Download, id: 5 },
  ];

  return (
    <div className="w-full bg-paper-pure border-b border-paper-border px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStepIndex === idx;
          const isCompleted = activeStepIndex > idx;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onSelectStep(idx)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-crimson-50 text-crimson-700 border border-crimson-200 shadow-sm'
                    : isCompleted
                    ? 'text-charcoal hover:bg-paper-subtle'
                    : 'text-charcoal-light hover:text-charcoal opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-crimson-accent text-white shadow-crimson-glow'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-paper-subtle text-charcoal-muted'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold">{step.label}</span>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    activeStepIndex > idx ? 'bg-crimson-accent' : 'bg-paper-border'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
