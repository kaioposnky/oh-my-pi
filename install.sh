#!/usr/bin/env bash
#
# Fork installer for omp (oh-my-pi) — kaioposnky/oh-my-pi
#
# Installs the fork build (which carries the provider tool-name truncation fix)
# over any existing omp installation, verifying the binary download against the
# release's SHA256SUMS.txt before touching disk.
#
# Usage:
#   ./install.sh [--lang=en|pt] [-y|--yes] [--version=X.Y.Z]
#
set -euo pipefail

REPO="kaioposnky/oh-my-pi"
BRANCH="truncated-tool-names"
BIN_NAME="omp"
INSTALL_DIR="$HOME/.local/bin"
NPM_PKG="@oh-my-pi/pi-coding-agent"

# ---------------------------------------------------------------- arguments --
WANT_LANG=""
ASSUME_YES=0
while [ $# -gt 0 ]; do
  case "$1" in
    --lang=*) WANT_LANG="${1#--lang=}" ;;
    --lang) WANT_LANG="${2:-}"; shift ;;
    -y | --yes) ASSUME_YES=1 ;;
    --version=*) FORCED_VERSION="${1#--version=}" ;;
    -h | --help)
      sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown argument: $1 (use --help)" >&2
      exit 64
      ;;
  esac
  shift
done

# ------------------------------------------------------------------ language --
case "${WANT_LANG:-${LC_ALL:-${LC_MESSAGES:-${LANG:-}}}}" in
  pt* | PT*) L="pt" ;;
  *) L="en" ;;
esac

say() {
  local key="$1"
  if [ "$L" = "pt" ]; then
    case "$key" in
      welcome) echo "== Instalador do fork omp / oh-my-pi ($REPO) ==" ;;
      explain) cat <<'EOT'
Este fork existe para corrigir um bug de provedores (ex.: Verboo) que derrubam o
ultimo caractere do nome de uma ferramenta ao chama-la (ex.: `read` chega como
`rea`), quebrando toda a sessao do agente. Aqui o nome truncado e recuperado
contra a lista de ferramentas anunciadas antes de executar qualquer coisa.

Este instalador VAI SUBSTITUIR sua instalacao atual do omp pela versao do fork
(mesmo caminho binario, mesmo comando `omp`). Copias gerenciadas por npm/bun/
pnpm encontradas serao removidas; instalacoes via brew/mise serao sinalizadas
para remocao manual para que apenas o fork responda pelo comando `omp`.
EOT
      ;;
      detecting) echo "-> Detectando sistema operacional e arquitetura..." ;;
      unsupported_os) echo "!! Sistema nao suportado por este script. No Windows, use install.ps1." >&2 ;;
      unsupported_arch) echo "!! Arquitetura nao suportada: %s" >&2 ;;
      resolving) echo "-> Resolvendo versao mais recente do fork..." ;;
      using_version) echo "-> Versao selecionada: %s" ;;
      api_failed) echo "!! Nao foi possivel consultar o GitHub API (limite de requisicoes?). Use --version=X.Y.Z." >&2 ;;
      plan_header) echo "-- Plano -------------------------------------------------" ;;
      plan_download) echo "   baixar : %s" ;;
      plan_verify) echo "   verificar: SHA-256 contra SHA256SUMS.txt do release" ;;
      plan_install) echo "   instalar : %s" ;;
      plan_footer) echo "-----------------------------------------------------------" ;;
      found_existing) echo "   instalacao existente encontrada: %s" ;;
      none_found) echo "   nenhuma instalacao anterior encontrada" ;;
      will_remove) echo "   sera removido: %s" ;;
      manual_note) echo "   nota: %s — remova manualmente se desejar (o binario do fork tera prioridade no PATH)" ;;
      confirm_proceed) echo "Continuar? [s/N]" ;;
      confirm_removed) echo "   removido: %s" ;;
      remove_warn) echo "   aviso: falha ao remover %s (remova manualmente depois)" >&2 ;;
      downloading) echo "-> Baixando %s ..." ;;
      verifying) echo "-> Verificando checksum SHA-256..." ;;
      checksum_fail) echo "!! CHECKSUM NAO CONFERE — download abortado, nada foi alterado." >&2 ;;
      installing) echo "-> Instalando em %s ..." ;;
      path_hint) echo "!! %s nao esta no PATH. Adicione ao seu rc de shell:" >&2 ;;
      path_hint_cmd) echo '   export PATH="$HOME/.local/bin:$PATH"' ;;
      success) echo "== OK! Fork do omp %s instalado. ('%s --version' para conferir) ==" ;;
      aborted) echo "Cancelado. Nada foi alterado." ;;
    esac
  else
    case "$key" in
      welcome) echo "== omp (oh-my-pi) fork installer ($REPO) ==" ;;
      explain) cat <<'EOT'
