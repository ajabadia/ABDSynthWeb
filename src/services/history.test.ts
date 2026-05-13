import { historyService } from './historyService';
import { SemanticDiffEngine } from './historyDiff';
import { HistoryRestoreEngine } from './historyRestore';
import type { OmegaNode } from '@/omega-ui-core/types/manifest';

/**
 * PHASE 21 - HISTORY ENGINE TEST
 * Verifies capture, diff, and validated restore.
 */
async function runHistoryTest() {
  console.log('--- STARTING PHASE 21 HISTORY ENGINE TEST ---');

  const graphA: OmegaNode[] = [
    { id: 'osc1', kind: 'cell', role: 'oscillator', layout: { pos: { x: 0, y: 0 } } }
  ];

  const graphB: OmegaNode[] = [
    { id: 'osc1', kind: 'cell', role: 'oscillator', layout: { pos: { x: 0, y: 0 } } },
    { id: 'filter1', kind: 'cell', role: 'filter', layout: { pos: { x: 10, y: 10 } }, cellRef: 'filter_core' }
  ];

  // 1. Test Capture
  console.log('[TEST] Capturing revisions...');
  const revA = historyService.captureRevision(graphA, 'SNAPSHOT_SYNC', 'tx_a', 'Initial State');
  const revB = historyService.captureRevision(graphB, 'TRANSACTION_COMMIT', 'tx_b', 'Added Filter');

  const history = historyService.getHistory();
  if (history.length === 2) {
    console.log('[PASSED] History captured correctly.');
  } else {
    console.error('[FAILED] History capture count mismatch!');
    process.exit(1);
  }

  // 2. Test Semantic Diff
  console.log('[TEST] Running semantic diff...');
  const diff = SemanticDiffEngine.compare(revA, graphA, revB, graphB);
  const added = diff.changes.find(c => c.type === 'ADD' && c.path === 'filter1');
  if (added) {
    console.log('[PASSED] Semantic diff detected addition correctly.');
  } else {
    console.error('[FAILED] Semantic diff failed to detect change!');
    process.exit(1);
  }

  // 3. Test Restore (Success)
  console.log('[TEST] Validating restore path (Success)...');
  const restoredGraph = await HistoryRestoreEngine.prepareRestore(revA);
  if (restoredGraph && restoredGraph[0].id === 'osc1' && restoredGraph.length === 1) {
    console.log('[PASSED] Historical restore validated successfully.');
  } else {
    console.error('[FAILED] Restore validation failed for valid data!');
    process.exit(1);
  }

  // 4. Test Restore (Failure)
  console.log('[TEST] Validating restore path (Failure)...');
  // Inject bad data into history (manually for test)
  // A cell node MUST have a cellRef according to BlueprintValidator
  const badRev = historyService.captureRevision([{ id: 'bad-cell', kind: 'cell' } as any], 'MANUAL_SAVE', 'tx_bad');
  const failedRestore = await HistoryRestoreEngine.prepareRestore(badRev);
  if (failedRestore === null) {
    console.log('[PASSED] Restore blocked invalid historical data correctly.');
  } else {
    console.error('[FAILED] Restore allowed invalid data!');
    process.exit(1);
  }

  console.log('--- HISTORY ENGINE TEST COMPLETE ---');
}

runHistoryTest();
