import requests
import jwt
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
from .services import decodeGooleToken, generateJwt, check2FACode, get2FACode, jwtCookieRequired, createPlayer

@api_view(['GET'])
def OAuthIntra(request):
    # redirectUri = urlencode({"redirect_uri": f"{settings.PUBLIC_AUTHENTICATION_URL}intra/callback/"})
    redirectUri = urlencode({"redirect_uri": "https://www.google.com/"})
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
    # print("indo pra data callback")
    data = {
        "grant_type": "authorization_code",
        "client_id": getenv("INTRA_CLIENT_ID"),
        "client_secret": getenv("INTRA_CLIENT_SECRET"),
        "code": code,
        "redirect_uri": "https://www.google.com/"
        # "redirect_uri": f"{settings.PUBLIC_AUTHENTICATION_URL}intra/callback/",
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
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
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
    jwtToken = generateJwt(player.id, player.twoFactor)
    response = redirect(f"https://{settings.BASE_URL}/{'twofa' if player.twoFactor else 'home'}/", permanent=True)
    response.set_cookie("jwt_token", value=jwtToken, httponly=True, secure=True)
    return response

@api_view(['GET'])
@jwtCookieRequired
def qrCode2FA(request):
    token = request.COOKIES.get("jwt_token")
    decodedToken = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    idPlayer = decodedToken['id']
    qrCode = get2FACode(idPlayer)
    image = make_qr_code_image(qrCode, QRCodeOptions(), True)
    return HttpResponse(image, content_type='image/svg+xml')

@api_view(["POST"])
def verify2FA(request):
    code = request.data.get("code")
    jwtToken = request.COOKIES.get("jwt_token")
    try:
        decodedToken = jwt.decode(jwtToken, settings.SECRET_KEY, algorithms=["HS256"])
    except:
        return Response({"statusCode": 401, "error": "Invalid token"})
    idPlayer = decodedToken['id']
    twoFactor = decodedToken['twofa']
    if twoFactor is False:
        if not check2FACode(idPlayer, code):
            return Response({"statusCode": 401, "message": "Incorrect 2FA code."})
        player = Player.objects.get(id=idPlayer)
        player.twoFactor = True
        player.save()
        return Response({"statusCode": 200, "message": "Successfully verified"})
    else:
        if not check2FACode(idPlayer, code):
            return Response({"statusCode": 401, "message": "Incorrect 2FA code."})
        jwtToken = generateJwt(idPlayer, False)
        response = Response({"statusCode": 200, "message": "Successfully verified", "redirected": True})
        response.set_cookie("jwt_token", value=jwtToken, httponly=True, secure=True)
        return response