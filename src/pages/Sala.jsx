import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase"; // Ajuste o caminho conforme necessário
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./Sala.css"; // Estilos opcionais

const SOCKET_SERVER_URL = 'http://localhost:3001';

const Sala = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const playerName = searchParams.get('player');
    const [sala, setSala] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [players, setPlayers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            newSocket.emit('joinRoom', { 
                roomId: id,
                playerName: playerName
            });
        });

        newSocket.on('playerList', ({ players }) => {
            console.log('Updated player list:', players);
            setPlayers(players);
        });

        // Listen for quiz start event
        newSocket.on('startQuiz', ({ quizId }) => {
            console.log('Quiz starting:', quizId);
            navigate(`/quiz/${quizId}?player=${encodeURIComponent(playerName)}&sala=${id}`);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [id, playerName, navigate]);

    useEffect(() => {
        const salaRef = doc(firestore, "salas", id);
        const unsubscribe = onSnapshot(salaRef, (doc) => {
            if (doc.exists()) {
                const salaData = doc.data();
                console.log("Sala data loaded:", salaData);
                setSala(salaData);
                
                // Check if current player is admin
                const currentPlayer = salaData.players?.find(p => p.name === playerName);
                setIsAdmin(currentPlayer?.isAdmin || false);
                
                setPlayers(salaData.players || []);

                // If the room status is "iniciado", navigate to quiz
                if (salaData.status === "iniciado" && salaData.quizId) {
                    navigate(`/quiz/${salaData.quizId}?player=${encodeURIComponent(playerName)}&sala=${id}`);
                }
            } else {
                setError("Sala não encontrada.");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, playerName, navigate]);

    const iniciarQuiz = async () => {
        if (!sala?.quizId) return;
        
        try {
            const salaRef = doc(firestore, "salas", id);
            await updateDoc(salaRef, {
                status: "iniciado",
                currentQuestion: 0
            });
            
            // Emit event to make everyone navigate to the quiz
            if (socket) {
                socket.emit('startQuiz', { 
                    roomId: id, 
                    quizId: sala.quizId
                });
            }
        } catch (error) {
            console.error("Error starting quiz:", error);
            setError("Erro ao iniciar o quiz");
        }
    };

    if (loading) {
        return <div>Carregando detalhes da sala...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div id="Sala">
            <h1>Sala: {id}</h1>
            
            <div className="players-list">
                <h3>Jogadores na sala:</h3>
                <ul>
                    {players.map((player, index) => (
                        <li key={index}>
                            {player.name} 
                            {player.isAdmin && " (Admin)"}
                            {player.name === playerName && !player.isAdmin && " (Você)"}
                        </li>
                    ))}
                </ul>
            </div>

            {sala && sala.quizId && isAdmin && (
                <button onClick={iniciarQuiz} className="start-quiz-button">
                    Iniciar Quiz
                </button>
            )}

            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default Sala;