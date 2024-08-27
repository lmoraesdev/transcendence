import os
import logging
import urllib.parse
from pprint import pformat
from .serializers import PlayerInfoSerializer, PlayerSettingsInfoSerializer
from .models import  Friendship, Player, PlayerMatch, PlayerSettings
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

            logger.debug("pega a settings")
            playerSettings = PlayerSettings.objects.get(playerId=player)
            logger.debug(f"Settings = {pformat(playerSettings)}")
            serializerSettings = PlayerSettingsInfoSerializer(playerSettings)
            return Response({
                "status": 200,
                "player": serializer.data,
                "playerSettings": serializerSettings.data
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
            changedSettings = False
            message = "No changes detected"

            id = request.decoded_token['id']
            playerData = request.data.get('player')
            playerSettingsData = request.data.get('playerSettings')

            logger.info(f"Received request to update player with ID: {id}")
            logger.debug(f"player data {pformat(playerData)}")

            if (playerData is not None):
                player = Player.objects.get(id=id)
                logger.info(f"Found player: {player}")
                if (player is not None):
                    if ("username" in playerData):
                        username = ' '.join(playerData["username"].split())
                        logger.debug(f"Username provided: {username}")

                        if (not username or len(playerData['username']) > Player.username.max_length):
                            logger.warning(f"Invalid username: {username}")
                            return Response({
                                "status": 400,
                                "message": "Invalid username",
                            })

                        player.username = username
                        changed = True

                    if ("first_name" in playerData):
                        firstName = ' '.join(playerData['first_name'].split())
                        logger.debug(f"First name provided: {firstName}")

                        if (not firstName or len(firstName) > Player.firstName.max_length):
                            logger.warning(f"Invalid first name: {firstName}")
                            return Response({
                                "status": 400,
                                "message": "Invalid first name",
                            })

                        player.firstName = firstName
                        changed = True

                    if ("last_name" in playerData):
                        lastName = ' '.join(playerData['last_name'].split())
                        logger.debug(f"Last name provided: {lastName}")

                        if (not lastName or len(lastName) > Player.lastName.max_length):
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

                    if (changed == True):
                        player.save()
                        logger.info(f"Player updated successfully with ID: {id}")
            if (playerSettingsData is not None):
                playerSettings = PlayerSettings.objects.get(playerId=Player.objects.get(id=id))
                logger.info(f"Found settings: {playerSettings}")
                if (playerSettings is not None):
                    if "screenReader" in playerSettingsData:
                        logger.debug(f"Screen reader setting: {playerSettingsData['screenReader']}")
                        playerSettings.screenReader = playerSettingsData['screenReader']
                        changedSettings = True

                    if "highContrast" in playerSettingsData:
                        logger.debug(f"High contrast setting: {playerSettingsData['highContrast']}")
                        playerSettings.highContrast = playerSettingsData['highContrast']
                        changedSettings = True

                    if "textSize" in playerSettingsData:
                        textSize = playerSettingsData['textSize']
                        logger.debug(f"Text size provided: {textSize}")

                        if textSize not in [choice[0] for choice in PlayerSettings.TEXT_SIZE_CHOICE]:
                            logger.warning(f"Invalid text size: {textSize}")
                            return Response({
                                "status": 400,
                                "message": "Invalid text size",
                            })

                        playerSettings.textSize = textSize
                        changedSettings = True

                    if "colorBlind" in playerSettingsData:
                        colorBlind = playerSettingsData['colorBlind']
                        logger.debug(f"Color blind setting provided: {colorBlind}")

                        if colorBlind not in [choice[0] for choice in PlayerSettings.COLOR_BLIND_CHOICE]:
                            logger.warning(f"Invalid color blind setting: {colorBlind}")
                            return Response({
                                "status": 400,
                                "message": "Invalid color blind setting",
                            })

                        playerSettings.colorBlind = colorBlind
                        changedSettings = True

                    if "language" in playerSettingsData:
                        language = playerSettingsData['language']
                        logger.debug(f"Language provided: {language}")

                        if language not in [choice[0] for choice in PlayerSettings.LANGUAGE_CHOICE]:
                            logger.warning(f"Invalid language: {language}")
                            return Response({
                                "status": 400,
                                "message": "Invalid language",
                            })

                        playerSettings.language = language
                        changedSettings = True

                    if "iaLevel" in playerSettingsData:
                        iaLevel = playerSettingsData['iaLevel']
                        logger.debug(f"IA level provided: {iaLevel}")

                        if iaLevel not in [choice[0] for choice in PlayerSettings.IA_LEVE_CHOICE]:
                            logger.warning(f"Invalid IA level: {iaLevel}")
                            return Response({
                                "status": 400,
                                "message": "Invalid IA level",
                            })

                        playerSettings.iaLevel = iaLevel
                        changedSettings = True

                    if (changedSettings == True):
                        playerSettings.save()
                        logger.info(f"Player settings updated successfully for player ID: {id}")

            if (changed == True or changedSettings == True):
                if (changed == True and changedSettings == True):
                    message = "User updated successfully and or Settings"
                elif (changed == True):
                    message = "User updated successfully"
                elif (changedSettings == True):
                    message = "User Settings updated successfully"

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
        except PlayerSettings.DoesNotExist:
            logger.error(f"Player Settings not found")
            return Response({
                "status": 405,
                "message": "User Settings not found",
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


# class MatchesSoloHistory(APIView):
#     @method_decorator(jwtCookieRequired)
#     def get(self, request):


#     @method_decorator(jwtCookieRequired)
#     def post(self, request):
        

class ListAllUser(APIView):

    @method_decorator(jwtCookieRequired)
    def get(self, request):
        try:
            username = request.query_params.get('username')
            if username:
                username = ' '.join(username.split())
                playerExclude = Player.objects.filter(username=username)
                if not playerExclude.exists():
                    raise Player.DoesNotExist
                listPlayer = Player.objects.exclude(id=playerExclude.first().id)
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