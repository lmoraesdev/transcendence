import logging
from pprint import pformat
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
import asyncio, random, json
from .models import PlayerMatch, Match, Player

logger = logging.getLogger('custom_logger')

# Define initial states for paddles
PADDLE_INITIAL_STATE = {
    'speed': 30,
    'positionX': 0,
    'positionY': 0,
    'sizeX': 40,
    'sizeY': 200,
    'eliminated': False,
    'score': 0
}

padd_left = PADDLE_INITIAL_STATE.copy()
padd_right = PADDLE_INITIAL_STATE.copy()
padd_up = PADDLE_INITIAL_STATE.copy()
padd_down = PADDLE_INITIAL_STATE.copy()

padd_up['sizeX'] = padd_down['sizeX'] = 200
padd_up['sizeY'] = padd_down['sizeY'] = 40

rooms = {}

def eliminate_player(padd, room_id):
    logger.debug(f"eliminate_player called with padd: {padd}, room_id: {room_id}")
    if padd['info']['eliminated']:
        return False
    padd['info']['eliminated'] = True
    rooms[room_id]['elimination_count'] += 1
    return True

def getAllRooms():
    """Retorna todas as salas ativas."""
    active_rooms = []
    for room_id, room_info in rooms.items():
        active_rooms.append({
            'room_id': room_id,
            'players': [
                {
                    'username': room_info['padd_left']['username'],
                    'avatar': room_info['padd_left']['avatar'],
                    'eliminated': room_info['padd_left']['info']['eliminated'],
                } if 'padd_left' in room_info else None,
                {
                    'username': room_info['padd_right']['username'],
                    'avatar': room_info['padd_right']['avatar'],
                    'eliminated': room_info['padd_right']['info']['eliminated'],
                } if 'padd_right' in room_info else None,
                {
                    'username': room_info['padd_up']['username'],
                    'avatar': room_info['padd_up']['avatar'],
                    'eliminated': room_info['padd_up']['info']['eliminated'],
                } if 'padd_up' in room_info else None,
                {
                    'username': room_info['padd_down']['username'],
                    'avatar': room_info['padd_down']['avatar'],
                    'eliminated': room_info['padd_down']['info']['eliminated'],
                } if 'padd_down' in room_info else None,
            ],
            'ball_position': {
                'positionX': room_info['ball']['positionX'],
                'positionY': room_info['ball']['positionY']
            } if 'ball' in room_info else None
        })
    return active_rooms

@database_sync_to_async
def walk_over(room_id, match_id, pos, capacity):
    logger.debug(f"walk_over called with room_id: {room_id}, match_id: {match_id}, pos: {pos}, capacity: {capacity}")
    try:
        if capacity == 2:
            return walk_over_two(room_id, match_id, pos)
    except Exception as e:
        logger.error(f"Error in walk_over: {e}")
        print(e, flush=True)

def walk_over_two(room_id, match_id, pos):
    logger.debug(f"walk_over_two called with room_id: {room_id}, match_id: {match_id}, pos: {pos}")
    player_left = rooms[room_id]['padd_left']
    player_right = rooms[room_id]['padd_right']
    player_left_db = Player.objects.get(id=player_left['user_id'])
    player_right_db = Player.objects.get(id=player_right['user_id'])
    match = get_match(match_id)
    winner, loser = (player_left_db, player_right_db) if pos == 'right' else (player_right_db, player_left_db)

    winner_match, _ = PlayerMatch.objects.get_or_create(matchId=match, playerId=winner)
    loser_match, _ = PlayerMatch.objects.get_or_create(matchId=match, playerId=loser)

    winner_match.score, winner_match.winner = 2, True
    loser_match.score, loser_match.winner = 0, False

    winner_match.save()
    loser_match.save()

    return f"{winner.username} you win"

def get_match(match_id):
    logger.debug(f"get_match called with match_id: {match_id}")
    match = Match.objects.create(game='PG', status=Match.Status.PLAYING.value) if not match_id else Match.objects.get(id=match_id)
    match.status = Match.Status.PLAYING.value
    match.save()
    return match

