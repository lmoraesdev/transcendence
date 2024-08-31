import logging
from pprint import pformat
from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from itertools import cycle
from .models import Tournament, Player, Match, PlayerMatch, PlayerTournament
from .serializer import TournamentSerializer
from .decorators import jwtCookieRequired

logger = logging.getLogger('custom_logger')

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
        playerId = request.decoded_token.get('id')
        logger.info(f"Fetching tournament data for playerId: {playerId}")
        
        serializer = TournamentSerializer()
        
        try:
            player = Player.objects.get(id=playerId)
            logger.info(f"Player found: {player}")
        except Player.DoesNotExist:
            logger.error(f"Player with ID {playerId} does not exist")
            return Response({"statusCode": 404, "message": "Player not found"})

        if serializer.playerInTournament(player):
            try:
                tournament = serializer.playerInTournament(player)
                logger.info(f"Tournament found for player: {tournament}")
                
                serializer = TournamentSerializer(
                    tournament,
                    context={"player": player}
                )
                
                if tournament.status == Tournament.StatusChoices.PENDING.value:
                    logger.info(f"Tournament {tournament.id} is pending")
                    return Response({
                        "statusCode": 200,
                        "currentTournament": serializer.data,
                        "players": serializer.getPlayers(tournament)
                    })
                
                # Assume updateTournament is a function that updates tournament status
                updateTournament(tournament.id)
                logger.info(f"Tournament {tournament.id} status updated")
                return Response({"statusCode": 200, "currentTournament": serializer.data})
            
            except Tournament.DoesNotExist:
                logger.error(f"Tournament not found for player {playerId}")
                return Response({"statusCode": 404, "message": "Tournament not found"})

        tournaments = Tournament.objects.filter(status="PD")
        logger.debug(f"torneios pendende {pformat(tournaments)}")
        tournamentPlayerFinished = PlayerTournament.objects.filter(playerId=player).order_by("-id").first()
        logger.debug(f"tournamentPlayerFinished {pformat(tournamentPlayerFinished)}")
        responseData = {}
        
        if tournamentPlayerFinished:
            tournamentFinished = Tournament.objects.filter(id=tournamentPlayerFinished.tournamentId.id).first()
            if tournamentFinished:
                serializerFinished = TournamentSerializer(tournamentFinished)
                responseData["currentTournament"] = serializerFinished.data
                logger.info(f"Current finished tournament: {tournamentFinished}")
            else:
                logger.warning(f"Finished tournament with ID {tournamentPlayerFinished.tournamentId.id} not found")

        if not tournaments:
            logger.info("No tournaments available")
            responseData.update({"statusCode": 405, "message": "No Tournament are available"})
            return Response(responseData)
        
        serializerAll = TournamentSerializer(tournaments, many=True)
        responseData.update({"statusCode": 200, "tournaments": serializerAll.data})
        logger.info(f"Available tournaments: {serializerAll.data}")
        return Response(responseData)

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        logger.debug(f"request {pformat(request.data)}")
        action = request.data.get('action')
        tournamentId = request.data.get('tournamentId')
        name = request.data.get('name')
        playerId = request.decoded_token.get('id')
        
        logger.info(f"Received request with action={action}, tournamentId={tournamentId}, name={name}, playerId={playerId}")
        
        try:
            player = Player.objects.get(id=playerId)
            logger.info(f"Player {playerId} found")
        except Player.DoesNotExist:
            logger.error(f"Player {playerId} does not exist")
            return Response({"statusCode": 402, "message": "Player does not exist"})
        
        if "create" in action:
            if name is None or len(name) == 0:
                logger.error("Invalid Tournament name provided")
                return Response({"statusCode": 403, "message": "Invalid Tournament name"})
            
            serializer = TournamentSerializer()
            if serializer.playerInTournament(player):
                logger.warning(f"Player {playerId} already in a Tournament")
                return Response({"statusCode": 400, "message": "Already in a Tournament"})
            
            tournament = Tournament.objects.create(name=name)
            PlayerTournament.objects.create(
                playerId=player,
                tournamentId=tournament,
                creator=True
            )
            serializer = TournamentSerializer(tournament)
            player.save()
            logger.info(f"Tournament {tournament.id} created and player {playerId} added as creator")
            return Response({"statusCode": 200, "currentTournament": serializer.getPlayers(tournament)}, status=201)
        
        try:
            tournament = Tournament.objects.get(id=tournamentId)
            serializer = TournamentSerializer(tournament)
            logger.info(f"Tournament {tournamentId} found")
        except Tournament.DoesNotExist:
            logger.error(f"Tournament {tournamentId} does not exist")
            return Response({"statusCode": 402, "message": "Missing Tournament id"})
        
        if "join" in action:
            logger.debug("entoru no join")
            if tournamentId is None:
                logger.error("Missing Tournament id")
                return Response({"statusCode": 400, "message": "Missing Tournament id"})
            logger.debug(f"tournament {pformat(tournament)}")
            # logger.debug(f"{serializer.getPlayerCount} < {settings.COMPETITORS}")
            if tournament.status == "PD" and serializer.getPlayerCount(tournament) < settings.COMPETITORS:
                if serializer.playerInTournament(player):
                    logger.warning(f"Player {playerId} already in Tournament {tournamentId}")
                    return Response({"statusCode": 400, "message": "Already in a Tournament"})
                
                PlayerTournament.objects.create(playerId=player, tournamentId=tournament)
                logger.info(f"Player {playerId} joined Tournament {tournamentId}")
                return Response({"statusCode": 200, "message": "Successfully joined tournament"})
            
            logger.warning(f"Tournament {tournamentId} is full")
            return Response({"statusCode": 400, "message": "Tournament is full"})
        
        elif "leave" in action:
            if tournament.status != Tournament.StatusChoices.PENDING.value:
                logger.error(f"Tournament {tournamentId} status is not pending")
                return Response({"statusCode": 400, "message": "Tournament status is not pending"})
            
            try:
                playerTournament = PlayerTournament.objects.get(playerId=player, tournamentId=tournament)
                logger.info(f"Player {playerId} found in Tournament {tournamentId}")
            except PlayerTournament.DoesNotExist:
                logger.error(f"Player {playerId} not found in Tournament {tournamentId}")
                return Response({"statusCode": 400, "message": "Player is not in the Tournament"})
            
            if playerTournament.creator:
                tournament.delete()
                logger.info(f"Tournament {tournamentId} deleted along with player {playerId}")
                return Response({"statusCode": 200, "message": "Tournament deleted along with player"})
            else:
                playerTournament.delete()
                logger.info(f"Player {playerId} removed from Tournament {tournamentId}")
                return Response({"statusCode": 200, "message": "Player removed from Tournament"})
        
        elif "start" in action:
            logger.debug("entoru no start")
            if not PlayerTournament.objects.filter(playerId=player, tournamentId=tournament, creator=True).exists():
                logger.error(f"Player {playerId} cannot start Tournament {tournamentId}")
                return Response({"statusCode": 400, "message": "Tournament cannot be started"})
            logger.debug("passou o 1 if")
            if serializer.getPlayerCount(tournament) != settings.COMPETITORS:
                logger.error(f"Tournament {tournamentId} not full yet")
                return Response({"statusCode": 400, "message": "Tournament not full yet"})
            logger.debug("passou o 2 if")
            if tournament.status == Tournament.StatusChoices.PENDING.value:
                playersTournaments = PlayerTournament.objects.filter(tournamentId=tournament)
                playersCycle = cycle(playersTournaments)
                logger.debug("dentro do 3 if")
                
                for _ in range(0, settings.COMPETITORS - 1, 2):
                    try:
                        logger.debug("inicio do loop");
                        player1 = next(playersCycle).playerId
                        logger.debug(f"player1 {player1}")
                        player2 = next(playersCycle).playerId
                        logger.debug(f"player2 {player2}")
                        tournamentMatch = Match.objects.create(
                            tournament=tournament,
                            game=Match.Game.PONG.value,
                            round=tournament.round
                        )
                        logger.debug(f"tournamentMatch = {tournamentMatch}")
                        pm1 = PlayerTournament.objects.create(
                            matchId=tournamentMatch,
                            playerId=player1
                        )
                        logger.debug(f"PlayerMatch1 = {pm1}")
                        pm2 = PlayerMatch.objects.create(
                            matchId=tournamentMatch,
                            playerId=player2
                        )
                        logger.debug(f"PlayerMatch2 = {pm2}")
                    except Exception as e:
                        logger.debug(f"erro: {pformat(e)}")

                tournament.status = Tournament.StatusChoices.PROGRESS.value
                tournament.save()
                logger.info(f"Tournament {tournamentId} started")
                return Response({"statusCode": 200, "message": "Tournament started", "tournamentId": tournamentId})
            
            logger.error(f"Tournament {tournamentId} is not pending")
            return Response({"statusCode": 400, "message": "Tournament is not pending"})
        
        logger.error(f"Wrong action provided: {action}")
        return Response({"statusCode": 400, "message": "Wrong Action"})