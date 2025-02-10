import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Your React app URL (Vite default port)
        methods: ["GET", "POST"]
    }
});

// Track connected users and rooms
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', ({ roomId, playerName = 'Anonymous' }) => {
        console.log(`Player ${playerName} (${socket.id}) joining room ${roomId}`);
        
        // Join the room
        socket.join(roomId);
        
        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        
        // Add player to room
        rooms.get(roomId).add({
            id: socket.id,
            name: playerName
        });
        
        // Send updated player list to all in room
        const players = Array.from(rooms.get(roomId));
        io.to(roomId).emit('playerList', { players });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove player from their room
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