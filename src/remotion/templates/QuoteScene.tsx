import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const QuoteScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const quoteOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const quoteY = interpolate(entrance, [0, 1], [30, 0]);

  const visualData: any = scene.visualData || {};
  const speaker = visualData.speaker || 'Official Statement';
  const role = visualData.role || 'Key Architect / Leadership';

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
          padding: '60px 50px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 24,
          position: 'relative',
        }}
      >
        {/* Large Editorial Quotation Mark in Crimson */}
        <div
          style={{
            fontFamily: theme.serifFont,
            fontSize: 120,
            lineHeight: 0.7,
            color: theme.accent,
            opacity: 0.9,
            marginBottom: 8,
          }}
        >
          “
        </div>

        {/* The Quote Text */}
        <blockquote
          style={{
            fontFamily: theme.serifFont,
            fontSize: 48,
            fontStyle: 'italic',
            lineHeight: 1.35,
            color: theme.textPrimary,
            margin: 0,
            opacity: quoteOpacity,
            transform: `translateY(${quoteY}px)`,
          }}
        >
          {scene.mainText}
        </blockquote>

        {/* Speaker Info */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 24,
            width: '100%',
            borderTop: `1.5px solid ${theme.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 24,
              fontFamily: theme.sansFont,
            }}
          >
            {speaker.charAt(0)}
          </div>
          <div>
            <div
              style={{
                fontFamily: theme.sansFont,
                fontSize: 26,
                fontWeight: 700,
                color: theme.textPrimary,
              }}
            >
              {speaker}
            </div>
            <div
              style={{
                fontFamily: theme.sansFont,
                fontSize: 20,
                color: theme.textSecondary,
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
