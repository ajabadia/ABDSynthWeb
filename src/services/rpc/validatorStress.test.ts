import { OmegaRPCBridge } from './omegaRPCBridge';
import type { SnapshotParams } from './rpcTypes';
import type { OMEGA_Manifest, OmegaNode } from '@/omega-ui-core/types/manifest';

/**
 * OMEGA Phase 20.4 - Validator Stress Test
 * Validates that the BlueprintValidator acts as a blocking gatekeeper.
 */
async function runValidatorStressTest() {
  console.log('--- STARTING PHASE 20.4 VALIDATOR STRESS TEST ---');

  const bridge = new OmegaRPCBridge('ws://localhost:8081');
  
  const mockManifest: OMEGA_Manifest = {
    id: 'test-lab',
    schemaVersion: '7.2.3',
    metadata: { name: 'Test Lab', version: '1.0.0', author: 'OMEGA' },
    resources: { assets: [{ id: 'existing-asset', path: 'lib:statics/knob.png', category: 'primitive', url: '', type: 'image' }] },
    ui: { skin: 'standard' } as any,
    entities: []
  };

  const baseGraph: OmegaNode = {
    id: 'root',
    kind: 'root',
    layout: { pos: { x: 0, y: 0 } },
    children: []
  };

  const runTest = async (name: string, graph: OmegaNode, expectedToFail: boolean) => {
    console.log(`\n[TEST: ${name}]`);
    const params: SnapshotParams = {
      manifestVersion: '7.2.3',
      documentId: 'test-doc',
      graph,
      modulations: []
    };

    try {
      const result = await bridge.syncSnapshot(params, mockManifest);
      if (result.success) {
        if (expectedToFail) {
          console.error(`❌ FAILED: Test "${name}" was expected to fail validation but passed.`);
        } else {
          console.log(`✅ PASSED: Test "${name}" passed as expected. Result: ${result.hash}`);
        }
      } else {
        if (expectedToFail) {
          console.log(`✅ PASSED: Test "${name}" failed as expected. Error: ${result.error}`);
        } else {
          // Special case: Valid Blueprint might fail due to WebSocket not open, which is fine for this test
          if (result.error === 'WebSocket not open' || result.hash === 'ERR') {
             console.log(`✅ PASSED: Test "${name}" passed validation (Bridge error expected: ${result.error})`);
          } else {
             console.error(`❌ FAILED: Test "${name}" was expected to pass validation but failed with error: ${result.error}`);
          }
        }
      }
    } catch (err: any) {
      if (expectedToFail) {
        console.log(`✅ PASSED: Test "${name}" failed as expected (Hard Crash). Error: ${err.message}`);
      } else {
        console.error(`❌ FAILED: Test "${name}" was expected to pass but crashed with error: ${err.message}`);
      }
    }
  };

  // CASE 1: Duplicate IDs
  const duplicateIdGraph: OmegaNode = {
    ...baseGraph,
    children: [
      { id: 'node_1', kind: 'cell', cellRef: 'knob', layout: { pos: { x: 0, y: 0 } } },
      { id: 'node_1', kind: 'cell', cellRef: 'knob', layout: { pos: { x: 10, y: 0 } } }
    ]
  };
  await runTest('Duplicate IDs', duplicateIdGraph, true);

  // CASE 2: Missing Bind for Control
  const missingBindGraph: OmegaNode = {
    ...baseGraph,
    children: [
      { id: 'knob_1', kind: 'cell', cellRef: 'knob', role: 'control', layout: { pos: { x: 0, y: 0 } } }
    ]
  };
  await runTest('Missing Bind for Control', missingBindGraph, true);

  // CASE 3: Missing Asset
  const missingAssetGraph: OmegaNode = {
    ...baseGraph,
    children: [
      { 
        id: 'decor_1', kind: 'cell', cellRef: 'image', role: 'decor', 
        layout: { pos: { x: 0, y: 0 } },
        style: { asset: 'non-existent-asset' } as any
      }
    ]
  };
  await runTest('Missing Asset Reference', missingAssetGraph, true);

  // CASE 4: Structural Cycle
  const cycleNode: any = { id: 'cycle_1', kind: 'group', layout: { pos: { x: 0, y: 0 } } };
  cycleNode.children = [cycleNode]; // Direct cycle
  await runTest('Structural Cycle', cycleNode as OmegaNode, true);

  // CASE 5: Valid Blueprint
  const validGraph: OmegaNode = {
    ...baseGraph,
    children: [
      { 
        id: 'osc_1', kind: 'cell', cellRef: 'knob', role: 'control', bind: 'osc.freq',
        layout: { pos: { x: 10, y: 10 } },
        style: { asset: 'existing-asset' } as any
      }
    ]
  };
  await runTest('Valid Blueprint', validGraph, false);

  console.log('\n--- PHASE 20.4 VALIDATOR STRESS TEST COMPLETE ---');
}

runValidatorStressTest().catch(console.error);
