import requests
import jwt
import json 
import logging
import io
from os import getenv
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
from .services import decodeGooleToken, generateJwt, check2FACode, get2FACode, jwtCookieRequired, createPlayer, refresh_access_token, validate_access_token

from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

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
    
    logger.debug("playerData -> %s", userToken.json())
    playerData = {
        "email": userToken.json()['email'],
        "username": userToken.json()['login'],
        "last_name": userToken.json()['last_name'],
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
    if error:
        return Response({"statusCode": 401, "error": error})

    if not code:
        return Response({"statusCode": 401, "error": "User Not Authorized"})

    data = {
        "code": code,
        "client_id": getenv("GOOGLE_CLIENT_ID"),
        "client_secret": getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": f'{settings.PUBLIC_AUTHENTICATION_URL}google/callback/',
        "grant_type": "authorization_code",
    }

    try:
        auth_response = requests.post("https://oauth2.googleapis.com/token", data=data)
        auth_response.raise_for_status()  # Lança um erro se o status não for 200
        tokens = auth_response.json()
    except requests.RequestException:
        return Response({"statusCode": 401, "error": "Failed to obtain access token from Google."})  
        
    access_token = tokens.get("access_token")
    id_token = tokens.get("id_token")

    if not access_token or not id_token:
        return Response({"statusCode": 401, "error": "Invalid token response from Google"})

    tokenDecoded = decodeGooleToken(id_token)

    if tokenDecoded is None:
        return Response({"statusCode": 401, "error": "Failed to decode ID token"})

    playerData = {
        "email": tokenDecoded['email'],
        "username": tokenDecoded['name'],
        "firstName": tokenDecoded['given_name'],
        "last_name": tokenDecoded['family_name'],
        "avatar": tokenDecoded['picture'],
    }

    player = createPlayer(playerData)

    if player is None:
        return redirect(f"https://{settings.BASE_URL}/login/", permanent=True)

    jwtToken = generateJwt(player.id, player.twoFactor)
    response = redirect(f"https://{settings.BASE_URL}/{'twofa' if player.twoFactor else 'home'}/", permanent=True)
    response.set_cookie(
        'jwt_token',
        jwtToken,
        httponly=True,
        secure=True,
        samesite='Strict'
    )

    return response

@api_view(['GET'])
@jwtCookieRequired
def qrCode2FA(request):
    try:
        token = request.COOKIES.get("jwt_token")
        if not token:
            return Response({"statusCode": 401, "error": "JWT token missing"})

        decodedToken = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        playerId = decodedToken.get('id')
        
        # Log para verificar o token decodificado e o playerId
        print(f"Decoded Token: {decodedToken}")
        print(f"Player ID: {playerId}")
        
        if not playerId:
            return Response({"statusCode": 401, "error": "Invalid JWT token"})

        provisioning_uri = get2FACode(playerId)
        print(f"Provisioning URI: {provisioning_uri}")

        if not provisioning_uri:
            return Response({"statusCode": 402, "error": "2FA required"})

        qr_code_image = make_qr_code_image(provisioning_uri, QRCodeOptions())
        image_stream = io.BytesIO()
        qr_code_image.save(image_stream, format="PNG")
        image_stream.seek(0)

        # Retornando a imagem SVG
        return HttpResponse(image_stream.getvalue(), content_type="image/png")

    except Exception as e:
        print(f"Error: {e}")
        return Response({"statusCode": 500, "error": "Internal Server Error"})
    
@api_view(["POST"])
def verify2FA(request):
    code = request.data.get("code")
    jwtToken = request.COOKIES.get("jwt_token")
    try:
        decodedToken = jwt.decode(jwtToken, settings.SECRET_KEY, algorithms=["HS256"])
    except:
        return Response({"statusCode": 401, "error": "Invalid token"})
    playerId = decodedToken['id']
    twoFactor = decodedToken['twofa']
    if twoFactor is False:
        if not check2FACode(playerId, code):
            return Response({"statusCode": 401, "message": "Incorrect 2FA code."})
        player = Player.objects.get(id=playerId)
        player.twoFactor = True
        player.save()
        return Response({"statusCode": 200, "message": "Successfully verified"})
    else:
        if not check2FACode(playerId, code):
            return Response({"statusCode": 401, "message": "Incorrect 2FA code."})
        jwtToken = generateJwt(playerId, False)
        response = Response({"statusCode": 200, "message": "Successfully verified", "redirected": True})
        response.set_cookie("jwt_token", value=jwtToken, httponly=True, secure=True)
        return response
    
@api_view(['POST'])
def refreshToken(request):
    refresh_token = request.COOKIES.get('jwt_token')
    if refresh_token is None:
        return Response({"statusCode": 401, "error": "Refresh token missing"})
    
    try:
        new_access_token = refresh_access_token(refresh_token)
        return Response({"access_token": new_access_token})
    except Exception as e:
        return Response({"statusCode": 403, "error": str(e)})

@api_view(['POST'])
def checkToken(request):
    access_token = request.COOKIES.get('jwt_token')
    if access_token is None:
        return Response({"statusCode": 401, "error": "Access token missing"})
    
    try:
        validate_access_token(access_token)
        return Response({"statusCode": 200, "message": "Token is valid"})
    except Exception as e:
        return Response({"statusCode": 401, "error": "Invalid token", "details": str(e)})