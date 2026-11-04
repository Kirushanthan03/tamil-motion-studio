import React from 'react';
import { Composition } from 'remotion';
import { ReelComposition, ReelCompositionProps } from './ReelComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9:16 Vertical Reel (Shorts, Reels, TikTok) */}
      <Composition
        id="TamilReel"
        component={ReelComposition}
        durationInFrames={900} // 30 seconds default
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showSafeZones: false,
        }}
        calculateMetadata={async ({ props }) => {
          const p = props as ReelCompositionProps;
          const isLandscape = p?.project?.aspectRatio === '16:9';
          const duration = p?.project?.audio?.duration || p?.project?.targetDuration || 60;
          const durationInFrames = Math.max(90, Math.round(duration * 30));
          return {
            width: isLandscape ? 1920 : 1080,
            height: isLandscape ? 1080 : 1920,
            durationInFrames,
          };
        }}
      />

      {/* 16:9 Landscape Video (YouTube Deep Dives up to 15 minutes) */}
      <Composition
        id="TamilLandscape"
        component={ReelComposition}
        durationInFrames={5400} // 3 minutes default (up to 27,000 frames / 15m)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          showSafeZones: false,
        }}
        calculateMetadata={async ({ props }) => {
          const p = props as ReelCompositionProps;
          const isLandscape = p?.project?.aspectRatio !== '9:16';
          const duration = p?.project?.audio?.duration || p?.project?.targetDuration || 180;
          const durationInFrames = Math.max(90, Math.round(duration * 30));
          return {
            width: isLandscape ? 1920 : 1080,
            height: isLandscape ? 1080 : 1920,
            durationInFrames,
          };
        }}
      />
    </>
  );
};
