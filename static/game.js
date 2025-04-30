//Disable scrolling behavior on mobile
const boardEl = document.getElementById('board');
boardEl.addEventListener('touchstart', e => e.stopPropagation(), { passive: false });
boardEl.addEventListener('touchmove', e => e.preventDefault(), { passive: false });


const socket = io();
const room = "default";
socket.emit("join", { room });

const game = new Chess();
const board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDrop: handleMove,
    pieceTheme: '/static/img/chesspieces/wikipedia/{piece}.png'
});
gameStatus()

function gameStatus() {
  const turn = game.turn()
  const status_element = document.getElementById("game-status")
  console.log(turn)
  console.log("check " + game.in_check())
  console.log("mate  " + game.in_checkmate())
  console.log("gameover")
  //if (game.game_over()) {
  //  status_element.innerHTML = "Game over."
  //  return
  //}
  if (game.in_stalemate()) {
    status_element.innerHTML = "Game over. Draw."
    return
  }
  if (turn === 'b') {
    if (game.in_checkmate()) {
      status_element.innerHTML = "<h2>Game over. White won!</h2>"
      launchConfetti()
    }
    else if (game.in_check()) {
      status_element.innerHTML = "<h2 style=\"color:red\">Black is in check. Black's Turn</h2>"
    } else {
      status_element.innerHTML = "<h2>Black's Turn</h2>"
    }
  } else {
    if (game.in_checkmate()) {
      status_element.innerHTML = "<h2>Game over. Black won!</h2>"
      launchConfetti()
    }
    else if (game.in_check()) {
      status_element.innerHTML = "<h2 style=\"color: red\">White is in check. White's Turn</h2>"
    } else {
      status_element.innerHTML = "<h2>White's Turn</h2>"
    }
  }
}

function handleMove(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    socket.emit("chess move", {
        room,
        move,
        fen: game.fen()
    });

    const name = document.getElementById("name").value || "Anonymous";
    const message = 'From ' + source + " to " + target
    const now = new Date()
    const time = now.toLocaleTimeString()
    socket.emit("chat message", { message, name, room, time });
}

socket.on("chess move", data => {
    game.load(data.fen);
    board.position(data.fen);
    gameStatus()
});

socket.on("load game", data => {
    game.load(data.fen);
    board.position(data.fen);
    gameStatus()
});


//Attach listener to chat box
document.getElementById("message").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault(); // prevent default newline in input
        sendMessage();
    }
});

function sendMessage() {
    const message = document.getElementById("message").value;
    const name = document.getElementById("name").value || "Anonymous";
    if (message.trim() === "") return;

    const now = new Date();
    const time = now.toLocaleTimeString()
    socket.emit("chat message", { message, name, room, time });
    document.getElementById("message").value = ""; // ✅ clears field
}


socket.on("chat message", data => {
    const chatBox = document.getElementById('messages');
    chatBox.innerHTML += data.html;
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
});


function launchConfetti() {
  const confetti = new JSConfetti();
  confetti.addConfetti({
     //emojis: ['♟️'],
    // confettiColors: ['#E4F5AC', '#204A32', '#FF7144', '#FFDC4D', '#F6AE30', '#84211F', '#E9453A'],
    confettiNumber: 500,
    confettiRadius: 6,
  });
}
