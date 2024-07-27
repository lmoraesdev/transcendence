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
    username = models.CharField(max_length=20, blank=False, null=False)
    firstName = models.CharField(max_length=25, blank=False, null=False)
    lastName = models.CharField(max_length=25, blank=False, null=False)
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
    
class Friendship(models.Model):
    class Status(Enum):
        ACCEPTED = "AC"
        PENDING = "PN"
    STATUS_CHOICE = [
        (Status.ACCEPTED.value, "ACCEPTED"),
        (Status.PENDING.value, "PENDING")
    ]

    id = models.BigAutoField(primary_key=True, auto_created=True)
    sender = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='orderShipped')
    receiver = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='requestReceived')
    status = models.CharField(max_length=2, choices=STATUS_CHOICE, default=Status.PENDING.value)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}"
    
class Tournament(models.Model):
    class StatusChoices(Enum):
        PENDING = 'PD'
        PROGRESS = 'PG'
        FINISHED = 'FN'

        @classmethod
        def choices(cls):
            return [(choice.value, choice.name) for choice in cls]

    id = models.BigAutoField(primary_key=True, auto_created=True)
    name = models.CharField(max_length=20, blank=False, null=False, unique=False)
    round = models.IntegerField(default=1)
    status = models.CharField(max_length=2,
                              choices=StatusChoices.choices(),
                              default=StatusChoices.PENDING.value,
                              null=False, blank=False)

    def __str__(self):
        return f"Tournament : {self.id}"

class Match(models.Model):
    class Game(Enum):
        PONG = "PG"

        @classmethod
        def choices(cls):
            return [(choice.value, choice.name) for choice in cls]
    
    class Status(Enum):
        PLAYING = "PL"
        NOT_PLAYING = "NP"

        @classmethod
        def choices(cls):
            return [(choice.value, choice.name) for choice in cls]

    id = models.BigAutoField(primary_key=True, auto_created=True)
    game = models.CharField(max_length=2, choices=Game.choices(), null=False, blank=False, default=Game.PONG.value)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True, blank=False)
    round = models.IntegerField(default=1)
    status = models.CharField(max_length=2, choices=Status.choices(), null=False, blank=False, default=Status.NOT_PLAYING.value)


class PlayerMatch(models.Model):
    id = models.BigAutoField(primary_key=True, auto_created=True)
    matchId = models.ForeignKey(Match, on_delete=models.CASCADE, null=False, blank=False)
    playerId = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=False, blank=False)
    score = models.IntegerField(default=0, null=False, blank=False)
    matchFinished = models.BooleanField(default=False, null=False, blank=False)

    def __str__(self):
        return f"Score: {self.score}"

class PlayerTournament(models.Model):
    id = models.BigAutoField(primary_key=True, auto_created=True)
    playerId = models.ForeignKey(Player, on_delete=models.CASCADE, null=False, blank=False)
    tournamentId = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=False, blank=False)
    creator = models.BooleanField(default=False, null=False, blank=False)

    def __str__(self):
        return f'{self.tournamentId} -> {self.creator}'