@database_sync_to_async
def set_db_two_player(room_id, match_id):
    logger.debug(f"set_db_two_player called with room_id: {room_id}, match_id: {match_id}")
    try:
        player_left = rooms[room_id]['padd_left']
        player_right = rooms[room_id]['padd_right']

        logger.debug(f"playerLeft {pformat(player_left)}\nplayerRight {pformat(player_right)}")
        match = get_match(match_id)
        logger.debug(f"match {match}")
        player_left_db = Player.objects.get(id=player_left['user_id'])
        player_right_db = Player.objects.get(id=player_right['user_id'])

        player_match_left, _ = PlayerMatch.objects.get_or_create(matchId=match, playerId=player_left_db)
        player_match_right, _ = PlayerMatch.objects.get_or_create(matchId=match, playerId=player_right_db)

        player_match_left.score = player_left['info']['score']
        player_match_right.score = player_right['info']['score']

        player_match_left.winner = player_left['info']['score'] == 7
        player_match_right.winner = player_right['info']['score'] == 7

        player_match_left.save()
        player_match_right.save()

        if player_left['info']['score'] == 7:
            player_left_db.victory += 1
            player_right_db.defeat += 1
        else:
            player_left_db.defeat += 1
            player_right_db.victory += 1

        player_left_db.save()
        player_right_db.save()

        winner = player_left_db if player_left['info']['score'] == 7 else player_right_db
        return f"{winner.username} winner"
    except Exception as e:
        logger.error(f"Error in set_db_two_player: {e}")
        print(e, flush=True)

def ballDirection(capacity):
    speed = {
        'X': 0,
        'Y': 0
    }
    speedX, speedY = (
        (random.choice([10, -10]), random.choice([0, -10, 10])) 
        if capacity != 2 
        else (
            (random.choice([0, -5, 5]), random.choice([0, -6, 6])) 
            if (random.choice([0, -5, 5]) == 0 and random.choice([0, -6, 6]) == 0) 
            else (random.choice([0, -5, 5]), random.choice([0, -6, 6]))
        )
    )
    speed['X'] = speedX
    speed['Y'] = speedY
    return speed

def addSpeedBall(room_id):
    rooms[room_id]['ball']['positionX'] += rooms[room_id]['ball']['speedX']
    rooms[room_id]['ball']['positionY'] += rooms[room_id]['ball']['speedY']


