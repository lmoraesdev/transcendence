from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Tournament, Player, Match, PlayerMatch, PlayerTournament
from .serializer import TournamentSerializer
from .decorators import jwt_cookie_required
from itertools import cycle

def updateTournament(tournamentId):
    tournament = Tournament.objects.get(id=tournamentId)
    if (tournament.status == Tournament.StatusChoices.FINISHED.value):
        return
    currentRound = tournament.round
    currentMatch = Match.objects.filter(tournament=tournament, round=currentRound)
    if (all(match.status == Match.Status.PLAYING.value for match in currentMatch)):
        if (tournament.round == 3):
            tournament.status = Tournament.StatusChoices.FINISHED.value
            tournament.save()
            return
    # winner