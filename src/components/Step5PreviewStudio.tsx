import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { Project, SubtitleSettings, VideoTheme } from '@/types';
import { ReelComposition } from '@/remotion/ReelComposition';
import { VIDEO_THEMES } from '@/remotion/styles/theme';
import { Play, Palette, Type, Shield, Sparkles, ArrowRight, Eye, RefreshCw, Volume2, VolumeX, Music, Zap, Mic, MicOff } from 'lucide-react';

interface Props {
  project: Project;
  onUpdateSettings: (themeId: string, subtitleSettings: SubtitleSettings) => void;
  onTriggerRender: () => void;
  isLoading: boolean;
}

export const Step5PreviewStudio: React.FC<Props> = ({
  project,
  onUpdateSettings,
  onTriggerRender,
  isLoading,
}) => {
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [enableVoiceover, setEnableVoiceover] = useState(true);
  const [enableBgm, setEnableBgm] = useState(true);
  const [enableSfx, setEnableSfx] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(project.themeId || 'editorial-crimson');
  const [subSettings, setSubSettings] = useState<SubtitleSettings>(
    project.subtitleSettings || {
      enabled: true,
      fontSize: 48,
      bottomMargin: 320,
      highlightColor: '#C8102E',
      textColor: '#18181B',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      style: 'editorial',
    }
  );

  const isLandscape = project.aspectRatio === '16:9';
  const compWidth = isLandscape ? 1920 : 1080;
  const compHeight = isLandscape ? 1080 : 1920;
  const scenes = project.scenes || [];
  const durationInFrames = Math.max(90, Math.round((project.audio?.duration || project.targetDuration || 30) * 30));

  const handleThemeChange = (tId: string) => {
    setSelectedTheme(tId);
    onUpdateSettings(tId, subSettings);
  };

  const handleSubChange = (newSubs: Partial<SubtitleSettings>) => {
    const updated = { ...subSettings, ...newSubs };
    setSubSettings(updated);
    onUpdateSettings(selectedTheme, updated);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="flex items-center justify-between pb-6 border-b border-paper-border">
          <div>
            <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
              STEP 05 // REMOTION PREVIEW & POLISHING
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
              Preview, Audio Polish & Editorial Styling
            </h1>
            <p className="text-charcoal-muted text-sm mt-1">
              Live Remotion player preview with Instagram Reels / TikTok overlay safe-zones, kinetic subtitles, background audio ducking, and transition whoosh SFX.
            </p>
          </div>

          <button
            onClick={onTriggerRender}
            disabled={isLoading}
            className="bg-crimson-accent hover:bg-crimson-deep text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-crimson-glow transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>Render Final 1080x1920 MP4</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Studio Layout: Left Player, Right Controls */}
        <div className={`mt-8 grid grid-cols-1 ${isLandscape ? 'lg:grid-cols-12' : 'lg:grid-cols-12'} gap-8 items-start`}>
          {/* Remotion Player Container */}
          <div className={`${isLandscape ? 'lg:col-span-6' : 'lg:col-span-5'} flex flex-col items-center`}>
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 border-charcoal bg-black ${
                isLandscape ? 'w-full aspect-video max-h-[380px]' : 'w-[340px] h-[604px]'
              }`}
            >
              <Player
                component={ReelComposition}
                inputProps={{
                  project,
                  scenes,
                  audioUrl: project.audio?.filename ? `/storage/projects/${project.id}/${project.audio.filename}` : undefined,
                  themeId: selectedTheme,
                  subtitleSettings: subSettings,
                  showSafeZones,
                  enableVoiceover,
                  enableBgm,
                  enableSfx,
                }}
                durationInFrames={durationInFrames}
                fps={30}
                compositionWidth={compWidth}
                compositionHeight={compHeight}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                controls
                autoPlay={false}
                loop
              />
            </div>

            {/* Quick Guide Overlay Button */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-paper-subtle border border-paper-border text-charcoal">
                {isLandscape ? '🖥️ 16:9 Landscape (1920x1080)' : '📱 9:16 Vertical Reel (1080x1920)'}
              </span>

              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border transition-all ${
                  showSafeZones
                    ? 'bg-crimson-accent text-white border-crimson-accent'
                    : 'bg-paper-subtle text-charcoal-muted border-paper-border hover:text-charcoal'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showSafeZones ? 'Hide Safe Guides' : isLandscape ? 'Show YouTube Safe Guides' : 'Show Reels / TikTok Safe Guides'}</span>
              </button>
            </div>
          </div>

          {/* Right Styling & Settings Panel */}
          <div className={`${isLandscape ? 'lg:col-span-6' : 'lg:col-span-7'} space-y-6`}>
            {/* Audio Polish & Sensory Sound Suite */}
            <div className="bg-paper rounded-2xl border border-paper-border p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-paper-border">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-crimson-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                    Audio & Voiceover Controls
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const allMuted = !enableVoiceover && !enableBgm && !enableSfx;
                    if (allMuted) {
                      setEnableVoiceover(true);
                      setEnableBgm(true);
                      setEnableSfx(true);
                    } else {
                      setEnableVoiceover(false);
                      setEnableBgm(false);
                      setEnableSfx(false);
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all ${
                    !enableVoiceover && !enableBgm && !enableSfx
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-paper-pure text-charcoal border-paper-border hover:bg-paper-subtle'
                  }`}
                >
                  {!enableVoiceover && !enableBgm && !enableSfx ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                      <span>Silent Visual Mode (Active)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-crimson-accent" />
                      <span>Mute All Audio (Silent Demo)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Voiceover Master Track */}
                <div className="bg-paper-pure p-3.5 rounded-xl border border-paper-border flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {enableVoiceover ? (
                        <Mic className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <MicOff className="w-4 h-4 text-charcoal-muted" />
                      )}
                      <span className="text-xs font-bold text-charcoal">Voiceover Track</span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted leading-relaxed">
                      {project.audio ? 'Master narration audio' : 'No recorded audio attached'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-paper-border">
                    <span className="text-[10px] font-mono uppercase font-bold text-charcoal-muted">
                      {enableVoiceover ? 'Enabled' : 'Muted'}
                    </span>
                    <input
                      type="checkbox"
                      checked={enableVoiceover}
                      onChange={(e) => setEnableVoiceover(e.target.checked)}
                      className="rounded text-crimson-accent focus:ring-crimson-accent"
                    />
                  </div>
                </div>

                {/* Background Music Bed */}
                <div className="bg-paper-pure p-3.5 rounded-xl border border-paper-border flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-crimson-accent" />
                      <span className="text-xs font-bold text-charcoal">Ambient BGM</span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted leading-relaxed">
                      Lively synth bed with auto speech ducking
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-paper-border">
                    <span className="text-[10px] font-mono uppercase font-bold text-charcoal-muted">
                      {enableBgm ? 'Enabled' : 'Muted'}
                    </span>
                    <input
                      type="checkbox"
                      checked={enableBgm}
                      onChange={(e) => setEnableBgm(e.target.checked)}
                      className="rounded text-crimson-accent focus:ring-crimson-accent"
                    />
                  </div>
                </div>

                {/* Transition SFX */}
                <div className="bg-paper-pure p-3.5 rounded-xl border border-paper-border flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-crimson-accent" />
                      <span className="text-xs font-bold text-charcoal">Whoosh SFX</span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted leading-relaxed">
                      Crisp card-turn whoosh on scene cuts
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-paper-border">
                    <span className="text-[10px] font-mono uppercase font-bold text-charcoal-muted">
                      {enableSfx ? 'Enabled' : 'Muted'}
                    </span>
                    <input
                      type="checkbox"
                      checked={enableSfx}
                      onChange={(e) => setEnableSfx(e.target.checked)}
                      className="rounded text-crimson-accent focus:ring-crimson-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="bg-paper rounded-2xl border border-paper-border p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-crimson-accent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                  Editorial Visual Theme
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.values(VIDEO_THEMES).map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-crimson-accent bg-crimson-50/20 shadow-sm'
                          : 'border-paper-border bg-paper-pure hover:border-charcoal-light'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-bold text-charcoal text-sm">
                          {theme.name}
                        </span>
                        <div className="flex gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: theme.background }}
                          />
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-charcoal-muted line-clamp-1">
                        {theme.id === 'editorial-crimson'
                          ? 'Warm paper, deep red accent'
                          : theme.id === 'dark-editorial'
                          ? 'Deep charcoal, crimson glow'
                          : theme.id === 'cyber-amber'
                          ? 'High-contrast tech amber'
                          : 'Clean monochrome layout'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kinetic Subtitles Settings */}
            <div className="bg-paper rounded-2xl border border-paper-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-crimson-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                    Kinetic Subtitles & Safe Margins
                  </h3>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subSettings.enabled}
                    onChange={(e) => handleSubChange({ enabled: e.target.checked })}
                    className="rounded text-crimson-accent focus:ring-crimson-accent"
                  />
                  <span className="text-xs font-semibold text-charcoal">Enable Subtitles</span>
                </label>
              </div>

              {subSettings.enabled && (
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-charcoal-muted mb-1 font-semibold">
                      <span>Subtitle Font Size</span>
                      <span>{subSettings.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={36}
                      max={64}
                      value={subSettings.fontSize}
                      onChange={(e) => handleSubChange({ fontSize: parseInt(e.target.value, 10) })}
                      className="w-full accent-crimson-accent"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-charcoal-muted mb-1 font-semibold">
                      <span>Reels Safe Bottom Margin (Avoids Instagram UI)</span>
                      <span>{subSettings.bottomMargin}px</span>
                    </div>
                    <input
                      type="range"
                      min={240}
                      max={450}
                      value={subSettings.bottomMargin}
                      onChange={(e) => handleSubChange({ bottomMargin: parseInt(e.target.value, 10) })}
                      className="w-full accent-crimson-accent"
                    />
                  </div>

                  <div className="flex gap-4 pt-1">
                    {(['editorial', 'pill', 'minimal'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => handleSubChange({ style })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                          subSettings.style === style
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-paper-pure text-charcoal border-paper-border hover:bg-paper-subtle'
                        }`}
                      >
                        {style} Box
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scene Timing Overview */}
            <div className="bg-paper rounded-2xl border border-paper-border p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                Scene Sequence ({scenes.length} Scenes)
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {scenes.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-36 bg-paper-pure p-2.5 rounded-xl border border-paper-border text-center"
                  >
                    <span className="text-[10px] font-bold text-crimson-accent block">
                      {s.template.toUpperCase()}
                    </span>
                    <span className="font-serif font-bold text-xs text-charcoal truncate block mt-0.5">
                      {s.mainText}
                    </span>
                    <span className="text-[10px] text-charcoal-muted font-mono block mt-1">
                      {s.duration.toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
