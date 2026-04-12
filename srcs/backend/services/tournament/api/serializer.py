from rest_framework import serializers
from django.db.models import Q
from .models import Player, Tournament, Match, PlayerTournament, PlayerMatch

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ("id", "username", "avatar")

class PlayerMatchSerializer(serializers.ModelSerializer):
    player = serializers.SerializerMethodField()

    class Meta:
        model = PlayerMatch
        fields = ("player", "score")

    def getPlayer(self, playerMatch):
        player = Player.objects.get(id=playerMatch.playerId.id)
        serializer = PlayerSerializer(player)
        return serializer.data

class MatchSerializer(serializers.ModelSerializer):
    players = serializers.SerializerMethodField()
    current = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ("id", "game", "status", "round", "current", "players")

    def getCurrent(self, match):
        player = self.context.get("player")
        if (match.status == Match.Status.PLAYING.value):
            return False
        current = PlayerMatch.objects.filter(matchId=match, playerId=player).exists()
        return current

    def getPlayers(self, match):
        playerMatchs = PlayerMatch.objects.filter(matchId=match)
        serializer = PlayerMatchSerializer(playerMatchs, many=True)
        return serializer.data

class TournamentSerializer(serializers.ModelSerializer):
    matches = serializers.SerializerMethodField();
    creator = serializers.SerializerMethodField();
    playersQuantity = serializers.SerializerMethodField();

    class Meta:
        model = Tournament
        fields = ("id", "name", "status", "round", "matches", "creator", "playersQuantity")

    def getMatches(self, tournament):
        matches = Match.objects.filter(tournament=tournament)
        serializer = MatchSerializer(matches, context={"player": self.context.get("player")}, many=True)
        return serializer.data

    def  getPlayers(self, tournament):
        playerTournaments = PlayerTournament.objects.filter(tournamentId=tournament)
        players = []
        for playerTournament in playerTournaments:
            players.append(Player.objects.get(id=playerTournament.playerId.id))
        serializer = PlayerSerializer(instance=players, many=True)
        return serializer.data

    def getPlayerCount(self, tournament):
        playerTournaments = PlayerTournament.objects.filter(tournamentId=tournament)
        return playerTournaments.count()

    def getCreator(self, tournament):
        player = self.context.get("player")
        return PlayerTournament.objects.filter(tournamentId=tournament, playerId=player, creator=True).exists()

    def playerInTournament(self, player):
        tournament = Tournament.objects.filter(
            Q(playertournament__playerId=player) &
            (Q(status=Tournament.StatusChoices.PENDING.value) |
            Q(status=Tournament.StatusChoices.PROGRESS.value))
        ).first()
        return tournament

    def is_player_in_tournament(self, player):
        return self.playerInTournament(player) is not None

    def get_players_count(self, tournament):
        return self.getPlayerCount(tournament)
