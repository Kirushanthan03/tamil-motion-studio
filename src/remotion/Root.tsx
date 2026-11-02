import React from 'react';
import { Composition } from 'remotion';
import { ReelComposition, ReelCompositionProps } from './ReelComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TamilReel"
        component={ReelComposition}
        durationInFrames={900} // 30 seconds default (30fps * 30s)
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showSafeZones: false,
        }}
      />
    </>
  );
};
