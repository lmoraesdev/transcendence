from django.db import models
from enum import Enum

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
        TICTACTOE = "TC"

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
