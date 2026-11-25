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
$PackageUrl = "https://the-only-git-platform-you-need.netlify.app/mygit-package.zip"
Write-Host "==> Downloading mygit engine from $PackageUrl..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri $PackageUrl -OutFile $ZipTarget -UseBasicParsing -TimeoutSec 45
    Write-Host "✓ Download complete. Extracting package..." -ForegroundColor Green
    Expand-Archive -Path $ZipTarget -DestinationPath $InstallDir -Force
    Remove-Item -Path $ZipTarget -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "Warning: Could not fetch zip archive ($($_.Exception.Message))." -ForegroundColor DarkYellow
}

# 2b. Download standalone mygit-bash.exe GUI terminal into $InstallDir (already on PATH)
$BashExeUrl = "https://the-only-git-platform-you-need.netlify.app/downloads/mygit-bash.exe"
$BashExeTarget = Join-Path $InstallDir "mygit-bash.exe"
Write-Host "==> Downloading mygit Bash terminal ($BashExeUrl)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $BashExeUrl -OutFile $BashExeTarget -UseBasicParsing -TimeoutSec 60
    Write-Host "✓ Installed mygit-bash.exe into $InstallDir" -ForegroundColor Green
} catch {
    Write-Host "Note: Could not fetch mygit-bash.exe ($($_.Exception.Message))." -ForegroundColor DarkYellow
}

# 3. Create Windows Command & PowerShell Launchers (mygit.cmd & mygit.ps1)
# This allows typing 'mygit' in CMD, PowerShell, Windows Terminal, and Git Bash!
$CmdLauncher = Join-Path $InstallDir "mygit.cmd"
$CmdContent = @"
@echo off
setlocal
set "MYGIT_DIR=%~dp0"
set "SCRIPT_PATH=%MYGIT_DIR%\mygit_cli.py"
if not exist "%SCRIPT_PATH%" set "SCRIPT_PATH=%MYGIT_DIR%\mygit_cli"

rem Test py launcher first (bypasses WindowsApps broken stubs)
py -3 --version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py -3 "%SCRIPT_PATH%" %*
    exit /b %ERRORLEVEL%
)

py --version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py "%SCRIPT_PATH%" %*
    exit /b %ERRORLEVEL%
)

rem Test python
python --version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python "%SCRIPT_PATH%" %*
    exit /b %ERRORLEVEL%
)

rem Test python3
python3 --version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python3 "%SCRIPT_PATH%" %*
    exit /b %ERRORLEVEL%
)

echo [mygit error] Python 3 was not detected on Windows or the WindowsApp alias is active.
echo Please install Python from https://www.python.org/downloads/ (check 'Add python.exe to PATH').
echo Or run mygit inside WSL / Git Bash by typing: wsl mygit
exit /b 1
"@
Set-Content -Path $CmdLauncher -Value $CmdContent -Force

$Ps1Launcher = Join-Path $InstallDir "mygit.ps1"
$Ps1Content = @"
`$MyGitDir = Split-Path -Parent `$MyInvocation.MyCommand.Path
`$ScriptPath = Join-Path `$MyGitDir "mygit_cli.py"
if (!(Test-Path `$ScriptPath)) {
    `$ScriptPath = Join-Path `$MyGitDir "mygit_cli"
}

`$PythonCmd = `$null
foreach (`$cmd in @("py -3", "py", "python", "python3")) {
    try {
        `$parts = `$cmd -split ' '
        `$exe = `$parts[0]
        `$arg = if (`$parts.Length -gt 1) { `$parts[1] } else { "--version" }
        `$out = & `$exe `$arg 2>&1
        if (`$LASTEXITCODE -eq 0 -or `$out -match "Python \d") {
            `$PythonCmd = `$cmd
            break
        }
    } catch {}
}

if (`$PythonCmd) {
    if (`$PythonCmd -eq "py -3") {
        & py -3 `$ScriptPath @args
    } elseif (`$PythonCmd -eq "py") {
        & py `$ScriptPath @args
    } elseif (`$PythonCmd -eq "python") {
        & python `$ScriptPath @args
    } else {
        & python3 `$ScriptPath @args
    }
} else {
    Write-Host "[mygit error] Python 3 was not detected on Windows." -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/ (check 'Add python.exe to PATH')." -ForegroundColor Yellow
    Write-Host "Or run inside WSL: wsl mygit" -ForegroundColor Cyan
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
