/**
 * UCA BRIDGE (Phase 1 & 2)
 * Bidirectional translation between flat legacy arrays and hierarchical UCA tree.
 */

export { manifestToTree } from './converters/manifestToTree';
export { treeToManifest } from './converters/treeToManifest';
export { congealSnapshot } from './treeUtils'; // [Phase 5.1]
