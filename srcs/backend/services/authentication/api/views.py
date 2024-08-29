import requests
import jwt
import logging
from os import getenv
from pprint import pformat
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.http import urlencode
from rest_framework.decorators import api_view
from rest_framework.response import Response
from qr_code.qrcode.maker import make_qr_code_image
from qr_code.qrcode.utils import QRCodeOptions
from .models import Player
from .services import decodeGooleToken, generateJwt, check2FACode, get2FACode, jwtCookieRequired, createPlayer

logger = logging.getLogger('custom_logger')

@api_view(['GET'])
def OAuthIntra(request):
    redirectUri = urlencode({"redirect_uri": f"{settings.PUBLIC_AUTHENTICATION_URL}intra/callback/"})
    authorizationUrl = f"https://api.intra.42.fr/oauth/authorize?client_id={getenv('INTRA_CLIENT_ID')}&{redirectUri}&response_type=code"
    return redirect(authorizationUrl)

@api_view(['GET'])
def intraCallbackOAuth(request):
    code = request.GET.get("code")
    errorMessage = request.GET.get("error")
    if errorMessage is not None:
        return Response({"statusCode": 401, "error": errorMessage})
    if code is None:
        return Response({"statusCode": 402, "error": "code is required"})
    if request.user.is_authenticated:
        return Response({"statusCode": 200, "message": "Already logged in"})
    data = {
        "grant_type": "authorization_code",
        "client_id": getenv("INTRA_CLIENT_ID"),
        "client_secret": getenv("INTRA_CLIENT_SECRET"),
        "code": code,
        "redirect_uri": f"{settings.PUBLIC_AUTHENTICATION_URL}intra/callback/",
    }
    # print("data: ", data)
    oAuthResponse = requests.post("https://api.intra.42.fr/oauth/token", data=data)
    if not oAuthResponse.ok:
        return Response({"statusCode": 401})
    accessToken = oAuthResponse.json()['access_token']
    userToken = requests.get(
        "https://api.intra.42.fr/v2/me",
        headers={"Authorization": f"Bearer {accessToken}"}
    )
    if not userToken.ok:
        return Response({"statusCode": 401, "detail": "No access token in the token response"})
    
    playerData = {
        "email": userToken.json()['email'],
        "username": userToken.json()['login'],
        "firstName": userToken.json()['first_name'],
        "lastName": userToken.json()['last_name'],
        "avatar": userToken.json()['image']['link'],
    }
    player = createPlayer(playerData)
    if player is None:
        return redirect(f"https://{settings.BASE_URL}/login/", permanent=True)
    jwtToken = generateJwt(player.id, player.twoFactor)
    response = redirect(f"https://{settings.BASE_URL}/{'twofa' if player.twoFactor else 'home'}/", permanent=True)
    response.set_cookie("jwt_token", value=jwtToken, httponly=True, secure=True)
    return response

@api_view(['GET'])
@jwtCookieRequired
def loggoutUser(request):
    if request.token is not None:
        cache.set(request.token, True, timeout=None)
        response = redirect(f"https://{settings.BASE_URL}/login/", permanent=True)
        response.delete_cookie("jwt_token")
        return response
    else:
        return Response({"statusCode": 400, "detail": "No valid access token found"})
    
@api_view(['GET'])
def OAuthGoogle(request):
    SCOPES = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
    ]
    params = {
        "response_type": "code",
        "client_id": getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": f'{settings.PUBLIC_AUTHENTICATION_URL}google/callback/',
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "select_account",
    }
    queryParams = urlencode(params)
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    authorizationUrl = f"{GOOGLE_AUTH_URL}?{queryParams}"
    return redirect(authorizationUrl)

@api_view(["GET"])
def googleCallbackOAuth(request):
    code = request.GET.get("code")
    error = request.GET.get("error")
    if error is not None:
        return Response({"statusCode": 401, "error": error})
    if code is None:
        return Response({"statusCode": 401, "error": "User Not Autorized"})
    data = {
        "code": code,
        "client_id": getenv("GOOGLE_CLIENT_ID"),
        "client_secret": getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": f'{settings.PUBLIC_AUTHENTICATION_URL}google/callback/',
        "grant_type": "authorization_code",
    }
    auth_response = requests.post("https://oauth2.googleapis.com/token", data=data)
    if not auth_response.ok:
        return Response({"statusCode": 401, "error": "Failed to obtain access token from Google."})
    tokens = auth_response.json()
    if tokens["access_token"] is None:
        return Response({"statusCode": 401, "error": "AccessToken is invalid"})
    token = tokens["id_token"]
    tokenDecoded = decodeGooleToken(token)
    playerData = {
        "email": tokenDecoded['email'],
        "username": tokenDecoded['name'],
        "firstName": tokenDecoded['given_name'],
        "lastName": tokenDecoded['family_name'],
        "avatar": tokenDecoded['picture'],
    }
    player = createPlayer(playerData)
    if player is None:
        return redirect(f"https://{settings.BASE_URL}/login/", permanent=True)
        #return Response({"statusCode": 401, "error": "Failed to create player"})

    jwtToken = generateJwt(player.id, player.twoFactor)
    response = redirect(f"https://{settings.BASE_URL}/{'twofa' if player.twoFactor else 'home'}/", permanent=True)
    response.set_cookie("jwt_token", value=jwtToken, httponly=True, secure=True)
    return response

