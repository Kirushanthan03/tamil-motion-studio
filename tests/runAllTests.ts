import { testStateMachine } from './stateMachine.test';
import { testSceneSchemas } from './sceneSchemas.test';
import { testScriptGeneration } from './scriptGeneration.test';
import { testAudioValidation } from './audioValidation.test';
import { testEndToEndRender } from './endToEndRender.test';

async function main() {
  console.log('====================================================');
  console.log('🎬 TAMIL & ENGLISH MOTION STUDIO AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  try {
    testStateMachine();
    console.log('');

    testSceneSchemas();
    console.log('');

    testScriptGeneration();
    console.log('');

    await testAudioValidation();
    console.log('');

    await testEndToEndRender();
    console.log('');

    console.log('====================================================');
    console.log('🌟 ALL 5 AUTOMATED TEST SUITES PASSED CLEANLY! 🌟');
    console.log('====================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
}

main();
