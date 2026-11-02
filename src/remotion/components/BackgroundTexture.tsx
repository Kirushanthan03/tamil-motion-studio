import React from 'react';
import { VideoTheme } from '@/types';

interface Props {
  theme: VideoTheme;
  width?: number;
  height?: number;
}

export const BackgroundTexture: React.FC<Props> = ({
  theme,
  width = 1080,
  height = 1920,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: theme.background,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Subtle fine dot grid */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.045,
        }}
      >
        <defs>
          <pattern
            id="dotGrid"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" fill={theme.textPrimary} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>

      {/* Elegant editorial framing lines */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          border: `1px solid ${theme.cardBorder}`,
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Crimson Corner Accent Marks */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 36,
          width: 20,
          height: 20,
          borderTop: `3px solid ${theme.accent}`,
          borderLeft: `3px solid ${theme.accent}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 36,
          width: 20,
          height: 20,
          borderTop: `3px solid ${theme.accent}`,
          borderRight: `3px solid ${theme.accent}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 36,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${theme.accent}`,
          borderLeft: `3px solid ${theme.accent}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          right: 36,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${theme.accent}`,
          borderRight: `3px solid ${theme.accent}`,
        }}
      />
    </div>
  );
};
