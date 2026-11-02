import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const TimelineScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const visualData: any = scene.visualData || {};
  const events = visualData.events || [
    { year: '2023', title: 'GPT-4 & LLM Boom', desc: 'Text-first chat assistants' },
    { year: '2024', title: 'Multimodal Frontier', desc: 'Audio, Vision, Code agents' },
    { year: '2026', title: 'Autonomous Reasoning', desc: 'Self-correcting pipelines' },
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
          gap: 28,
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
          // TIMELINE & EVOLUTION
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

        {/* Vertical Timeline Track */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
          {events.map((ev: any, idx: number) => {
            const itemSpring = spring({
              frame: Math.max(0, frame - idx * 8),
              fps,
              config: { damping: 14, stiffness: 90 },
            });
            const itemX = interpolate(itemSpring, [0, 1], [-30, 0]);
            const itemOp = interpolate(itemSpring, [0, 1], [0, 1]);
            const isLatest = idx === events.length - 1;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 20,
                  transform: `translateX(${itemX}px)`,
                  opacity: itemOp,
                }}
              >
                {/* Year Pill / Bullet */}
                <div
                  style={{
                    backgroundColor: isLatest ? theme.accent : theme.cardBorder,
                    color: isLatest ? '#FFFFFF' : theme.textPrimary,
                    fontFamily: theme.sansFont,
                    fontWeight: 800,
                    fontSize: 20,
                    padding: '8px 16px',
                    borderRadius: 8,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  {ev.year}
                </div>

                {/* Event Details Card */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: isLatest ? `${theme.accent}08` : theme.background,
                    border: isLatest ? `2px solid ${theme.accent}` : `1px solid ${theme.cardBorder}`,
                    borderRadius: 12,
                    padding: '16px 20px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: theme.serifFont,
                      fontSize: 26,
                      fontWeight: 700,
                      color: isLatest ? theme.accent : theme.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {ev.title}
                  </div>
                  <div style={{ fontFamily: theme.sansFont, fontSize: 20, color: theme.textSecondary }}>
                    {ev.desc}
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
