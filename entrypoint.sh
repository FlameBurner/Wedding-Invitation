#!/bin/bash
# Railway gives us a PORT env var — make Apache listen on it
if [ -n "$PORT" ]; then
    sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf
fi

# Start Apache in foreground (required for Docker)
apache2-foreground
