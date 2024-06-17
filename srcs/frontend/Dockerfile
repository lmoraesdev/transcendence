# Usando a imagem do Node.js 18.20.3
FROM node:18.20.3

# Definindo o diretório de trabalho
WORKDIR /app/srcs

# Inicializando um novo projeto Node.js e instalando o Bootstrap
RUN npm init -y && npm install bootstrap

# Expondo a porta que o servidor frontend usará (ajuste conforme necessário)
EXPOSE 3000

# Comando para manter o container em execução (opcional, dependendo do uso)
CMD ["tail", "-f", "/dev/null"]
