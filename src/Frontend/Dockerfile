# Usando a imagem do Node.js
FROM node:14

# Definindo o diretório de trabalho
WORKDIR /app

# Copiando os arquivos de configuração do frontend
COPY package*.json ./

# Instalando as dependências
RUN npm install

# Copiando o código do frontend
COPY . .

# Construindo a aplicação frontend
RUN npm run build

# Instalando o servidor HTTP para servir o frontend
RUN npm install -g serve

# Expondo a porta que o servidor frontend usará
EXPOSE 3000

# Comando para rodar o frontend
CMD ["serve", "-s", "build"]
