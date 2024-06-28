from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

class OAuth42Provider(OAuth2Provider):
    id = '42school'
    name = '42School'
    package = 'api'

    def get_default_scope(self):
        return ['public']