This fork fixes a provider bug (e.g. Verboo models) where the last character of
a tool name is dropped on tool calls (e.g. advertised `read` arrives as `rea`),
which derails the whole agent session. Here the truncated name is recovered
against the advertised tool set before anything executes.

This installer WILL REPLACE your current omp installation with the fork build
(same binary path, same `omp` command). Copies managed by npm/bun/pnpm that we
find are removed; brew/mise installs are flagged for manual removal so only the
fork answers to `omp`.
EOT
      ;;
      detecting) echo "-> Detecting operating system and architecture..." ;;
      unsupported_os) echo "!! Unsupported OS for this script. On Windows, use install.ps1." >&2 ;;
      unsupported_arch) echo "!! Unsupported architecture: %s" >&2 ;;
      resolving) echo "-> Resolving latest fork release..." ;;
      using_version) echo "-> Selected version: %s" ;;
      api_failed) echo "!! Could not query the GitHub API (rate limit?). Use --version=X.Y.Z." >&2 ;;
      plan_header) echo "-- Plan ---------------------------------------------------" ;;
      plan_download) echo "   download : %s" ;;
      plan_verify) echo "   verify   : SHA-256 against the release SHA256SUMS.txt" ;;
      plan_install) echo "   install  : %s" ;;
      plan_footer) echo "------------------------------------------------------------" ;;
      found_existing) echo "   existing installation found: %s" ;;
      none_found) echo "   no previous installation found" ;;
      will_remove) echo "   will remove: %s" ;;
      manual_note) echo "   note: %s — remove manually if desired (the fork binary takes PATH precedence)" ;;
      confirm_proceed) echo "Continue? [y/N]" ;;
      confirm_removed) echo "   removed: %s" ;;
      remove_warn) echo "   warning: failed to remove %s (remove it manually later)" >&2 ;;
      downloading) echo "-> Downloading %s ..." ;;
      verifying) echo "-> Verifying SHA-256 checksum..." ;;
      checksum_fail) echo "!! CHECKSUM MISMATCH — download aborted, nothing was changed." >&2 ;;
      installing) echo "-> Installing to %s ..." ;;
      path_hint) echo "!! %s is not on your PATH. Add this to your shell rc:" >&2 ;;
      path_hint_cmd) echo '   export PATH="$HOME/.local/bin:$PATH"' ;;
      success) echo "== Done! omp fork %s installed. (run '%s --version' to confirm) ==" ;;
      aborted) echo "Aborted. Nothing was changed." ;;
    esac
  fi
}

pct() {
  local fmt="$1"
  shift
  printf -- "$fmt\n" "$@"
}

die() { echo "!! $*" >&2; exit 1; }

confirm() {
  if [ ! -t 0 ]; then return 0; fi
  if [ "$ASSUME_YES" = "1" ]; then return 0; fi
  local answer=""
  read -r -p "$(pct "$(say confirm_proceed)") " answer </dev/tty 2>/dev/null || answer=""
  case "$answer" in
    y | Y | yes | s | S | sim) return 0 ;;
    *) echo ""; pct "$(say aborted)"; exit 1 ;;
  esac
}

command -v curl >/dev/null 2>&1 || die "curl is required"

pct "$(say welcome)"
echo ""
say explain
echo ""

# ------------------------------------------------------------ platform check --
say detecting
os="$(uname -s)"
arch="$(uname -m)"
case "$arch" in
  x86_64 | amd64) arch="x64" ;;
  arm64 | aarch64) arch="arm64" ;;
  *) pct "$(say unsupported_arch)" "$arch" >&2; exit 65 ;;
esac
case "$os" in
  Linux) asset_os="linux" ;;
  Darwin) asset_os="darwin" ;;
  *) say unsupported_os >&2; exit 65 ;;
esac
asset="omp-$asset_os-$arch"

# ------------------------------------------------------------------- version --
if [ "${FORCED_VERSION:-${VERSION:-}}" != "" ]; then
  version="${FORCED_VERSION:-${VERSION:-}}"
  version="${version#v}"
