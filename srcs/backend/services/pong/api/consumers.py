import logging
from pprint import pformat
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
import asyncio, random, json, copy
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

rooms = {}

def clone_paddle_state():
    return copy.deepcopy(PADDLE_INITIAL_STATE)


def get_room_player_count(room_id):
    return sum(1 for key in rooms.get(room_id, {}) if key.startswith('padd_'))

async def check_win(room_id, match_id):
    for position in ['left', 'right', 'up', 'down']:
        if rooms[room_id][f'padd_{position}']['info']['eliminated']:
            return await set_db_four_player(room_id, match_id, position)
    return None

def eliminate_player(padd, room_id):
    if padd['info']['eliminated']:
        return False
    padd['info']['eliminated'] = True
    rooms[room_id]['elimination_count'] += 1
    return True

@database_sync_to_async
def walk_over(room_id, match_id, pos, capacity):
    try:
        if capacity == 2:
            return walk_over_two(room_id, match_id, pos)
        return walk_over_four(room_id, match_id, pos)
    except Exception as e:
        logger.error(f"Error in walk_over: {e}")

def walk_over_two(room_id, match_id, pos):
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

    return f"{winner.username} left you win"

def walk_over_four(room_id, match_id, pos):
    player_pos_map = {
        'left': rooms[room_id]['padd_left'],
        'right': rooms[room_id]['padd_right'],
        'up': rooms[room_id]['padd_up'],
        'down': rooms[room_id]['padd_down'],
    }

    if not eliminate_player(player_pos_map[pos], room_id):
        return None

    if rooms[room_id]['elimination_count'] >= 3:
        return check_win(room_id, match_id)

def get_match(match_id):
    match = Match.objects.create(game='PG', status=Match.Status.PLAYING.value) if not match_id else Match.objects.get(id=match_id)
    match.status = Match.Status.PLAYING.value
    match.save()
    return match

@database_sync_to_async
def set_db_four_player(room_id, match_id, winner):
    try:
        player_pos_map = {
            'left': rooms[room_id]['padd_left'],
            'right': rooms[room_id]['padd_right'],
            'up': rooms[room_id]['padd_up'],
            'down': rooms[room_id]['padd_down'],
        }

        match = get_match(match_id)
        players = {pos: Player.objects.get(id=player['user_id']) for pos, player in player_pos_map.items()}
        player_matches = {pos: PlayerMatch.objects.get_or_create(matchId=match, playerId=player)[0] for pos, player in players.items()}

        for pos in players:
            player_matches[pos].score, player_matches[pos].winner = (1, True) if pos == winner else (0, False)
            players[pos].victory += 1 if pos == winner else 0
            players[pos].defeat += 1 if pos != winner else 0

            player_matches[pos].save()
            players[pos].save()

        return f"{players[winner].username} is the winner"
    except Exception as e:
        logger.error(f"Error in set_db_four_player: {e}")

@database_sync_to_async
def set_db_two_player(room_id, match_id):
    try:
        player_left = rooms[room_id]['padd_left']
        player_right = rooms[room_id]['padd_right']

        match = get_match(match_id)
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

def ballDirection(capacity):
    # logger.debug(f"ballDirection called with capacity: {capacity}")
    speed = {
        'X': 0,
        'Y': 0
    }
    if capacity == 2:
        speedX = random.choice([-5, -4, 4, 5])
        speedY = random.choice([-3, -2, 2, 3])
    else:
        speedX = random.choice([-4, -3, 3, 4])
        speedY = random.choice([-4, -3, 3, 4])

    speed['X'] = speedX
    speed['Y'] = speedY
    return speed


def addSpeedBall(room_id):
    if room_id not in rooms:
        return
    rooms[room_id]['ball']['positionX'] += rooms[room_id]['ball']['speedX']
    rooms[room_id]['ball']['positionY'] += rooms[room_id]['ball']['speedY']


