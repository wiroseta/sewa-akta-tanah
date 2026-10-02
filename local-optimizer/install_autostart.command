#!/bin/zsh
set -euo pipefail

LABEL="com.palm.local-pdf-optimizer"
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/Library/Application Support/PALM/LocalOptimizer"
LAUNCH_DIR="$HOME/Library/LaunchAgents"
PLIST="$LAUNCH_DIR/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/PALM"
UID_NOW="$(id -u)"
DOMAIN="gui/$UID_NOW"

mkdir -p "$INSTALL_DIR" "$LAUNCH_DIR" "$LOG_DIR"

# Stop an older PALM LaunchAgent before replacing it. Ignore if not installed yet.
/bin/launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true

# If the manually started PALM helper is still using port 8765, stop only that helper.
for pid in $(/usr/sbin/lsof -tiTCP:8765 -sTCP:LISTEN 2>/dev/null || true); do
  cmd="$(/bin/ps -p "$pid" -o command= 2>/dev/null || true)"
  if [[ "$cmd" == *"palm_pdf_optimizer.py"* ]]; then
    echo "Menghentikan helper PALM manual (PID $pid) agar LaunchAgent dapat mengambil port 8765..."
    /bin/kill "$pid" 2>/dev/null || true
    sleep 1
  fi
done

/bin/cp "$SRC_DIR/palm_pdf_optimizer.py" "$INSTALL_DIR/palm_pdf_optimizer.py"
/bin/chmod 700 "$INSTALL_DIR/palm_pdf_optimizer.py"

CERT="$INSTALL_DIR/palm-localhost.crt"
KEY="$INSTALL_DIR/palm-localhost.key"
MARKER="$INSTALL_DIR/.palm-cert-trusted-v1"

# Reuse the already-working certificate when available; otherwise generate one in the permanent install folder.
if [[ -f "$SRC_DIR/palm-localhost.crt" && -f "$SRC_DIR/palm-localhost.key" ]]; then
  /bin/cp "$SRC_DIR/palm-localhost.crt" "$CERT"
  /bin/cp "$SRC_DIR/palm-localhost.key" "$KEY"
elif [[ ! -f "$CERT" || ! -f "$KEY" ]]; then
  echo "Membuat sertifikat HTTPS localhost..."
  /usr/bin/openssl req -x509 -newkey rsa:2048 -sha256 -days 825 -nodes \
    -keyout "$KEY" -out "$CERT" -subj "/CN=localhost/O=PALM Local PDF Optimizer" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" >/dev/null 2>&1
fi
/bin/chmod 600 "$KEY"

# Trust the certificate in this login user's keychain. Re-adding is harmless and makes the permanent copy self-contained.
echo "Memastikan sertifikat localhost dipercaya di Login Keychain..."
if /usr/bin/security add-trusted-cert -r trustRoot -k "$HOME/Library/Keychains/login.keychain-db" "$CERT"; then
  /usr/bin/touch "$MARKER"
else
  echo "Gagal memasang trust sertifikat. Auto-start tidak diaktifkan."
  echo "Buka $CERT di Keychain Access dan set Trust > Always Trust, lalu jalankan installer ini lagi."
  read "?Tekan Enter untuk menutup..."
  exit 1
fi

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>$INSTALL_DIR/palm_pdf_optimizer.py</string>
  </array>
  <key>WorkingDirectory</key><string>$INSTALL_DIR</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ProcessType</key><string>Background</string>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <key>StandardOutPath</key><string>$LOG_DIR/local-optimizer.log</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/local-optimizer-error.log</string>
  <key>ThrottleInterval</key><integer>10</integer>
</dict>
</plist>
PLIST

/usr/bin/plutil -lint "$PLIST"
/bin/launchctl bootstrap "$DOMAIN" "$PLIST"
/bin/launchctl enable "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
/bin/launchctl kickstart -k "$DOMAIN/$LABEL"
sleep 2

echo
echo "PALM Local PDF Optimizer Auto-Start terpasang."
echo "Lokasi permanen : $INSTALL_DIR"
echo "LaunchAgent      : $PLIST"
echo "Log              : $LOG_DIR/local-optimizer.log"
echo "Error log        : $LOG_DIR/local-optimizer-error.log"
echo
if /usr/bin/curl --silent --show-error --fail --max-time 5 https://localhost:8765/health; then
  echo
  echo "Health check: OK"
else
  echo "Health check belum merespons. Cek error log di atas."
fi
echo
read "?Tekan Enter untuk menutup..."
