require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnnect = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const ACTIONS = require("./actions");

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    },
});

app.use(cookieParser())
const corsOptions = {
    credentials: true,
    origin: ['http://localhost:3000']
}
app.use(cors(corsOptions));
app.use('/storage', express.static('storage'));
const PORT = process.env.PORT || 8000;
DbConnnect();
app.use(express.json({limit: '120mb'}));
app.use(router)

app.get('/', (req, res) => {
    res.send('Hello');
})

const socketUserMapping = {}

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, ({roomId, user}) => {
        socketUserMapping[socket.id] = user;
        //clients means connected users
        //map
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {})
        });
        socket.emit(ACTIONS.ADD_PEER, {});
        socket.join(roomId);
        console.log(clients);
    });
})

server.listen(PORT, () => console.log(`Listing on port ${PORT}`));
