#!/bin/sh

# O shell irá encerrar a execução do script quando um comando falhar
set -e

# Esperar até que o PostgreSQL esteja pronto
echo 'Entrou no shell script'
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  echo "🟡 Aguardando Inicialização do Banco de Dados PostgreSQL ($POSTGRES_HOST:$POSTGRES_PORT) ..."
  sleep 2
done

echo "✅ Banco de Dados PostgreSQL Iniciado com Sucesso ($POSTGRES_HOST:$POSTGRES_PORT)"

# Comandos do Django
python manage.py collectstatic --no-input
python manage.py makemigrations --no-input
python manage.py migrate --no-input

# Iniciar Uvicorn com Gunicorn
echo "🚀 Iniciando servidor Uvicorn com Gunicorn..."
/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker api.asgi:application --bind 0.0.0.0:8000

# Ou se preferir, diretamente com Uvicorn sem Gunicorn
# echo "🚀 Iniciando servidor Uvicorn..."
# /venv/bin/uvicorn web.asgi:application --host 0.0.0.0 --port 8000