@api_view(['GET'])
@jwtCookieRequired
def qrCode2FA(request):
    logger.debug(f"entrou no qrcode\nrequest = {pformat(request)}")
    token = request.COOKIES.get("jwt_token")
    logger.debug(f"token: {pformat(token)}")
    decodedToken = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    logger.debug(f"decodeToken: {pformat(decodedToken)}")
    playerId = decodedToken['id']
    logger.debug(f"playerId: {playerId}")
    qrCode = get2FACode(playerId)
    logger.debug(f"qrCode: {pformat(qrCode)}")
    image = make_qr_code_image(qrCode, QRCodeOptions(), True)
    logger.debug(f"imagem = {pformat(image)}")
    return HttpResponse(image, content_type='image/svg+xml')

@api_view(["POST"])
def verify2FA(request):
    logger.debug("Iniciando verificação 2FA")
    
    code = request.data.get("code")
    if not code:
        logger.error("Código 2FA não fornecido na requisição.")
        return Response({"statusCode": 400, "error": "2FA code not provided"})

    logger.debug(f"Código 2FA recebido: {code}")
    
    jwtToken = request.COOKIES.get("jwt_token")
    if not jwtToken:
        logger.error("Token JWT não encontrado nos cookies.")
        return Response({"statusCode": 401, "error": "JWT token not found in cookies"})

    logger.debug(f"Token JWT recebido: {jwtToken}")
    
    try:
        decodedToken = jwt.decode(jwtToken, settings.SECRET_KEY, algorithms=["HS256"])
        logger.debug(f"Token JWT decodificado: {decodedToken}")
    except jwt.ExpiredSignatureError:
        logger.error("Token JWT expirado.")
        return Response({"statusCode": 401, "error": "Token expired"})
    except jwt.InvalidTokenError:
        logger.error("Token JWT inválido.")
        return Response({"statusCode": 401, "error": "Invalid token"})
    except Exception as e:
        logger.error(f"Erro ao decodificar token JWT: {str(e)}")
        return Response({"statusCode": 500, "error": "Internal server error"})

    playerId = decodedToken.get('id')
    twoFactor = decodedToken.get('twofa')

    if playerId is None or twoFactor is None:
        logger.error(f"Dados inválidos no token JWT. playerId: {playerId}, twoFactor: {twoFactor}")
        return Response({"statusCode": 401, "error": "Invalid token data"})

    logger.debug(f"Player ID: {playerId}, Two Factor: {twoFactor}")

    if twoFactor is False:
        logger.debug("2FA não está habilitado, verificando o código 2FA.")
        if not check2FACode(playerId, code):
            logger.error("Código 2FA incorreto.")
            return Response({"statusCode": 401, "message": "Incorrect 2FA code."})

        try:
            player = Player.objects.get(id=playerId)
            player.twoFactor = True
            player.save()
            logger.debug(f"2FA habilitado com sucesso para o player ID: {playerId}")
            return Response({"statusCode": 200, "message": "Successfully verified"})
        except Player.DoesNotExist:
            logger.error(f"Player com ID {playerId} não encontrado.")
            return Response({"statusCode": 404, "error": "Player not found"})
        except Exception as e:
            logger.error(f"Erro ao atualizar o player: {str(e)}")
            return Response({"statusCode": 500, "error": "Internal server error"})

    else:
        logger.debug("2FA já está habilitado, verificando o código 2FA.")
        if not check2FACode(playerId, code):
            logger.error("Código 2FA incorreto.")
            return Response({"statusCode": 401, "message": "Incorrect 2FA code."})

        try:
            jwtToken = generateJwt(playerId, False)
            response = Response({"statusCode": 200, "message": "Successfully verified", "redirected": True})
            response.set_cookie("jwt_token", value=jwtToken, httponly=True, secure=True)
            logger.debug(f"Token JWT renovado e cookie atualizado para o player ID: {playerId}")
            return response
        except Exception as e:
            logger.error(f"Erro ao gerar novo token JWT: {str(e)}")
            return Response({"statusCode": 500, "error": "Internal server error"})