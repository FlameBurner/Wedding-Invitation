FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql

COPY . /var/www/html/

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
