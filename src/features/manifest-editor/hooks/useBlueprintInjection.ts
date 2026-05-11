'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  OMEGA_Manifest, 
  BlueprintDefinition,
  BlueprintPlaceholderValues 
} from '@/omega-ui-core/types/manifest';
import { 
  BlueprintInjectionRequest, 
  BlueprintInjectionResult 
} from '../types/blueprint';
import { BlueprintInjector } from '../utils/blueprintInjector';

/**
 * OMEGA Phase 9.4A - Industrial Blueprint Injection Hook
 * Manages the state and lifecycle of the 10-step injection pipeline.
 */
export const useBlueprintInjection = (
  manifest: OMEGA_Manifest,
  updateManifest: (updates: Partial<OMEGA_Manifest>, label: string, forceHistory?: boolean) => void,
  addLog: (msg: string) => void
) => {
  const [activeBlueprint, setActiveBlueprint] = useState<BlueprintDefinition | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [lastResult, setLastResult] = useState<BlueprintInjectionResult | null>(null);

  const injector = useMemo(() => new BlueprintInjector(), []);

  /**
   * Internal execution logic.
   */
  const executeInjection = useCallback(async (
    blueprint: BlueprintDefinition, 
    targetId: string | undefined, 
    values: BlueprintPlaceholderValues
  ) => {
    const request: BlueprintInjectionRequest = {
      blueprintId: blueprint.blueprintId,
      placeholderValues: values,
      manifestId: manifest.id,
      mode: 'commit',
      strategy: {
        targetParentNodeId: targetId || null,
        idCollisionStrategy: 'remap',
        dryRun: false,
        forceIdRemap: true // Recommended default
      }
    };

    addLog(`[SYSTEM] Initiating Blueprint injection: ${blueprint.name}...`);
    
    const result = await injector.inject(manifest, blueprint, request);
    setLastResult(result);

    if (!result.success) {
      addLog(`[ERROR] Injection failed: ${result.fatalError?.message} (${result.fatalError?.code})`);
      return;
    }

    if (result.resultManifest) {
      const label = `[BLUEPRINT] Inject ${blueprint.name} (v${blueprint.version})`;
      updateManifest(result.resultManifest, label, true);
      addLog(`[SUCCESS] ${blueprint.name} inserted successfully. Duration: ${result.report.durationMs}ms`);
      
      // Log validation warnings if any
      result.report.validationIssues.forEach(issue => {
        if (issue.severity === 'warning') {
          addLog(`[WARNING] ${issue.message}`);
        }
      });
    }

    // Cleanup
    setIsPromptOpen(false);
    setActiveBlueprint(null);
    setTargetParentId(null);
  }, [manifest, updateManifest, addLog, injector]);

  /**
   * Initiates the injection flow.
   */
  const startInjection = useCallback((blueprint: BlueprintDefinition, targetId?: string) => {
    setActiveBlueprint(blueprint);
    setTargetParentId(targetId || null);
    
    // Check if we need to show the prompt
    if (blueprint.placeholders && blueprint.placeholders.length > 0) {
      setIsPromptOpen(true);
    } else {
      // Direct injection (no placeholders)
      executeInjection(blueprint, targetId, {});
    }
  }, [executeInjection]);

  /**
   * Finalizes the injection after placeholder resolution.
   */
  const confirmInjection = useCallback((values: BlueprintPlaceholderValues) => {
    if (!activeBlueprint) return;
    executeInjection(activeBlueprint, targetParentId || undefined, values);
  }, [activeBlueprint, targetParentId, executeInjection]);

  const cancelInjection = useCallback(() => {
    setIsPromptOpen(false);
    setActiveBlueprint(null);
    setTargetParentId(null);
  }, []);

  return {
    activeBlueprint,
    isPromptOpen,
    setIsPromptOpen,
    startInjection,
    confirmInjection,
    cancelInjection,
    lastResult
  };
};
