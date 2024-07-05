FROM nginx:1.25

RUN	rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

RUN mkdir -p /etc/nginx/ssl

COPY ssl/certs/nginx.crt /etc/nginx/ssl/nginx.crt
COPY ssl/private/nginx.key /etc/nginx/ssl/nginx.key

WORKDIR /nginx

EXPOSE 80
EXPOSE 443
