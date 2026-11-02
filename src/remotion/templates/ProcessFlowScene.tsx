import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const ProcessFlowScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const visualData: any = scene.visualData || {};
  const steps = visualData.steps || [
    { num: '01', title: 'Data Ingestion', text: 'Real-time multi-source streaming' },
    { num: '02', title: 'AI Alignment', text: 'Automated semantic validation' },
    { num: '03', title: 'Video Synthesis', text: 'Instant motion graphics render' },
  ];

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
          padding: '48px 40px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontFamily: theme.sansFont,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: theme.accent,
            textTransform: 'uppercase',
          }}
        >
          // WORKFLOW PROCESS
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 46,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
          }}
        >
          {scene.mainText}
        </h2>

        {/* 3 Step Cards */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((st: any, i: number) => {
            const stepSpring = spring({
              frame: Math.max(0, frame - i * 6),
              fps,
              config: { damping: 14, stiffness: 90 },
            });
            const sY = interpolate(stepSpring, [0, 1], [30, 0]);
            const sOp = interpolate(stepSpring, [0, 1], [0, 1]);
            const isHighlight = i === 1;

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  backgroundColor: isHighlight ? `${theme.accent}08` : theme.background,
                  border: isHighlight ? `2px solid ${theme.accent}` : `1px solid ${theme.cardBorder}`,
                  borderRadius: 16,
                  padding: '20px 24px',
                  transform: `translateY(${sY}px)`,
                  opacity: sOp,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: isHighlight ? theme.accent : theme.cardBorder,
                    color: isHighlight ? '#FFFFFF' : theme.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: theme.sansFont,
                    fontWeight: 800,
                    fontSize: 22,
                  }}
                >
                  {st.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: theme.serifFont,
                      fontSize: 28,
                      fontWeight: 700,
                      color: isHighlight ? theme.accent : theme.textPrimary,
                    }}
                  >
                    {st.title}
                  </div>
                  <div style={{ fontFamily: theme.sansFont, fontSize: 20, color: theme.textSecondary }}>
                    {st.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {scene.supportingText && (
          <p style={{ fontFamily: theme.sansFont, fontSize: 24, color: theme.textSecondary, margin: 0 }}>
            {scene.supportingText}
          </p>
        )}
      </div>
    </div>
  );
};
