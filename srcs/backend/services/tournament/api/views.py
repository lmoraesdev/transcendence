from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from itertools import cycle
from .models import Tournament, Player, Match, PlayerMatch, PlayerTournament
from .serializer import TournamentSerializer
from .decorators import jwtCookieRequired

def updateTournament(tournamentId):
    tournament = Tournament.objects.get(id=tournamentId)
    if (tournament.status == Tournament.StatusChoices.FINISHED.value):
        return
    currentRound = tournament.round
    currentMatch = Match.objects.filter(tournament=tournament, round=currentRound)
    if (all(match.status == Match.Status.PLAYING.value for match in currentMatch)):
        if (tournament.round == 3):
            tournament.status = Tournament.StatusChoices.FINISHED.value
            winner = PlayerMatch.objects.get(matchId__in=currentMatch, winner=True)
            winner.playerId.champion += 1
            tournament.save()
            winner.playerId.save()
            return
        playerWinners = list(PlayerMatch.objects.filter(matchId__in=currentMatch, winner=True))
        if (playerWinners):
            tournament.round += 1
            tournament.save()
        while (len(playerWinners) >= 2):
            playerOne = playerWinners.pop(0)
            playerTwo = playerWinners.pop(0)
            matchTournament = Match.objects.create(
                tournament=tournament,
                game=Match.Game.PONG.value,
                round=currentRound + 1
            )
            PlayerMatch.objects.create(
                matchId=matchTournament,
                playerId=playerOne
            )
            PlayerMatch.objects.create(
                matchId=matchTournament,
                playerId=playerTwo
            )

class TournamentView(APIView):
    @method_decorator(jwtCookieRequired)
    def get(self, request):
        player_id = request.decoded_token['id']
        player = Player.objects.get(id=player_id)
        serializer = TournamentSerializer()
        tournament = serializer.playerInTournament(player)
        if tournament is not None:
            serializer = TournamentSerializer(tournament, context={"player": player})
            if tournament.status == Tournament.StatusChoices.PENDING.value:
                return Response({"statusCode": 200, "currentTournament": serializer.data, "players": serializer.getPlayers(tournament)})
            updateTournament(tournament.id)
            return Response({"statusCode": 200, "currentTournament": serializer.data})
        tournaments = Tournament.objects.filter(status=Tournament.StatusChoices.PENDING.value)
        tournamentPlayerFinished = PlayerTournament.objects.filter(playerId=player).order_by("-id").first()
        responseData = {}
        if tournamentPlayerFinished is not None:
            tournamentFinished = Tournament.objects.filter(id=tournamentPlayerFinished.tournamentId.id).first()
            if tournamentFinished is not None:
                serializerFinished = TournamentSerializer(tournamentFinished)
                responseData["currentTournament"] = serializerFinished.data
        if not tournaments:
            responseData.update({"statusCode": 405, "message": "No tournament is available"})
            return Response(responseData)
        serializerAll = TournamentSerializer(tournaments, many=True)
        responseData.update({"statusCode": 200, "tournaments": serializerAll.data})
        return Response(responseData)

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        action = str(request.data.get('action', '')).lower()
        tournamentId = request.data.get('tournamentId')
        name = request.data.get('name')
        player_id = request.decoded_token['id']
        player = Player.objects.get(id=player_id)

        if 'create' in action:
            if not name or not isinstance(name, str):
                return Response({"statusCode": 403, "message": "Invalid tournament name"})
            serializer = TournamentSerializer()
            if serializer.playerInTournament(player):
                return Response({"statusCode": 400, "message": "Already in a tournament"})
            tournament = Tournament.objects.create(name=name)
            PlayerTournament.objects.create(playerId=player, tournamentId=tournament, creator=True)
            serializer = TournamentSerializer(tournament)
            return Response({"statusCode": 200, "currentTournament": serializer.getPlayers(tournament)}, status=201)

        if not tournamentId:
            return Response({"statusCode": 400, "message": "Missing tournament id"})

        try:
            tournament = Tournament.objects.get(id=tournamentId)
        except Tournament.DoesNotExist:
            return Response({"statusCode": 404, "message": "Tournament not found"})

        serializer = TournamentSerializer(tournament)
        current_count = serializer.getPlayerCount(tournament)

        if 'join' in action:
            if tournament.status != Tournament.StatusChoices.PENDING.value:
                return Response({"statusCode": 400, "message": "Tournament cannot be joined"})
            if serializer.playerInTournament(player):
                return Response({"statusCode": 400, "message": "Already in a tournament"})
            if current_count >= settings.COMPETITORS:
                return Response({"statusCode": 400, "message": "Tournament is full"})
            PlayerTournament.objects.create(playerId=player, tournamentId=tournament)
            return Response({"statusCode": 200, "message": "Successfully joined tournament"})
        elif 'leave' in action:
            if tournament.status != Tournament.StatusChoices.PENDING.value:
                return Response({"statusCode": 400, "message": "Tournament status is not pending"})
            try:
                playerTournament = PlayerTournament.objects.get(playerId=player, tournamentId=tournament)
            except PlayerTournament.DoesNotExist:
                return Response({"statusCode": 400, "message": "Player is not in the tournament"})
            if playerTournament.creator:
                tournament.delete()
                return Response({"statusCode": 200, "message": "Tournament deleted along with player"})
            playerTournament.delete()
            return Response({"statusCode": 200, "message": "Player removed from tournament"})
        elif 'start' in action:
            if not PlayerTournament.objects.filter(playerId=player, tournamentId=tournament, creator=True).exists():
                return Response({"statusCode": 400, "message": "Tournament cannot be started"})
            if current_count != settings.COMPETITORS:
                return Response({"statusCode": 400, "message": "Tournament is not full yet"})
            if tournament.status != Tournament.StatusChoices.PENDING.value:
                return Response({"statusCode": 400, "message": "Tournament is not pending"})
            playersTournaments = PlayerTournament.objects.filter(tournamentId=tournament)
            playersCycle = cycle(playersTournaments)
            for _ in range(0, settings.COMPETITORS - 1, 2):
                player1 = next(playersCycle).playerId
                player2 = next(playersCycle).playerId
                tournamentMatch = Match.objects.create(tournament=tournament, game=Match.Game.PONG.value, round=tournament.round)
                PlayerMatch.objects.create(match_id=tournamentMatch, playerId=player1)
                PlayerMatch.objects.create(match_id=tournamentMatch, playerId=player2)
            tournament.status = Tournament.StatusChoices.PROGRESS.value
            tournament.save()
            return Response({"statusCode": 200, "message": "Tournament started", "tournamentId": tournamentId})
        return Response({"statusCode": 400, "message": "Wrong action"})
