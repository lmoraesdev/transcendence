import json
from channels.generic.websocket import AsyncWebsocketConsumer

class User(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    # adicionar logina com o close_code (codigo)
    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))
