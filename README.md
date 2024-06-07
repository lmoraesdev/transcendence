project-transcendence/
│
├── backend/
│ ├── Dockerfile
│ ├── requirements.txt
│ ├── manage.py
│ ├── backend/
│ │ ├── **init**.py
│ │ ├── settings.py
│ │ ├── urls.py
│ │ ├── asgi.py
│ │ ├── wsgi.py
│ ├── users/
│ │ ├── **init**.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── tests.py
│ │ ├── urls.py
│ │ ├── views.py
│ ├── games/
│ │ ├── **init**.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── tests.py
│ │ ├── urls.py
│ │ ├── views.py
│ ├── profiles/
│ │ ├── **init**.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── tests.py
│ │ ├── urls.py
│ │ ├── views.py
│ └── locale/
│ ├── en/
│ │ └── LC_MESSAGES/
│ └── pt/
│ └── LC_MESSAGES/
│
├── frontend/
│ ├── Dockerfile
│ ├── public/
│ │ ├── index.html
│ │ ├── login.html
│ │ ├── register.html
│ │ ├── profile.html
│ │ ├── game.html
│ │ ├── matchmaking.html
│ │ └── css/
│ │ └── styles.css
│ ├── js/
│ │ ├── main.js
│ │ ├── auth.js
│ │ └── game.js
└── docker-compose.yml
