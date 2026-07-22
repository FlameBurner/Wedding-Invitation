# Agung & Wulan invitation

## Laragon setup

1. Copy this folder into `C:\laragon\www\`.
2. Start Apache and MySQL in Laragon.
3. Open phpMyAdmin, create/import the database by running [database.sql](database.sql).
4. Visit `http://localhost/update-this-website-with-add-an-2/` (use your actual folder name if you rename it).

The local defaults are MySQL host `127.0.0.1`, user `root`, no password, and database `wedding_invitation`. If yours differs, set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in Apache/PHP's environment.

## Railway setup

1. Push this folder to a Git repository and create a Railway service from it. Railway uses the included [Dockerfile](Dockerfile).
2. Add a Railway MySQL service.
3. In the web service, reference the MySQL service variables. Railway's `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, and `MYSQLPASSWORD` work automatically. Alternatively, set the matching `DB_*` variables yourself.
4. Redeploy the web service.

## Gallery media

Put the gallery video at `assets/videos/gallery-video.mp4`, then replace the five image `src` values in [index.html](index.html) with your final photos.
