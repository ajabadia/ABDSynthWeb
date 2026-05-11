param(
    [string[]]$Exclude = @(),   # carpetas/rutas adicionales a excluir (relativas al root)
    [switch]$Compact,           # modo compacto
    [string]$Mode               # 'total' or 'delta'
)

# OMEGA ERA 7.2.3 - INDUSTRIAL BUNDLER & AUDITOR
# This script handles both full project bundling and surgical delta reporting.

# Determine root directory based on script location (assumes scripts/ folder)
$scriptDir = $PSScriptRoot
$rootDir = (Get-Item $scriptDir).Parent.FullName

# Interactive mode if no Mode is specified
if (-not $Mode) {
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "          OMEGA INDUSTRIAL BUNDLER & AUDITOR        " -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "1. TOTAL BUNDLE (Full JSONL for AI Consumption)"
    Write-Host "2. DELTA REPORT (Surgical Audit & Pre-Phase 8 Check)"
    $choice = Read-Host "Select execution mode [1-2]"
    if ($choice -eq "1") { $Mode = "total" }
    elseif ($choice -eq "2") { $Mode = "delta" }
    else { Write-Host "Invalid choice. Aborting."; exit }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if ($Mode -eq "total") {
    # --- TOTAL BUNDLE LOGIC ---
    
    # Ensure exports directory exists
    $exportsDir = Join-Path $rootDir "exports"
    if (-not (Test-Path $exportsDir)) {
        New-Item -ItemType Directory -Path $exportsDir | Out-Null
    }

    $jsonlFile   = Join-Path $exportsDir "project_bundle_$timestamp.jsonl"
    $metaFile    = Join-Path $exportsDir "project_metadata_$timestamp.json"
    $controlFile = Join-Path $exportsDir "CONTROL_FILESCODE_$timestamp.txt"

    # Extensions to include
    $includeExtensions = @(".js", ".ts", ".tsx", ".css", ".json", ".md", ".ps1", ".bat", ".yml", ".yaml", ".html", ".txt")
    $specificFiles = @(
        "README.md",
        ".gitignore",
        "package.json",
        "next.config.ts",
        "tailwind.config.ts"
    )

    # Folders to explicitly INCLUDE (relative to root)
    $foldersToProcess = @("app", "src", ".agent", ".brain")

    # Directories to exclude (always ignore these)
    $excludeDirsBase = @(
        "node_modules", ".next", ".git", ".vscode", "tmp", "out", "bin", "obj",
        "public", ".swc", "coverage", "test-results", ".turbo",
        ".vercel", "dist", "build", "exports", ".gemini"
    )

    $excludeDirs = New-Object System.Collections.Generic.List[string]
    [string[]]$excludeDirsBase | ForEach-Object { $excludeDirs.Add($_) }

    foreach ($ex in $Exclude) {
        if ([string]::IsNullOrWhiteSpace($ex)) { continue }
        $excludeDirs.Add($ex.Trim())
    }

    $globalSizeLimitBytes = 500KB

    Write-Host "Starting Total Bundle at $jsonlFile..." -ForegroundColor Yellow

    # Helpers
    function Get-LanguageFromExtension {
        param([string]$Extension)
        switch ($Extension.ToLower()) {
            ".html" { "html" }
            ".js"    { "javascript" }
            ".ts"    { "typescript" }
            ".tsx"   { "tsx" }
            ".css"   { "css" }
            ".json" { "json" }
            ".md"   { "markdown" }
            ".ps1"  { "powershell" }
            ".bat"  { "batch" }
            ".yml"  { "yaml" }
            ".yaml" { "yaml" }
            default { "text" }
        }
    }

    function Is-InExcludedDir {
        param(
            [string]$RelativePath,
            [System.Collections.Generic.List[string]]$ExcludeList
        )
        foreach ($ex in $ExcludeList) {
            $exNorm = $ex -replace '/', '\'
            if ($RelativePath -like "*\$exNorm\*") { return $true }
            if ($RelativePath -like ".\$exNorm\*") { return $true }
            if ($RelativePath -like "$exNorm\*") { return $true }
        }
        return $false
    }

    $jsonlWriter   = [System.IO.StreamWriter]::new($jsonlFile, $false, [System.Text.Encoding]::UTF8)
    $controlWriter = [System.IO.StreamWriter]::new($controlFile, $false, [System.Text.Encoding]::UTF8)

    $totalFiles       = 0
    $includedFiles    = 0

    try {
        $allFiles = @()
        foreach ($folder in $foldersToProcess) {
            $folderPath = Join-Path $rootDir $folder
            if (Test-Path $folderPath) {
                $allFiles += Get-ChildItem -Path $folderPath -Recurse -File
            }
        }

        foreach ($f in $specificFiles) {
            $fPath = Join-Path $rootDir $f
            if (Test-Path $fPath) { $allFiles += Get-Item $fPath }
        }

        $allFiles = $allFiles | Sort-Object FullName -Unique

        foreach ($item in $allFiles) {
            $filePath     = $item.FullName
            $relativePath = $filePath.Substring($rootDir.Length + 1)
            $totalFiles++

            if (Is-InExcludedDir -RelativePath $relativePath -ExcludeList $excludeDirs) {
                $controlWriter.WriteLine("$relativePath : SKIPPED_EXCLUDED_DIR")
                continue
            }

            if ($item.Length -gt $globalSizeLimitBytes) {
                $controlWriter.WriteLine("$relativePath : SKIPPED_OVER_SIZE_LIMIT")
                continue
            }

            $ext = $item.Extension.ToLower()
            $isSpecific = $specificFiles -contains $item.Name
            if (-not $isSpecific -and $includeExtensions -notcontains $ext) {
                $controlWriter.WriteLine("$relativePath : SKIPPED_BIN_OR_NOT_TEXT")
                continue
            }

            try {
                $content = [System.IO.File]::ReadAllText($filePath)
                if ([string]::IsNullOrWhiteSpace($content)) {
                    $controlWriter.WriteLine("$relativePath : EMPTY")
                    continue
                }

                $obj = [PSCustomObject]@{
                    type     = "file"
                    path     = $relativePath
                    language = Get-LanguageFromExtension $item.Extension
                    size     = $item.Length
                    content  = $content
                }

                $jsonlWriter.WriteLine(($obj | ConvertTo-Json -Depth 10 -Compress))
                $includedFiles++
                $controlWriter.WriteLine("$relativePath : OK")
                if (-not $Compact) { Write-Host "Added: $relativePath" }
            }
            catch {
                $controlWriter.WriteLine("${relativePath} : ERROR $_")
            }
        }

        Write-Host "Total Bundle Complete! Added $includedFiles files." -ForegroundColor Green
    } finally {
        $jsonlWriter.Close()
        $controlWriter.Close()
    }

} else {
    # --- DELTA REPORT LOGIC ---
    
    Write-Host "Generating OMEGA Delta Report..." -ForegroundColor Yellow
    
    $gitBranch = git rev-parse --abbrev-ref HEAD 2>$null
    $gitCommit = git rev-parse --short HEAD 2>$null

    $reportHeader = @"
# OMEGA Phase 7.1.b — Delta Report
**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Branch:** $gitBranch
**Commit:** $gitCommit

---

## 1. Archivos Modificados (últimas 24h)

``````
"@
    $report = $reportHeader

    $modifiedFiles = git diff --name-status HEAD@{1.day.ago} HEAD 2>$null
    if ($modifiedFiles) {
        $report += $modifiedFiles + "`n"
    } else {
        $report += "(No changes detected in git history)`n"
    }

    $report += "``````" + "`n`n" + "## 2. Archivos Clave Tocados" + "`n`n" + "``````" + "`n"

    $criticalFiles = @(
        "src/features/manifest-editor/hooks/useDocumentOrchestrator.ts",
        "src/features/manifest-editor/hooks/useManifestEditor.ts",
        "src/features/manifest-editor/hooks/useWorkbenchState.ts",
        "src/features/manifest-editor/hooks/entities/useEntityCRUD.ts",
        "src/features/manifest-editor/types/document.ts",
        "src/hooks/map.md"
    )

    foreach ($file in $criticalFiles) {
        $fPath = Join-Path $rootDir $file
        if (Test-Path $fPath) {
            $status = git diff --name-status HEAD@{1.day.ago} HEAD -- $fPath 2>$null
            if ($status) { $report += "[MODIFIED] $file`n" }
            else { $report += "[unchanged] $file`n" }
        } else {
            $report += "[MISSING] $file`n"
        }
    }

    $report += "``````" + "`n`n" + "## 3. Legacy Purge Status" + "`n`n" + "``````" + "`n"

    $legacyFiles = @("src/features/manifest-editor/hooks/useManifestState.ts")
    foreach ($legacy in $legacyFiles) {
        $lPath = Join-Path $rootDir $legacy
        if (Test-Path $lPath) {
            $content = Get-Content $lPath -Raw
            if ($content -match "PURGED LEGACY ARTIFACT") {
                $report += "[TOMBSTONED] $legacy`n"
            } else {
                $report += "[STILL ACTIVE] $legacy`n"
            }
        } else {
            $report += "[DELETED] $legacy`n"
        }
    }

    $report += "``````" + "`n`n" + "## 4. TypeScript & Lint Status" + "`n`n" + "``````" + "`n"

    $origDir = Get-Location
    Set-Location $rootDir
    
    Write-Host "Running TypeScript check..." -ForegroundColor Yellow
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) { $report += "[PASS] TypeScript: zero errors`n" }
    else { $report += "[FAIL] TypeScript: errors detected`n$tscOutput`n" }

    Write-Host "Running ESLint..." -ForegroundColor Yellow
    $lintOutput = npm run lint -- --quiet 2>&1
    if ($LASTEXITCODE -eq 0) { $report += "[PASS] ESLint: zero errors`n" }
    else { $report += "[FAIL] ESLint: errors detected`n$lintOutput`n" }

    $report += "``````" + "`n`n" + "## 5. localStorage Keys Inventory" + "`n`n"

    $localStorageRefs = Get-ChildItem -Path (Join-Path $rootDir "src") -Filter "*.ts*" -Recurse | 
        Select-String -Pattern "localStorage\.(get|set)Item" -AllMatches | 
        Select-Object -ExpandProperty Line | 
        ForEach-Object { 
            if ($_ -match "localStorage\.(get|set)Item\(['""]([^'""]+)['""]") { $matches[2] }
        } | Select-Object -Unique

    if ($localStorageRefs) {
        foreach ($key in $localStorageRefs) { $report += "  - $key`n" }
    } else {
        $report += "(No localStorage usage detected)`n"
    }

    $report += "`n" + "## 6. Contract Alignment Check" + "`n`n"

    $contractFile = Join-Path $rootDir "src/features/manifest-editor/types/document.ts"
    $implFile = Join-Path $rootDir "src/features/manifest-editor/hooks/useDocumentOrchestrator.ts"

    if ((Test-Path $contractFile) -and (Test-Path $implFile)) {
        $contractContent = Get-Content $contractFile -Raw
        $implContent = Get-Content $implFile -Raw
        $methods = @("openDocument", "closeDocument", "updateDocument", "setActiveDocument", "captureStableSnapshot", "resetDocument")
        foreach ($method in $methods) {
            $inContract = $contractContent -match $method
            $inImpl = $implContent -match "const $method"
            if ($inContract -and $inImpl) { $report += "[ALIGNED] $method`n" }
            elseif ($inContract) { $report += "[MISSING] $method in implementation`n" }
            else { $report += "[EXTRA] $method implemented but not in contract`n" }
        }
    }

    $report += "`n" + "## 7. Smoke Tests (Manual Checklist)" + "`n`n"
    $report += "- [ ] **Clipboard Cross-Doc**: Copy A -> Paste B (ID regenerated)`n"
    $report += "- [ ] **Session Restore**: Multi-tab + split + refresh restoration`n"
    $report += "- [ ] **Reset Document**: Factory reset clears dirty state`n"
    $report += "- [ ] **Zero Legacy**: No active references to useManifestState`n"
    $report += "`n---`n*Ready for Phase 8 Certification: YES / NO*"

    $exportsDir = Join-Path $rootDir "exports"
    if (-not (Test-Path $exportsDir)) { New-Item -ItemType Directory -Path $exportsDir | Out-Null }
    $outputPath = Join-Path $exportsDir "delta_report_$timestamp.md"
    $report | Out-File -FilePath $outputPath -Encoding UTF8
    
    Set-Location $origDir
    Write-Host "Delta Report generated at $outputPath" -ForegroundColor Green
    Start-Process $outputPath
}
