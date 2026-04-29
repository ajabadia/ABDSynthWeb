param(
    [string[]]$Exclude = @(),   # carpetas/rutas adicionales a excluir (relativas al root)
    [switch]$Compact            # modo compacto
)

# Script to bundle all source code into a JSONL file + metadata
# Adapted for ABDSynths project

# Determine root directory based on script location (assumes scripts/ folder)
$scriptDir = $PSScriptRoot
$rootDir = (Get-Item $scriptDir).Parent.FullName

$timestamp = Get-Date -Format "yyyyMMddHHmm"

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

# Combine base excludes with user-provided ones
$excludeDirs = New-Object System.Collections.Generic.List[string]
[string[]]$excludeDirsBase | ForEach-Object { $excludeDirs.Add($_) }

foreach ($ex in $Exclude) {
    if ([string]::IsNullOrWhiteSpace($ex)) { continue }
    $excludeDirs.Add($ex.Trim())
}

# GLOBAL size threshold (safety limit for ANY file)
$globalSizeLimitBytes = 500KB

# Explicitly excluded extensions
$excludedExtensions = @(".png", ".jpg", ".jpeg", ".gif", ".pdf", ".ttf", ".woff", ".woff2", ".exe", ".dll", ".lib", ".obj", ".pdb")

Write-Host "Bundling code from $rootDir to $jsonlFile..."

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

function Get-ProjectName {
    param([string]$RootDir)
    $pkgPath = Join-Path $RootDir "package.json"
    if (Test-Path $pkgPath) {
        try {
            $pkgJson = Get-Content $pkgPath -Raw | ConvertFrom-Json
            if ($pkgJson.name) { return $pkgJson.name }
        } catch {}
    }
    return (Split-Path $RootDir -Leaf)
}

# Create Writers
$jsonlWriter   = [System.IO.StreamWriter]::new($jsonlFile, $false, [System.Text.Encoding]::UTF8)
$controlWriter = [System.IO.StreamWriter]::new($controlFile, $false, [System.Text.Encoding]::UTF8)

# Global stats
$totalFiles       = 0
$totalBytes       = 0
$includedFiles    = 0
$includedBytes    = 0

try {
    # 1. Get files from explicitly included folders
    $allFiles = @()
    foreach ($folder in $foldersToProcess) {
        $folderPath = Join-Path $rootDir $folder
        if (Test-Path $folderPath) {
            $allFiles += Get-ChildItem -Path $folderPath -Recurse -File
        }
    }

    # 2. Get specific files from root
    foreach ($f in $specificFiles) {
        $fPath = Join-Path $rootDir $f
        if (Test-Path $fPath) {
            $allFiles += Get-Item $fPath
        }
    }

    $allFiles = $allFiles | Sort-Object FullName -Unique

    foreach ($item in $allFiles) {
        $filePath     = $item.FullName
        $relativePath = $filePath.Substring($rootDir.Length + 1)

        $totalFiles++
        $totalBytes += $item.Length

        if (Is-InExcludedDir -RelativePath $relativePath -ExcludeList $excludeDirs) {
            $controlWriter.WriteLine("$relativePath : SKIPPED_EXCLUDED_DIR")
            continue
        }

        if ($item.Length -gt $globalSizeLimitBytes) {
            $controlWriter.WriteLine("$relativePath : SKIPPED_OVER_SIZE_LIMIT")
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

            $json = $obj | ConvertTo-Json -Depth 10 -Compress
            $jsonlWriter.WriteLine($json)

            $includedFiles++
            $includedBytes += $item.Length
            $controlWriter.WriteLine("$relativePath : OK")
            Write-Host "Added: $relativePath"
        }
        catch {
            $controlWriter.WriteLine("${relativePath} : ERROR $_")
        }
    }

    # Meta
    $meta = [PSCustomObject]@{
        projectName = Get-ProjectName -RootDir $rootDir
        generatedAt = (Get-Date).ToString("o")
        stats = [PSCustomObject]@{
            totalFiles    = $totalFiles
            includedFiles = $includedFiles
        }
    }
    $metaJson = $meta | ConvertTo-Json -Depth 10 -Compress
    $meta | ConvertTo-Json -Depth 10 | Out-File -FilePath $metaFile -Encoding UTF8

} finally {
    $jsonlWriter.Close()
    $controlWriter.Close()
}

Write-Host "Done! Bundle created in $jsonlFile"
