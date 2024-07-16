#/bin/bash

set -e

# Esperar até que o PostgreSQL esteja pronto
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  echo "🟡 Aguardando Inicialização do Banco de Dados PostgreSQL ($POSTGRES_HOST:$POSTGRES_PORT) ..."
  sleep 2
done

echo "✅ Banco de Dados PostgreSQL Iniciado com Sucesso ($POSTGRES_HOST:$POSTGRES_PORT)"

python manage.py makemigrations
python manage.py migrate --run-syncdb
python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8000
