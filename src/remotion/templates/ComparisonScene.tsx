import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const ComparisonScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const rightSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const leftX = interpolate(leftSpring, [0, 1], [-40, 0]);
  const rightX = interpolate(rightSpring, [0, 1], [40, 0]);

  const visualData: any = scene.visualData || {};
  const leftTitle = visualData.leftTitle || 'TRADITIONAL METHOD';
  const rightTitle = visualData.rightTitle || 'NEW ARCHITECTURE';
  const leftPoints = visualData.leftPoints || ['Slow manual prompts', 'High token costs', 'High latency'];
  const rightPoints = visualData.rightPoints || ['Autonomous reasoning', 'Sub-second response', '10x efficient'];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          border: `2px solid ${theme.cardBorder}`,
          borderRadius: 24,
          padding: '48px 36px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div
          style={{
            alignSelf: 'flex-start',
            fontSize: 22,
            fontFamily: theme.sansFont,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: theme.accent,
            textTransform: 'uppercase',
          }}
        >
          // DIRECT COMPARISON
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 44,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
            textAlign: 'center',
          }}
        >
          {scene.mainText}
        </h2>

        {/* Side-by-side cards with VS badge */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            gap: 20,
            position: 'relative',
          }}
        >
          {/* Left Card */}
          <div
            style={{
              flex: 1,
              backgroundColor: theme.background,
              border: `1.5px solid ${theme.cardBorder}`,
              borderRadius: 16,
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transform: `translateX(${leftX}px)`,
              opacity: interpolate(leftSpring, [0, 1], [0, 1]),
            }}
          >
            <div
              style={{
                fontFamily: theme.sansFont,
                fontSize: 20,
                fontWeight: 700,
                color: theme.textSecondary,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${theme.cardBorder}`,
                paddingBottom: 8,
              }}
            >
              {leftTitle}
            </div>
            {leftPoints.map((pt: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 22, color: theme.textSecondary }}>
                <span style={{ color: '#EF4444', fontWeight: 800 }}>✕</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Right Card (Hero / Highlighted) */}
          <div
            style={{
              flex: 1,
              backgroundColor: `${theme.accent}08`,
              border: `2px solid ${theme.accent}`,
              borderRadius: 16,
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transform: `translateX(${rightX}px)`,
              opacity: interpolate(rightSpring, [0, 1], [0, 1]),
              boxShadow: `0 8px 24px ${theme.accent}15`,
            }}
          >
            <div
              style={{
                fontFamily: theme.sansFont,
                fontSize: 20,
                fontWeight: 800,
                color: theme.accent,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${theme.accent}30`,
                paddingBottom: 8,
              }}
            >
              {rightTitle}
            </div>
            {rightPoints.map((pt: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 22, color: theme.textPrimary, fontWeight: 600 }}>
                <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {scene.supportingText && (
          <p
            style={{
              fontFamily: theme.sansFont,
              fontSize: 26,
              color: theme.textSecondary,
              margin: 0,
              textAlign: 'center',
            }}
          >
            {scene.supportingText}
          </p>
        )}
      </div>
    </div>
  );
};
