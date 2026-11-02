import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const ConclusionScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const pulse = Math.sin(frame / 6) * 0.05 + 1;

  const visualData: any = scene.visualData || {};
  const takeaways = visualData.takeaways || [
    'Breakthrough reasoning capabilities',
    'Massive reduction in API inference latency',
    'Ready for enterprise deployment today',
  ];
  const ctaText = visualData.cta || 'FOLLOW FOR MORE TECH EXPLAINERS';

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
          // VERDICT & SUMMARY
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 48,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          {scene.mainText}
        </h2>

        {/* Takeaway Points Checklist */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {takeaways.map((item: string, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                backgroundColor: theme.background,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 12,
                padding: '16px 20px',
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: theme.accent,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontFamily: theme.sansFont,
                  fontSize: 22,
                  fontWeight: 600,
                  color: theme.textPrimary,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Pulsing Follow / Subscribe CTA Button */}
        <div
          style={{
            backgroundColor: theme.accent,
            color: '#FFFFFF',
            padding: '18px 40px',
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 800,
            fontFamily: theme.sansFont,
            letterSpacing: '0.06em',
            transform: `scale(${pulse})`,
            boxShadow: `0 12px 28px ${theme.accent}40`,
            marginTop: 8,
          }}
        >
          {ctaText}
        </div>
      </div>
    </div>
  );
};
