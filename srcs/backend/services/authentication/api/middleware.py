import re
import jwt
from django.db import close_old_connections
from django.conf import settings
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from .models import Player

@database_sync_to_async
def getPlayerById(id):
    return Player.objects.get(id=id)

class TokenAuthMW:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()
        headers = dict(scope['headers'])
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()
            getCookie = re.search(r"jwt_token=([^;]+)", cookies)
            if getCookie is not None:
                tokenKey = getCookie.group(1)
                if await self.decodeToken(tokenKey, scope):
                    return await self.inner(scope, receive, send)
        await send({"type": "websocket.close", "code": 4401})

    async def decodeToken(self, tokenKey, scope):
        try:
            payload = jwt.decode(tokenKey, settings.SECRET_KEY, algorithms=["HS256"])
            if payload.get('twofa'):
                return False
            scope['player'] = await getPlayerById(payload['id'])
            scope['status'] = "Valid"
            return True
        except (Player.DoesNotExist, jwt.InvalidTokenError):
            scope['status'] = "Invalid"
            return False

AuthMWStack = lambda inner: TokenAuthMW(AuthMiddlewareStack(inner))
