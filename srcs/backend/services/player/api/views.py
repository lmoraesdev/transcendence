import os
import urllib.parse
from .serializers import PlayerInfoSerializer
from .models import Friendship, Player, PlayerMatch, PlayerTournament
from .decorators import jwtCookieRequired
from django.db.models import Q
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.decorators import method_decorator
from django.utils.text import get_valid_filename
from rest_framework.response import Response
from rest_framework.views import APIView

class PlayerInfo(APIView):

    @method_decorator(jwtCookieRequired)
    def get(self, request):
        try:
            username = request.query_params.get('username')
            if username is not None:
                username = username.strip()
                if username == "":
                    return Response({"status": 400, "message": "Invalid username filter"})
                players = Player.objects.filter(username__iexact=username)
                if not players.exists():
                    return Response({"status": 404, "message": "User not found"})
                serializer = PlayerInfoSerializer(players, many=True)
                return Response({"status": 200, "players": serializer.data, "message": "Users found successfully"})
            player = Player.objects.get(id=request.decoded_token['id'])
            serializer = PlayerInfoSerializer(player)
            return Response({"status": 200, "player": serializer.data})
        except Player.DoesNotExist:
            return Response({"status": 404, "message": "User not found"})
        except Exception as e:
            return Response({"status": 500, "message": str(e)})

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        try:
            changed = False
            player_id = request.decoded_token['id']
            playerData = request.data.get('player') or {}
            if not isinstance(playerData, dict):
                return Response({"status": 400, "message": "Invalid payload"})
            player = Player.objects.get(id=player_id)
            if "username" in playerData:
                username = ' '.join(str(playerData["username"]).split())
                if not username or len(username) > 20:
                    return Response({"status": 400, "message": "Invalid username"})
                player.username = username
                changed = True
            if "firstName" in playerData:
                firstName = ' '.join(str(playerData['firstName']).split())
                if not firstName or len(firstName) > 20:
                    return Response({"status": 400, "message": "Invalid first name"})
                player.firstName = firstName
                changed = True
            if "lastName" in playerData:
                lastName = ' '.join(str(playerData['lastName']).split())
                if not lastName or len(lastName) > 20:
                    return Response({"status": 400, "message": "Invalid last name"})
                player.lastName = lastName
                changed = True
            if "twoFactor" in playerData and playerData['twoFactor'] is False:
                player.twoFactor = False
                changed = True
            if changed:
                player.save()
            message = "User updated successfully" if changed else "No changes detected"
            return Response({"status": 200, "message": message})
        except Player.DoesNotExist:
            return Response({"status": 404, "message": "User not found"})
        except Exception as e:
            return Response({"status": 500, "message": str(e)})


class PlayerAvatarUpload(APIView):

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        try:
            player_id = request.decoded_token['id']
            if 'avatar' not in request.FILES:
                return Response({"status": 400, "message": "Avatar file is required"})
            file = request.FILES['avatar']
            safe_name = get_valid_filename(file.name)
            saved_path = default_storage.save(f"avatars/{player_id}_{safe_name}", ContentFile(file.read()))
            fileUrl = f"{settings.PUBLIC_PLAYER_URL.rstrip('/')}{settings.MEDIA_URL}{saved_path.lstrip('/')}"
            player = Player.objects.get(id=player_id)
            player.avatar = fileUrl
            player.save()
            return Response({"status": 200, "message": "Avatar updated successfully", "avatar": player.avatar})
        except Player.DoesNotExist:
            return Response({"status": 404, "message": "User not found"})
        except Exception as e:
            return Response({"status": 500, "message": str(e)})


