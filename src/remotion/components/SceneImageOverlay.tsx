import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { VideoTheme } from '@/types';

interface Props {
  imageUrl?: string;
  theme: VideoTheme;
  maxHeight?: number;
  caption?: string;
}

export const SceneImageOverlay: React.FC<Props> = ({
  imageUrl,
  theme,
  maxHeight = 440,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!imageUrl) return null;

  const imageSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const scale = interpolate(imageSpring, [0, 1], [0.92, 1]);
  const opacity = interpolate(imageSpring, [0, 1], [0, 1]);
  const kenBurns = 1 + (frame % 200) * 0.0002;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight,
          borderRadius: 20,
          border: `2px solid ${theme.cardBorder}`,
          backgroundColor: '#0F172A',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale * kenBurns})`,
          opacity,
          position: 'relative',
        }}
      >
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            maxHeight,
            objectFit: 'contain',
            display: 'block',
          }}
        />

        {/* Subtle crimson corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: `${theme.accent}E6`,
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: theme.sansFont,
            padding: '4px 10px',
            borderRadius: 6,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          FIGURE // ATTACHMENT
        </div>
      </div>

      {caption && (
        <span
          style={{
            fontSize: 18,
            fontFamily: theme.sansFont,
            color: theme.textSecondary,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {caption}
        </span>
      )}
    </div>
  );
};
