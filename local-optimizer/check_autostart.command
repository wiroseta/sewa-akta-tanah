#!/bin/zsh
set -u
LABEL="com.palm.local-pdf-optimizer"
DOMAIN="gui/$(id -u)"
echo "PALM Local PDF Optimizer — Status Auto-Start"
echo
if /bin/launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  echo "LaunchAgent : TERPASANG / aktif"
else
  echo "LaunchAgent : belum aktif"
fi
if /usr/bin/curl --silent --show-error --fail --max-time 5 https://localhost:8765/health; then
  echo
  echo "Health      : OK"
else
  echo
  echo "Health      : TIDAK MERESPONS"
fi
echo "Log         : $HOME/Library/Logs/PALM/local-optimizer.log"
echo "Error log   : $HOME/Library/Logs/PALM/local-optimizer-error.log"
echo
read "?Tekan Enter untuk menutup..."
