import os
import urllib.parse
from .serializers import PlayerInfoSerializer
from .models import  Friendship, Player, PlayerMatch, PlayerTournament 
from .decorators import jwtCookieRequired
from django.db.models import Q
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

class PlayerInfo(APIView):

    @method_decorator(jwtCookieRequired)
    def get(self, request):
        try:
            username = request.query_params.get('username')
            if username:
                player = Player.objects.filter(username=username)
                if not player.exists():
                    raise Player.DoesNotExist
                serializer = PlayerInfoSerializer(player, many=True)
                return Response({
                    "status": 200,
                    "players": serializer.data,
                    "message": "User found successfully"
                })
            player = Player.objects.get(id=request.decoded_token['id'])
            serializer = PlayerInfoSerializer(player)
            return Response({
                "status": 200,
                "player": serializer.data
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

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        try:
            changed = False
            id = request.decoded_token['id']
            playerData = request.data.get('player')
            player = Player.objects.get(id=id)
            if "username" in playerData:
                username = ' '.join(playerData["username"].split())
                if not username or len(playerData['username']) > 8 :
                    return Response({
                        "status": 400,
                        "message": "Invalid username",
                    })
                player.username = username
                changed = True
            if "first_name" in playerData:
                first_name = ' '.join(playerData['first_name'].split())
                if not first_name or len(first_name) > 20 :
                    return Response({
                        "status": 400,
                        "message": "Invali first name",
                    })
                player.first_name = first_name
                changed = True
            if "last_name" in playerData:
                last_name = ' '.join(playerData['last_name'].split())
                if not last_name or len(last_name) > 20 :
                    return Response({
                        "status": 400,
                        "message": "Invalid last name",
                    })
                player.last_name = last_name
                changed = True
            if "two_factor" in playerData and playerData['two_factor'] is False:
                player.two_factor = playerData['two_factor']
                changed = True
            player.save()
            message = "User updated successfully" if changed else "No changes detected"
            return Response({
                "status": 200,
                "message": message,
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


class PlayerAvatarUpload(APIView):

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        try:
            id = request.decoded_token['id']
            file = request.FILES['avatar']
            filePath = os.path.join(settings.MEDIA_ROOT, file.name)
            default_storage.save(filePath, ContentFile(file.read()))
            fileUrl = urllib.parse.urljoin(settings.PUBLIC_PLAYER_URL, os.path.join(settings.MEDIA_URL, file.name))
            player = Player.objects.get(id=id)
            player.avatar = fileUrl
            player.save()
            return Response({
                "status": 200,
                "message": "Avatar updated successfully",
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
                if receiverId == id:
                    return Response({
                        "status": 400,
                        "message": "You can't send a friend request to yourself",
                    })
                receiver = Player.objects.get(id=receiverId)
                if Friendship.objects.filter(sender=sender, receiver=receiver).exists():
                    return Response({
                        "status": 400,
                        "message": "Friend request already sent",
                    })
                elif Friendship.objects.filter(sender=receiver, receiver=sender).exists():
                    friendships = Friendship.objects.filter(sender=receiver, receiver=sender)
                    friendships.update(status='AC')
                    return Response({
                    "status": 200,
                    "message": "Friend requests accepted successfully"
                    })
                else:
                    friendship = Friendship.objects.create(sender=sender, receiver=receiver, status='PN')
                    friendship.save()
                    return Response({
                        "status": 200,
                        "message": "Friend request sent successfully"
                    })
            except Player.DoesNotExist:
                return Response({
                    "status": 404,
                    "message": "User not found",
                })
            except Friendship.DoesNotExist:
                    return Response({
                        "status": 404,
                        "message": "Friend request not found",
                    })
            except Exception as e:
                    return Response({
                        "status": 500,
                        "message": str(e),
                    })

        @method_decorator(jwtCookieRequired)
        def delete(self, request):
            try:
                senderId = request.decoded_token['id']
                receiverId = request.data.get('target_id')
                sender = Player.objects.get(id=senderId)
                receiver = Player.objects.get(id=receiverId)
                try:
                    friendship = Friendship.objects.get(sender=sender, receiver=receiver)
                except Friendship.DoesNotExist:
                    friendship = Friendship.objects.get(sender=receiver, receiver=sender)
                if friendship:
                    friendship.delete()
                    return Response({
                        "status": 204,
                        "message": 'Friendship deleted successfully'
                    })
                else:
                    return Response({
                        "status": 404,
                        "message": "Friend request not found",
                    })
            except Exception as e:
                return Response({
                    "status": 500,
                    "message": str(e),
                })


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
                        "won": playerMatch.matchFinished,
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