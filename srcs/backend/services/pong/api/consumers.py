from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
import asyncio, random, json
from .models import PlayerMatch, Match, Player

# Define initial states for paddles
PADDLE_INITIAL_STATE = {
    'speed': 30,
    'positionX': 0,
    'positionY': 0,
    'sizeX': 40,
    'sizeY': 200,
    'eliminated': False,
}

# Clone initial state for paddles
padd_left = PADDLE_INITIAL_STATE.copy()
padd_right = PADDLE_INITIAL_STATE.copy()
padd_up = PADDLE_INITIAL_STATE.copy()
padd_down = PADDLE_INITIAL_STATE.copy()

# Adjust sizes for up and down paddles
padd_up['sizeX'] = padd_down['sizeX'] = 200
padd_up['sizeY'] = padd_down['sizeY'] = 40

rooms = {}

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
        print(e, flush=True)

def walk_over_two(room_id, match_id, pos):
    player_left = rooms[room_id]['padd_left']
    player_right = rooms[room_id]['padd_right']
    player_left_db = Player.objects.get(id=player_left['user_id'])
    player_right_db = Player.objects.get(id=player_right['user_id'])
    match = get_match(match_id)
    winner, loser = (player_left_db, player_right_db) if pos == 'right' else (player_right_db, player_left_db)

    winner_match, _ = PlayerMatch.objects.get_or_create(match_id=match, player_id=winner)
    loser_match, _ = PlayerMatch.objects.get_or_create(match_id=match, player_id=loser)

    winner_match.score, winner_match.won = 2, True
    loser_match.score, loser_match.won = 0, False

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
    match = Match.objects.create(game='PO', state=Match.State.PLAYED.value) if not match_id else Match.objects.get(id=match_id)
    match.state = Match.State.PLAYED.value
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
        player_matches = {pos: PlayerMatch.objects.get_or_create(match_id=match, player_id=player)[0] for pos, player in players.items()}

        for pos in players:
            player_matches[pos].score, player_matches[pos].won = (1, True) if pos == winner else (0, False)
            players[pos].wins += 1 if pos == winner else 0
            players[pos].losses += 1 if pos != winner else 0

            player_matches[pos].save()
            players[pos].save()

        return f"{players[winner].username} is the winner"
    except Exception as e:
        print(e, flush=True)

@database_sync_to_async
def set_db_two_player(room_id, match_id):
    try:
        player_left = rooms[room_id]['padd_left']
        player_right = rooms[room_id]['padd_right']

        match = get_match(match_id)
        player_left_db = Player.objects.get(id=player_left['user_id'])
        player_right_db = Player.objects.get(id=player_right['user_id'])

        player_match_left, _ = PlayerMatch.objects.get_or_create(match_id=match, player_id=player_left_db)
        player_match_right, _ = PlayerMatch.objects.get_or_create(match_id=match, player_id=player_right_db)

        player_match_left.score = player_left['info']['score']
        player_match_right.score = player_right['info']['score']

        player_match_left.won = player_left['info']['score'] == 7
        player_match_right.won = player_right['info']['score'] == 7

        player_match_left.save()
        player_match_right.save()

        if player_left['info']['score'] == 7:
            player_left_db.wins += 1
            player_right_db.losses += 1
        else:
            player_left_db.losses += 1
            player_right_db.wins += 1

        player_left_db.save()
        player_right_db.save()

        winner = player_left_db if player_left['info']['score'] == 7 else player_right_db
        return f"{winner.username} won"
    except Exception as e:
        print(e, flush=True)

def ball_direction(capacity):
    if capacity == 2:
        return [random.choice([10, -10]), random.choice([0, -10, 10])]
    speed_x, speed_y = random.choice([0, -5, 5]), random.choice([0, -6, 6])
    return [random.choice([-5, 5]) if speed_x == speed_y == 0 else speed_x, speed_y]