class PlayerFriendship(APIView):

        @method_decorator(jwtCookieRequired)
        def get(self, request):
            id = request.decoded_token['id']
            try:
                getType = request.query_params.get('target')
                if getType == 'invites':
                    friendships = Friendship.objects.filter(receiver=id, status='PN')
                    friendshipData = []
                    for friendship in friendships:
                        friend = friendship.sender
                        friendData = PlayerInfoSerializer(friend).data
                        friendshipData.append(friendData)
                    return Response({
                        "status": 200,
                        "friendships": friendshipData
                    })
                elif getType == 'friends':
                    friendships = Friendship.objects.filter(Q(sender=id) | Q(receiver=id),status="AC")
                    friendshipData = []
                    for friendship in friendships:
                        friend = friendship.sender if friendship.sender.id != id else friendship.receiver
                        friendData = PlayerInfoSerializer(friend).data
                        friendshipData.append(friendData)
                    return Response({
                        "status": 200,
                        "friendships": friendshipData
                    })
                elif getType == 'requests':
                    friendships = Friendship.objects.filter(sender=id, status='PN')
                    friendshipData = []
                    for friendship in friendships:
                        friend = friendship.receiver
                        friendData = PlayerInfoSerializer(friend).data
                        friendshipData.append(friendData)
                    return Response({
                        "status": 200,
                        "friendships": friendshipData
                    })
                else:
                    return Response({
                        "status": 400,
                        "message": "Invalid request",
                    })
            except Exception as e:
                return Response({
                    "status": 500,
                    "message": str(e),
                })

        @method_decorator(jwtCookieRequired)
        def post(self, request):
            id = request.decoded_token['id']
            try:
                sender = Player.objects.get(id=id)
                receiverId = request.data.get('target_id')
                if not receiverId:
                    return Response({"status": 400, "message": "target_id is required"})
                if receiverId == id:
                    return Response({"status": 400, "message": "You can't send a friend request to yourself"})
                receiver = Player.objects.get(id=receiverId)
                if Friendship.objects.filter(sender=sender, receiver=receiver).exists():
                    return Response({"status": 400, "message": "Friend request already sent"})
                if Friendship.objects.filter(sender=receiver, receiver=sender).exists():
                    friendships = Friendship.objects.filter(sender=receiver, receiver=sender)
                    friendships.update(status='AC')
                    return Response({"status": 200, "message": "Friend request accepted successfully"})
                Friendship.objects.create(sender=sender, receiver=receiver, status='PN')
                return Response({"status": 200, "message": "Friend request sent successfully"})
            except Player.DoesNotExist:
                return Response({"status": 404, "message": "User not found"})
            except Exception as e:
                return Response({"status": 500, "message": str(e)})

        @method_decorator(jwtCookieRequired)
        def delete(self, request):
            try:
                senderId = request.decoded_token['id']
                receiverId = request.data.get('target_id')
                if not receiverId:
                    return Response({"status": 400, "message": "target_id is required"})
                sender = Player.objects.get(id=senderId)
                receiver = Player.objects.get(id=receiverId)
                try:
                    friendship = Friendship.objects.get(sender=sender, receiver=receiver)
                except Friendship.DoesNotExist:
                    friendship = Friendship.objects.get(sender=receiver, receiver=sender)
                friendship.delete()
                return Response({"status": 204, "message": 'Friendship deleted successfully'})
            except Player.DoesNotExist:
                return Response({"status": 404, "message": "User not found"})
            except Friendship.DoesNotExist:
                return Response({"status": 404, "message": "Friend request not found"})
            except Exception as e:
                return Response({"status": 500, "message": str(e)})


class MatchesHistory(APIView):

    @method_decorator(jwtCookieRequired)
    def get(self, request):
        try:
            player = Player.objects.get(id=request.decoded_token['id'])
            matches = PlayerMatch.objects.filter(playerId=player.id, matchId__status="PL").order_by('-matchId__status')[:8]
            matchesData = []
            for match in matches:
                matchPlayers = []
                for playerMatch in match.matchId.playermatch_set.all():
                    matchPlayers.append({
                        "id": playerMatch.playerId.id,
                        "username": playerMatch.playerId.username,
                        "avatar": playerMatch.playerId.avatar,
                        "score": playerMatch.score,
                        "won": playerMatch.winner,
                    })
                matchesData.append({
                    "id": match.matchId.id,
                    "game": match.matchId.game,
                    "players": matchPlayers,
                })
            return Response({
                "status": 200,
                "matches": matchesData
            })
        except Player.DoesNotExist:
            return Response({
                "status": 404,
                "message": "User not found",
            })
        except Exception as e:
            return Response({
                "status": 500,
                "message": str(e),
            })
