import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const DeviceMockupScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const deviceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const deviceY = interpolate(deviceSpring, [0, 1], [40, 0]);

  const visualData: any = scene.visualData || {};
  const appTitle = visualData.appTitle || 'AI Assistant // Live';
  const chatBubble1 = visualData.chat1 || 'Generate optimized Tamil video script for tech release';
  const chatBubble2 = visualData.chat2 || 'Generated 3 verified scripts with timestamps synchronized!';

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
          padding: '40px 36px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
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
          // INTERFACE DEMO
        </div>

        <h2
          style={{
            fontFamily: theme.serifFont,
            fontSize: 42,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: 0,
            textAlign: 'center',
          }}
        >
          {scene.mainText}
        </h2>

        {/* Smartphone Frame Mockup */}
        <div
          style={{
            width: '84%',
            height: 380,
            backgroundColor: '#0F172A',
            borderRadius: 28,
            border: '6px solid #1E293B',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: `translateY(${deviceY}px)`,
            padding: 20,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            overflow: 'hidden',
          }}
        >
          {/* Header pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: 14 }}>
            <span>9:41</span>
            <div style={{ width: 60, height: 12, backgroundColor: '#334155', borderRadius: 999 }} />
            <span>5G 100%</span>
          </div>

          <div style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, borderBottom: '1px solid #334155', paddingBottom: 6 }}>
            {appTitle}
          </div>

          {/* User message */}
          <div
            style={{
              alignSelf: 'flex-end',
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: '14px 14px 2px 14px',
              fontSize: 16,
              maxWidth: '85%',
              lineHeight: 1.3,
            }}
          >
            {chatBubble1}
          </div>

          {/* AI Response message */}
          <div
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#1E293B',
              color: '#E2E8F0',
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 2px',
              fontSize: 16,
              maxWidth: '88%',
              lineHeight: 1.3,
              border: '1px solid #334155',
            }}
          >
            {chatBubble2}
          </div>
        </div>

        {scene.supportingText && (
          <p style={{ fontFamily: theme.sansFont, fontSize: 24, color: theme.textSecondary, margin: 0, textAlign: 'center' }}>
            {scene.supportingText}
          </p>
        )}
      </div>
    </div>
  );
};