class Pong(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        room_id = self.scope['url_route']['kwargs']['room_id']
        self.capacity = self.scope['url_route']['kwargs']['capacity']
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
            await self.send('1')
        else:
            paddle_positions = ['padd_right', 'padd_up', 'padd_down']
            for index, pos in enumerate(paddle_positions[:self.capacity - 1], start=2):
                if rooms[room_id].get(pos) is None:
                    rooms[room_id][pos] = {
                        'player': self.channel_name,
                        'user_id': self.scope['payload']['id'],
                        'info': globals()[f'padd_{pos.split("_")[1]}'].copy(),
                        'username': player_db.username,
                        'avatar': player_db.avatar
                    }
                    await self.send(str(index))
                    break
            if len(rooms[room_id]) == self.capacity:
                await self.start_game(room_id)

    async def pong_message(self, event):
        room_id = self.scope['url_route']['kwargs']['room_id']
        if event['message'] == 'ball' and room_id in rooms:
            await self.send(text_data=json.dumps(rooms[room_id]))
        else:
            await self.send(text_data=json.dumps(event['message']))

    async def disconnect(self, close_code):
        room_id = self.scope['url_route']['kwargs']['room_id']
        await self.channel_layer.group_discard(room_id, self.channel_name)

        if room_id in rooms:
            message = None
            for pos in ['left', 'right', 'up', 'down']:
                if self.channel_name == rooms[room_id][f'padd_{pos}']['player']:
                    if close_code is not None:
                        message = await walk_over(room_id, self.match_id, pos, self.capacity)
                    break
            if message is not None:
                await self.channel_layer.group_send(room_id, {'type': 'pong.message', 'message': message})
                del rooms[room_id]

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        room_id = self.scope['url_route']['kwargs']['room_id']
        self.capacity = self.scope['url_route']['kwargs']['capacity']

        if 'canvas_width' in text_data_json:
            rooms[room_id]['canvas_width'] = text_data_json['canvas_width']
            rooms[room_id]['canvas_height'] = text_data_json['canvas_height']
            rooms[room_id]['ball'] = {
                'positionX': text_data_json['canvas_width'] // 2,
                'positionY': text_data_json['canvas_height'] // 2,
                'speedX': ball_direction(self.capacity)[0],
                'speedY': ball_direction(self.capacity)[1],
                'size': 15,
            }
        else:
            ball = rooms[room_id]['ball']
            for pos in ['left', 'right', 'up', 'down']:
                if f'padd_{pos}_pos' in text_data_json:
                    rooms[room_id][f'padd_{pos}']['info']['positionY'] = text_data_json[f'padd_{pos}_pos']

            await self.BallCollision(room_id)
            ball['positionX'] += ball['speedX']
            ball['positionY'] += ball['speedY']

        await self.channel_layer.group_send(room_id, {'type': 'pong.message', 'message': 'ball'})

    async def BallCollision(self, room_id):
        ball = rooms[room_id]['ball']
        canvas_width = rooms[room_id]['canvas_width']
        canvas_height = rooms[room_id]['canvas_height']

        if ball['positionX'] + ball['size'] >= canvas_width:
            if rooms[room_id]['padd_right']['info']['eliminated']:
                ball['speedX'] *= -1
            else:
                await self.reset_game(room_id, True)
        elif ball['positionX'] - ball['size'] <= 0:
            if rooms[room_id]['padd_left']['info']['eliminated']:
                ball['speedX'] *= -1
            else:
                await self.reset_game(room_id, True)
        if ball['positionY'] + ball['size'] >= canvas_height:
            if self.capacity == 4 and not rooms[room_id]['padd_down']['info']['eliminated']:
                await self.reset_game(room_id, False)
            else:
                ball['speedY'] *= -1
        elif ball['positionY'] - ball['size'] <= 0:
            if self.capacity == 4 and not rooms[room_id]['padd_up']['info']['eliminated']:
                await self.reset_game(room_id, False)
            else:
                ball['speedY'] *= -1

    async def reset_game(self, room_id, is_horizontal):
        if is_horizontal:
            rooms[room_id]['ball']['positionX'] = rooms[room_id]['canvas_width'] // 2
            rooms[room_id]['ball']['speedX'] *= -1
        else:
            rooms[room_id]['ball']['positionY'] = rooms[room_id]['canvas_height'] // 2
            rooms[room_id]['ball']['speedY'] *= -1
        await self.channel_layer.group_send(room_id, {'type': 'pong.message', 'message': 'ball'})

    async def start_game(self, room_id):
        rooms[room_id]['elimination_count'] = 0
        await self.channel_layer.group_send(room_id, {'type': 'pong.message', 'message': 'start'})
        await asyncio.sleep(1)  # Delay to ensure clients are ready
        await self.channel_layer.group_send(room_id, {'type': 'pong.message', 'message': 'ball'})