class Pong(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        room_id = self.getRoomId()

        self.capacity = int(self.scope['url_route']['kwargs']['capacity'])
        self.match_id = self.scope['url_route']['kwargs'].get('match_id')
        player_db = await database_sync_to_async(Player.objects.get)(id=self.scope['payload']['id'])
   
        await self.channel_layer.group_add(room_id, self.channel_name)

        if room_id not in rooms:
            rooms[room_id] = {
                    'padd_left': {
                    'player': self.channel_name,
                    'user_id': self.scope['payload']['id'],
                    'info': padd_left.copy(),
                    'username': player_db.username,
                    'avatar': player_db.avatar
                },
            }
            await self.send(text_data=json.dumps({'inLobby': '1'}))
        else:
            paddle_positions = ['padd_right', 'padd_up', 'padd_down']
            for index, pos in enumerate(paddle_positions[:self.capacity - 1], start=2):
                if (rooms[room_id].get(pos) is None):
                    rooms[room_id][pos] = {
                        'player': self.channel_name,
                        'user_id': self.scope['payload']['id'],
                        'info': globals()[f'padd_{pos.split("_")[1]}'].copy(),
                        'username': player_db.username,
                        'avatar': player_db.avatar
                    }
                    await self.send(text_data=json.dumps({'inLobby': str(index)}))
                    break
            if (len(rooms[room_id]) == self.capacity):
                await self.gameStart(room_id)


    async def gameStart(self, room_id):
        self.prepareGame(room_id)
        logger.debug("chamada gameStart")
        addSpeedBall(room_id)
        await self.channel_layer.group_send(
            room_id,
            {
                'type': 'pong.message',
                'message': 'ball',
            }
        )
        if (room_id in rooms):
            asyncio.create_task(self.gameLoop(room_id))

    def prepareGame(self, room_id):
        rooms[room_id]['canvas_width'] = 1920 
        rooms[room_id]['canvas_height'] = 1080

        rooms[room_id]['padd_left']['info']['positionX'] = 60
        rooms[room_id]['padd_left']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100
        
        rooms[room_id]['padd_right']['info']['positionX'] = rooms[room_id]['canvas_width'] - 100
        rooms[room_id]['padd_right']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100

        valueSpeed = ballDirection(self.capacity)
        speed = {
            'speedX': valueSpeed["X"],
            'speedY': valueSpeed["Y"],
            'positionX': rooms[room_id]['canvas_width'] / 2,
            'positionY': rooms[room_id]['canvas_height'] / 2,
            'size': 20
        }
        rooms[room_id]['ball'] = speed

    async def gameLoop(self, room_id):
        logger.debug("start gameLoop")
        await asyncio.sleep(2)
        logger.debug("start looping")
        while True:
            addSpeedBall(room_id)
            try:
                await self.ballCollision(room_id)
                if (room_id not in rooms):
                    logger.debug(f"Closed Game {room_id} now")
                    print(f"Closed Game {room_id} now")
                    break
                await self.paddleCollision(room_id)
                await self.BallPaddleCollision(room_id)
                await self.channel_layer.group_send(
                    room_id,
                    {
                        'type': 'pong.message',
                        'message': 'ball',
                    }
                )
                rooms[room_id]['ball']['speedX'] += 0.01 if rooms[room_id]['ball']['speedX'] > 0 else -0.01
                rooms[room_id]['ball']['speedY'] += 0.01 if rooms[room_id]['ball']['speedY'] > 0 else -0.01
            except Exception as e:
                logger.debug(f"deu exception: {e}")
                print(e, flush=True)
            await asyncio.sleep(0.015)

    def getPaddCenter(self, room_id, side):
        padd_info = rooms[room_id][f'padd_{side[:-1]}']['info']
        size_x, size_y = padd_info['sizeX'], padd_info['sizeY']
        position = padd_info[f'position{side[-1]}'] 
        center_offset = size_x / 2 if side[-1] == 'X' else size_y / 2

        return position + center_offset


    async def BallPaddleCollision(self, room_id):
        ball = rooms[room_id]['ball']
        ball_size = ball['size']
        paddles = {
            'left': ('leftX', 'leftY', 'positionX', 'positionY', 'padd_left', 'speedX'),
            'right': ('rightX', 'rightY', 'positionX', 'positionY', 'padd_right', 'speedX')
        }

        for paddle, (cx, cy, px, py, pkey, speed_key) in paddles.items():
            size = rooms[room_id][pkey]['info']['sizeX'] if 'up' in pkey or 'down' in pkey else rooms[room_id][pkey]['info']['sizeY']
            center_x = self.getPaddCenter(room_id, cx)
            center_y = self.getPaddCenter(room_id, cy)
            dx = abs(ball['positionX'] - center_x)
            dy = abs(ball['positionY'] - center_y)
            if not rooms[room_id][pkey]['info']['eliminated'] and (dx <= ball_size + size / 2 and dy <= ball_size + size / 2):
                if (ball['positionX'] >= center_x and ball[speed_key] > 0) or (ball['positionX'] <= center_x and ball[speed_key] < 0):
                    return
                ball[speed_key] *= -1        


    async def paddleCollision(self, room_id):
        paddles = ['padd_right', 'padd_left']
        for paddle in paddles:
            if not rooms[room_id][paddle]['info']['eliminated']:
                size = rooms[room_id][paddle]['info']['sizeY']
                pos = rooms[room_id][paddle]['info']['positionY']
                canvas_height = rooms[room_id]['canvas_height']
                rooms[room_id][paddle]['info']['positionY'] = max(0, min(pos, canvas_height - size)) 

    async def ballCollision(self, room_id):
        ballPositionX = rooms[room_id]['ball']['positionX']
        ballPositionY = rooms[room_id]['ball']['positionY']
        ballSize = rooms[room_id]['ball']['size']
        canvasWidth = rooms[room_id]['canvas_width']
        canvasHeight = rooms[room_id]['canvas_height']

        if (ballPositionX + ballSize >= canvasWidth 
            or ballPositionX - ballSize <= 0):
            if (rooms[room_id]['padd_right']['info']['eliminated'] 
                or rooms[room_id]['padd_left']['info']['eliminated']):
                rooms[room_id]['ball']['speedX'] *= -1
            else:
                await self.resetGame(room_id, True)
        if (ballPositionY + ballSize >= canvasHeight 
            or ballPositionY - ballSize <= 0):
            rooms[room_id]['ball']['speedY'] *= -1

    async def resetGame(self, room_id, eliminated):
        logger.debug(f"entrou na 'resetGame' eliminated = {eliminated}")
        speed = ballDirection(self.capacity)
        logger.debug(f"salas: {pformat(rooms[room_id])}")
        if (eliminated):
            padd = "padd_right" if rooms[room_id]['ball']['speedX'] > 0 else "padd_left"
            logger.debug(f"padd = {padd}")
            logger.debug(f"sala atual: {pformat(rooms[room_id][padd])}")
            rooms[room_id][padd]['info']['score'] += 1

            valueSpeed = ballDirection(self.capacity)
            speed = {
                'speedX': valueSpeed["X"],
                'speedY': valueSpeed["Y"],
                'positionX': rooms[room_id]['canvas_width'] / 2,
                'positionY': rooms[room_id]['canvas_height'] / 2,
                'size': 20
            }
            rooms[room_id]['ball'] = speed
            addSpeedBall(room_id)
            
            if rooms[room_id][padd]['info']['score'] == 7:
                result = await set_db_two_player(room_id, self.match_id)
                logger.debug(f"resultado: {pformat(result)}")
                await self.channel_layer.group_send(
                    room_id,
                    {
                        'type': 'pong.message',
                        'message': result
                    }
                )
                logger.debug(f"del Antes {room_id} = {pformat(rooms)}")
                del rooms[room_id]
                logger.debug(f"del Depois {room_id} = {pformat(rooms)}")
                logger.debug("saiu pos del da 'resetGame'")
                return
        else:
            if rooms[room_id]['ball']['speedY'] > 0:
                rooms[room_id]['padd_down']['info']['eliminated'] = True
            else:
                rooms[room_id]['padd_up']['info']['eliminated'] = True
            rooms[room_id]['elimination_count'] += 1
            rooms[room_id]['ball']['speedX'] = speed['X'] 
        rooms[room_id]['ball']['speedY'] = speed['Y']
        rooms[room_id]['ball']['positionX'] = rooms[room_id]['canvas_width'] / 2
        rooms[room_id]['ball']['positionY'] = rooms[room_id]['canvas_height'] / 2
        rooms[room_id]['padd_left']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100
        rooms[room_id]['padd_right']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100        

    def movePaddle(self, paddle, room_id, neg):
        if self.channel_name in rooms[room_id][paddle]['player']:
            rooms[room_id][paddle]['info']['positionY'] += (rooms[room_id][paddle]['info']['speed'] * neg)

    async def receive(self, text_data):
        room_id = self.getRoomId()

        if (text_data in ['up', 'down', 'left', 'right', 'w', 's', 'a', 'd']):
            for paddle in ['padd_left', 'padd_right']:
                if (self.channel_name in rooms[room_id][paddle]['player']):
                    if (text_data in ['up', 'left', 'w', 'a',]):
                        self.movePaddle(paddle, room_id, -1)
                    else:
                        self.movePaddle(paddle, room_id, 1)
                    break
        await self.paddleCollision(room_id)             

    async def new_player(self, event):
        logger.debug(f"new_player called with event: {event}")
        await self.send(text_data=json.dumps({
            'type': 'new_player',
            'message': event['message'],
        }))

    async def score_update(self, event):
        logger.debug(f"score_update called with event: {event}")
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'message': event['message'],
        }))

    async def position_update(self, event):
        logger.debug(f"position_update called with event: {event}")
        await self.send(text_data=json.dumps({
            'type': 'position_update',
            'message': event['message'],
        }))

    async def ball_update(self, event):
        logger.debug(f"ball_update called with event: {event}")
        await self.send(text_data=json.dumps({
            'type': 'ball_update',
            'ballDirection': event['ballDirection'],
        }))

    async def pong_message(self, event):
        if (event['message'] == 'ball'
                and self.getRoomId() in rooms):
            logger.debug(f"ta enviado o dentro do if ({self.getRoomId()})")
            await self.send(text_data=json.dumps(
                rooms[self.getRoomId()]
            ))
        else:
            await self.send(text_data=json.dumps(
                event['message']
            ))

    async def disconnect(self, close_code):
        logger.debug(f"disconnect called with close_code: {close_code}\nself: {pformat(self)}")
        logger.debug(f"url_route: {pformat(self.scope['url_route'])}")
        message = None
        room_id = self.getRoomId()
        if (room_id):
            await self.channel_layer.group_discard(room_id, self.channel_name)
        else:
            logger.error("room_id could not be extracted or is invalid")

        if (room_id in rooms):
            positions = ['padd_left', 'padd_right', 'padd_up', 'padd_down']
            for position in positions:
                if self.channel_name == rooms[room_id][position]['player'] and close_code is not None:
                    message = await walk_over(room_id, self.match_id, position.split('_')[1], self.capacity)
                    break
            if message is not None:
                await self.channel_layer.group_send(
                    room_id,
                    {
                        'type': 'pong.message',
                        'message': message
                    }
                )
                del rooms[room_id]
            if self.capacity == 2 and room_id in rooms:
                del rooms[room_id]
    
    def getRoomId(self):
        try:
            url_route_kwargs = self.scope['url_route']['kwargs']            
            room_id_data = url_route_kwargs.get('room_id')
            if isinstance(room_id_data, str):
                room_id_dict = json.loads(room_id_data)
                return room_id_dict.get('room_id')
            elif isinstance(room_id_data, dict):
                return room_id_data.get('room_id')
            else:
                logger.error(f"Unexpected format for room_id: {room_id_data}")
                return None
        except KeyError:
            logger.error("room_id not found in self.scope['url_route']['kwargs']")
            return None
        except json.JSONDecodeError:
            logger.error("Error decoding room_id from JSON string")
            return None
        except Exception as e:
            logger.error(f"Unexpected error extracting room_id: {e}")
            return None