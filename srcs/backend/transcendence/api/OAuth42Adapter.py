from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter
from .OAuth42Provider import OAuth42Provider
import requests

class Adapter42Auth2(OAuth2Adapter):
    provider_id = OAuth42Provider.id
    access_token_url = 'https://api.intra.42.fr/oauth/token'
    authorize_url = 'https://api.intra.42.fr/oauth/authorize'
    profile_url = 'https://api.intra.42.fr/v2/me'

    def complete_login(self, request, app, token, **kwargs):
        headers = {'Authorization': f'Bearer {token.token}'}
        extra_data = requests.get(self.profile_url, headers=headers).json()
        return self.get_provider().sociallogin_from_response(request, extra_data)
