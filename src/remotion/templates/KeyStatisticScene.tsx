import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const KeyStatisticScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const cardSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const scale = interpolate(numSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(numSpring, [0, 1], [0, 1]);

  const cardY = interpolate(cardSpring, [0, 1], [50, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const visualData: any = scene.visualData || {};
  const statValue = visualData.statValue || scene.mainText.match(/[\d.,]+%?|\d+x|\$\d+[BMK]?/i)?.[0] || '10x';
  const statLabel = visualData.statLabel || scene.mainText;
  const delta = visualData.delta || '+85% FASTER';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        boxSizing: 'border-box',
      }}
    >
      {/* Massive Stat Block */}
      <div
        style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          border: `2px solid ${theme.cardBorder}`,
          borderRadius: 24,
          padding: '60px 48px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
        }}
      >
        {/* Metric category tag */}
        <div
          style={{
            fontSize: 22,
            fontFamily: theme.sansFont,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: theme.accent,
            textTransform: 'uppercase',
          }}
        >
          // KEY PERFORMANCE METRIC
        </div>

        {/* Big Number Display */}
        <div
          style={{
            fontFamily: theme.serifFont,
            fontSize: 130,
            fontWeight: 900,
            color: theme.accent,
            lineHeight: 1,
            transform: `scale(${scale})`,
            opacity,
            letterSpacing: '-0.04em',
            textShadow: '0 8px 30px rgba(200, 16, 46, 0.15)',
          }}
        >
          {statValue}
        </div>

        {/* Delta Pill */}
        <div
          style={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            padding: '8px 24px',
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 800,
            fontFamily: theme.sansFont,
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>▲</span> {delta}
        </div>

        {/* Headline / Explanation */}
        <div
          style={{
            transform: `translateY(${cardY}px)`,
            opacity: cardOpacity,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h2
            style={{
              fontFamily: theme.serifFont,
              fontSize: 48,
              fontWeight: 700,
              color: theme.textPrimary,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {statLabel}
          </h2>

          {scene.supportingText && (
            <p
              style={{
                fontFamily: theme.sansFont,
                fontSize: 30,
                color: theme.textSecondary,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {scene.supportingText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
