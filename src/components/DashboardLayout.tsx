import React from 'react';
import { Project } from '@/types';
import { Video, Plus, FolderKanban, ShieldCheck } from 'lucide-react';

interface Props {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({
  currentProject,
  projects,
  onSelectProject,
  onNewProject,
  children,
}) => {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      {/* Editorial Top Navigation */}
      <header className="bg-paper-pure border-b border-paper-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-crimson-accent text-white flex items-center justify-center shadow-crimson-glow font-serif text-2xl font-black">
              ர
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl text-charcoal tracking-tight">
                  TAMIL MOTION STUDIO
                </span>
                <span className="text-[10px] bg-crimson-accent text-white font-mono font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                  REELS 9:16
                </span>
              </div>
              <span className="text-xs text-charcoal-muted font-medium block">
                Editorial Motion Graphics Studio for Tamil Tech Content Creators
              </span>
            </div>
          </div>

          {/* Project Selector & Actions */}
          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <div className="flex items-center gap-2 bg-paper px-3 py-1.5 rounded-xl border border-paper-border text-xs">
                <FolderKanban className="w-4 h-4 text-charcoal-muted" />
                <select
                  value={currentProject?.id || ''}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="bg-transparent font-semibold text-charcoal focus:outline-none cursor-pointer max-w-[220px] truncate"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.topic}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onNewProject}
              className="bg-charcoal hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Reel Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 py-8 px-6">{children}</main>

      {/* Editorial Footer */}
      <footer className="bg-paper-pure border-t border-paper-border py-4 px-8 text-center text-xs text-charcoal-muted">
        <span>
          Tamil & English Motion Graphics Studio // Deterministic Remotion Engine // 1080x1920 Vertical
        </span>
      </footer>
    </div>
  );
};
