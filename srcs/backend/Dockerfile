# Usando a imagem do Python
FROM python:3.10-slim

# Definindo o diretório de trabalho
WORKDIR /app

# Copiando os arquivos de configuração do backend
COPY requirements.txt .

# Instalando as dependências
RUN pip install -r requirements.txt

# Copiando o código do backend
COPY . .

# Expondo a porta que o servidor backend usará
EXPOSE 8000

# Comando para rodar o backend
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
