# Transcendence

Aplicação de jogos multiplayer em microserviços usando Django no backend e frontend Vanilla JS.

## Estrutura do Repositório

O projeto principal está em `srcs/`.

- `srcs/docker-compose.yml` — orquestração de todos os serviços e dependências.
- `srcs/backend/dotenv_files/.env` — variáveis de ambiente usadas pelos containers.
- `srcs/backend/services/authentication/` — serviço de autenticação e OAuth.
- `srcs/backend/services/player/` — serviço de perfil de jogador, avatar, amigos e histórico.
- `srcs/backend/services/matchmaking/` — serviço de criação/entrada em salas e matchmaking.
- `srcs/backend/services/pong/` — serviço de jogo Pong com WebSockets.
- `srcs/backend/services/tournament/` — serviço de torneios.
- `srcs/frontend/` — frontend estático servido por Nginx.

## Serviços Principais

### Backend

- `authentication/`
  - login local
  - OAuth Google e Intra 42
  - 2FA

- `player/`
  - perfil do jogador
  - upload de avatar
  - edição de nome e histórico de partidas
  - rotas protegidas por cookie JWT

- `matchmaking/`
  - WebSocket para salas de jogo
  - lógica de criação e entrada em partidas

- `pong/`
  - WebSocket do jogo Pong
  - lógica de colisões e evolução da velocidade da bola

- `tournament/`
  - criação e gerenciamento de torneios

### Frontend

- `srcs/frontend/index.html` — templates das páginas.
- `srcs/frontend/app.js` — inicialização do SPA.
- `srcs/frontend/web/js/` — páginas, roteador e componentes.
- `srcs/frontend/web/css/` — estilos da interface.
- `srcs/frontend/server/conf/nginx.conf` — configuração do proxy Nginx.

## Como Executar

1. Abra a pasta `srcs/`.
2. Execute:
   ```bash
   docker compose up --build
   ```
3. Acesse `https://localhost`.

> Use HTTPS porque o frontend e os WebSockets estão configurados para rodar sobre TLS local.

## Ajustes Recentes

- Corrigido o upload de avatar no serviço `player` para gerar uma URL pública válida.
- Ajustado o layout do avatar na página de configurações para não extrapolar a div.
- Refinado o comportamento da bola em `pong/api/consumers.py` para começar mais suave e resetar com velocidade adequada.
- Atualizadas dependências críticas (`Django`, `PyJWT`) para faixas seguras em todos os serviços backend.
- Documentação atualizada para refletir a estrutura real do projeto.

## Observações Técnicas

- O serviço `player` serve mídia em `MEDIA_URL = '/media/'` e o `PlayerAvatarUpload` grava arquivos em `assets/avatars/`.
- O `pong` usa `asyncio` e WebSockets para enviar atualizações de posição da bola e dos jogadores.
- O `authentication` usa cookies `jwt_token` para autenticação entre serviços.

## Status Atual

- [x] Backend funcional
- [x] Frontend funcional
- [x] Login e perfil funcionando
- [x] Upload de avatar corrigido
- [x] Bola do jogo ajustada
- [x] Documentação atualizada


