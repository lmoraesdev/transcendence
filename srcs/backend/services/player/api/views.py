import os
import logging
import urllib.parse
from pprint import pformat
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

logger = logging.getLogger('custom_logger')

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

            logger.info(f"Received request to update player with ID: {id}")
            logger.debug(f"player data {pformat(playerData)}")
            player = Player.objects.get(id=id)
            logger.info(f"Found player: {player}")

            if "username" in playerData:
                username = ' '.join(playerData["username"].split())
                logger.debug(f"Username provided: {username}")

                if not username or len(playerData['username']) > 8:
                    logger.warning(f"Invalid username: {username}")
                    return Response({
                        "status": 400,
                        "message": "Invalid username",
                    })

                player.username = username
                changed = True

            if "first_name" in playerData:
                firstName = ' '.join(playerData['first_name'].split())
                logger.debug(f"First name provided: {firstName}")

                if not firstName or len(firstName) > 20:
                    logger.warning(f"Invalid first name: {firstName}")
                    return Response({
                        "status": 400,
                        "message": "Invalid first name",
                    })

                player.firstName = firstName
                changed = True

            if "last_name" in playerData:
                lastName = ' '.join(playerData['last_name'].split())
                logger.debug(f"Last name provided: {lastName}")

                if not lastName or len(lastName) > 20:
                    logger.warning(f"Invalid last name: {lastName}")
                    return Response({
                        "status": 400,
                        "message": "Invalid last name",
                    })

                player.lastName = lastName
                changed = True

            if "two_factor" in playerData and playerData['two_factor'] is False:
                logger.debug(f"Two-factor authentication setting: {playerData['two_factor']}")
                player.twoFactor = playerData['two_factor']
                changed = True

            player.save()
            logger.info(f"Player updated successfully with ID: {id}")
            message = "User updated successfully" if changed else "No changes detected"

            return Response({
                "status": 200,
                "message": message,
            })

        except Player.DoesNotExist:
            logger.error(f"Player with ID: {id} not found")
            return Response({
                "status": 404,
                "message": "User not found",
            })

        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({
                "status": 500,
                "message": str(e),
            })


class PlayerAvatarUpload(APIView):

    @method_decorator(jwtCookieRequired)
    def post(self, request):
        try:
            logger.debug(f"request: {pformat(request)}")
            logger.debug(f"BASE_DIR: {settings.BASE_DIR}\nPLAYER_DIR: {settings.PLAYER_DIR}\nSERVICES_DIR: {settings.SERVICES_DIR}\nSTATIC_URL: {settings.STATIC_URL}\nSTATIC_ROOT: {settings.STATIC_ROOT}\nMEDIA_URL: {settings.MEDIA_URL}\nMEDIA_ROOT: {settings.MEDIA_ROOT}\n")
            id = request.decoded_token['id']
            file = request.FILES['avatar']
            filePath = os.path.join(settings.MEDIA_ROOT, file.name)
            logger.debug(f"file path |{filePath}|")
            path = default_storage.save(filePath, ContentFile(file.read()))

            if default_storage.exists(file.name):
                logger.debug("File exists")
                print("File exists")

            else:
                logger.debug("File does not exist")
                print("File does not exist")

            logger.debug(f"path salva |{path}|")
            logger.debug(f"Public player api = {settings.PUBLIC_PLAYER_URL}\nMedia URL {settings.MEDIA_URL} | Media Root {settings.MEDIA_ROOT}\nfile {file.name}")
            fileUrl = urllib.parse.urljoin(settings.PUBLIC_PLAYER_URL, os.path.join(settings.MEDIA_URL, file.name))
            logger.debug(f"file url {fileUrl}")
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
        
class ListAllUser(APIView):

    @method_decorator(jwtCookieRequired)
    def get(self, request):
        try:
            username = request.query_params.get('username')
            if username:
                username = ' '.join(username.split())  # Tratamento para username com espaços
                listPlayer = Player.objects.exclude(username__iexact=username)
            else:
                listPlayer = Player.objects.all()
            
            serializer = PlayerInfoSerializer(listPlayer, many=True)
            return Response(serializer.data)

        except Player.DoesNotExist:
            return Response({
                "status": 404,
                "message": "User not found",
            }, status=404)
        except Exception as e:
            return Response({
                "status": 500,
                "message": str(e),
            }, status=500)
