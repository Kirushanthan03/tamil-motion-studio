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
          gap: compact ? 16 : 24,
          padding: compact ? '10px 22px' : '18px 36px',
          backgroundColor: theme.cardBg || 'rgba(15, 23, 42, 0.94)',
          border: `${compact ? 2 : 3}px solid ${theme.cardBorder || 'rgba(255, 255, 255, 0.2)'}`,
          borderRadius: compact ? 20 : 32,
          boxShadow: `0 16px 40px -10px ${theme.accent}40, 0 8px 20px rgba(0,0,0,0.3)`,
          transform: `translateY(${translateY + floatY}px) scale(${scale})`,
          opacity,
          maxWidth: '92%',
          margin: position === 'inline' ? '0 auto 20px auto' : '0',
          backdropFilter: 'blur(12px)',
          zIndex: 15,
        }}
      >
        {/* Glowing Circular Avatar */}
        <div
          style={{
            width: compact ? 70 : 124,
            height: compact ? 70 : 124,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `${compact ? 3 : 4}px solid ${theme.accent}`,
            boxShadow: `0 0 28px ${theme.accent}70`,
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
                fontSize: compact ? 11 : 14,
                fontFamily: theme.sansFont,
                fontWeight: 800,
                letterSpacing: 2.5,
                color: theme.accent,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              {entity.badge}
            </span>
          )}

          <span
            style={{
              fontSize: compact ? 20 : 32,
              fontFamily: theme.serifFont,
              fontWeight: 800,
              color: theme.textPrimary,
              lineHeight: 1.15,
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
                fontSize: compact ? 13 : 20,
                fontFamily: theme.sansFont,
                color: theme.textSecondary,
                marginTop: 4,
                lineHeight: 1.3,
                fontWeight: 500,
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
        gap: compact ? 16 : 24,
        padding: compact ? '10px 22px' : '18px 36px',
        backgroundColor: theme.cardBg || 'rgba(15, 23, 42, 0.94)',
        border: `${compact ? 2 : 3}px solid ${theme.cardBorder || 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: compact ? 18 : 28,
        boxShadow: `0 16px 40px -10px ${theme.accent}35, 0 6px 18px rgba(0,0,0,0.25)`,
        transform: `translateY(${translateY + floatY}px) scale(${scale})`,
        opacity,
        margin: position === 'inline' ? '0 auto 20px auto' : '0',
        backdropFilter: 'blur(12px)',
        zIndex: 15,
      }}
    >
      {/* Brand Icon */}
      {brandImg && (
        <div
          style={{
            width: compact ? 56 : 96,
            height: compact ? 56 : 96,
            borderRadius: compact ? 14 : 20,
            padding: compact ? 8 : 14,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
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
              fontSize: compact ? 11 : 14,
              fontFamily: theme.sansFont,
              fontWeight: 800,
              letterSpacing: 2.5,
              color: theme.accent,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {entity.badge}
          </span>
        )}

        <span
          style={{
            fontSize: compact ? 20 : 34,
            fontFamily: theme.serifFont,
            fontWeight: 800,
            color: theme.textPrimary,
            lineHeight: 1.15,
          }}
        >
          {entity.name}
        </span>

        {entity.roleOrSubtitle && (
          <span
            style={{
              fontSize: compact ? 13 : 20,
              fontFamily: theme.sansFont,
              color: theme.textSecondary,
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            {entity.roleOrSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};
