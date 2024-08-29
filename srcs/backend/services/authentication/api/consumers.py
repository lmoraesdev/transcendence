import logging
from pprint import pformat
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Player

logger = logging.getLogger('custom_logger')

listPlayersOnline = {}

@database_sync_to_async
def setPlayerStatus(player, playerStatus):
    player.status = playerStatus
    player.save(update_fields=["status"])

class ConnectionPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.debug(f"connect")
        await self.accept()
        logger.debug(f"self {pformat(self)}")
        logger.debug(f"self scope {pformat(self.scope)}")
        self.id = None
        if self.scope['status'] == 'Valid':
            self.player = self.scope['player']
            self.id = self.player.id
            if self.id not in listPlayersOnline:
                await setPlayerStatus(self.player, Player.Status.ONLINE.value)
                listPlayersOnline[self.id] = 1
            else:
                listPlayersOnline[self.id] += 1
        await self.send(self.scope['status'])

    async def disconnect(self, code):
        if self.id is None:
            return
        if listPlayersOnline[self.id] == 1:
            await setPlayerStatus(self.player, Player.Status.OFFLINE.value)
            del listPlayersOnline[self.id]
        else:
            listPlayersOnline[self.id] -= 1
        
    async def receive(self, text_data):
        pass