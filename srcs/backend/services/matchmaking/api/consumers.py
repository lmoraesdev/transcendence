import json
import logging
from pprint import pformat
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from .models import Match
import uuid

logger = logging.getLogger('custom_logger')

rooms = []

def createRoom(matchId, playerId, channelName, capacity):
    room = {
        "players": [{playerId: channelName}],
        "id": str(uuid.uuid4()),
        "matchId": matchId,
        "capacity": capacity
    }
    rooms.append(room)
    logger.debug("Room created: %s", pformat(room))
    return room

def getRoom(matchId, playerId, channelName, capacity):
    logger.debug("Attempting to get room with parameters: matchId=%s, playerId=%s, channelName=%s, capacity=%s", 
                 matchId, playerId, channelName, capacity)
    logger.debug("Current rooms: %s", pformat(rooms))
    for room in rooms:
        logger.debug("Inspecting room: %s", pformat(room))
        if (len(room["players"]) < capacity and 
            room["capacity"] == capacity and
            room["matchId"] == matchId):
            room["players"].append({playerId: channelName})
            logger.debug("Player added to room: %s", pformat(room))
            async_to_sync(get_channel_layer().group_add)(room["id"], channelName)
            return room
        elif len(room["players"]) == capacity:
            logger.debug("Room is full, sending message and removing room: %s", room["id"])
            async_to_sync(get_channel_layer().group_send)(room["id"], {
                "type": "chat.message",
                "text": room["id"]
            })
            rooms.remove(room)
            logger.debug("Room removed: %s", room["id"])
    new_room = createRoom(matchId, playerId, channelName, capacity)
    logger.debug("New room created and returned: %s", pformat(new_room))
    return new_room

def findChannelsRoom(playerId, channelName):
    logger.debug("Finding channels room for playerId=%s, channelName=%s", playerId, channelName)
    logger.debug("Current rooms: %s", pformat(rooms))
    for room in rooms:
        logger.debug("Inspecting room: %s", pformat(room))
        for player in room["players"]:
            logger.debug("Inspecting player: %s", player)
            if playerId in player and player[playerId] == channelName:
                logger.debug("Player found in room, removing player: %s", player)
                room["players"].remove(player)
                logger.debug("Player removed, returning room: %s", pformat(room))
                return room
    logger.debug("No room found for playerId=%s", playerId)
    return None

def matchPlayed(matchId):
    match = Match.objects.get(id=matchId)
    match_status = match.status == "PL"
    logger.debug("Match %s played status: %s", matchId, match_status)
    return match_status

class Matchmaking(WebsocketConsumer):
    def receive(self, textData):
        logger.debug("Received data: %s", textData)
        
    def chatMessage(self, event):
        logger.debug("Chat message event: %s", pformat(event))
        self.send(text_data=event["text"])

    def connect(self):
        logger.debug("WebSocket connect initiated.")
        logger.debug("Scope details: %s", pformat(self.scope))
        matchId = self.scope['url_route']['kwargs'].get('matchId')
        logger.debug("Match ID from URL: %s", matchId)
        self.accept()

        if matchId is not None and matchPlayed(matchId):
            logger.debug("Match already played, sending message to client.")
            self.send("Already Played")
            return

        if findChannelsRoom(self.scope['payload']['id'], self.channel_name):
            logger.debug("Player already in a game, sending message to client.")
            self.send("Already in Game")
            return

        room = getRoom(matchId, self.scope['payload']['id'], self.channel_name, self.scope['url_route']['kwargs']['capacity'])
        logger.debug("Room obtained: %s", pformat(room))

        if not room:
            logger.debug("No room returned, connection will be terminated.")
            return

        logger.debug("Adding channel to room group.")
        async_to_sync(self.channel_layer.group_add)(room['id'], self.channel_name)
        logger.debug("Connected to room: %s", room['id'])
        self.send(text_data=json.dumps({
            'room_id': room['id']
        }))

    def disconnect(self, closeCode):
        logger.debug("WebSocket disconnect initiated, closeCode: %s", closeCode)
        room = findChannelsRoom(self.scope['payload']['id'], self.channel_name)
        if room:
            logger.debug("Removing channel from room group: %s", room['id'])
            async_to_sync(self.channel_layer.group_discard)(room['id'], self.channel_name)
