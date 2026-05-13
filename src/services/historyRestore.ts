import { historyService } from './historyService';
import { BlueprintValidator } from '@/omega-ui-core/uca/blueprintValidator';
import { observabilityService } from './observabilityService';
import type { OmegaNode } from '@/omega-ui-core/types/manifest';

/**
 * OMEGA ERA 7.2.3 - TIME TRAVEL RESTORE (Phase 21.4)
 * Orchestrates the safe restoration of historical manifest states.
 */
export class HistoryRestoreEngine {
  /**
   * prepareRestore
   * Loads a revision and validates it before promotion.
   */
  static async prepareRestore(revisionId: string): Promise<OmegaNode[] | null> {
    const startTime = Date.now();
    const entry = historyService.getRevision(revisionId);
    
    if (!entry) {
      console.error(`[HISTORY RESTORE] Revision not found: ${revisionId}`);
      return null;
    }

    try {
      // Gatekeeping: Historical data must pass validation before activation
      BlueprintValidator.validate(entry.graph, { id: 'restore_target' } as any);
      
      const durationMs = Date.now() - startTime;

      observabilityService.trackHistoryEvent(
        entry.meta.correlationId,
        'HISTORY_RESTORE_SUCCESS',
        'SUCCESS',
        `Validated historical revision ${revisionId} for restoration.`,
        durationMs,
        { revisionId }
      );

      return entry.graph;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      console.error(`[HISTORY RESTORE] Validation failed for revision ${revisionId}:`, err);
      
      observabilityService.trackHistoryEvent(
        entry.meta.correlationId,
        'HISTORY_RESTORE_FAILED',
        'FAILURE',
        `Historical revision ${revisionId} failed validation.`,
        durationMs
      );

      return null;
    }
  }
}
