# OMEGA SYSTEM AUDIT ORCHESTRATOR (Era 7.2.3)
# ---------------------------------------------------------------------------
# This script executes a full system health check and records the output.
# It ensures Zero-Noise and Architectural Integrity.
# ---------------------------------------------------------------------------

$LogFile = "omega-audit-results.log"
$Separator = "`n" + ("=" * 80) + "`n"
$GlobalStatus = $true

# HELPER: Extract context for errors to allow faster remediation
function Write-LogWithContext($Output) {
    $CurrentFile = ""
    foreach ($line in $Output) {
        $line = "$line" # Ensure string
        $line | Out-File -FilePath $LogFile -Append -Encoding utf8
        
        # TSC Pattern: path/to/file.ts(10,5): error TS1234: message
        if ($line -match '^(.*?)\((\d+),(\d+)\): error (.*)$') {
            $file = $Matches[1].Trim()
            $lineNum = [int]$Matches[2]
            if (Test-Path $file) {
                try {
                    $content = Get-Content $file -TotalCount $lineNum -ErrorAction SilentlyContinue | Select-Object -Last 1
                    if ($null -ne $content) {
                        "  -> [REMEDIATION] L${lineNum}: $($content.Trim())" | Out-File -FilePath $LogFile -Append -Encoding utf8
                    }
                } catch {}
            }
        }
        
        # ESLint Pattern (File Header)
        if ($line -match '^[A-Z]:\\.*') {
            $CurrentFile = $line.Trim()
        }
        
        # ESLint Pattern (Error):   10:5  error  message  @rule
        if ($line -match '^\s+(\d+):(\d+)\s+error\s+(.*)$') {
            $lineNum = [int]$Matches[1]
            if ($CurrentFile -and (Test-Path $CurrentFile)) {
                try {
                    $content = Get-Content $CurrentFile -TotalCount $lineNum -ErrorAction SilentlyContinue | Select-Object -Last 1
                    if ($null -ne $content) {
                        "  -> [REMEDIATION] L${lineNum}: $($content.Trim())" | Out-File -FilePath $LogFile -Append -Encoding utf8
                    }
                } catch {}
            }
        }
    }
}

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
$ArchOutput = npm run arch-audit 2>&1
$ArchOutput | Out-File -FilePath $LogFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { $GlobalStatus = $false; Write-Host "  -> [FAILED] Architectural Audit" -ForegroundColor Red } else { Write-Host "  -> [PASSED] Architectural Audit" -ForegroundColor Green }

# 3. TYPESCRIPT COMPILATION (TSC)
Write-Host "[2/3] Running Type Safety Check..." -ForegroundColor Yellow
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"SECTION 2: TYPE SAFETY CHECK (tsc)" | Out-File -FilePath $LogFile -Append -Encoding utf8
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
$TscOutput = npx tsc --noEmit 2>&1
Write-LogWithContext $TscOutput
if ($LASTEXITCODE -ne 0) { $GlobalStatus = $false; Write-Host "  -> [FAILED] Type Safety Check" -ForegroundColor Red } else { Write-Host "  -> [PASSED] Type Safety Check" -ForegroundColor Green }

# 4. ESLINT HYGIENE
Write-Host "[3/3] Running Code Linting..." -ForegroundColor Yellow
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"SECTION 3: CODE LINTING (eslint)" | Out-File -FilePath $LogFile -Append -Encoding utf8
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
$LintOutput = npm run lint --quiet 2>&1
Write-LogWithContext $LintOutput
if ($LASTEXITCODE -ne 0) { $GlobalStatus = $false; Write-Host "  -> [FAILED] Code Linting" -ForegroundColor Red } else { Write-Host "  -> [PASSED] Code Linting" -ForegroundColor Green }

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
        $GlobalStatus = $false
        Write-Host "  -> [FAILED] Missing critical file: $File" -ForegroundColor Red
    }
}

# 6. FINAL SUMMARY
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
if ($GlobalStatus) {
    Write-Host "`n[OMEGA AUDIT] SYSTEM READY: ALL CHECKS PASSED ✅" -ForegroundColor Green -BackgroundColor Black
    "STATUS: ALL CHECKS PASSED" | Out-File -FilePath $LogFile -Append -Encoding utf8
} else {
    Write-Host "`n[OMEGA AUDIT] SYSTEM COMPROMISED: ERRORS DETECTED ❌" -ForegroundColor Red -BackgroundColor Black
    "STATUS: ERRORS DETECTED" | Out-File -FilePath $LogFile -Append -Encoding utf8
}

Write-Host "`n[OMEGA AUDIT] Complete! Results saved to: $LogFile" -ForegroundColor Green
Write-Host "[REMEDIATION] See docs/arch-audit-report.csv and docs/OMEGA_Remediation_Map.md" -ForegroundColor Cyan
$Separator | Out-File -FilePath $LogFile -Append -Encoding utf8
"END OF REPORT" | Out-File -FilePath $LogFile -Append -Encoding utf8

if (-not $GlobalStatus) { exit 1 }
