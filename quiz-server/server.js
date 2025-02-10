import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', ({ roomId, playerName }) => {
        console.log(`Player ${playerName} joining room ${roomId}`);
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        
        rooms.get(roomId).add({
            id: socket.id,
            name: playerName
        });
        
        const players = Array.from(rooms.get(roomId));
        io.to(roomId).emit('playerList', { players });
    });

    socket.on('startQuiz', ({ roomId, quizId }) => {
        console.log(`Starting quiz ${quizId} in room ${roomId}`);
        io.to(roomId).emit('startQuiz', { quizId });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        rooms.forEach((players, roomId) => {
            const player = Array.from(players).find(p => p.id === socket.id);
            if (player) {
                players.delete(player);
                io.to(roomId).emit('playerList', { 
                    players: Array.from(players)
                });
            }
        });
    });
});



const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});