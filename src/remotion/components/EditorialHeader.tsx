import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { VideoTheme } from '@/types';

interface Props {
  theme: VideoTheme;
  categoryTag?: string;
  sourceAttribution?: string;
  currentScene: number;
  totalScenes: number;
  totalDurationFrames: number;
}

export const EditorialHeader: React.FC<Props> = ({
  theme,
  categoryTag = 'TECH REPORT',
  sourceAttribution,
  currentScene,
  totalScenes,
  totalDurationFrames,
}) => {
  const frame = useCurrentFrame();

  const progress = Math.min(1, Math.max(0, frame / Math.max(1, totalDurationFrames)));

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 70,
        right: 70,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 50,
      }}
    >
      {/* Top Bar with category pill, scene counter, and source attribution */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: theme.sansFont,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: 4,
            }}
          >
            {categoryTag}
          </span>

          {sourceAttribution && (
            <span
              style={{
                fontSize: 18,
                color: theme.textSecondary,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
              VERIFIED: {sourceAttribution}
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 22,
            fontFamily: theme.serifFont,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: '0.05em',
          }}
        >
          {String(currentScene).padStart(2, '0')} / {String(totalScenes).padStart(2, '0')}
        </div>
      </div>

      {/* Thin Editorial Progress Bar */}
      <div
        style={{
          width: '100%',
          height: 3,
          backgroundColor: `${theme.accent}20`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: theme.accent,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
};
