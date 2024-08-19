from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('intra/', views.OAuthIntra, name='intraView'),
    path('intra/callback/', views.intraCallbackOAuth, name='intraCallbackView'),
    path('google/', views.OAuthGoogle, name='googleView'),
    path('google/callback/', views.googleCallbackOAuth, name='googleCallbackView'),
    path('loggout/', views.loggoutUser, name='loggoutUserView'),
    path('2FA/qrcode/', views.qrCode2FA, name='qrCodeTwoFactorView'),
    path('2FA/verify/', views.verify2FA, name='verifyTwoFactorView'),

    path('check-token/', views.checkToken, name='checkTokenView'),
    path('refresh-token/', views.refreshToken, name='refreshTokenView'),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)