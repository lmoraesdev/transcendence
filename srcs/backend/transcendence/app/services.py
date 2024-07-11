from urllib.parse import urlencode
from django.http import HttpResponse
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from requests_oauthlib import OAuth2Session
from decouple import config
import logging
import requests

logger = logging.getLogger(__name__)

BASE_URL = config('BASE_URL')
CLIENT_ID = config('CLIENT_ID')
CLIENT_SECRET = config('CLIENT_SECRET')
API_URL = 'https://api.intra.42.fr'

def OAuthLogin(redirect_uri):
    try:            
        auth_url = f'{API_URL}/oauth/authorize'
        # redirect_uri = f'{BASE_URL}/oauth/callback/'
        redirect_uri = 'https://www.google.com/'
        params = {
            'client_id': CLIENT_ID,
            'redirect_uri': redirect_uri,
            'response_type': 'code'
        }
        return redirect(f'{auth_url}?{urlencode(params)}')
    except Exception as e:
        return HttpResponse("An error occurred in external_login", status=500)

def OAuthCallback(request):
    try:
        code = request.GET.get('code')
        if not code:
            return HttpResponse('Error: Code not return', status=400)
        
        tokenUrl = f'{API_URL}/oauth/token'

        response = requests.post(tokenUrl, data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': f'{BASE_URL}/oauth/callback/',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        })

        responseData = response.json()

        if response.status_code != 200 or 'access_token' not in responseData:
            return HttpResponse('Error fetching access token', status=401)

        accessToken = responseData.get('access_token')

        userInfoUrl = f'{API_URL}/v2/me'
        userInfoResponse = requests.get(userInfoUrl, headers={
            'Authorization': f'Bearer {accessToken}',
        })

        userInfo = userInfoResponse.json()
        if userInfoResponse.status_code != 200:
            return HttpResponse('Error fetching user info', status=402)

        userModel = get_user_model()
        try:
            user = userModel.objects.get(userName=userInfo['login'])
        except userModel.DoesNotExist:
            try:
                user = userModel.objects.get(email=userInfo['email'])
            except userModel.DoesNotExist:
                user = userModel.objects.create_user(
                    username=userInfo['login'],
                    first_name=userInfo['first_name'],
                    last_name=userInfo['last_name'],
                    email=userInfo['email'],
                )
                user.save()
        
        token, created = Token.objects.get_or_create(user=user)
        
        return redirect(f'/?token={token.key}')
    except Exception as e:
        return HttpResponse("An error occurred in external_callback", status=500)
