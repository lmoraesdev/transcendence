FROM nginx:1.25

# Remove o arquivo de configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia o arquivo de configuração personalizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cria o diretório para certificados SSL
RUN mkdir -p /etc/nginx/ssl

# Copia os certificados SSL
COPY ssl/certs/nginx.crt /etc/nginx/ssl/nginx.crt
COPY ssl/private/nginx.key /etc/nginx/ssl/nginx.key

# Copia os arquivos estaticos e media
COPY --from=srcs_frontend /app/static/ /nginx/frontend/static
COPY --from=srcs_frontend /app/media/ /nginx/frontend/media

# Define o diretório de trabalho dentro do contêiner
WORKDIR /nginx

# Exponha as portas 80 e 443 do Nginx
EXPOSE 80
EXPOSE 443
