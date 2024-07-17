FROM debian:bullseye

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install curl vim nano lsof nginx -y

# Copiando o arquivo de configuração do Nginx
COPY ./server/conf/nginx.conf /etc/nginx/sites-enabled/nginx.conf

# Copiando certificados SSL
COPY ./server/ssl/certs/nginx.crt /etc/ssl/certs/nginx.crt
COPY ./server/ssl/private/nginx.key /etc/ssl/private/nginx.key

# Criando o diretório onde os arquivos do frontend serão servidos
RUN mkdir -p /var/www/transcendence

# Copiando todo o conteúdo do frontend para o diretório criado
COPY . /var/www/transcendence/

CMD ["nginx", "-g", "daemon off;"]
