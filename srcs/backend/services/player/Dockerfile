FROM    python:3.11.7

RUN     apt-get update -y && \
        apt-get upgrade -y && \
        apt-get install curl vim nano lsof netcat-openbsd -y

RUN     mkdir -p /services/player/

COPY    . /services/player/

COPY    ./ssl/certs/nginx.crt /etc/ssl/certs/nginx.crt

COPY    ./ssl/private/nginx.key /etc/ssl/private/nginx.key

WORKDIR /services/player/

RUN     chmod +x ./tools/run_player.sh

RUN     pip install --upgrade pip

RUN     pip install -r ./tools/requirements.txt

CMD     [ "bash", "./tools/run_player.sh" ]