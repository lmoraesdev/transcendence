import re
import jwt
from django.db import close_old_connections
from django.conf import settings
from channels.auth import AuthMiddlewareStack

class TokenMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()
        headers = dict(scope["headers"])
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()
            match = re.search(r"jwt_token=([^;]+)", cookies)
            if match is not None:
                token_key = match.group(1)
                payload = self.decode_token(token_key)
                if payload is not None:
                    scope['payload'] = payload
                    return await self.inner(scope, receive, send)
        await send({"type": "websocket.close", "code": 4401})

    def decode_token(self, token_key):
        try:
            payload = jwt.decode(token_key, settings.SECRET_KEY, algorithms=["HS256"])
            if payload.get('twofa'):
                return None
            return payload
        except jwt.InvalidTokenError:
            return None

MyAuthMiddlewareStack = lambda inner: TokenMiddleware(AuthMiddlewareStack(inner))
