import React from 'react';
import { SceneDefinition, VideoTheme } from '@/types';
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
