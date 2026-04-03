from channels.generic.websocket import AsyncWebsocketConsumer
import json

class EchoConsumer(AsyncWebsocketConsumer):
    async def connect(self):

        await self.accept()

    async def receive(self, text_data):

        message = text_data

        await self.send(text_data=message)

    async def disconnect(self, close_code):

        print("WebSocket disconnected with code", close_code)