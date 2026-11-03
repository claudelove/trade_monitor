#!/bin/sh
set -eu
umask 077
# A newly mounted persistent disk can initially belong to root. Drop privileges
# before starting Python; never recursively change ownership outside the DB dir.
if [ "$(id -u)" = 0 ]; then
    db_dir="$(dirname "${MONITOR_DB:-/app/data/monitor.db}")"
    if [ "$db_dir" = / ]; then
        echo 'MONITOR_DB must use a dedicated data directory' >&2
        exit 1
    fi
    mkdir -p "$db_dir"
    chown monitor:monitor "$db_dir"
    for file in "${MONITOR_DB:-/app/data/monitor.db}" "${MONITOR_DB:-/app/data/monitor.db}-wal" "${MONITOR_DB:-/app/data/monitor.db}-shm"; do
        if [ -f "$file" ]; then chown monitor:monitor "$file"; fi
    done
    exec runuser -u monitor -- "$@"
fi
exec "$@"
