game = new Chess();
let socket = io();

let color = "white";
let players;
let roomId;
let play = true;

let button = document.getElementById("button")
let state = document.getElementById('state')

function status(string) {
    document.getElementById('message').innerHTML = string;
}

function loaded() {
    const loader = document.querySelector('#loading');
    loader.parentElement.removeChild(loader);
    document.querySelector('main').classList.remove('hidden');
}

if (location.hash.length === 0) {

    roomId = Math.random()
        .toString(16)
        .substr(2, 10);

    socket.emit('created', roomId);
    state.innerHTML = "Created a game"

    document.querySelector('#link').href = "localhost:3000/#" + roomId;
    document.querySelector('#link').innerHTML = "localhost:3000/#" + roomId;
    document.querySelector('#link').classList.remove('hidden');
    loaded();
    status('Waiting for opponent...');

} else {
    roomId = location.hash.split('#').pop();

    console.log(roomId);

    socket.emit('joined', roomId);

    state.innerHTML = "Joined a game"
    document.querySelector('header').classList.add('hidden');
    document.querySelector('.blur').classList.remove('blur');
    status('Connected to opponent, waiting for him/her to play...');
}


socket.on('full', function (message) {
    if (roomId === message)
        window.location.assign(window.location.href + 'full.html');
});

socket.on('disconnect', function (message) {
    socket.emit('disconnect');
});

socket.on('play', function (message) {
    if (message === roomId) {
        play = false;
        state.innerHTML = "Game in progress"

        state.innerHTML = "Joined a game"
        document.querySelector('header').classList.add('hidden');
        document.querySelector('.blur').classList.remove('blur');
        status('Connected to opponent, play your turn.');
    }
});

socket.on('move', function (message) {
    if (message.room === roomId) {
        game.move(message.move);
        board.position(game.fen());
        console.log("moved")

        if (game.turn() === 'b')
            status('Oynama sırası siyahta');
        else
            status('Oynama sırası beyazda');
    }
});

let removeGreySquares = function () {
    $('#board .square-55d63').css('background', '');
};

let greySquare = function (square) {
    let squareEl = $('#board .square-' + square);

    let background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

let onDragStart = function (source, piece) {

    if (game.game_over() === true || play ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() === 'w' && color === 'black') ||
        (game.turn() === 'b' && color === 'white')) {
        return false;
    }
};

let onDrop = function (source, target) {
    removeGreySquares();

    let move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    console.log(source, target, game.turn());

    if (game.game_over()) {
        state.innerHTML = 'GAME OVER';
        socket.emit('gameOver', roomId)
    }

    if (move === null) return 'snapback';
    else socket.emit('move', {move: move, board: game.fen(), room: roomId});

    if (game.turn() === 'b')
        status('Oynama sırası siyahta');
    else
        status('Oynama sırası beyazda');
};

let onMouseoverSquare = function (square, piece) {
    let moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

let onMouseoutSquare = function (square, piece) {
    removeGreySquares();
};

let onSnapEnd = function () {
    board.position(game.fen());
};


socket.on('player', (message) => {
    let plno = document.getElementById('player')
    color = message.color;

    plno.innerHTML = 'Player ' + message.players + " : " + color;
    players = message.players;

    if (players === 2) {
        play = false;
        socket.emit('play', message.roomId);
        state.innerHTML = "Game in Progress"
    } else
        state.innerHTML = "Waiting for Second player";


    let config = {
        orientation: color,
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };
    board = ChessBoard('board', config);
});