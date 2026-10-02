#!/bin/zsh
set -euo pipefail
LABEL="com.palm.local-pdf-optimizer"
INSTALL_DIR="$HOME/Library/Application Support/PALM/LocalOptimizer"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"
/bin/launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
/bin/rm -f "$PLIST"
/bin/rm -rf "$INSTALL_DIR"
echo "PALM Local PDF Optimizer Auto-Start sudah dilepas."
echo "Sertifikat yang pernah dipercaya tidak dihapus otomatis dari Keychain agar tidak mengganggu instalasi PALM lain."
read "?Tekan Enter untuk menutup..."
