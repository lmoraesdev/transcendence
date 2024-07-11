from .services import OAuthLogin, OAuthCallback
from . import views
from django.urls import path

urlpatterns = [
    path('', views.HomeView.as_view(), name='Home'),
    path('login/', OAuthLogin, name='login'),
    path('oauth/callback/', OAuthCallback, name='oauth_callback'),

]