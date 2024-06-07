# Project Transcendence

Este é o repositório do projeto Transcendence, um sistema web de jogos multiplayer.

## Estrutura do Projeto
```
project-root/
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   ├── wsgi.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── views.py
│   ├── games/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── views.py
│   ├── profiles/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── views.py
│   └── locale/
│       ├── en/
│       │   └── LC_MESSAGES/
│       └── pt/
│           └── LC_MESSAGES/
│
├── frontend/
│   ├── Dockerfile
│   ├── public/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── profile.html
│   │   ├── game.html
│   │   ├── matchmaking.html
│   │   └── css/
│   │       └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   └── game.js
└── docker-compose.yml
```

Esta é a estrutura do projeto Transcendence. Ele consiste em duas partes principais: `backend` e `frontend`. O backend é responsável pela lógica do servidor e a API REST, enquanto o frontend é a interface do usuário.

## Backend

O backend do projeto Transcendence é construído usando Django, um framework web em Python. Ele é organizado da seguinte forma:

- `backend/`: Pasta principal do backend.
  - `Dockerfile`: Arquivo para a construção da imagem Docker.
  - `requirements.txt`: Lista de dependências Python.
  - `manage.py`: Script de gerenciamento do Django.
  - `backend/`: Configurações principais do Django.
    - `settings.py`: Configurações do projeto.
    - `urls.py`: Configurações de roteamento de URLs.
    - `asgi.py` e `wsgi.py`: Configurações para servidores web.
  - `users/`, `games/`, `profiles/`: Aplicativos Django para usuários, jogos e perfis, respectivamente.
    - `admin.py`: Configurações para o painel de administração do Django.
    - `apps.py`: Configurações de aplicativos.
    - `models.py`: Definições de modelos de banco de dados.
    - `serializers.py`: Serializadores para API REST.
    - `tests.py`: Testes de unidade.
    - `urls.py` e `views.py`: Roteamento de URLs e lógica de visualização para cada aplicativo.
  - `locale/`: Arquivos de localização para tradução.

## Frontend

O frontend do projeto Transcendence é construído usando HTML, CSS e JavaScript. Ele é organizado da seguinte forma:

- `frontend/`: Pasta principal do frontend.
  - `Dockerfile`: Arquivo para a construção da imagem Docker.
  - `public/`: Arquivos HTML e CSS públicos.
  - `js/`: Scripts JavaScript.

