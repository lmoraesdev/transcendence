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
    for room in rooms:
        if room["matchId"] == matchId and room["capacity"] == capacity and len(room["players"]) < capacity:
            room["players"].append({playerId: channelName})
            return room
    return createRoom(matchId, playerId, channelName, capacity)


def findChannelsRoom(playerId, channelName):
    for room in rooms:
        for player in room["players"]:
            if playerId in player:
                if player[playerId] == channelName:
                    room["players"].remove(player)
                return room
    return None


def matchPlayed(matchId):
    if not matchId:
        return False
    try:
        match = Match.objects.get(id=matchId)
        return match.status == "PL"
    except Match.DoesNotExist:
        return False

class Matchmaking(WebsocketConsumer):
    def receive(self, textData):
        pass

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
        if matchId is not None and matchPlayed(matchId):
            self.send("Already Played")
            return
        if findChannelsRoom(self.scope['payload']['id'], self.channel_name):
            self.send("Already in Game")
            return

        room = getRoom(
            matchId,
            self.scope['payload']['id'],
            self.channel_name,
            self.scope['url_route']['kwargs']['capacity'],
        )
        if not room:
            return

        async_to_sync(self.channel_layer.group_add)(room['id'], self.channel_name)
        if len(room['players']) == room['capacity']:
            async_to_sync(self.channel_layer.group_send)(room['id'], {
                'type': 'chat.message',
                'text': room['id'],
            })

        self.send(text_data=json.dumps({
            'room_id': room['id']
        }))


    def disconnect(self, closeCode):
        room = findChannelsRoom(self.scope['payload']['id'], self.channel_name)
        if room:
            async_to_sync(self.channel_layer.group_discard)(room['id'], self.channel_name)
