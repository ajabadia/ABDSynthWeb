# OMEGA SYSTEM AUDIT ORCHESTRATOR (Era 7.2.3)
# ---------------------------------------------------------------------------
# This script executes a full system health check and records the output.
# It ensures Zero-Noise and Architectural Integrity.
# ---------------------------------------------------------------------------

$LogFile = "omega-audit-results.log"
$Separator = "`n" + ("=" * 80) + "`n"

# 1. INITIALIZATION: Clear previous log
if (Test-Path $LogFile) {
    Remove-Item $LogFile
}

Write-Host "`n[OMEGA AUDIT] Starting full system check..." -ForegroundColor Cyan
"OMEGA SYSTEM AUDIT REPORT - $(Get-Date)" | Out-File -FilePath $LogFile -Encoding utf8

# 2. ARCHITECTURAL GUARD (ADR-014)
Write-Host "[1/3] Running Architectural Audit..." -ForegroundColor Yellow
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"SECTION 1: ARCHITECTURAL INTEGRITY (arch-audit)" | Out-File -FilePath $LogFile -Append -Encoding utf8
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
npm run arch-audit 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8

# 3. TYPESCRIPT COMPILATION (TSC)
Write-Host "[2/3] Running Type Safety Check..." -ForegroundColor Yellow
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"SECTION 2: TYPE SAFETY CHECK (tsc)" | Out-File -FilePath $LogFile -Append -Encoding utf8
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
npx tsc --noEmit 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8

# 4. ESLINT HYGIENE
Write-Host "[3/3] Running Code Linting..." -ForegroundColor Yellow
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"SECTION 3: CODE LINTING (eslint)" | Out-File -FilePath $LogFile -Append -Encoding utf8
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
npm run lint --quiet 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8

# 5. INTEGRITY VERIFICATION (Extra)
Write-Host "[BONUS] Verifying Critical Manifests..." -ForegroundColor Cyan
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"SECTION 4: CRITICAL FILE INTEGRITY" | Out-File -FilePath $LogFile -Append -Encoding utf8
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
$CriticalFiles = @("package.json", "tsconfig.json", "src/omega-ui-core/governance/ElementCatalog.ts")
foreach ($File in $CriticalFiles) {
    if (Test-Path $File) {
        "OK: $File exists." | Out-File -FilePath $LogFile -Append -Encoding utf8
    } else {
        "ERROR: $File is MISSING!" | Out-File -FilePath $LogFile -Append -Encoding utf8
    }
}

Write-Host "`n[OMEGA AUDIT] Complete! Results saved to: $LogFile" -ForegroundColor Green
Write-Host "[REMEDIATION] See docs/arch-audit-report.csv and docs/OMEGA_Remediation_Map.md" -ForegroundColor Cyan
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"END OF REPORT" | Out-File -FilePath $LogFile -Append -Encoding utf8
