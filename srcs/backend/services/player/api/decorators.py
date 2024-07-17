import jwt
from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response

def jwtCookieRequired(view_func):
    def wrappedView(request):
        if "jwt_token" not in request.COOKIES:
            return Response({"statusCode": 401, 'error': 'JWT token cookie missing'})
        token = request.COOKIES.get("jwt_token")
        if cache.get(token) is not None:
            return Response({"statusCode": 402, 'error': 'Invalid Token'})
        try:
            decodedToken = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if decodedToken['twofa']:
                return Response({"statusCode": 403, 'error': '2FA Required'})
            request.decoded_token = decodedToken
            return view_func(request)
        except jwt.ExpiredSignatureError:
            return Response({"statusCode": 404, 'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({"statusCode": 401, 'error': 'Invalid token'})
        except Exception as e:
            return Response({"statusCode": 500, 'error': str(e)})
    return wrappedView