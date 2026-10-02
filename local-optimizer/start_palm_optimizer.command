#!/bin/zsh
set -u
cd "$(dirname "$0")"
echo "PALM Local PDF Optimizer HTTPS"
echo "Tutup jendela Terminal ini untuk menghentikan helper."
echo
CERT="palm-localhost.crt"
KEY="palm-localhost.key"
MARKER=".palm-cert-trusted-v1"
if [[ ! -f "$CERT" || ! -f "$KEY" ]]; then
  echo "Membuat sertifikat HTTPS lokal untuk localhost..."
  /usr/bin/openssl req -x509 -newkey rsa:2048 -sha256 -days 825 -nodes \
    -keyout "$KEY" -out "$CERT" -subj "/CN=localhost/O=PALM Local PDF Optimizer" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" >/dev/null 2>&1 || exit 1
  chmod 600 "$KEY"
  rm -f "$MARKER"
  echo "Sertifikat dibuat: $CERT"
  echo
fi

# Safari/GitHub Pages will reject a self-signed localhost certificate unless it is trusted.
# Add trust only to the login user's keychain; this does not expose the helper to LAN/Internet.
if [[ ! -f "$MARKER" ]]; then
  echo "Memasang trust sertifikat localhost ke Login Keychain..."
  if /usr/bin/security add-trusted-cert -r trustRoot -k "$HOME/Library/Keychains/login.keychain-db" "$CERT" 2>/tmp/palm-cert-error.txt; then
    touch "$MARKER"
    echo "Sertifikat localhost sudah dipercaya."
  else
    echo
    echo "BELUM BERHASIL mempercayai sertifikat localhost."
    echo "macOS mungkin meminta password user login / akses Keychain."
    cat /tmp/palm-cert-error.txt 2>/dev/null
    echo
    echo "PALM tetap bisa dibuka, tetapi Ghostscript lokal tidak dapat dipanggil dari GitHub Pages sampai sertifikat dipercaya."
    echo "Anda dapat double-click file palm-localhost.crt lalu set Trust > Always Trust di Keychain Access."
    echo
  fi
fi

/usr/bin/python3 palm_pdf_optimizer.py
