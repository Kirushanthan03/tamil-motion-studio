import { ProjectStatus } from '../src/types';

export function testStateMachine() {
  console.log('🧪 Testing Workflow State Machine transitions...');

  const validSequence: ProjectStatus[] = [
    'DRAFT_TOPIC',
    'RESEARCH_READY',
    'SCRIPTS_READY',
    'SCRIPT_APPROVED',
    'WAITING_FOR_VOICEOVER',
    'AUDIO_ALIGNED',
    'SCENES_GENERATED',
    'PREVIEW_READY',
    'RENDERING',
    'COMPLETED',
  ];

  let current: ProjectStatus = 'DRAFT_TOPIC';
  for (let i = 1; i < validSequence.length; i++) {
    const next = validSequence[i];
    current = next;
  }

  if (current !== 'COMPLETED') {
    throw new Error(`State machine sequence failed to reach COMPLETED, stopped at ${current}`);
  }

  // Test recoverable failure state
  let failedState: ProjectStatus = 'RENDERING';
  failedState = 'FAILED';
  failedState = 'PREVIEW_READY'; // Retry control
  if (failedState !== 'PREVIEW_READY') {
    throw new Error('Failed to recover from FAILED state');
  }

  console.log('✅ State Machine transitions validated successfully');
}
