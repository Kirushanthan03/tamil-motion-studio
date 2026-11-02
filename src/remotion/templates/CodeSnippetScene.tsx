import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const CodeSnippetScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.94, 1]);

  const visualData: any = scene.visualData || {};
  const filename = visualData.filename || 'pipeline.ts';
  const codeLines = visualData.codeLines || [
    '// Tamil Motion Studio Pipeline',
    'const pipeline = await createPipeline({',
    '  topic: "AI Architecture",',
    '  language: "tanglish",',
    '  autoAlign: true',
    '});',
    'await pipeline.renderVideo("output.mp4");',
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
        padding: '0 60px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: '#1E1E24',
          borderRadius: 20,
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          transform: `scale(${cardScale})`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            backgroundColor: '#141418',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>
          <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: 18 }}>{filename}</span>
          <span style={{ color: theme.accent, fontSize: 16, fontWeight: 700 }}>TS</span>
        </div>

        {/* Code Content */}
        <div style={{ padding: '24px 28px', fontFamily: '"JetBrains Mono", monospace', fontSize: 21, lineHeight: 1.6, color: '#E2E8F0' }}>
          {codeLines.map((line: string, i: number) => {
            const isComment = line.trim().startsWith('//');
            const isKeyword = line.includes('const') || line.includes('await');
            return (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: '#475569', userSelect: 'none', width: 24, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ color: isComment ? '#64748B' : isKeyword ? '#F43F5E' : '#E2E8F0' }}>{line}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: 'center', padding: '0 20px' }}>
        <h3 style={{ fontFamily: theme.serifFont, fontSize: 36, color: theme.textPrimary, margin: '0 0 8px 0' }}>
          {scene.mainText}
        </h3>
        {scene.supportingText && (
          <p style={{ fontFamily: theme.sansFont, fontSize: 24, color: theme.textSecondary, margin: 0 }}>
            {scene.supportingText}
          </p>
        )}
      </div>
    </div>
  );
};
