from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from enum import Enum

class Player(AbstractBaseUser):

    class Status(Enum):
        ONLINE = "ON"
        OFFLINE = "OF"
        INGAME = "IG"
    STATUS_CHOICE = [
        (Status.ONLINE.value, "ONLINE"),
        (Status.OFFLINE.value, "OFFLINE"),
        (Status.INGAME.value, "INGAME"),
    ]

    id = models.BigAutoField(primary_key=True, auto_created=True)
    email = models.EmailField(max_length=50, blank=False, null=False, unique=True)
    username = models.CharField(max_length=60, blank=False, null=False)
    first_name = models.CharField(max_length=25, blank=False, null=False)
    last_name = models.CharField(max_length=25, blank=False, null=False)
    avatar = models.URLField(blank=True, null=True)
    two_factor = models.BooleanField(default=False)
    status = models.CharField(max_length=2, choices=STATUS_CHOICE, default=Status.OFFLINE.value)
    champions = models.IntegerField(default=0, null=False, blank=True)
    wins = models.IntegerField(default=0, null=False, blank=True)
    losses = models.IntegerField(default=0, null=False, blank=True)
    #defeat = models.IntegerField(default=0, null=False, blank=True)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'

    def __str__(self):
        return f'Player: [username: {self.username} email: {self.email} ]'