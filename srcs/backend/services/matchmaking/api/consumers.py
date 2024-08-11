import json
import logging
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from .models import Match
import uuid

logger = logging.getLogger('custom_logger')

rooms = []

def createRoom(matchId, playerId, channelName, capacity):
    rooms.append({
        "players": [{
            playerId: channelName
        }],
        "id": str(uuid.uuid4()),
        "matchId": matchId,
        "capacity": capacity
    })
    return rooms[len(rooms) - 1]

def getRoom(matchId, playerId, channelName, capacity):
    # logger.debug("------------getRoom------------")
    # logger.debug("matchId -> %s", matchId)
    # logger.debug("playerId -> %s", playerId)
    # logger.debug("channelName -> %s", channelName)
    # logger.debug("capacity -> %s", capacity)
    # logger.debug("rooms %s", rooms)
    for room in rooms:
        # logger.debug("room -> %s", room)
        if (len(room["players"]) < capacity and 
                room["capacity"] == capacity and
                room["matchId"] == matchId):
            # logger.debug("append")
            room["players"].append({playerId: channelName})
            async_to_sync(get_channel_layer().group_add)(room["id"], channelName)
        elif (len(room["players"]) == capacity):
            # logger.debug("remove")
            async_to_sync(get_channel_layer().group_send)(room["id"], {
                "type": "chat.message",
                "text": room["id"]
            })
            rooms.remove(room)
        # logger.debug("------------------------")
        return room
    # logger.debug("------------------------")
    return createRoom(matchId, playerId, channelName, capacity)

def findChannelsRoom(playerId, channelName):
    # logger.debug("------------findChannelsRoom------------")
    # logger.debug("playerId -> %s", playerId)
    # logger.debug("channelName -> %s", channelName)
    # logger.debug("find rooms -> %s", rooms)
    for room in rooms:
        # logger.debug("  find room -> %s", room)
        # logger.debug("  find room player -> %s", room['players'])
        for player in room["players"]:
            # logger.debug("      find player -> %s", player)
            if (playerId in player):
                # logger.debug("      playerId -> %s", playerId)
                # logger.debug("      player[playerId] -> %s", player[playerId])
                # logger.debug("      %s", player[playerId])
                # logger.debug("      %s", channelName)
                if (player[playerId] == channelName):
                    # logger.debug("removendoooo")
                    room["players"].remove(player)
                # logger.debug("retorando room [%s]", room)
                # logger.debug("------------------------")
                return room
    # logger.debug("vai retornar None")
    # logger.debug("------------------------")
    return None
                

def matchPlayed(matchId):
    match = Match.objects.get(id=matchId)
    if (match.status == "PL"):
        return True
    else:
        return False

class Matchmaking(WebsocketConsumer):
    def receive(self, textData):
        print(textData)
        
    def chatMessage(self, event):
        self.send(text_data=event["text"])


    def connect(self):
        # logger.debug("-------------------------------------------------")
        # logger.debug("Entrou Connect")
        # logger.debug("self scope -> %s", self.scope)
        # logger.debug(self.scope)
        matchId = self.scope['url_route']['kwargs'].get('matchId')
        # logger.debug("id: %s", matchId)
        self.accept()
        if (matchId is not None and matchPlayed(matchId)):
            # logger.debug("Ta jogando")
            self.send("Already Played")
            return
        if (findChannelsRoom(self.scope['payload']['id'], self.channel_name)):
            # logger.debug("Esta na partida")
            self.send("Already in Game")
            return
        room = getRoom(matchId, self.scope['payload']['id'], self.channel_name,self.scope['url_route']['kwargs']['capacity'])
        # logger.debug("room -> %s", room)
        if not room:
            # logger.debug("Not room return")
            return
        # logger.debug("async")
        # logger.debug("self.channel_layer.group_add -> %s", self.channel_layer.group_add)
        # logger.debug("room['id'] -> %s", room['id'])
        # logger.debug("self.channel_name -> %s", self.channel_name)
        async_to_sync(self.channel_layer.group_add)(room['id'], self.channel_name)
        # logger.debug("Connected to room: %s", room['id'])
        self.send(text_data=json.dumps({
            'room_id': room['id']
        }))


    def disconnect(self, closeCode):
        room = findChannelsRoom(self.scope['payload']['id'], self.channel_name)
        if room:
            async_to_sync(self.channel_layer.group_discard)(room['id'], self.channel_name)