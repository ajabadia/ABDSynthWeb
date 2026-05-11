# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke-tests.spec.ts >> Phase 6 Critical Flows >> Flow 3: Diagnostic Trigger (Broken Bind -> Badge -> Tooltip)
- Location: e2e\smoke-tests.spec.ts:79:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[title*="Broken Bind"]').first()
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('[title*="Broken Bind"]').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - navigation [ref=e6]:
          - button "File" [ref=e8]
          - button "Edit" [ref=e10]
          - button "View" [ref=e12]
          - button "Help" [ref=e14]
        - generic:
          - generic:
            - generic:
              - img
            - generic: OMEGA Manifest Editor
        - generic [ref=e15]:
          - button "GOVERNANCE FAIL 0" [ref=e16]:
            - img [ref=e18]
            - generic [ref=e20]:
              - generic [ref=e21]: GOVERNANCE FAIL
              - generic [ref=e24]: "0"
          - generic [ref=e27]:
            - generic [ref=e28]:
              - button "Orbital" [ref=e29]
              - button "Virtual Rack" [ref=e30]
              - button "Source" [active] [ref=e31]
            - button "Toggle Split View (Vertical)" [ref=e32]:
              - img [ref=e33]
          - button "Switch to Light Mode" [ref=e36]:
            - img [ref=e37]
          - button "Global Configuration" [ref=e43]:
            - img [ref=e44]
          - button "Logs" [ref=e47]:
            - img [ref=e48]
            - generic [ref=e50]: Logs
      - main [ref=e51]:
        - generic [ref=e54]:
          - generic [ref=e55]:
            - generic [ref=e57] [cursor=pointer]: Orbital
            - generic [ref=e59] [cursor=pointer]: Rack
            - generic [ref=e62] [cursor=pointer]: Source
            - generic [ref=e65]: PANE::PRIMARY
          - code [ref=e70]:
            - generic [ref=e71]:
              - textbox "Editor content" [ref=e72]
              - textbox [ref=e73]
              - generic [ref=e75]:
                - generic [ref=e76]:
                  - generic [ref=e78] [cursor=pointer]: 
                  - generic [ref=e79]: "1"
                - generic [ref=e81]: "2"
                - generic [ref=e83]: "3"
                - generic [ref=e84]:
                  - generic [ref=e85] [cursor=pointer]: 
                  - generic [ref=e86]: "4"
                - generic [ref=e88]: "5"
                - generic [ref=e90]: "6"
                - generic [ref=e91]:
                  - generic [ref=e92] [cursor=pointer]: 
                  - generic [ref=e93]: "7"
                - generic [ref=e95]: "8"
                - generic [ref=e97]: "9"
                - generic [ref=e99]: "10"
                - generic [ref=e100]:
                  - generic [ref=e101] [cursor=pointer]: 
                  - generic [ref=e102]: "11"
                - generic [ref=e103]:
                  - generic [ref=e104] [cursor=pointer]: 
                  - generic [ref=e105]: "12"
                - generic [ref=e107]: "13"
                - generic [ref=e109]: "14"
                - generic [ref=e111]: "15"
                - generic [ref=e112]:
                  - generic [ref=e113] [cursor=pointer]: 
                  - generic [ref=e114]: "16"
                - generic [ref=e116]: "17"
                - generic [ref=e117]:
                  - generic [ref=e118] [cursor=pointer]: 
                  - generic [ref=e119]: "18"
                - generic [ref=e121]: "19"
                - generic [ref=e123]: "20"
                - generic [ref=e125]: "21"
                - generic [ref=e127]: "22"
                - generic [ref=e129]: "23"
                - generic [ref=e131]: "24"
                - generic [ref=e132]:
                  - generic [ref=e133] [cursor=pointer]: 
                  - generic [ref=e134]: "25"
                - generic [ref=e136]: "26"
                - generic [ref=e138]: "27"
                - generic [ref=e140]: "28"
              - generic [ref=e225]:
                - generic [ref=e227]: "{"
                - generic [ref=e229]: "\"schemaVersion\": \"7.2.3\","
                - generic [ref=e231]: "\"id\": \"omega_primary\","
                - generic [ref=e233]: "\"metadata\": {"
                - generic [ref=e235]: "\"name\": \"Primary Manifest\","
                - generic [ref=e237]: "\"family\": \"oscillator\","
                - generic [ref=e239]: "\"tags\": ["
                - generic [ref=e241]: "\"era7\""
                - generic [ref=e243]: "]"
                - generic [ref=e245]: "},"
                - generic [ref=e247]: "\"ui\": {"
                - generic [ref=e249]: "\"dimensions\": {"
                - generic [ref=e251]: "\"width\": 140,"
                - generic [ref=e253]: "\"height\": 420"
                - generic [ref=e255]: "},"
                - generic [ref=e257]: "\"layout\": {"
                - generic [ref=e259]: "\"containers\": [],"
                - generic [ref=e261]: "\"planes\": ["
                - generic [ref=e263]: "\"MAIN\""
                - generic [ref=e265]: "],"
                - generic [ref=e267]: "\"gridSnap\": 5,"
                - generic [ref=e269]: "\"activeTab\": \"rack\""
                - generic [ref=e271]: "}"
                - generic [ref=e273]: "},"
                - generic [ref=e275]: "\"resources\": {"
                - generic [ref=e277]: "\"wasm\": \"module.wasm\""
                - generic [ref=e279]: "}"
                - generic [ref=e281]: "}"
        - generic [ref=e285]:
          - generic [ref=e287]:
            - img [ref=e289]
            - generic [ref=e293]:
              - heading "Module Configuration" [level=2] [ref=e294]
              - paragraph [ref=e295]: omega_primary
          - navigation [ref=e296]:
            - button "Identity" [ref=e297]:
              - img [ref=e298]
              - generic [ref=e307]: Identity
            - button "Architecture" [ref=e308]:
              - img [ref=e309]
              - generic [ref=e311]: Architecture
          - generic [ref=e314]:
            - generic [ref=e315]:
              - generic [ref=e316] [cursor=pointer]:
                - generic [ref=e317]:
                  - img [ref=e318]
                  - img [ref=e321]
                  - generic [ref=e325]: Module Signature
                - button [ref=e327]:
                  - img [ref=e328]
              - generic [ref=e332]:
                - generic [ref=e333]:
                  - generic [ref=e334]:
                    - generic [ref=e337]: Schema
                    - textbox [ref=e339]: 7.2.3
                  - generic [ref=e341]:
                    - generic [ref=e344]: Canonical ID (Unique)
                    - textbox "module_id_v1" [ref=e346]: omega_primary
                - generic [ref=e347]:
                  - generic [ref=e349]:
                    - generic [ref=e352]: Commercial Name
                    - textbox "OMEGA NEURONIK" [ref=e354]: Primary Manifest
                  - generic [ref=e356]:
                    - generic [ref=e359]: Version
                    - textbox [ref=e361]: 1.0.0
                  - generic [ref=e362]:
                    - generic [ref=e365]: HP
                    - spinbutton [ref=e367]: "12"
                - generic [ref=e368]:
                  - generic [ref=e371]: Module Description
                  - textbox "ENTER MODULE DOCUMENTATION / SPECIFICATIONS..." [ref=e373]
                - generic [ref=e374]:
                  - generic [ref=e375]:
                    - img [ref=e376]
                    - generic [ref=e380]: Identity Branding (Registry Icon)
                  - generic [ref=e381]:
                    - generic [ref=e382]:
                      - img [ref=e383]
                      - generic [ref=e387]: Module Face
                    - generic [ref=e388]:
                      - paragraph [ref=e389]: Select the high-fidelity asset to be displayed in the OMEGA Module Registry.
                      - generic [ref=e390]:
                        - generic [ref=e393]:
                          - img [ref=e394]
                          - generic [ref=e398]: Branding Asset
                        - generic [ref=e400]:
                          - button "System Library" [ref=e401]:
                            - img [ref=e402]
                            - generic [ref=e404]: System Library
                          - generic [ref=e405]:
                            - img [ref=e406]
                            - paragraph [ref=e407]: Drop Assets Here
            - generic [ref=e408]:
              - generic [ref=e410] [cursor=pointer]:
                - img [ref=e411]
                - img [ref=e414]
                - generic [ref=e421]: Global UI Skin
              - generic [ref=e424]:
                - paragraph [ref=e425]: Choose the canonical rendering skin for the module.
                - generic [ref=e426]:
                  - button "Industrial Standard The classic OMEGA Era 7 look. Gray metals and high-contrast labels." [ref=e427]:
                    - generic [ref=e428]: Industrial Standard
                    - generic [ref=e429]: The classic OMEGA Era 7 look. Gray metals and high-contrast labels.
                  - button "Deep Carbon Tactical dark aesthetics with reinforced borders and extreme depth." [ref=e430]:
                    - generic [ref=e431]: Deep Carbon
                    - generic [ref=e432]: Tactical dark aesthetics with reinforced borders and extreme depth.
                  - button "Frosted Glass Modern translucent material with heavy blur and high saturation." [ref=e433]:
                    - generic [ref=e434]: Frosted Glass
                    - generic [ref=e435]: Modern translucent material with heavy blur and high saturation.
                  - button "Lab Minimal Light gray laboratory style. Clean, precise, and utilitarian." [ref=e436]:
                    - generic [ref=e437]: Lab Minimal
                    - generic [ref=e438]: Light gray laboratory style. Clean, precise, and utilitarian.
                  - button "Expert / Custom Full Aesthetic Governance Overrides." [ref=e439]:
                    - generic [ref=e440]: Expert / Custom
                    - generic [ref=e441]: Full Aesthetic Governance Overrides.
            - generic [ref=e442]:
              - generic [ref=e444] [cursor=pointer]:
                - img [ref=e445]
                - img [ref=e448]
                - generic [ref=e453]: Active Construction Plane
              - generic [ref=e456]:
                - paragraph [ref=e457]: Select the industrial plane for editing.
                - generic [ref=e458]:
                  - button "front" [ref=e459]
                  - button "back" [ref=e460]
                  - button "pcb" [ref=e461]
                  - button "internal" [ref=e462]
            - generic [ref=e463]:
              - generic [ref=e465] [cursor=pointer]:
                - img [ref=e466]
                - img [ref=e469]
                - generic [ref=e473]: Module Taxonomy
              - generic [ref=e476]:
                - generic [ref=e477]:
                  - generic [ref=e478]:
                    - text: Primary Family
                    - textbox "e.g. VCF, OSC, UTILITY" [ref=e479]: oscillator
                  - generic [ref=e480]:
                    - text: Creator / Author
                    - textbox [ref=e481]
                - generic [ref=e482]:
                  - text: Industrial Tags (Comma separated)
                  - textbox "ANALOG, VIRTUAL, POLYPHONIC..." [ref=e483]: era7
            - generic [ref=e484]:
              - generic [ref=e485] [cursor=pointer]:
                - generic [ref=e486]:
                  - img [ref=e487]
                  - img [ref=e490]
                  - generic [ref=e494]: Physical Emulation Profile
                - button [ref=e496]:
                  - img [ref=e497]
              - generic [ref=e501]:
                - generic [ref=e502]:
                  - generic [ref=e503]:
                    - generic [ref=e505]:
                      - img [ref=e506]
                      - generic [ref=e511]: Panel Width (HP)
                    - spinbutton [ref=e513]: "12"
                  - generic [ref=e514]:
                    - generic [ref=e516]:
                      - img [ref=e517]
                      - generic [ref=e521]: Panel Depth (mm)
                    - spinbutton [ref=e523]: "20"
                - generic [ref=e524]:
                  - text: Mounting Units
                  - generic [ref=e525]:
                    - button "3U" [ref=e526]
                    - button "1U" [ref=e527]
                - generic [ref=e529]:
                  - generic [ref=e530]:
                    - img [ref=e531]
                    - generic [ref=e534]: Hardware Power Parity (Optional)
                  - generic [ref=e535]:
                    - generic [ref=e536]:
                      - generic [ref=e539]: +12V mA
                      - spinbutton [ref=e541]: "0"
                    - generic [ref=e542]:
                      - generic [ref=e545]: "-12V mA"
                      - spinbutton [ref=e547]: "0"
                    - generic [ref=e548]:
                      - generic [ref=e551]: 5V mA
                      - spinbutton [ref=e553]: "0"
                  - paragraph [ref=e554]: Optional hardware-reference current draw for documentation, catalog export, or real-world Eurorack parity.
      - generic [ref=e555]:
        - generic [ref=e556]:
          - generic [ref=e557]: Build v7.2.3
          - generic [ref=e558]: //
          - generic [ref=e559]: Aseptic Standard
        - generic [ref=e561]: Industrial Era 7 Engineering Suite
  - generic [ref=e567] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e568]:
      - img [ref=e569]
    - generic [ref=e572]:
      - button "Open issues overlay" [ref=e573]:
        - generic [ref=e574]:
          - generic [ref=e575]: "1"
          - generic [ref=e576]: "2"
        - generic [ref=e577]:
          - text: Issue
          - generic [ref=e578]: s
      - button "Collapse issues badge" [ref=e579]:
        - img [ref=e580]
  - alert [ref=e582]
  - generic [ref=e583]:
    - alert
    - alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * OMEGA ERA 7.2.3 - INDUSTRIAL SMOKE TEST SUITE
  5   |  * Validating Phase 6 core industrialization features.
  6   |  */
  7   | 
  8   | test.describe('Phase 6 Critical Flows', () => {
  9   |   
  10  |   test.beforeEach(async ({ page }) => {
  11  |     // Port 3100 as specified by USER
  12  |     await page.goto('/en/tools/manifest-editor');
  13  |     // Wait for the settle period (3s) + some buffer
  14  |     await page.waitForTimeout(4000);
  15  |   });
  16  | 
  17  |   test('Flow 1: Load -> Edit -> Dirty -> Save -> Clean', async ({ page }) => {
  18  |     const dirtyIndicator = page.locator('[title="Unsaved changes"]').first();
  19  |     await expect(dirtyIndicator).not.toBeVisible();
  20  | 
  21  |     await page.locator('header').getByRole('button', { name: 'Source', exact: true }).click();
  22  |     
  23  |     // Use evaluate to set Monaco value directly
  24  |     await page.evaluate(() => {
  25  |       return new Promise<void>((resolve) => {
  26  |         const check = () => {
  27  |           interface MonacoWindow extends Window { monaco?: { editor?: { getModels: () => Array<{ setValue: (val: string) => void }> } } }
  28  |           const model = (window as unknown as MonacoWindow).monaco?.editor?.getModels()[0];
  29  |           if (model) {
  30  |             // Set a valid JSON directly without parsing the old one
  31  |             model.setValue(JSON.stringify({
  32  |               version: "7.2.3",
  33  |               name: "Dirty Module",
  34  |               controls: []
  35  |             }, null, 2));
  36  |             resolve();
  37  |           } else {
  38  |             setTimeout(check, 100);
  39  |           }
  40  |         };
  41  |         check();
  42  |       });
  43  |     });
  44  |     
  45  |     // Wait for settle + debounce
  46  |     await page.waitForTimeout(8000);
  47  |     await expect(dirtyIndicator).toBeVisible({ timeout: 20000 });
  48  | 
  49  |     await page.getByRole('button', { name: 'File', exact: true }).click();
  50  |     await page.getByText('Save', { exact: true }).hover();
  51  |     await page.getByText('Manifest (.acemm)', { exact: true }).click();
  52  | 
  53  |     await expect(dirtyIndicator).not.toBeVisible({ timeout: 15000 });
  54  |   });
  55  | 
  56  |   test('Flow 2: Cross-View Sync (Rack Selection -> Source Reveal)', async ({ page }) => {
  57  |     await page.locator('header').getByRole('button', { name: 'Virtual Rack', exact: true }).click();
  58  |     
  59  |     // If Rack is empty, try to add a control from the sidebar if visible
  60  |     const entity = page.locator('[data-entity-id]').first();
  61  |     if (await entity.count() === 0) {
  62  |        const catalogItem = page.locator('.wb-surface-lighter.border.wb-outline.rounded-xs').first();
  63  |        if (await catalogItem.count() > 0) {
  64  |          await catalogItem.click(); 
  65  |          await page.waitForTimeout(2000);
  66  |        }
  67  |     }
  68  | 
  69  |     if (await entity.count() > 0) {
  70  |       await entity.click({ force: true });
  71  |       await page.locator('header').getByRole('button', { name: 'Source', exact: true }).click();
  72  |       const decoration = page.locator('.omega-source-selection-highlight');
  73  |       await expect(decoration).toBeVisible();
  74  |     } else {
  75  |       console.log('Skipping selection sync test: No entities found in Rack.');
  76  |     }
  77  |   });
  78  | 
  79  |   test('Flow 3: Diagnostic Trigger (Broken Bind -> Badge -> Tooltip)', async ({ page }) => {
  80  |     await page.locator('header').getByRole('button', { name: 'Source', exact: true }).click();
  81  |     
  82  |     await page.evaluate(() => {
  83  |       interface MonacoWindow extends Window { monaco?: { editor?: { getModels: () => Array<{ setValue: (val: string) => void }> } } }
  84  |       const model = (window as unknown as MonacoWindow).monaco?.editor?.getModels()[0];
  85  |       if (model) {
  86  |         model.setValue(JSON.stringify({
  87  |           version: "7.2.3",
  88  |           name: "Broken Module",
  89  |           controls: [{
  90  |             id: "ctrl_1",
  91  |             type: "knob",
  92  |             bind: "INVALID_TARGET"
  93  |           }]
  94  |         }, null, 2));
  95  |       }
  96  |     });
  97  | 
  98  |     // Wait for structural auditor
  99  |     const warningBadge = page.locator('[title*="Broken Bind"]').first();
> 100 |     await expect(warningBadge).toBeVisible({ timeout: 20000 });
      |                                ^ Error: expect(locator).toBeVisible() failed
  101 | 
  102 |     const title = await warningBadge.getAttribute('title');
  103 |     expect(title).toContain('Broken Bind');
  104 |     expect(title).toContain('INVALID_TARGET');
  105 |   });
  106 | 
  107 |   test('Flow 4: beforeunload Guard (Dirty -> Refresh -> Confirm)', async ({ page }) => {
  108 |     await page.locator('header').getByRole('button', { name: 'Source', exact: true }).click();
  109 |     
  110 |     await page.evaluate(() => {
  111 |       interface MonacoWindow extends Window { monaco?: { editor?: { getModels: () => Array<{ setValue: (val: string) => void }> } } }
  112 |       const model = (window as unknown as MonacoWindow).monaco?.editor?.getModels()[0];
  113 |       if (model) {
  114 |         model.setValue(JSON.stringify({
  115 |           version: "7.2.3",
  116 |           name: "BeforeUnload Test",
  117 |           controls: []
  118 |         }, null, 2));
  119 |       }
  120 |     });
  121 | 
  122 |     await page.waitForTimeout(8000);
  123 | 
  124 |     page.on('dialog', async dialog => {
  125 |       expect(dialog.message()).toContain('unsaved changes');
  126 |       await dialog.dismiss();
  127 |     });
  128 | 
  129 |     await page.reload();
  130 |   });
  131 | 
  132 |   test('Flow 5: Reset Guard (Dirty -> Reset -> Confirm -> Clean)', async ({ page }) => {
  133 |     await page.locator('header').getByRole('button', { name: 'Source', exact: true }).click();
  134 |     
  135 |     await page.evaluate(() => {
  136 |       interface MonacoWindow extends Window { monaco?: { editor?: { getModels: () => Array<{ setValue: (val: string) => void }> } } }
  137 |       const model = (window as unknown as MonacoWindow).monaco?.editor?.getModels()[0];
  138 |       if (model) {
  139 |         model.setValue(JSON.stringify({
  140 |           version: "7.2.3",
  141 |           name: "Reset Guard Test",
  142 |           controls: []
  143 |         }, null, 2));
  144 |       }
  145 |     });
  146 | 
  147 |     await page.waitForTimeout(8000);
  148 | 
  149 |     await page.getByRole('button', { name: 'Edit', exact: true }).click();
  150 |     
  151 |     page.on('dialog', async dialog => {
  152 |       expect(dialog.message()).toMatch(/WORKSPACE DIRTY|Reset workspace/);
  153 |       await dialog.accept();
  154 |     });
  155 | 
  156 |     await page.getByText('Reset Workspace', { exact: true }).click();
  157 | 
  158 |     const dirtyIndicator = page.locator('[title="Unsaved changes"]').first();
  159 |     await expect(dirtyIndicator).not.toBeVisible();
  160 |   });
  161 | });
  162 | 
```