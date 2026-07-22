#!/bin/bash
set -e
 
# Railway gives us a PORT env var — make Apache listen on it
if [ -n "$PORT" ]; then
    sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf
fi
 
# Fix: Railway's builder sometimes enables more than one Apache MPM module,
# which crashes Apache with "More than one MPM loaded". PHP requires mpm_prefork,
# so force that one on and remove any others.
a2dismod mpm_event mpm_worker >/dev/null 2>&1 || true
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* || true
a2enmod mpm_prefork >/dev/null 2>&1 || true
 
# Start Apache in foreground (required for Docker)
exec apache2-foreground
 