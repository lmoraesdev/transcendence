FROM    python:3.11.7

RUN     apt-get update -y && \
        apt-get upgrade -y && \
        apt-get install curl vim nano lsof netcat-openbsd -y

RUN     mkdir -p /services/authentication/

COPY    . /services/authentication/

COPY    ./ssl/certs/nginx.crt /etc/ssl/certs/nginx.crt

COPY    ./ssl/private/nginx.key /etc/ssl/private/nginx.key

WORKDIR /services/authentication/

RUN     chmod +x ./tools/run_authentication.sh

RUN     pip install --upgrade pip

RUN     pip install -r ./tools/requirements.txt

CMD     [ "bash", "./tools/run_authentication.sh" ]