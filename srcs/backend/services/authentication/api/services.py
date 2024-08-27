import datetime
import jwt
import logging
from pprint import pformat
from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from pyotp.totp import TOTP
from functools import wraps
from base64 import b32encode
from typing import Dict
from .models import Player

logger = logging.getLogger('custom_logger')

def generateJwt(id: int, twoFactor: bool) -> str:
    payload = {
        'id': id,
        'twofa': twoFactor,
        'exp': datetime.datetime.now() + datetime.timedelta(days=1),
        'iat': datetime.datetime.now()
    }
    jwtToken = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return jwtToken

def decodeGooleToken(idToken: str) -> Dict[str, str]:
    decodeToken = jwt.decode(idToken, options={"verify_signature": False})
    return decodeToken

def   get2FACode(playerId: int) -> str:
    playerIdEnconde = str(playerId).encode("utf-8")
    return TOTP(b32encode(playerIdEnconde)).provisioning_uri(name="player", issuer_name="ft_transcendence")

def check2FACode(playerId: int, code: int) -> bool:
    playerIdEnconde = str(playerId).encode("utf-8")
    return TOTP(b32encode(playerIdEnconde)).verify(code)    

def jwtCookieRequired(viewFunction):
    @wraps(viewFunction)
    def wrappedView(request, *args, **kwargs):
        if "jwt_token" not in request.COOKIES:
            return Response({"statusCode": 401, 'error': 'JWT token cookie missing'})
        token = request.COOKIES.get("jwt_token")
        try:
            request.token = token
            decodedToken = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            if decodedToken.get('twofa'):
                return Response({"statusCode": 402, "error": "2FA required"})
            request.decoded_token = decodedToken
            return viewFunction(request, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return Response({"statusCode": 403, 'error': 'Token is expired'})
        except jwt.InvalidTokenError:
            return Response({"statusCode": 404, 'error': 'Invalid token'})
        except Exception as e:
            return Response({"statusCode": 500, 'error': str(e)})
    return wrappedView

def createPlayer(data: Dict[str, str]) -> Player:
    try:
        email = data['email']
        if Player.objects.filter(email=email).exists():
            player = Player.objects.get(email=email)
            return player
        username = data['username']
        firstName = data['firstName']
        lastName = data['lastName']
        avatar = data.get('avatar')
        
        player = Player.objects.create(
            email = email,
            username = username,
            firstName = firstName,
            lastName = lastName,
            avatar = avatar
        )
        #logger.debug("Novo jogador criado: %s", player)
        #logger.debug("PLayer: %s", player)
        #return Player.objects.get(email=email)
        return player
    except Exception as e:
        logger.error(f"Error creating player: {str(e)}")
        #return Response({"statusCode": 500, 'error': f"Error creating player: {str(e)}"})
