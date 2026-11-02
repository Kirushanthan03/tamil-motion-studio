import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { Project, VideoTheme } from '@/types';
import { VIDEO_THEMES, DEFAULT_THEME } from './styles/theme';
import { BackgroundTexture } from './components/BackgroundTexture';
import { EditorialHeader } from './components/EditorialHeader';
import { SubtitleOverlay } from './components/SubtitleOverlay';
import { SceneRenderer } from './SceneRenderer';
import { WHOOSH_SFX_URI, AMBIENT_BED_URI } from './audio/audioAssets';

export interface ReelCompositionProps {
  project?: Project;
  scenes?: Project['scenes'];
  audioUrl?: string;
  themeId?: string;
  subtitleSettings?: Project['subtitleSettings'];
  showSafeZones?: boolean;
  enableBgm?: boolean;
  enableSfx?: boolean;
}

export const ReelComposition: React.FC<ReelCompositionProps> = ({
  project,
  scenes: propsScenes,
  audioUrl: propsAudioUrl,
  themeId: propsThemeId,
  subtitleSettings: propsSubtitleSettings,
  showSafeZones = false,
  enableBgm = true,
  enableSfx = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const themeId = propsThemeId || project?.themeId || 'editorial-crimson';
  const theme: VideoTheme = VIDEO_THEMES[themeId] || DEFAULT_THEME;
  const scenes = propsScenes || project?.scenes || [];
  const subtitleSettings = propsSubtitleSettings || project?.subtitleSettings || {
    enabled: true,
    fontSize: 48,
    bottomMargin: 320,
    highlightColor: '#C8102E',
    textColor: '#18181B',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    style: 'editorial',
  };

  const audioUrl = propsAudioUrl || (project?.audio?.filename ? `/storage/projects/${project.id}/${project.audio.filename}` : undefined);

  // Find current scene index for header display
  const currentSceneIndex = scenes.findIndex(
    (s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames
  );
  const activeSceneNumber = currentSceneIndex >= 0 ? currentSceneIndex + 1 : 1;
  const currentScene = scenes[currentSceneIndex >= 0 ? currentSceneIndex : 0];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        overflow: 'hidden',
        width,
        height,
      }}
    >
      {/* Background paper texture & fine dot grid */}
      <BackgroundTexture theme={theme} width={width} height={height} />

      {/* Voiceover Master Audio */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Ambient Lo-Fi / Editorial Background Bed with Dynamic Speech Ducking */}
      {enableBgm && (
        <Audio
          src={AMBIENT_BED_URI}
          loop
          volume={(f) => {
            const hasSpeech = project?.transcript?.some((seg) => {
              const startF = Math.round(seg.start * fps);
              const endF = Math.round(seg.end * fps);
              return f >= startF - 6 && f <= endF + 6;
            });
            // Duck volume down to 3.5% during speech; swell up to 16% in pauses
            return hasSpeech ? 0.035 : 0.16;
          }}
        />
      )}

      {/* Editorial Scene Transition Whoosh SFX */}
      {enableSfx &&
        scenes.map((scene, idx) => {
          if (idx === 0) return null;
          return (
            <Sequence
              key={`whoosh-${scene.id || idx}`}
              from={scene.startFrame}
              durationInFrames={15}
            >
              <Audio src={WHOOSH_SFX_URI} volume={0.25} />
            </Sequence>
          );
        })}

      {/* Editorial Top Header */}
      <EditorialHeader
        theme={theme}
        categoryTag={currentScene?.categoryTag || 'TECH EXPLAINER'}
        sourceAttribution={currentScene?.sourceAttribution || project?.research?.sources?.[0]?.sourceName}
        currentScene={activeSceneNumber}
        totalScenes={Math.max(1, scenes.length)}
        totalDurationFrames={durationInFrames}
      />

      {/* Sequential Scenes */}
      {scenes.map((scene, index) => {
        return (
          <Sequence
            key={scene.id || index}
            from={scene.startFrame}
            durationInFrames={scene.durationInFrames}
          >
            <SceneRenderer scene={scene} theme={theme} />
          </Sequence>
        );
      })}

      {/* Subtitles Overlay */}
      <SubtitleOverlay
        transcript={project?.transcript}
        settings={subtitleSettings}
        theme={theme}
      />

      {/* Instagram Reels / TikTok Safe Zone Guide for Studio Preview */}
      {showSafeZones && (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 999 }}>
          {/* Top Reels Overlay: Avatar & Header */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 140,
              borderBottom: '2px dashed rgba(239, 68, 68, 0.6)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              fontFamily: 'monospace',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            ⚠️ TOP SAFE ZONE (REELS HEADER / STATUS BAR)
          </div>

          {/* Right Action Buttons (Like, Comment, Share) */}
          <div
            style={{
              position: 'absolute',
              top: 200,
              right: 0,
              width: 140,
              bottom: 340,
              borderLeft: '2px dashed rgba(239, 68, 68, 0.6)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              writingMode: 'vertical-rl',
              color: '#EF4444',
              fontFamily: 'monospace',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            ⚠️ RIGHT ACTION BUTTONS SAFE ZONE
          </div>

          {/* Bottom Caption & Audio Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 320,
              borderTop: '2px dashed rgba(239, 68, 68, 0.6)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              fontFamily: 'monospace',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            ⚠️ BOTTOM CAPTION / MUSIC SAFE ZONE
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
