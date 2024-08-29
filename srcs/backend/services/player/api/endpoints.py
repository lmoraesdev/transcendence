from . import views
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.PlayerInfo.as_view(), name='playerInfoView'),
    path('avatar/', views.PlayerAvatarUpload.as_view(), name='playerAvatarUploadView'),
    path('friendship/', views.PlayerFriendship.as_view(), name='playerFriendshipView'),
    path('matches/', views.MatchesHistory.as_view(), name='matchesHistoryView'),
    path('training/', views.TrainingHistory.as_view(), name="trainingHistoryView"),
    path('listAllPlayers/', views.ListAllUser.as_view(), name='listAllPlayers'),
    path('2FA/disable/', views.Disable2FA.as_view(), name="disable2FA"),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)