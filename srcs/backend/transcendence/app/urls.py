from .services import OAuthLogin
from . import views
from django.urls import path

urlpatterns = [
    path('', views.HomeView.as_view(), name='Home'),
    path('login/', OAuthLogin, name='login'),
    path('oauth/callback/', views.OAuthLoginView.as_view(), name='oauth_callback'),

]