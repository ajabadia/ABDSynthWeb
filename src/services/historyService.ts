import type { HistoryEntry, HistoryCaptureReason, HistoryRevisionMeta } from './historyTypes';
import type { OmegaNode } from '@/omega-ui-core/types/manifest';
import { observabilityService } from './observabilityService';

/**
 * OMEGA ERA 7.2.3 - HISTORY SERVICE (Phase 21.1)
 * Manages the capture and retrieval of historical manifest revisions.
 */
class HistoryService {
  private history: HistoryEntry[] = [];
  private lastRevisionId: string | null = null;

  /**
   * captureRevision
   * Records a new point in the manifest's evolution.
   */
  captureRevision(
    graph: OmegaNode[], 
    reason: HistoryCaptureReason, 
    correlationId: string,
    label?: string
  ): string {
    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const meta: HistoryRevisionMeta = {
      revisionId,
      parentRevisionId: this.lastRevisionId,
      timestamp: Date.now(),
      correlationId,
      reason,
      label: label || 'Untitled Revision',
      schemaVersion: '7.2.3'
    };

    const entry: HistoryEntry = {
      meta,
      graph: JSON.parse(JSON.stringify(graph)) // Deep copy to isolate history
    };

    this.history.push(entry);
    this.lastRevisionId = revisionId;

    const durationMs = Date.now() - meta.timestamp;

    observabilityService.trackHistoryEvent(
      correlationId,
      'HISTORY_CAPTURED',
      'SUCCESS',
      `Captured history revision: ${revisionId} (Reason: ${reason})`,
      durationMs,
      { revisionId, parentId: meta.parentRevisionId }
    );

    return revisionId;
  }

  getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  getRevision(revisionId: string): HistoryEntry | undefined {
    return this.history.find(e => e.meta.revisionId === revisionId);
  }

  clearHistory() {
    this.history = [];
    this.lastRevisionId = null;
  }
}

export const historyService = new HistoryService();
