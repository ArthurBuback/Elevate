import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Ajuste o caminho conforme necessário
import "./Resultado.css"; // Estilos opcionais

const Resultado = () => {
    const { id } = useParams(); // Obtém o ID da sala
    const navigate = useNavigate(); // Hook para navegação
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResultado = async () => {
            try {
                const salaRef = doc(firestore, "salas", id);
                const salaSnap = await getDoc(salaRef);

                if (salaSnap.exists()) {
                    const salaData = salaSnap.data();
                    
                    if (salaData.players) {
                        setPlayers(salaData.players); // Atualiza a lista de usuários
                    }
                } else {
                    setError("Sala não encontrada.");
                }
            } catch (err) {
                setError("Erro ao carregar resultado.");
            }
            setLoading(false);
        };
        
        fetchResultado();
    }, [id]);

    if (loading) {
        return <div>Carregando resultado...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div id="Resultado">
            <h1>Resultado do Quiz</h1>
            <h2>Usuários da sala:</h2>
            {players.length > 0 ? (
                <ul>
                    {players.map((player, index) => (
                        <li key={index}>
                            <strong>{player.name}</strong> {player.isAdmin && "(Admin)"}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum usuário encontrado.</p>
            )}

            {/* Botão de Navegação */}
            <button onClick={() => navigate("/")}>Retornar</button>
        </div>
    );
};

export default Resultado;
