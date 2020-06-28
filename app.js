const express = require('express')
const app = express()
let http = require('http').Server(app)

const port = process.env.PORT || 3000
let io = require('socket.io')(http)
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let games = Array(1000);

let players;
let joined = true;

io.on('connection', function (socket) {

    let color;
    let playerId = Math.floor((Math.random() * 100) + 1)

    console.log(playerId + ' connected');

    socket.on('created', function (roomId) {

        games[roomId] = {players: 0, pid: [0, 0]};

        games[roomId].players++;
        games[roomId].pid[games[roomId].players - 1] = playerId;


        console.log(games[roomId]);
        players = games[roomId].players

        if (players % 2 == 0) color = 'black';
        else color = 'white';

        socket.emit('player', {playerId, players, color, roomId})

    })

    socket.on('joined', function (roomId) {

        if (games[roomId].players < 2) {
            games[roomId].players++;
            games[roomId].pid[games[roomId].players - 1] = playerId;
        } else {
            socket.emit('full', roomId)
            return;
        }

        console.log(games[roomId]);
        players = games[roomId].players

        if (players % 2 == 0) color = 'black';
        else color = 'white';

        socket.emit('player', {playerId, players, color, roomId})
    });

    socket.on('move', function (message) {
        socket.broadcast.emit('move', message);

    });

    socket.on('play', function (message) {
        socket.broadcast.emit('play', message);
        console.log("ready " + message);
    });

    socket.on('disconnect', function () {
        console.log("games", games);
        games.forEach(function (key, item) {
            
            if (item.pid[0] == playerId) 
                delete games['key'];

            if (item.pid[1] == playerId) 
                item.players--;
        })
    });
});


http.listen(port, () => {
    console.log('listening on', port)
})

app.use('/img/chesspieces/wikipedia/', express.static(__dirname + '/public/assets/images/'));
