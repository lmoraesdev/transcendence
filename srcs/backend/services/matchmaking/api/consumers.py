from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from .models import Match
import uuid

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
        if (len(room["players"]) < capacity and 
                room["capacity"] == capacity and
                room["matchId"] == matchId):
            room["players"].append({playerId: channelName})
            async_to_sync(get_channel_layer().group_add)(room["id"], channelName)
        if (len(room["players"]) == capacity):
            async_to_sync(get_channel_layer().group_send)(room["id"], {
                "type": "chat.message",
                "text": room["id"]
            })
            rooms.remove(rooms)
        return
    return createRoom(matchId, playerId, channelName, capacity)

def findChannelsRoom(playerId, channelName):
    for room in rooms:
        for player in rooms["players"]:
            if (playerId in player):
                if (player[playerId] == channelName):
                    room["player"].remove(player)
                return room
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
        matchId = self.scope['url_route']['kwargs'].get('matchId')
        self.accept()
        if (matchId is not None and matchPlayed(matchId)):
            self.send("Already Played")
            return
        if (findChannelsRoom(self.scope['payload']['id'], self.channel_name)):
            self.send("Already in Game")
            return
        room = getRoom(self.scope['payload']['id'], self.scope['url_route']['kwargs']['capacity'], self.channel_name, matchId)
        if not room:
            return
        async_to_sync(self.channel_layer.group_add)(r['id'], self.channel_name)
    
    def disconnect(self):
        room = findChannelsRoom(self.scope['payload']['id'], self.channel_name)
        if room:
            async_to_sync(self.channel_layer.group_discard)(room['id'], self.channel_name)