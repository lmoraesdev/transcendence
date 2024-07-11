# Usando a imagem do Python
FROM python:3.10

# Instala netcat
RUN apt-get update && apt-get install -y netcat-openbsd

# Copia a pasta "transcendence" para dentro do container, ajustando para o seu projeto específico.
COPY transcendence /djangoapp

# Copia a pasta "scripts" para dentro do container.
COPY scripts /scripts

# Copia o arquivo `requirements.txt` para dentro do conteiner
COPY requirements.txt /djangoapp/

# Entra na pasta djangoapp no container
WORKDIR /djangoapp

# Crie o ambiente virtual
RUN python -m venv /venv

# Atualize o pip dentro do ambiente virtual
RUN /venv/bin/pip install --upgrade pip

# Instale as dependências a partir do requirements.txt
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

# Copia o restante do código para aplicação
COPY . /djangoapp/

# Essa variável de ambiente é usada para controlar se o Python deve
# gravar arquivos de bytecode (.pyc) no disco. 1 = Não, 0 = Sim
ENV PYTHONDONTWRITEBYTECODE 1

# Define que a saída do Python será exibida imediatamente no console ou em
# outros dispositivos de saída, sem ser armazenada em buffer.
# Em resumo, você verá os outputs do Python em tempo real.
ENV PYTHONUNBUFFERED 1

# Define a porta 8000 para o Django
EXPOSE 8000

# Executa comandos para configurar o ambiente
RUN adduser --disabled-password --no-create-home duser && \
    mkdir -p /data/web/static && \
    mkdir -p /data/web/media && \
    mkdir -p /djangoapp/static && \
    mkdir -p /djangoapp/staticfiles && \
    mkdir -p /djangoapp/app/migrations && \
    chown -R duser:duser /djangoapp/static && \
    chown -R duser:duser /djangoapp/staticfiles && \
    chown -R duser:duser /data/web/static && \
    chown -R duser:duser /data/web/media && \
    chown -R duser:duser /djangoapp/app/migrations && \
    chmod -R 755 /djangoapp/static && \
    chmod -R 755 /djangoapp/staticfiles && \
    chmod -R 755 /data/web/static && \
    chmod -R 755 /data/web/media && \
    chmod -R 755 /djangoapp/app/migrations && \
    chmod -R +x /scripts && \
    chmod +x /scripts/commands.sh


# Adiciona a pasta scripts e venv/bin no $PATH do container.
ENV PATH="/scripts:/venv/bin:$PATH"

# Muda o usuário para duser
USER duser

# Executa o arquivo scripts/commands.sh ao iniciar o contêiner
CMD ["/scripts/commands.sh"]
