import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../firebase';
import './JoinRoom.css';

const JoinRoom = () => {
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleJoin = async (e) => {
        e.preventDefault();
        if (roomId.trim() && playerName.trim()) {
            setLoading(true);
            try {
                const salaRef = doc(firestore, "salas", roomId.trim());
                const salaSnap = await getDoc(salaRef);
                
                if (!salaSnap.exists()) {
                    alert("Sala não encontrada.");
                    return;
                }

                const salaData = salaSnap.data();
                const hasAdmin = salaData.players?.some(player => player.isAdmin);

                // Add player with admin status if they're first
                await updateDoc(salaRef, {
                    players: arrayUnion({
                        name: playerName.trim(),
                        joinedAt: new Date().toISOString(),
                        isAdmin: !hasAdmin // First player gets admin status
                    })
                });
                
                navigate(`/sala/${roomId.trim()}?player=${encodeURIComponent(playerName.trim())}`);
            } catch (error) {
                console.error("Erro ao entrar na sala:", error);
                alert("Erro ao entrar na sala. Verifique o ID e tente novamente.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="join-room">
            <h2>Entrar em uma Sala</h2>
            <p className="instructions">
                Para entrar em uma sala, você precisa do ID do quiz e seu nome.<br/>
                Digite as informações abaixo.<br/>
                <small>O primeiro jogador a entrar será o administrador da sala.</small>
            </p>
            <form onSubmit={handleJoin}>
                <div className="input-group">
                    <label htmlFor="playerName">Seu Nome:</label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Digite seu nome"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="roomId">ID da Sala:</label>
                    <input
                        type="text"
                        id="roomId"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Ex: OCz6Hpl7rDpK3Xc8360b"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar na Sala'}
                </button>
            </form>
        </div>
    );
};

export default JoinRoom; 