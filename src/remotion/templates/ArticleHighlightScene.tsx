import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const ArticleHighlightScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweepSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 60 },
  });

  const sweepProgress = interpolate(sweepSpring, [0, 1], [0, 100]);

  const visualData: any = scene.visualData || {};
  const publication = visualData.publication || 'OFFICIAL TECHNICAL DISCLOSURE';
  const highlightedPhrase = visualData.highlight || scene.mainText;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 70px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          border: `2px solid ${theme.cardBorder}`,
          borderRadius: 24,
          padding: '50px 44px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `2px solid ${theme.textPrimary}`,
            paddingBottom: 8,
            width: '100%',
          }}
        >
          <span style={{ fontSize: 24, color: theme.accent }}>📰</span>
          <span
            style={{
              fontFamily: theme.sansFont,
              fontSize: 20,
              fontWeight: 800,
              color: theme.textPrimary,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {publication}
          </span>
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 48,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
            lineHeight: 1.3,
            position: 'relative',
          }}
        >
          {/* Kinetic Highlighter Underlay */}
          <span
            style={{
              position: 'relative',
              display: 'inline',
              backgroundImage: `linear-gradient(to right, ${theme.accent}30, ${theme.accent}30)`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${sweepProgress}% 100%`,
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {highlightedPhrase}
          </span>
        </h2>

        {scene.supportingText && (
          <p
            style={{
              fontFamily: theme.sansFont,
              fontSize: 26,
              color: theme.textSecondary,
              margin: 0,
              lineHeight: 1.5,
              borderLeft: `3px solid ${theme.accent}`,
              paddingLeft: 16,
            }}
          >
            {scene.supportingText}
          </p>
        )}
      </div>
    </div>
  );
};
