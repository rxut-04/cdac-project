#!/usr/bin/env bash
# ==============================================================================
# mygit Unix/macOS Automated Installer
# Usage: curl -fsSL https://mygit.netlify.app/install.sh | bash
# ==============================================================================
set -e

INSTALL_DIR="${HOME}/.local/bin"
TARGET="${INSTALL_DIR}/mygit"

echo ""
echo -e "\033[1;36m >> Installing mygit CLI for Linux/macOS...\033[0m"

mkdir -p "${INSTALL_DIR}"

# Download or create launcher
cat << 'EOF' > "${TARGET}"
#!/usr/bin/env bash
if command -v python3 >/dev/null 2>&1; then
    exec python3 -c "
import urllib.request, sys
code = urllib.request.urlopen('https://mygit.netlify.app/mygit_cli').read().decode('utf-8')
exec(code)
" "$@"
else
    echo "Python 3 is required to run mygit"
    exit 1
fi
EOF

chmod +x "${TARGET}"

# Add to PATH in shell profile if not present
DETECTED_RC=""
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    DETECTED_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    DETECTED_RC="$HOME/.bashrc"
fi

if [ -n "$DETECTED_RC" ]; then
    if ! grep -q '.local/bin' "$DETECTED_RC"; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$DETECTED_RC"
        echo -e "\033[1;32m✓ Added ~/.local/bin to PATH in $DETECTED_RC\033[0m"
    fi
fi

echo -e "\033[1;32m✓ mygit installed successfully to ${TARGET}\033[0m"
echo -e "\033[1;33mRun 'mygit --help' or 'mygit login' to get started.\033[0m"
echo ""
