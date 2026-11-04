import React from 'react';
import { useVideoConfig } from 'remotion';
import { SceneDefinition, VideoTheme } from '@/types';
import { EntitySpotlight } from './components/EntitySpotlight';
import { HeadlineScene } from './templates/HeadlineScene';
import { KeyStatisticScene } from './templates/KeyStatisticScene';
import { QuoteScene } from './templates/QuoteScene';
import { TimelineScene } from './templates/TimelineScene';
import { ComparisonScene } from './templates/ComparisonScene';
import { ProcessFlowScene } from './templates/ProcessFlowScene';
import { NetworkNodesScene } from './templates/NetworkNodesScene';
import { ArchitectureScene } from './templates/ArchitectureScene';
import { DeviceMockupScene } from './templates/DeviceMockupScene';
import { ArticleHighlightScene } from './templates/ArticleHighlightScene';
import { CodeSnippetScene } from './templates/CodeSnippetScene';
import { ConclusionScene } from './templates/ConclusionScene';

interface Props {
  scene: SceneDefinition;
  theme: VideoTheme;
}

export const SceneRenderer: React.FC<Props> = ({ scene, theme }) => {
  const { width, height } = useVideoConfig();
  const isLandscape = width > height;

  const renderTemplateContent = () => {
    switch (scene.template) {
      case 'headline':
        return <HeadlineScene scene={scene} theme={theme} />;
      case 'key-statistic':
        return <KeyStatisticScene scene={scene} theme={theme} />;
      case 'quote':
        return <QuoteScene scene={scene} theme={theme} />;
      case 'timeline':
        return <TimelineScene scene={scene} theme={theme} />;
      case 'comparison':
        return <ComparisonScene scene={scene} theme={theme} />;
      case 'process-flow':
        return <ProcessFlowScene scene={scene} theme={theme} />;
      case 'network-nodes':
        return <NetworkNodesScene scene={scene} theme={theme} />;
      case 'architecture':
        return <ArchitectureScene scene={scene} theme={theme} />;
      case 'device-mockup':
        return <DeviceMockupScene scene={scene} theme={theme} />;
      case 'article-highlight':
        return <ArticleHighlightScene scene={scene} theme={theme} />;
      case 'code-snippet':
        return <CodeSnippetScene scene={scene} theme={theme} />;
      case 'conclusion':
        return <ConclusionScene scene={scene} theme={theme} />;
      default:
        return <HeadlineScene scene={scene} theme={theme} />;
    }
  };

  const entity = scene.visualData?.entity;

  const content = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Top Entity Spotlight (Person Avatar or Company Logo) */}
      {entity && (
        <div
          style={{
            position: 'absolute',
            top: isLandscape ? 30 : 200,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <EntitySpotlight entity={entity} theme={theme} compact={isLandscape} />
        </div>
      )}

      {/* Main Scene Template Content */}
      {renderTemplateContent()}
    </div>
  );

  // If in 16:9 Landscape mode (1920x1080), wrap in responsive widescreen frame
  if (isLandscape) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 100px',
          boxSizing: 'border-box',
          transform: 'scale(0.86)',
          transformOrigin: 'center center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 1600 }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
