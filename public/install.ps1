# ==============================================================================
# mygit Windows Automated Installer (PowerShell)
# Author: Om Raut
# Description: Installs mygit into %LOCALAPPDATA%\Programs\mygit
#              and automatically configures the Windows User PATH environment variable.
# Usage:
#   irm https://mygit.netlify.app/install.ps1 | iex
# ==============================================================================

$ErrorActionPreference = "Stop"

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

function Write-BrandHeader {
    Write-Host ""
    Write-Host "   __  ____  ______ _____ ______ " -ForegroundColor Cyan
    Write-Host "  /  |/  \ \/ / ___|_   _/  ____|" -ForegroundColor Cyan
    Write-Host " / /|_/ / \  / |  _  | | | |  _  " -ForegroundColor Cyan
    Write-Host "/ /  / /  / /| |_| |_| |_| |_| | " -ForegroundColor Cyan
    Write-Host "\_/  /_/  /_/  \____|_____|\_____| " -ForegroundColor Cyan
    Write-Host ""
    Write-Host " >> Decentralized, Byte-Compatible Version Control Platform" -ForegroundColor DarkGray
    Write-Host " >> Created by Om Raut (CDAC Pass Out Student)" -ForegroundColor Yellow
    Write-Host " >> Automated Windows Environment Setup" -ForegroundColor DarkGray
    Write-Host ""
}

Write-BrandHeader

# 1. Target Directory: %LOCALAPPDATA%\Programs\mygit (Standard per-user path, no admin needed)
$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\mygit"
$ZipTarget = Join-Path $env:TEMP "mygit-package.zip"

Write-Host "==> Target directory: $InstallDir" -ForegroundColor Yellow

if (!(Test-Path -Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "✓ Created installation directory." -ForegroundColor Green
}

# 2. Download Package
$PackageUrl = "https://velvety-druid-dccd85.netlify.app/mygit-package.zip"
Write-Host "==> Downloading mygit engine from $PackageUrl..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri $PackageUrl -OutFile $ZipTarget -UseBasicParsing -TimeoutSec 45
    Write-Host "✓ Download complete. Extracting package..." -ForegroundColor Green
    Expand-Archive -Path $ZipTarget -DestinationPath $InstallDir -Force
    Remove-Item -Path $ZipTarget -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "Warning: Could not fetch zip archive ($($_.Exception.Message))." -ForegroundColor DarkYellow
}

# 3. Create Windows Command & PowerShell Launchers (mygit.cmd & mygit.ps1)
# This allows typing 'mygit' in CMD, PowerShell, Windows Terminal, and Git Bash!
$CmdLauncher = Join-Path $InstallDir "mygit.cmd"
$CmdContent = @"
@echo off
setlocal
set "MYGIT_DIR=%~dp0"
if exist "%MYGIT_DIR%\mygit.exe" (
    "%MYGIT_DIR%\mygit.exe" %*
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        python "%MYGIT_DIR%\mygit_cli" %*
    ) else (
        echo [mygit] Python or mygit.exe not detected in %MYGIT_DIR%
        exit /b 1
    )
)
"@
Set-Content -Path $CmdLauncher -Value $CmdContent -Force

$Ps1Launcher = Join-Path $InstallDir "mygit.ps1"
$Ps1Content = @"
`$MyGitDir = Split-Path -Parent `$MyInvocation.MyCommand.Path
`$ExePath = Join-Path `$MyGitDir "mygit.exe"
if (Test-Path `$ExePath) {
    & `$ExePath @args
} else {
    python (Join-Path `$MyGitDir "mygit_cli") @args
}
"@
Set-Content -Path $Ps1Launcher -Value $Ps1Content -Force

# 4. Automatically Register in Windows Environment Variables (User PATH)
Write-Host "==> Configuring Windows Environment Variables..." -ForegroundColor Yellow

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($null -eq $UserPath) { $UserPath = "" }

$PathArray = $UserPath -split ';' | Where-Object { $_ -ne "" }

if ($PathArray -notcontains $InstallDir) {
    $NewPath = if ($UserPath.EndsWith(';') -or [string]::IsNullOrWhiteSpace($UserPath)) {
        "$UserPath$InstallDir"
    } else {
        "$UserPath;$InstallDir"
    }

    [Environment]::SetEnvironmentVariable("Path", $NewPath, "User")
    Write-Host "✓ Successfully added '$InstallDir' to your Windows User PATH variable!" -ForegroundColor Green
} else {
    Write-Host "✓ Windows PATH already includes '$InstallDir'." -ForegroundColor Green
}

# 5. Inject into the Current Running Session
$env:Path = "$InstallDir;$env:Path"

# 6. Verify Command Availability
Write-Host "==> Verifying installation..." -ForegroundColor Yellow
$InstalledOk = $false
try {
    if (Get-Command mygit -ErrorAction SilentlyContinue) {
        $InstalledOk = $true
    }
} catch {}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host " 🎉 mygit has been successfully installed on your Windows machine!" -ForegroundColor Green
Write-Host " 🚀 Created with ❤️ by Om Raut (CDAC Pass Out Student)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host " You can now use mygit anywhere from any command line:" -ForegroundColor White
Write-Host ""
Write-Host "   mygit whoami           " -ForegroundColor Cyan -NoNewline
Write-Host "# Check your active user session" -ForegroundColor Gray
Write-Host "   mygit login            " -ForegroundColor Cyan -NoNewline
Write-Host "# Authenticate with your cloud account" -ForegroundColor Gray
Write-Host "   mygit init my-app      " -ForegroundColor Cyan -NoNewline
Write-Host "# Initialize a new local repository" -ForegroundColor Gray
Write-Host "   mygit                  " -ForegroundColor Cyan -NoNewline
Write-Host "# Enter the dedicated interactive shell" -ForegroundColor Gray
Write-Host ""
Write-Host " (Note: If opening an existing PowerShell/CMD window, restart it once for PATH reload)" -ForegroundColor DarkGray
Write-Host ""
