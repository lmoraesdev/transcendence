# Time de Agents para Refatoração do Projeto Transcendence

## Objetivo
Montar um plano de agentes para refatorar e corrigir todos os problemas possíveis no código existente, preservando a arquitetura atual e evitando grandes mudanças na lógica já implementada.

## Visão Geral do Projeto
O projeto é um conjunto de microserviços Django com frontend separado, incluindo:

- `srcs/backend/services/authentication/`
- `srcs/backend/services/player/`
- `srcs/backend/services/matchmaking/`
- `srcs/backend/services/pong/`
- `srcs/backend/services/tournament/`

Cada serviço contém seu próprio `manage.py`, `api/` e configuração Django. Há uso de WebSockets em `matchmaking` e `pong`, e APIs REST em `player`, `authentication` e `tournament`.

## Principais problemas identificados

1. Áreas de segurança e autenticação
   - Código JWT duplicado em vários middlewares.
   - `jwt_token` lido diretamente de cookie sem validações adicionais.
   - `SECRET_KEY` e `DEBUG=True` estão expostos em código de serviço.

2. WebSockets e lógica de sala
   - `matchmaking/api/consumers.py` usa estado em memória com `rooms` global.
   - `getRoom()` retorna prematuramente dentro do loop, provocando comportamento incorreto.
   - `pong/api/rounting.py` está com nome errado: `rounting` em vez de `routing`.
   - Falta tratamento de erros e validação de entrada para mensagens recebidas.

3. APIs REST e validação
   - Uso excessivo de `try/except Exception` com mensagens genéricas.
   - Validação manual de campos em vez de `serializers` do DRF.
   - `PlayerInfo` mistura busca por username com retorno de lista e objetos individuais.
   - Upload de avatar gravando arquivo local sem sanitização adequada do nome.

4. Qualidade de código e consistência
   - Nomes inconsistentes de funções e variáveis (`decodeToken`, `createRoom`, `getRoom`).
   - Estrutura do README desatualizada em relação à árvore real do projeto.
   - Código comentado e `print()` em consumidores WebSocket.
   - Importações e organização de módulos repetidos entre serviços.

5. Arquitetura de microserviços
   - Muitos serviços repetem a mesma lógica de modelos de jogador e autenticação.
   - Ausência de utilitários reutilizáveis para token, middleware e validação.
   - Possível divergência de modelos Django entre serviços.

## Proposta de Time de Agents

### Backend Agents

#### Agent 1: `Infra & Shared Utilities`
Responsabilidades:
- Criar utilitários compartilhados mínimos para autenticação JWT, validação de cookies e parsing de payload.
- Centralizar lógica de middleware comum e evitar duplicação entre `pong`, `matchmaking` e `authentication`.
- Validar configurações principais de Django (`settings.py`) para ambiente de desenvolvimento e produção.

#### Agent 2: `Player API Refactor`
Responsabilidades:
- Refatorar `player/api/views.py` para usar `serializers` corretamente.
- Padronizar respostas REST e remover `except Exception` genérico.
- Corrigir regras de validação de campos (`username`, `firstName`, `lastName`, `twoFactor`).
- Melhorar `PlayerAvatarUpload` para salvar arquivo com caminho seguro e validar `MEDIA_ROOT`.

#### Agent 3: `Matchmaking WebSocket`
Responsabilidades:
- Corrigir a lógica de criação e busca de sala no `matchmaking/api/consumers.py`.
- Garantir que `getRoom()` não retorne dentro do loop e que o fluxo de sala seja consistente.
- Remover `print()` e adicionar logging apropriado.
- Validar o uso de `group_add`, `group_send` e `group_discard`.
- Garantir que o consumidor WebSocket trate payloads JSON de entrada adequadamente.

#### Agent 4: `Pong WebSocket`
Responsabilidades:
- Corrigir o typo em `pong/api/rounting.py` e padronizar importação em `asgi.py`.
- Revisar o consumidor `Pong` e isolar lógica de jogo em funções menores.
- Verificar estado de jogo e erros de sincronização no WebSocket.
- Adicionar tratamento de cases de desconexão e `close_code`.

#### Agent 5: `Tournament & Authentication API`
Responsabilidades:
- Revisar `tournament/api/views.py`, `authentication/api/models.py` e as outras APIs para consistência.
- Garantir que o middleware `TokenAuthMW` use a mesma estratégia de autenticação e nomenclatura.
- Corrigir possíveis duplicações de modelos `Player` e enums semelhantes.
- Atualizar documentação mínima das rotas e contratos de API.

### Frontend Agents

#### Agent 6: `Frontend Integration & Routing`
Responsabilidades:
- Verificar strings de rota e URLs do frontend para adequação aos endpoints backend.
- Conferir o uso de WebSocket URLs e parâmetros em `frontend/web/js` e `frontend/index.html`.
- Ajustar mensagens de erro e tratamento de conexão para corresponder às respostas do backend.
- Garantir que o frontend use a mesma convenção de autenticação de cookie/JWT quando necessário.

#### Agent 7: `Frontend Static Assets & Deployment`
Responsabilidades:
- Revisar `frontend/server/conf/nginx.conf` e Dockerfiles para configuração consistente.
- Verificar se recursos estáticos estão apontando para os caminhos corretos e se `index.html` carrega os scripts necessários.
- Validar configurações de HTTPS/SSL das pastas `ssl/` e o uso de certificados para desenvolvimento local.
- Documentar ajustes mínimos de deploy frontend no README.

### Tester Agent

#### Agent 8: `Quality Gate & Testador`
Responsabilidades:
- Atualizar o `README.md` para refletir a estrutura real do repositório.
- Criar lista de verificação de refatoração e testes manuais para backend e frontend.
- Verificar se há dependências repetidas ou requisitos faltantes.
- Validar regras de estilo, consistência entre serviços e pontos de integração.
- Garantir que alterações respeitem o plano e evitem reescritas desnecessárias.

## Plano de execução sugerido

1. **Inspeção inicial**
   - `Infra & Shared Utilities` identifica duplicações e cria módulos reutilizáveis.
   - `Quality Gate` documenta as inconsistências detectadas.

2. **Correções críticas**
   - `Matchmaking WebSocket` corrige sala e fluxo de mensagens.
   - `Pong WebSocket` corrige imports e estabiliza o consumidor.
   - `Player API Refactor` estabiliza validação e respostas.

3. **Refino e segurança**
   - `Tournament & Authentication API` revisa autenticação compartilhada.
   - `Infra & Shared Utilities` aplica melhorias de configuração.

4. **Verificação final**
   - `Quality Gate` valida documentação e fumaça de execução.

## Regras de modificação

- Manter a arquitetura de serviços existente.
- Evitar reescritas completas de funcionalidades.
- Refatorar em camadas pequenas: middleware, consumidor WebSocket, view/API, utilitários.
- Preservar contratos de rota e payloads sempre que possível.

## Resultados esperados

- Código mais legível e menos duplicado.
- Autenticação JWT reutilizável e consistente.
- WebSockets estáveis em `matchmaking` e `pong`.
- APIs de jogador mais robustas e seguras.
- Documentação alinhada à estrutura real.

---

> Nota: o plano foi construído a partir da análise dos serviços `pong`, `matchmaking`, `player` e `authentication`. O próximo passo é executar cada agente em pequenos lotes de refatoração com validação funcional contínua.
