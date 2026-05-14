*This project was created as part of the 42 curriculum by lmoraes, [login2], [login3], [login4], [login5]. I was responsible for the entire backend.*

# Transcendence

A multiplayer Pong web application with real-time gameplay, tournament mode, social features, and a microservices backend. Final project of the 42 common core.

![django](https://img.shields.io/badge/Django-backend-092E20?logo=django&logoColor=white)
![websockets](https://img.shields.io/badge/WebSockets-realtime-4353FF)
![docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)
![nginx](https://img.shields.io/badge/NGINX-reverse--proxy-009639?logo=nginx&logoColor=white)
![jwt](https://img.shields.io/badge/JWT-auth-000000?logo=jsonwebtokens&logoColor=white)

---

## Description

A web app where players authenticate, build a profile, find matches, play Pong against each other in real time, and join tournaments. The system was split into five backend microservices, each with its own responsibility and database, talking over HTTP and WebSockets, orchestrated by Docker Compose and fronted by NGINX.

My role on the team was the **entire backend**: I designed and implemented all five services, their data models, the authentication flow (including OAuth and 2FA), the WebSocket layer for real-time gameplay, and the Docker setup that ties everything together.

## Architecture

```
                                 ┌──────────────┐
                  browser ─────▶ │   NGINX      │  TLS, reverse proxy, static
                                 └──────┬───────┘
                                        │
                ┌───────────────┬───────┼─────────┬──────────────┐
                ▼               ▼       ▼         ▼              ▼
        ┌──────────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
        │ authentication │ │  player  │ │ matchmaking  │ │   tournament │
        │  OAuth + 2FA  │  │ profile  │  │  WebSocket   │  │              │
        │  JWT cookie   │  │ friends  │  │  rooms       │  │              │
        └──────────────┘  └──────────┘  └──────────────┘  └──────────────┘
                                        ┌──────────────┐
                                        │     pong     │
                                        │  WebSocket   │
                                        │  asyncio     │
                                        └──────────────┘
                                  each service has its own DB
```

## Backend services

| Service | Responsibility | Notes |
|---------|---------------|-------|
| **authentication** | Login flow, identity, sessions | Local login, OAuth (Google + Intra 42), 2FA, JWT issued as an HttpOnly cookie shared across services |
| **player** | Profile, avatar, friends, match history | Avatar upload to `MEDIA_URL`, routes protected by JWT cookie |
| **matchmaking** | Game rooms, queue, match creation | WebSocket-based room state, broadcasts to subscribers |
| **pong** | Real-time game loop | `asyncio` event loop, WebSocket per match, server-authoritative ball/paddle state, dynamic ball speed scaling |
| **tournament** | Tournament creation and bracket management | Coordinates matchmaking and pong services to schedule rounds |

Each service runs in its own container with an isolated database. Services don't share schemas — they communicate through HTTP for state mutations and WebSockets for real-time updates.

## Decisions worth highlighting

- **One service per domain, one database per service** — avoids the classic monolith trap where a schema change in "auth" breaks "player". Costs more boilerplate, pays off when one service needs to evolve.
- **JWT in HttpOnly cookie, not localStorage** — protects against XSS reading the token. The cookie is signed and shared across services on the same domain.
- **Server-authoritative game state** — the client only sends paddle inputs. The server runs the physics and broadcasts positions. Stops the trivial "edit your client to win" cheat.
- **Each service is its own Django project** — could have been a Django monolith. Splitting it forced clean boundaries and made the OAuth + JWT design real instead of theoretical.
- **NGINX as the only public-facing entrypoint** — TLS terminates at NGINX, internal services don't speak TLS to each other, the topology is invisible to the browser.

## Tech stack

- **Backend:** Django, Python 3, `asyncio`, Django Channels for WebSockets
- **Frontend:** Vanilla JS SPA, no framework (project constraint)
- **Auth:** OAuth 2.0 (Google, 42 Intra), TOTP for 2FA, JWT
- **Infra:** Docker, Docker Compose, NGINX, PostgreSQL per service
- **Real-time:** WebSockets

## Instructions

Requires Docker and Docker Compose.

```bash
git clone https://github.com/lmoraesdev/transcendence.git
cd transcendence/srcs
docker compose up --build
```

Open `https://localhost/`. The frontend is served over HTTPS because the WebSockets and OAuth callbacks require TLS even locally.

Environment variables (OAuth client IDs, database credentials, JWT secret) live in `srcs/backend/dotenv_files/.env`. A template is included.

## What I learned

- That "microservices" sounds clean on paper and turns into a series of small, real distributed-systems problems the moment two services need to agree on something
- How to design an auth flow that survives across services without re-asking the user to log in every time
- The difference between WebSockets that are easy to write and WebSockets that survive reconnection, disconnects, and clients that lie about their state
- How OAuth actually works under the hood — redirect URIs, state parameters, why you can't skip any of them
- That the boring layer (NGINX, certificates, env files, container networking) ends up consuming a third of the project — and that's normal

## Resources

- [Django docs](https://docs.djangoproject.com/)
- [Django Channels](https://channels.readthedocs.io/) — WebSocket support in Django
- [OAuth 2.0 spec — RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [TOTP — RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
- [JWT — RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [NGINX as reverse proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)

### Note on AI

This project was delivered before AI assistants were allowed by the 42 curriculum. All design, code, and debugging were done manually using documentation, the relevant RFCs, and peer discussion within the group.
