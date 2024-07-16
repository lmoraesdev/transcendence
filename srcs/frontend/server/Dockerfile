FROM    debian:bullseye

RUN     apt-get update -y && \
        apt-get upgrade -y && \
        apt-get install curl vim nano lsof nginx -y

COPY   conf/nginx.conf /etc/nginx/services/nginx.conf

COPY    ./ssl/certs/nginx.crt /etc/ssl/certs/nginx.certs

COPY    ./ssl/private/nginx.key /etc/ssl/private/nginx.key

RUN     mkdir -p /var/www/transcendence/

COPY    . /var/www/transcendence/

CMD     [ "nginx", "-g", "daemon off;" ]