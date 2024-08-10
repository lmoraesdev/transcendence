import datetime
import jwt
import logging
from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from pyotp.totp import TOTP
from base64 import b32encode
from typing import Dict
from .models import Player

logger = logging.getLogger('custom_logger')

def generateJwt(id: int, two_factor: bool) -> str:
    payload = {
        'id': id,
        'twofa': two_factor,
        'exp': datetime.datetime.now() + datetime.timedelta(minutes=15),
        'iat': datetime.datetime.now()
    }
    logger.debug("key: %s", settings.SECRET_KEY)
    jwtToken = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return jwtToken

def decodeGooleToken(idToken: str) -> Dict[str, str]:
    decodeToken = jwt.decode(idToken, options={"verify_signature": False})
    return decodeToken

def  get2FACode(playerId: int, code: int) -> bool:
    playerIdEnconde = str(playerId).encode("utf-8")
    return TOTP(b32encode(playerIdEnconde)).provisioning_uri(name="player", issuer_name="ft_transcendence")

def check2FACode(playerId: int, code: int) -> bool:
    playerIdEnconde = str(playerId).encode("utf-8")
    return TOTP(b32encode(playerIdEnconde)).verify(code)    

def jwtCookieRequired(viewFunction):
    def wrappedView(request):
        if "jwt_token" not in request.COOKIES:
            return Response({"statusCode": 401, 'error': 'JWT token cookie missing'})
        token = request.COOKIES.get("jwt_token")
        try:
            request.token = token
            decodedToken = jwt.decode(token, settings.SECRET_KEY, algorithm="HS256")
            if decodedToken['twofa']:
                return Response({"statusCode": 402, "error": "2FA required"})
            request.decoded_token = decodedToken
            return viewFunction(request)
        except jwt.ExpiredSignatureError:
            return Response({"statusCode": 403, 'error': 'Token is expired'})
        except jwt.InvalidTokenError:
            return Response({"statusCode": 404, 'error': 'Invalid token'})
        except Exception as e:
            return Response({"statusCode": 500, 'error': str(e)})
    return wrappedView

def createPlayer(data: Dict[str, str]) -> Player:
    logger.debug("Dados do jogador recebidos: %s", data)
    try:

        email = data['email']
        username = data['username']
        first_name = data['first_name']
        last_name = data['last_name']
        avatar = data.get('avatar')
        
        logger.debug("Verificando se o jogador já existe...")
        if Player.objects.filter(email=email).exists():
            logger.debug("Jogador encontrado com o email: %s", email)
            player = Player.objects.get(email=email)
            return player
        
        logger.debug("Criando novo jogador com o email: %s", email)
        player = Player.objects.create(
            email = email,
            username = username,
            first_name = first_name,
            last_name = last_name,
            avatar = avatar
        )
        logger.debug("Novo jogador criado: %s", player)
        #logger.debug("PLayer: %s", player)
        #return Player.objects.get(email=email)
        return player
    except Exception as e:
        logger.error(f"Error creating player: {str(e)}")
        #return Response({"statusCode": 500, 'error': f"Error creating player: {str(e)}"})
        raise
        #return None
