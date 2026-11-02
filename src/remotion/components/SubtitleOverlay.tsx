import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleSettings, TranscriptSegment, VideoTheme, WordTimestamp } from '@/types';

interface Props {
  transcript?: TranscriptSegment[];
  settings: SubtitleSettings;
  theme: VideoTheme;
}

export const SubtitleOverlay: React.FC<Props> = ({
  transcript = [],
  settings,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!settings.enabled || !transcript || transcript.length === 0) {
    return null;
  }

  const currentTime = frame / fps;

  // Find active segment
  const activeSegment = transcript.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end
  );

  if (!activeSegment) {
    return null;
  }

  // Find active word if available
  const words = activeSegment.words && activeSegment.words.length > 0
    ? activeSegment.words
    : activeSegment.text.split(' ').map((w, i, arr) => {
        const segDur = Math.max(0.1, activeSegment.end - activeSegment.start);
        const wStart = activeSegment.start + (i / arr.length) * segDur;
        const wEnd = activeSegment.start + ((i + 1) / arr.length) * segDur;
        return { word: w, start: wStart, end: wEnd };
      });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: settings.bottomMargin || 320,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: settings.backgroundColor || 'rgba(255, 255, 255, 0.96)',
          border: `1.5px solid ${theme.cardBorder}`,
          borderRadius: settings.style === 'pill' ? 999 : 12,
          padding: '16px 32px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
          maxWidth: '92%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center',
        }}
      >
        {words.map((item, idx) => {
          const isActive = currentTime >= item.start && currentTime <= item.end;
          return (
            <span
              key={`${item.word}-${idx}`}
              style={{
                fontFamily: theme.sansFont,
                fontSize: settings.fontSize || 44,
                fontWeight: isActive ? 800 : 500,
                color: isActive ? theme.accent : theme.textPrimary,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                display: 'inline-block',
                transition: 'all 0.1s ease',
                lineHeight: 1.3,
                textDecoration: isActive ? 'underline' : 'none',
                textDecorationColor: theme.accent,
                textUnderlineOffset: 6,
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
