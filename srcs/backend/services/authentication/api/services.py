import datetime
import jwt
import logging
from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from pyotp import TOTP
from functools import wraps
from base64 import b32encode
from typing import Dict
from .models import Player

logger = logging.getLogger('custom_logger')

def generateJwt(id: int, twoFactor: bool) -> str:
    payload = {
        'id': id,
        'twofa': twoFactor,
        'exp': datetime.datetime.now() + datetime.timedelta(hours=1), #adequado minutes=15 para o refresh token
        'iat': datetime.datetime.now()
    }
    jwtToken = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return jwtToken

def decodeGooleToken(idToken: str) -> Dict[str, str]:
    decodeToken = jwt.decode(idToken, options={"verify_signature": False})
    return decodeToken

def get2FACode(playerId: int) -> str:
    #playerIdEnconde = str(playerId).encode("utf-8")
    #totp = TOTP(b32encode(playerIdEnconde))
    secret = pyotp.random_base32()
    totp = TOTP(secret)
    return totp.provisioning_uri(name=f"player{playerId}", issuer_name="ft_transcendence")

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
    logger.debug("Dados do jogador recebidos: %s", data)
    try:
        email = data['email']
        username = data['username']
        firstName = data['firstName']
        lastName = data['last_name']
        avatar = data.get('avatar')
        
        #logger.debug("Verificando se o jogador já existe...")
        if Player.objects.filter(email=email).exists():
            logger.debug("Jogador encontrado com o email: %s", email)
            player = Player.objects.get(email=email)
            return player
        
        #logger.debug("Criando novo jogador com o email: %s", email)
        player = Player.objects.create(
            email = email,
            username = username,
            firstName = firstName,
            lastName = lastName,
            avatar = avatar
        )
        #logger.debug("Novo jogador criado: %s", player)
        #logger.debug("PLayer: %s", player)
        return Player.objects.get(email=email)
        #return player
    except Exception as e:
        logger.error(f"Error creating player: {str(e)}")
        #return Response({"statusCode": 500, 'error': f"Error creating player: {str(e)}"})
        raise

def refresh_access_token(refresh_token):
    try:
        token = RefreshToken(refresh_token)
        return str(token.access_token)
    except Exception as e:
        raise e

def validate_access_token(access_token):
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(access_token)
        return validated_token
    except (InvalidToken, TokenError) as e:
        raise e