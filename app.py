from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Store game state per room
games = {}  # {room: {fen: '...', moves: []}}

@app.route('/')
def index():
    return render_template('chess_chat.html')

@socketio.on('chat message')
def handle_message(data):
    room = data.get('room', 'default')
    msg_html = render_template('message.html', message=data['message'], name=data.get('name', 'Anonymous'), time=data.get('time', ''))
    emit('chat message', {'html': msg_html}, to=room)

@socketio.on('join')
def on_join(data):
    room = data.get('room', 'default')
    join_room(room)
    if room not in games:
        games[room] = {'fen': 'start', 'moves': []}
    emit('load game', games[room], to=room)

@socketio.on('chess move')
def handle_chess_move(data):
    room = data.get('room', 'default')
    move = data['move']
    fen = data['fen']

    games[room]['fen'] = fen
    games[room]['moves'].append(move)

    emit('chess move', {'move': move, 'fen': fen}, to=room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
