import { resolveNodeSemantics, ResolutionContext } from './ucaSemantics';
import { OmegaNode, ModuleTemplate } from '../types/manifest';

console.log('--- STARTING UCA TEMPLATE RESOLUTION TEST (Phase 5) ---');

// 1. Mock Module Template (Refined Era 7.2.3)
const mockTemplate: ModuleTemplate = {
  id: 'standard_vcf',
  version: '1.0.0',
  label: 'Standard VCF',
  family: 'Filter',
  contractVersion: '7.2.3',
  policy: [
    { path: 'layout.mode', mode: 'locked' },
    { path: 'children.0.kind', mode: 'locked' },
    { path: 'style.color', mode: 'editable' },
    { path: 'children.0.style.color', mode: 'editable' },
    { path: 'children.0.layout.pos', mode: 'editable' }
  ],
  slots: [
    { id: 'cutoff_binding', label: 'Cutoff', kind: 'parameter', required: true, path: 'cutoff_cell' }
  ],
  root: {
    id: 'template_root',
    kind: 'container',
    layout: { pos: { x: 0, y: 0 }, mode: 'stack-v' },
    children: [
      {
        id: 'cutoff_cell',
        kind: 'cell',
        bind: 'cutoff_binding', // Logical Slot
        layout: { pos: { x: 10, y: 10 }, size: { width: 50, height: 50 } },
        style: { color: '#888' }
      }
    ]
  }
};

// 2. Mock Context
const ctx: ResolutionContext = {
  catalog: {},
  moduleTemplates: {
    'standard_vcf': mockTemplate
  }
};

// 3. Mock Instance with Overrides and Slot Mappings
const instance: OmegaNode = {
  id: 'my_vcf_instance',
  kind: 'container',
  templateRef: 'standard_vcf',
  overrides: {
    'style.color': '#f00',            // Allowed
    'children.0.style.color': '#0f0', // Allowed
    'layout.mode': 'absolute'        // LOCKED - Should be ignored
  },
  slotMappings: {
    'cutoff_binding': 'vcf_1.cutoff' // Concrete DSP mapping
  }
};

// 4. Resolve
const resolved = resolveNodeSemantics(instance, ctx);

console.log('\n[Resolution Results]');
console.log('ID:', resolved.id);
console.log('Template Root ID:', resolved.children?.[0].id); // Should be generated/prefixed

// Verify Overrides
console.log('\n[Override Enforcement]');
console.log('Root Color (Expected #f00):', resolved.style?.color);
console.log('Child 0 Color (Expected #0f0):', resolved.children?.[0].style?.color);
console.log('Layout Mode (Expected stack-v, LOCKED):', resolved.layout?.mode);

// Verify Slot Mapping
console.log('\n[Slot Mapping Resolution]');
console.log('Child 0 Binding (Expected vcf_1.cutoff):', resolved.children?.[0].bind);

// Verify Portability (Snapshot)
const snapshotInstance: OmegaNode = {
  id: 'portable_vcf',
  kind: 'container',
  snapshot: JSON.parse(JSON.stringify(mockTemplate.root))
};

const resolvedSnapshot = resolveNodeSemantics(snapshotInstance, { catalog: {} });
console.log('\n[Portability Test (Snapshot)]');
console.log('Snapshot Child Binding (Expected cutoff_binding):', resolvedSnapshot.children?.[0].bind);

// 6. DSP Compatibility Test
function validateDSPCompatibility(template: ModuleTemplate, instance: OmegaNode): boolean {
  console.log(`\n[DSP Compatibility Test: ${template.label}]`);
  const missingSlots = template.slots
    .filter(s => s.required && (!instance.slotMappings || !instance.slotMappings[s.id]));
  
  if (missingSlots.length > 0) {
    console.error('Validation FAILED. Missing required slots:', missingSlots.map(s => s.id));
    return false;
  }
  
  console.log('Validation PASSED. All required slots mapped.');
  return true;
}

validateDSPCompatibility(mockTemplate, instance); // Should pass
validateDSPCompatibility(mockTemplate, { id: 'bad', kind: 'container' }); // Should fail

console.log('\n--- TEST COMPLETE ---');
