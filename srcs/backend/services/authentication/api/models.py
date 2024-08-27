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
    email = models.EmailField(max_length=255, blank=False, null=False, unique=True)
    username = models.CharField(max_length=255, blank=False, null=False)
    firstName = models.CharField(max_length=255, blank=False, null=False)
    lastName = models.CharField(max_length=255, blank=False, null=False)
    avatar = models.URLField(blank=True, null=True)
    twoFactor = models.BooleanField(default=False)
    status = models.CharField(max_length=2, choices=STATUS_CHOICE, default=Status.OFFLINE.value)
    victory = models.IntegerField(default=0, null=False, blank=True)
    defeat = models.IntegerField(default=0, null=False, blank=True)
    champion = models.IntegerField(default=0, null=False, blank=True)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'

    def __str__(self):
        return f'Player: [username: {self.username} email: {self.email} ]'
    
class PlayerSettings(models.Model):
    
    class TextSize(Enum):
        EXTRA_SMALL = "xs"
        SMALL = "sm"
        MEDIUM = "md"
        LARGE = "lg"
        EXTRA_LARGE = "xl"
    TEXT_SIZE_CHOICE = [
        (TextSize.EXTRA_SMALL.value, "EXTRA_SMALL"),
        (TextSize.SMALL.value, "SMALL"),
        (TextSize.MEDIUM.value, "MEDIUM"),
        (TextSize.LARGE.value, "LARGE"),
        (TextSize.EXTRA_LARGE.value, "EXTRA_LARGE"),
    ]

    class ColorBlind(Enum):
        NONE = "none"
        PROTANOPIA = "protanopia"
        DEUTERANOPIA = "deuteranopia"
        TRITANOPIA = "tritanopia"
    COLOR_BLIND_CHOICE = [
        (ColorBlind.NONE.value, "NONE"),
        (ColorBlind.PROTANOPIA.value, "PROTANOPIA"),
        (ColorBlind.DEUTERANOPIA.value, "DEUTERANOPIA"),
        (ColorBlind.TRITANOPIA.value, "TRITANOPIA"),
    ]

    class Language(Enum):
        PORTUGUES = "pt"
        INGLES = "en"
    LANGUAGE_CHOICE = [
        (Language.PORTUGUES.value, "PORTUGUES"),
        (Language.INGLES.value, "INGLES"),
    ]

    class IaLevel(Enum):
        EASY = "esy"
        MEDIUM = "med"
        HARD = "hrd"
        IMPOSSIBLE = "imp"
    IA_LEVE_CHOICE = [
        (IaLevel.EASY.value, "EASY"),
        (IaLevel.MEDIUM.value, "MEDIUM"),
        (IaLevel.HARD.value, "HARD"),
        (IaLevel.IMPOSSIBLE.value, "IMPOSSIBLE"),
    ]

    id = models.BigAutoField(primary_key=True, auto_created=True)
    playerId = models.ForeignKey(Player, on_delete=models.CASCADE, null=False, blank=False)
    screenReader = models.BooleanField(default=False, blank=False, null=False)
    highContrast = models.BooleanField(default=False, blank=False, null=False)
    textSize = models.CharField(max_length=2, choices=TEXT_SIZE_CHOICE, default=TextSize.MEDIUM.value)
    colorBlind = models.CharField(max_length=15, choices=COLOR_BLIND_CHOICE, default=ColorBlind.NONE.value)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICE, default=Language.INGLES.value)
    iaLevel = models.CharField(max_length=3, choices=IA_LEVE_CHOICE, default=IaLevel.EASY.value)
