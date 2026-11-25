#!/usr/bin/env bash
# ==============================================================================
# mygit Linux/macOS Automated Installer
# Usage: curl -fsSL https://the-only-git-platform-you-need.netlify.app/install.sh | bash
# ==============================================================================
set -e

INSTALL_DIR="${HOME}/.local/bin"
MYGIT_HOME="${HOME}/.mygit"
ZIP_TARGET="/tmp/mygit-package.zip"
PACKAGE_URL="https://the-only-git-platform-you-need.netlify.app/mygit-package.zip"

echo ""
echo -e "\033[1;36m >> Installing mygit CLI for Linux/macOS...\033[0m"
echo -e "\033[1;33m >> Created by Om Raut (CDAC Pass Out Student)\033[0m"

mkdir -p "${INSTALL_DIR}"
mkdir -p "${MYGIT_HOME}"

echo -e "\033[1;33m==> Downloading mygit engine from ${PACKAGE_URL}...\033[0m"
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "${PACKAGE_URL}" -o "${ZIP_TARGET}"
elif command -v wget >/dev/null 2>&1; then
    wget -q "${PACKAGE_URL}" -O "${ZIP_TARGET}"
else
    python3 -c "import urllib.request; urllib.request.urlretrieve('${PACKAGE_URL}', '${ZIP_TARGET}')"
fi

echo -e "\033[1;32m✓ Download complete. Extracting package...\033[0m"
python3 -m zipfile -e "${ZIP_TARGET}" "${MYGIT_HOME}" 2>/dev/null || unzip -q -o "${ZIP_TARGET}" -d "${MYGIT_HOME}"
rm -f "${ZIP_TARGET}"

TARGET="${INSTALL_DIR}/mygit"
cat << 'EOF' > "${TARGET}"
#!/usr/bin/env bash
exec python3 "${HOME}/.mygit/mygit_cli" "$@"
EOF

chmod +x "${TARGET}"
chmod +x "${MYGIT_HOME}/mygit_cli" 2>/dev/null || true

# Add to PATH in shell configuration files if needed
for rc in "${HOME}/.bashrc" "${HOME}/.zshrc" "${HOME}/.profile"; do
    if [ -f "$rc" ]; then
        if ! grep -q '.local/bin' "$rc"; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$rc"
            echo -e "\033[1;32m✓ Added ~/.local/bin to PATH in $rc\033[0m"
        fi
    fi
done

export PATH="${INSTALL_DIR}:${PATH}"

echo ""
echo -e "\033[1;32m================================================================"
echo -e " 🎉 mygit was successfully installed on your system!"
echo -e " 🚀 Created with ❤️ by Om Raut (CDAC Pass Out Student)"
echo -e "================================================================\033[0m"
echo ""
echo -e " Welcome to mygit! Run \033[1;36mmygit\033[0m or \033[1;36mmygit login\033[0m to get started."
echo ""
