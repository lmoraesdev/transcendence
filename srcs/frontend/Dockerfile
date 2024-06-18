# Use a imagem oficial do Node.js
FROM node:latest

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos necessários para o contêiner
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia os demais arquivos para o contêiner
COPY . .

# Expõe a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
