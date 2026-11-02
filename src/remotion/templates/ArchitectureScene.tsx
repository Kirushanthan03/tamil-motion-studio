import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const ArchitectureScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const visualData: any = scene.visualData || {};
  const layers = visualData.layers || [
    { name: 'Application UI & Voiceover', tag: 'Client' },
    { name: 'Orchestration & State Machine', tag: 'Backend' },
    { name: 'Multimodal AI & Speech Engine', tag: 'Core AI' },
    { name: 'Remotion Headless Video Engine', tag: 'Renderer' },
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
          // SYSTEM ARCHITECTURE
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 44,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
          }}
        >
          {scene.mainText}
        </h2>

        {/* Stacked Architecture Layers */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {layers.map((layer: any, idx: number) => {
            const layerSpring = spring({
              frame: Math.max(0, frame - idx * 5),
              fps,
              config: { damping: 14, stiffness: 95 },
            });
            const lScale = interpolate(layerSpring, [0, 1], [0.92, 1]);
            const lOp = interpolate(layerSpring, [0, 1], [0, 1]);
            const isHighlight = idx === 2;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: isHighlight ? `${theme.accent}12` : theme.background,
                  border: isHighlight ? `2px solid ${theme.accent}` : `1px solid ${theme.cardBorder}`,
                  borderRadius: 12,
                  padding: '16px 24px',
                  transform: `scale(${lScale})`,
                  opacity: lOp,
                }}
              >
                <span
                  style={{
                    fontFamily: theme.serifFont,
                    fontSize: 24,
                    fontWeight: 700,
                    color: isHighlight ? theme.accent : theme.textPrimary,
                  }}
                >
                  {layer.name}
                </span>
                <span
                  style={{
                    backgroundColor: isHighlight ? theme.accent : theme.cardBorder,
                    color: isHighlight ? '#FFFFFF' : theme.textSecondary,
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: theme.sansFont,
                    padding: '4px 12px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  {layer.tag}
                </span>
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
