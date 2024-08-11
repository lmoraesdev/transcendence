import re
import jwt
from django.db import close_old_connections
from django.conf import settings
from channels.auth import AuthMiddlewareStack

class TokenAuthMW:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()
        headers = dict(scope["headers"])
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()
            match = re.search("jwt_token=(.*)", cookies)
            if match is not None:
                token_key = match.group(1)
                scope['payload'] = self.decodeToken(token_key)
                if scope['payload'] is not None:
                    return await self.inner(scope, receive, send)
        return
    
    def decodeToken(self, tokenKey):
        try:
            payload = jwt.decode(tokenKey, settings.SECRET_KEY, algorithms="HS256")
            if (payload['twofa']):
                return None
            return payload
        except jwt.InvalidTokenError:
            return None
        
AuthMWStack = lambda inner: TokenAuthMW(AuthMiddlewareStack(inner))