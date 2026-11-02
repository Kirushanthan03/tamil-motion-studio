import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const NetworkNodesScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const packetProgress = (frame % (fps * 2)) / (fps * 2);

  const visualData: any = scene.visualData || {};
  const nodes = visualData.nodes || [
    { id: '1', label: 'Input Prompt', x: 140, y: 160, type: 'input' },
    { id: '2', label: 'Vector Index / RAG', x: 420, y: 100, type: 'context' },
    { id: '3', label: 'Core AI Model', x: 420, y: 220, type: 'model' },
    { id: '4', label: 'Reasoning Engine', x: 700, y: 160, type: 'output' },
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
        padding: '0 80px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          border: `2px solid ${theme.cardBorder}`,
          borderRadius: 24,
          padding: '50px 40px',
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
          // AI ARCHITECTURE & FLOW
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 48,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
            lineHeight: 1.25,
            textAlign: 'center',
          }}
        >
          {scene.mainText}
        </h2>

        {/* SVG Network Graph */}
        <div
          style={{
            width: '100%',
            height: 380,
            position: 'relative',
            backgroundColor: `${theme.background}`,
            borderRadius: 16,
            border: `1px solid ${theme.cardBorder}`,
            overflow: 'hidden',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 840 320">
            {/* Connecting Lines */}
            <line x1="200" y1="160" x2="360" y2="120" stroke={theme.cardBorder} strokeWidth="3" />
            <line x1="200" y1="160" x2="360" y2="200" stroke={theme.cardBorder} strokeWidth="3" />
            <line x1="480" y1="120" x2="640" y2="160" stroke={theme.cardBorder} strokeWidth="3" />
            <line x1="480" y1="200" x2="640" y2="160" stroke={theme.cardBorder} strokeWidth="3" />

            {/* Active Data Stream Highlight */}
            <line
              x1="200"
              y1="160"
              x2="640"
              y2="160"
              stroke={theme.accent}
              strokeWidth="2"
              strokeDasharray="8 6"
              strokeOpacity="0.4"
            />

            {/* Moving Pulsing Data Packets */}
            <circle
              cx={200 + (640 - 200) * packetProgress}
              cy={160}
              r={7}
              fill={theme.accent}
            />

            {/* Nodes */}
            {nodes.map((node: any, idx: number) => {
              const nodeSpring = spring({
                frame: Math.max(0, frame - idx * 4),
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const nodeScale = interpolate(nodeSpring, [0, 1], [0.6, 1]);
              const isCenter = node.type === 'model';

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y}) scale(${nodeScale})`}>
                  {/* Outer glow ring for core model */}
                  {isCenter && (
                    <circle
                      cx="0"
                      cy="0"
                      r="46"
                      fill="none"
                      stroke={theme.accent}
                      strokeWidth="2"
                      strokeOpacity="0.3"
                      strokeDasharray="4 4"
                    />
                  )}
                  <circle
                    cx="0"
                    cy="0"
                    r={isCenter ? 36 : 30}
                    fill={isCenter ? theme.accent : theme.cardBg}
                    stroke={isCenter ? theme.accent : theme.textPrimary}
                    strokeWidth="3"
                  />
                  <text
                    x="0"
                    y="52"
                    textAnchor="middle"
                    fill={theme.textPrimary}
                    fontSize="17"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label}
                  </text>
                  {isCenter && (
                    <text
                      x="0"
                      y="6"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="14"
                      fontWeight="800"
                    >
                      AI
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {scene.supportingText && (
          <p
            style={{
              fontFamily: theme.sansFont,
              fontSize: 28,
              color: theme.textSecondary,
              margin: 0,
              lineHeight: 1.5,
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