def increase_ball_speed(room_id, factor=1.02, max_speed=12):
    if room_id not in rooms or 'ball' not in rooms[room_id]:
        return
    ball = rooms[room_id]['ball']
    ball['hits'] = ball.get('hits', 0) + 1
    for axis in ['speedX', 'speedY']:
        speed = ball.get(axis, 0)
        if speed == 0:
            continue
        new_speed = speed * factor
        if abs(new_speed) > max_speed:
            ball[axis] = max_speed if speed > 0 else -max_speed
        else:
            ball[axis] = new_speed


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
                    'info': clone_paddle_state(),
                    'username': player_db.username,
                    'avatar': player_db.avatar
                },
                'elimination_count': 0,
            }
            await self.send(text_data=json.dumps({'inLobby': '1'}))
        else:
            paddle_positions = ['padd_right', 'padd_up', 'padd_down']
            for index, pos in enumerate(paddle_positions[: self.capacity - 1], start=2):
                if rooms[room_id].get(pos) is None:
                    rooms[room_id][pos] = {
                        'player': self.channel_name,
                        'user_id': self.scope['payload']['id'],
                        'info': clone_paddle_state(),
                        'username': player_db.username,
                        'avatar': player_db.avatar
                    }
                    await self.send(text_data=json.dumps({'inLobby': str(index)}))
                    break
            if get_room_player_count(room_id) == self.capacity:
                await self.gameStart(room_id)


    async def gameStart(self, room_id):
        if room_id not in rooms:
            return
        self.prepareGame(room_id)
        addSpeedBall(room_id)
        await self.channel_layer.group_send(
            room_id,
            {
                'type': 'pong.message',
                'message': 'ball',
            }
        )
        if room_id in rooms:
            asyncio.create_task(self.gameLoop(room_id))

    def prepareGame(self, room_id):
        if room_id not in rooms:
            return
        #define size with canvas
        rooms[room_id]['canvas_width'] = 1300 if self.capacity == 4 else 1920
        rooms[room_id]['canvas_height'] = 1300 if self.capacity == 4 else 1080

        #define pos for left
        rooms[room_id]['padd_left']['info']['positionX'] = 60
        rooms[room_id]['padd_left']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100

        #define pos for right
        rooms[room_id]['padd_right']['info']['positionX'] = rooms[room_id]['canvas_width'] - 100
        rooms[room_id]['padd_right']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100

        if (self.capacity == 4):
            #define pos for up
            rooms[room_id]['padd_up']['info']['positionX'] = rooms[room_id]['canvas_width'] / 2 - 100
            rooms[room_id]['padd_up']['info']['positionY'] = 100

            #define pos for down
            rooms[room_id]['padd_down']['info']['positionX'] = rooms[room_id]['canvas_width'] / 2 - 100
            rooms[room_id]['padd_down']['info']['positionY'] = rooms[room_id]['canvas_height'] - 100

        valueSpeed = ballDirection(self.capacity)
        # logger.debug(f"Value Speed\n{pformat(valueSpeed)}")

        speed = {
            'speedX': valueSpeed["X"],
            'speedY': valueSpeed["Y"],
            'positionX': rooms[room_id]['canvas_width'] / 2,
            'positionY': rooms[room_id]['canvas_height'] / 2,
            'size': 20,
            'hits': 0
        }
        rooms[room_id]['ball'] = speed
        # logger.debug(f"minhas rooms\n {pformat(rooms)}\ne RoomID: {room_id}\n{pformat(rooms[room_id])}")

    async def gameLoop(self, room_id):
        await asyncio.sleep(2)
        while True:
            if (room_id not in rooms):
                break
            addSpeedBall(room_id)
            try:
                await self.ballCollision(room_id)
                await self.paddleCollision(room_id)
                await self.BallPaddleCollision(room_id)
                if self.capacity == 4 and rooms[room_id]['elimination_count'] > 2:
                    result = await check_win(room_id, self.match_id)
                    await self.channel_layer.group_send(
                        room_id,
                        {
                            'type': 'pong.message',
                            'message': result
                        }
                    )
                    return
                await self.channel_layer.group_send(
                    room_id,
                    {
                        'type': 'pong.message',
                        'message': 'ball',
                    }
                )
            except Exception as e:
                logger.error(f"Error in gameLoop: {e}")
            await asyncio.sleep(0.025)

    def getPaddCenter(self, room_id, side):
        padd_info = rooms[room_id][f'padd_{side[:-1]}']['info']
        size_x, size_y = padd_info['sizeX'], padd_info['sizeY']
        position = padd_info[f'position{side[-1]}']
        center_offset = size_x / 2 if side[-1] == 'X' else size_y / 2

        if self.capacity == 4 and side.startswith('up') or side.startswith('down'):
            size_x, size_y = size_y, size_x
            center_offset = size_x / 2 if side[-1] == 'X' else size_y / 2
            if side == 'upY':
                center_offset = -center_offset

        return position + center_offset


    async def BallPaddleCollision(self, room_id):
        ball = rooms[room_id]['ball']
        ball_size = ball['size']
        paddles = {
            'left': ('leftX', 'leftY', 'positionX', 'positionY', 'padd_left', 'speedX'),
            'right': ('rightX', 'rightY', 'positionX', 'positionY', 'padd_right', 'speedX')
        }

        if self.capacity == 4:
            paddles.update({
                'up': ('upX', 'upY', 'positionX', 'positionY', 'padd_up', 'speedY'),
                'down': ('downX', 'downY', 'positionX', 'positionY', 'padd_down', 'speedY')
            })

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
                increase_ball_speed(room_id)



    async def paddleCollision(self, room_id):
        paddles = ['padd_right', 'padd_left']
        for paddle in paddles:
            if not rooms[room_id][paddle]['info']['eliminated']:
                size = rooms[room_id][paddle]['info']['sizeY']
                pos = rooms[room_id][paddle]['info']['positionY']
                canvas_height = rooms[room_id]['canvas_height']
                rooms[room_id][paddle]['info']['positionY'] = max(0, min(pos, canvas_height - size))

        if self.capacity == 4:
            paddles = ['padd_up', 'padd_down']
            for paddle in paddles:
                if not rooms[room_id][paddle]['info']['eliminated']:
                    size = rooms[room_id][paddle]['info']['sizeX']
                    pos = rooms[room_id][paddle]['info']['positionX']
                    canvas_width = rooms[room_id]['canvas_width']
                    rooms[room_id][paddle]['info']['positionX'] = max(0, min(pos, canvas_width - size))



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
            if (self.capacity == 4 and
                (not rooms[room_id]['padd_down']['info']['eliminated'] or
                    not rooms[room_id]['padd_up']['info']['eliminated'])):
                    await self.resetGame(room_id, False)
            else:
                rooms[room_id]['ball']['speedY'] *= -1


    async def resetGame(self, room_id, eliminated):
        speed = ballDirection(self.capacity)
        if (eliminated):
            padd = "padd_right" if rooms[room_id]['ball']['speedX'] > 0 else "padd_left"
            if self.capacity == 4:
                rooms[room_id][padd]['info']['eliminated'] = True
                rooms[room_id]['elimination_count'] += 1
            else:
                rooms[room_id][padd]['info']['score'] += 1

                if rooms[room_id][padd]['info']['score'] == 7:
                    result = await set_db_two_player(room_id, self.match_id)
                    await self.channel_layer.group_send(
                        room_id,
                        {
                            'type': 'pong.message',
                            'message': result
                        }
                    )
            rooms[room_id]['ball']['speedX'] = speed['X']
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
        rooms[room_id]['ball']['hits'] = 0
        rooms[room_id]['padd_left']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100
        rooms[room_id]['padd_right']['info']['positionY'] = rooms[room_id]['canvas_height'] / 2 - 100
        if self.capacity == 4:
            rooms[room_id]['padd_up']['info']['positionX'] = rooms[room_id]['canvas_width'] / 2 - 100
            rooms[room_id]['padd_down']['info']['positionX'] = rooms[room_id]['canvas_width'] / 2 - 100


    def movePaddle(self, paddle, room_id, neg):
        if rooms.get(room_id) and rooms[room_id][paddle]['player'] == self.channel_name:
            rooms[room_id][paddle]['info']['positionY'] += (rooms[room_id][paddle]['info']['speed'] * neg)

    async def receive(self, text_data):
        # logger.debug(f"receive called with text_data: {text_data}") #retornou s
        room_id = self.getRoomId()
        if (text_data in ['up', 'down', 'left', 'right', 'w', 's', 'a', 'd']):
            for paddle in ['padd_left', 'padd_right', 'padd_up', 'padd_down']:
                if (self.channel_name in rooms[room_id][paddle]['player']):
                    if (text_data in ['up', 'left', 'w', 'a',]):
                        self.movePaddle(paddle, room_id, -1)
                    else:
                        self.movePaddle(paddle, room_id, 1)
                    break
        await self.paddleCollision(room_id)

    async def new_player(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_player',
            'message': event['message'],
        }))

    async def score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'message': event['message'],
        }))

    async def position_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'position_update',
            'player': event['player'],
            'positionX': event['positionX'],
            'positionY': event['positionY'],
        }))

    async def ball_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ball_update',
            'ballDirection': event['ballDirection'],
        }))

    async def pong_message(self, event):
        # logger.debug(f"event[message] = {event['message']}\n que porra é essa alek {pformat(self.scope)}")
        if (event['message'] == 'ball'
                and self.getRoomId() in rooms):
            await self.send(text_data=json.dumps(
                rooms[self.getRoomId()]
            ))
        else:
            await self.send(text_data=json.dumps(
                event['message']
            ))

    async def disconnect(self, close_code):
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
        return self.scope.get('url_route', {}).get('kwargs', {}).get('room_id')
