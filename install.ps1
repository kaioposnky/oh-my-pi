<#
.SYNOPSIS
  Fork installer for omp (oh-my-pi) - kaioposnky/oh-my-pi (Windows).

.DESCRIPTION
  Installs the fork build (which carries the provider tool-name truncation fix)
  over any existing omp installation, verifying the download against the
  release SHA256SUMS.txt before replacing anything.

.EXAMPLE
  ./install.ps1
  ./install.ps1 -Lang pt -Yes
#>
param(
  [string]$Lang = "auto",
  [switch]$Yes,
  [string]$Version = $env:VERSION
)

$ErrorActionPreference = "Stop"
$Repo = "kaioposnky/oh-my-pi"
$InstallDir = Join-Path $HOME ".local\bin"
$NpmPkg = "@oh-my-pi/pi-coding-agent"

if ($Lang -eq "auto") {
  $ui = (Get-Culture).TwoLetterISOLanguageName
  $Lang = if ($ui -eq "pt") { "pt" } else { "en" }
}

function Say([string]$En, [string]$Pt) {
  $text = if ($Lang -eq "pt") { $Pt } else { $En }
  Write-Host $text
}

function Sayf([string]$En, [string]$Pt, [object]$Value) {
  $text = if ($Lang -eq "pt") { $Pt } else { $En }
  Write-Host ($text -f $Value)
}

Say "== omp (oh-my-pi) fork installer ($Repo) ==" "== Instalador do fork omp / oh-my-pi ($Repo) =="

$explainEn = @"
This fork fixes a provider bug (e.g. Verboo models) that drops the last
character of tool names on tool calls, derailing the agent session.
This will REPLACE your current omp installation with the fork build
(same path, same 'omp' command). The download is hash-verified against
the release SHA256SUMS.txt before anything is replaced.
"@
$explainPt = @"
Este fork corrige um bug de provedores (ex.: Verboo) que derruba o ultimo
caractere do nome das ferramentas nas chamadas, quebrando a sessao do agente.
Isto VAI SUBSTITUIR sua instalacao atual do omp pela versao do fork
(mesmo caminho, mesmo comando 'omp'). O hash do download e verificado
contra o SHA256SUMS.txt do release antes de qualquer substituicao.
"@
Write-Host $(if ($Lang -eq "pt") { $explainPt } else { $explainEn })

# --- architecture ---
$arch = switch ($env:PROCESSOR_ARCHITECTURE) {
  "ARM64" { "arm64" }
  default { "x64" }
}
Sayf "-> Detected architecture: {0}" "-> Arquitetura detectada: {0}" $arch

# --- version ---
if (-not $Version) {
  Say "-> Resolving latest fork release..." "-> Resolvendo versao mais recente do fork..."
  $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
  $Version = ($rel.tag_name -replace "^v", "")
}
Sayf "-> Selected version: {0}" "-> Versao selecionada: {0}" $Version

$asset = "omp-win32-$arch.exe"
$base = "https://github.com/$Repo/releases/download/v$Version"

# --- stop running instances so the binary file is not locked ---
$running = Get-Process -Name "omp" -ErrorAction SilentlyContinue
if ($running) {
  Say "   running omp process found; it will be stopped." "   processo omp em execucao encontrado; ele sera encerrado."
  foreach ($proc in $running) {
    try { Stop-Process -Id $proc.Id -Force -ErrorAction Stop } catch {}
  }
}

# --- confirm ---
if (-not $Yes -and [Environment]::UserInteractive) {
  $prompt = if ($Lang -eq "pt") { "Continuar? [s/N]" } else { "Continue? [y/N]" }
  $answer = Read-Host $prompt
  if ($answer -notmatch "^(y|yes|s|sim)$") {
    Say "Aborted. Nothing was changed." "Cancelado. Nada foi alterado."
    exit 1
  }
}

# --- download + verify ---
$tmp = New-Item -ItemType Directory -Path (Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName()))
try {
  Sayf "-> Downloading {0} ..." "-> Baixando {0} ..." $asset
  $assetPath = Join-Path $tmp $asset
  $sumsPath = Join-Path $tmp "SHA256SUMS.txt"
  Invoke-WebRequest -Uri "$base/$asset" -OutFile $assetPath -UseBasicParsing
  Invoke-WebRequest -Uri "$base/SHA256SUMS.txt" -OutFile $sumsPath -UseBasicParsing

  Say "-> Verifying SHA-256 checksum..." "-> Verificando checksum SHA-256..."
  $expectedLine = (Get-Content $sumsPath) | Where-Object { $_ -match "(^|\s)$([regex]::Escape($asset))(\s|$)" } | Select-Object -First 1
  $expected = ($expectedLine -split "\s+")[0]
  $actual = (Get-FileHash -Algorithm SHA256 $assetPath).Hash.ToLower()
  if (-not $expected -or $expected.ToLower() -ne $actual) {
    Say "!! CHECKSUM MISMATCH - aborted, nothing was changed." "!! CHECKSUM NAO CONFERE - abortado, nada foi alterado."
    exit 65
  }

  # --- remove npm-managed copies so only the fork answers ---
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    $globalList = & npm ls -g --depth=0 2>$null | Out-String
    if ($globalList -match [regex]::Escape($NpmPkg)) {
      Say "   removing npm-global $NpmPkg..." "   removendo $NpmPkg global do npm..."
      & npm rm -g $NpmPkg 2>$null
    }
  }

  # --- install ---
  Sayf "-> Installing to {0} ..." "-> Instalando em {0} ..." $InstallDir
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Copy-Item $assetPath (Join-Path $InstallDir "omp.exe") -Force
}
finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

# --- PATH check ---
$pathValue = [Environment]::GetEnvironmentVariable("Path", "User")
if (($pathValue -split ";") -notcontains $InstallDir) {
  Sayf "!! {0} is not on your user PATH. Add it with:" "!! {0} nao esta no PATH do usuario. Adicione com:" $InstallDir
  Write-Host "   [Environment]::SetEnvironmentVariable('Path', `"${InstallDir};`$path`", 'User')"
}

$binPath = Join-Path $InstallDir "omp.exe"
$v = & $binPath --version 2>$null | Select-Object -First 1
if (-not $v) { $v = $Version }
Sayf "== Done! omp fork {0} installed. ==" "== OK! Fork do omp {0} instalado. ==" $v
