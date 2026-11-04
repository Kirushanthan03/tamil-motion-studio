import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { VideoTheme } from '@/types';

export interface EntityData {
  name: string;
  type: 'person' | 'company' | 'crypto' | 'tech';
  roleOrSubtitle?: string;
  imageUrl?: string;
  logoUrl?: string;
  badge?: string;
}

interface Props {
  entity?: EntityData;
  theme: VideoTheme;
  position?: 'top' | 'inline' | 'floating';
  compact?: boolean;
}

export const EntitySpotlight: React.FC<Props> = ({
  entity,
  theme,
  position = 'inline',
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!entity || (!entity.imageUrl && !entity.logoUrl)) {
    return null;
  }

  // Entrance spring animation
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const scale = interpolate(enterSpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const translateY = interpolate(enterSpring, [0, 1], [25, 0]);

  // Subtle breathing float / Ken-Burns
  const floatY = Math.sin(frame / 20) * 3;
  const kenBurns = 1 + (frame % 300) * 0.0002;

  // Person Avatar Spotlight Card
  if (entity.type === 'person' && entity.imageUrl) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: compact ? '8px 16px' : '14px 24px',
          backgroundColor: theme.cardBg || 'rgba(15, 23, 42, 0.9)',
          border: `2px solid ${theme.cardBorder || 'rgba(255, 255, 255, 0.15)'}`,
          borderRadius: 20,
          boxShadow: `0 12px 35px -8px ${theme.accent}30, 0 4px 12px rgba(0,0,0,0.25)`,
          transform: `translateY(${translateY + floatY}px) scale(${scale})`,
          opacity,
          maxWidth: '90%',
          margin: position === 'inline' ? '0 auto 20px auto' : '0',
          backdropFilter: 'blur(10px)',
          zIndex: 15,
        }}
      >
        {/* Glowing Circular Avatar */}
        <div
          style={{
            width: compact ? 60 : 76,
            height: compact ? 60 : 76,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${theme.accent}`,
            boxShadow: `0 0 20px ${theme.accent}60`,
            flexShrink: 0,
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={entity.imageUrl}
            alt={entity.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${kenBurns})`,
            }}
          />
        </div>

        {/* Text Details */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
          {entity.badge && (
            <span
              style={{
                fontSize: 11,
                fontFamily: theme.sansFont,
                fontWeight: 800,
                letterSpacing: 2,
                color: theme.accent,
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              {entity.badge}
            </span>
          )}

          <span
            style={{
              fontSize: compact ? 18 : 22,
              fontFamily: theme.serifFont,
              fontWeight: 800,
              color: theme.textPrimary,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {entity.name}
          </span>

          {entity.roleOrSubtitle && (
            <span
              style={{
                fontSize: compact ? 12 : 14,
                fontFamily: theme.sansFont,
                color: theme.textSecondary,
                marginTop: 2,
                lineHeight: 1.3,
              }}
            >
              {entity.roleOrSubtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Company / Protocol Brand Hero Badge
  const brandImg = entity.logoUrl || entity.imageUrl;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: compact ? '8px 18px' : '12px 24px',
        backgroundColor: theme.cardBg || 'rgba(15, 23, 42, 0.9)',
        border: `2px solid ${theme.cardBorder || 'rgba(255, 255, 255, 0.15)'}`,
        borderRadius: 18,
        boxShadow: `0 12px 30px -8px ${theme.accent}25, 0 4px 10px rgba(0,0,0,0.2)`,
        transform: `translateY(${translateY + floatY}px) scale(${scale})`,
        opacity,
        margin: position === 'inline' ? '0 auto 20px auto' : '0',
        backdropFilter: 'blur(10px)',
        zIndex: 15,
      }}
    >
      {/* Brand Icon */}
      {brandImg && (
        <div
          style={{
            width: compact ? 42 : 52,
            height: compact ? 42 : 52,
            borderRadius: 12,
            padding: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Img
            src={brandImg}
            alt={entity.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Brand Metadata */}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        {entity.badge && (
          <span
            style={{
              fontSize: 10,
              fontFamily: theme.sansFont,
              fontWeight: 800,
              letterSpacing: 2,
              color: theme.accent,
              textTransform: 'uppercase',
            }}
          >
            {entity.badge}
          </span>
        )}

        <span
          style={{
            fontSize: compact ? 17 : 20,
            fontFamily: theme.serifFont,
            fontWeight: 800,
            color: theme.textPrimary,
            lineHeight: 1.2,
          }}
        >
          {entity.name}
        </span>

        {entity.roleOrSubtitle && (
          <span
            style={{
              fontSize: 12,
              fontFamily: theme.sansFont,
              color: theme.textSecondary,
              marginTop: 2,
            }}
          >
            {entity.roleOrSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};
