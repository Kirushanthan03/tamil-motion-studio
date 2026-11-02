import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';
import { SceneImageOverlay } from '../components/SceneImageOverlay';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const HeadlineScene: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const subtitleSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const accentLineSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  const subY = interpolate(subtitleSpring, [0, 1], [40, 0]);
  const subOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);

  const lineWidth = interpolate(accentLineSpring, [0, 1], [0, 160]);

  const visualData: any = scene.visualData || {};
  const badgeText = visualData.badge || 'BREAKING UPDATE';

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
      {/* Editorial Card */}
      <div
        style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          border: `2px solid ${theme.cardBorder}`,
          borderRadius: 24,
          padding: '64px 56px',
          boxShadow: theme.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 32,
          position: 'relative',
        }}
      >
        {/* News tag badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: `${theme.accent}15`,
            color: theme.accent,
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: theme.sansFont,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: theme.accent,
              boxShadow: `0 0 12px ${theme.accent}`,
            }}
          />
          {badgeText}
        </div>

        {/* Animated Crimson Accent Line */}
        <div
          style={{
            width: lineWidth,
            height: 6,
            backgroundColor: theme.accent,
            borderRadius: 3,
          }}
        />

        {/* Big Editorial Headline */}
        <h1
          style={{
            fontFamily: theme.serifFont,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.25,
            color: theme.textPrimary,
            margin: 0,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            letterSpacing: '-0.02em',
          }}
        >
          {scene.mainText}
        </h1>

        {/* Explanatory Subtitle */}
        {scene.supportingText && (
          <p
            style={{
              fontFamily: theme.sansFont,
              fontSize: 34,
              lineHeight: 1.5,
              color: theme.textSecondary,
              margin: 0,
              transform: `translateY(${subY}px)`,
              opacity: subOpacity,
              fontWeight: 400,
            }}
          >
            {scene.supportingText}
          </p>
        )}

        {/* Custom Uploaded Image / Diagram Overlay */}
        {visualData.imageUrl && (
          <SceneImageOverlay
            imageUrl={visualData.imageUrl}
            theme={theme}
            maxHeight={380}
            caption={visualData.caption}
          />
        )}

        {/* Bottom Editorial Footnote */}
        <div
          style={{
            width: '100%',
            paddingTop: 24,
            borderTop: `1px solid ${theme.cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 20,
            fontFamily: theme.sansFont,
            color: theme.textSecondary,
          }}
        >
          <span>EDITION 2026 // MOTION STUDIO</span>
          <span style={{ color: theme.accent, fontWeight: 600 }}>SWIPE &gt;&gt;</span>
        </div>
      </div>
    </div>
  );
};