else
  say resolving
  api_json="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest")" || api_json=""
  tag="$(printf '%s' "$api_json" | grep -o '"tag_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/')"
  [ -n "$tag" ] || { say api_failed >&2; exit 66; }
  version="${tag#v}"
fi
pct "$(say using_version)" "$version"

# ------------------------------------------------------- existing installs ----
existing=""
p="$(command -v "$BIN_NAME" 2>/dev/null || true)"
if [ -n "$p" ]; then
  existing+="$(pct "$(say found_existing)" "$p")"$'\n'
fi
if [ -x "$INSTALL_DIR/$BIN_NAME" ] && [ "${p:-}" != "$INSTALL_DIR/$BIN_NAME" ]; then
  existing+="$(pct "$(say found_existing)" "$INSTALL_DIR/$BIN_NAME")"$'\n'
fi
removals=()
if command -v npm >/dev/null 2>&1 && npm ls -g --depth=0 2>/dev/null | grep -q "pi-coding-agent"; then
  removals+=("npm rm -g $NPM_PKG")
fi
if command -v bun >/dev/null 2>&1 && bun pm ls -g 2>/dev/null | grep -q "pi-coding-agent"; then
  removals+=("bun remove -g $NPM_PKG")
fi
if command -v pnpm >/dev/null 2>&1 && pnpm ls -g 2>/dev/null | grep -q "pi-coding-agent"; then
  removals+=("pnpm remove -g $NPM_PKG")
fi
manual_notes=()
if command -v brew >/dev/null 2>&1 && brew list --formula 2>/dev/null | grep -qx "omp"; then
  manual_notes+=("brew uninstall can1357/tap/omp")
fi
if command -v mise >/dev/null 2>&1 && mise ls 2>/dev/null | grep -q "oh-my-pi"; then
  manual_notes+=("mise uninstall github:can1357/oh-my-pi")
fi
for r in "${removals[@]:-}"; do
  [ -n "$r" ] && existing+="$(pct "$(say will_remove)" "$r")"$'\n'
done
for n in "${manual_notes[@]:-}"; do
  [ -n "$n" ] && existing+="$(pct "$(say manual_note)" "$n")"$'\n'
done
[ -n "$existing" ] && printf '%s' "$existing" || say none_found

# --------------------------------------------------------------------- plan ---
say plan_header
pct "$(say plan_download)" "https://github.com/$REPO/releases/download/v$version/$asset"
say plan_verify
pct "$(say plan_install)" "$INSTALL_DIR/$BIN_NAME"
say plan_footer
echo ""
confirm

# ------------------------------------------------------------------ download --
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
base_url="https://github.com/$REPO/releases/download/v$version"
pct "$(say downloading)" "$asset"
curl -fsSL --retry 3 -o "$tmpdir/$asset" "$base_url/$asset"
curl -fsSL --retry 3 -o "$tmpdir/SHA256SUMS.txt" "$base_url/SHA256SUMS.txt"

say verifying
expected="$(awk -v f="$asset" '$2 == f { print $1 }' "$tmpdir/SHA256SUMS.txt")"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmpdir/$asset" | awk '{print $1}')"
else
  actual="$(shasum -a 256 "$tmpdir/$asset" | awk '{print $1}')"
fi
if [ -z "$expected" ] || [ "$expected" != "$actual" ]; then
  say checksum_fail >&2
  echo "   expected: ${expected:-<missing>}  actual: $actual" >&2
  exit 65
fi

# --------------------------------------------------------- remove old copies --
for r in "${removals[@]:-}"; do
  [ -n "$r" ] || continue
  # shellcheck disable=SC2086
  if sh -c "$r" >/dev/null 2>&1; then pct "$(say confirm_removed)" "$r"; else pct "$(say remove_warn)" "$r" >&2; fi
done

# ------------------------------------------------------------------- install --
pct "$(say installing)" "$INSTALL_DIR/$BIN_NAME"
mkdir -p "$INSTALL_DIR"
mv -f "$tmpdir/$asset" "$INSTALL_DIR/$BIN_NAME"
chmod 755 "$INSTALL_DIR/$BIN_NAME"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *) pct "$(say path_hint)" "$INSTALL_DIR" >&2; say path_hint_cmd >&2 ;;
esac

installed_version="$("$INSTALL_DIR/$BIN_NAME" --version 2>/dev/null | head -n1 || true)"
pct "$(say success)" "${installed_version:-$version}" "$BIN_NAME"
