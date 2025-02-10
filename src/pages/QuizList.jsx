import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { firestore } from "../firebase"; // Ajuste o caminho conforme necessário
import { useNavigate } from "react-router-dom";
import "./QuizList.css"; // Estilos opcionais

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]); // Estado para armazenar a lista de quizzes
    const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
    const [error, setError] = useState(null); // Estado para armazenar mensagens de erro
    const [playerName, setPlayerName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const navigate = useNavigate(); // Hook para navegação programática

    // Função para buscar os quizzes no Firestore
    const fetchQuizzes = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, "quizzes")); // Busca todos os documentos da coleção "quizzes"
            const quizzesList = querySnapshot.docs.map((doc) => ({
                id: doc.id, // ID do documento no Firestore
                ...doc.data(), // Dados do quiz (título, perguntas, etc.)
            }));
            setQuizzes(quizzesList); // Atualiza o estado com a lista de quizzes
        } catch (error) {
            console.error("Erro ao buscar quizzes: ", error);
            setError("Erro ao carregar os quizzes. Tente novamente mais tarde."); // Define uma mensagem de erro
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    };

    const handleQuizSelect = (quizId) => {
        setSelectedQuizId(quizId);
        setShowNameInput(true);
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!playerName.trim()) {
            alert("Por favor, digite seu nome.");
            return;
        }

        try {
            const salasRef = collection(firestore, "salas");
            const novaSalaRef = await addDoc(salasRef, {
                quizId: selectedQuizId,
                players: [{
                    name: playerName.trim(),
                    joinedAt: new Date().toISOString(),
                    isAdmin: true // First player is admin but keeps their name
                }],
                createdAt: new Date(),
                status: "aguardando",
            });

            navigate(`/sala/${novaSalaRef.id}?player=${encodeURIComponent(playerName.trim())}`);
        } catch (error) {
            console.error("Erro ao criar sala: ", error);
            setError("Erro ao criar sala. Tente novamente mais tarde.");
        }
    };

    // Busca os quizzes quando o componente é montado
    useEffect(() => {
        fetchQuizzes();
    }, []);

    // Exibe uma mensagem de carregamento enquanto os dados estão sendo buscados
    if (loading) {
        return <div>Carregando quizzes...</div>;
    }

    // Exibe uma mensagem de erro se ocorrer um problema ao buscar os quizzes
    if (error) {
        return <div>{error}</div>;
    }

    if (showNameInput) {
        return (
            <div id="QuizList">
                <h1>Digite seu nome</h1>
                <form onSubmit={handleCreateRoom} className="name-input-form">
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
                    <div className="button-group">
                        <button type="submit">Criar Sala</button>
                        <button type="button" onClick={() => {
                            setShowNameInput(false);
                            setSelectedQuizId(null);
                        }}>Voltar</button>
                    </div>
                </form>
            </div>
        );
    }

    // Exibe a lista de quizzes ou uma mensagem se a lista estiver vazia
    return (
        <div id="QuizList">
            <h1>Quizzes Disponíveis</h1>
            {quizzes.length === 0 ? (
                <p>Nenhum quiz encontrado.</p>
            ) : (
                <ul>
                    {quizzes.map((quiz) => (
                        <li key={quiz.id}>
                            <button onClick={() => handleQuizSelect(quiz.id)}>
                                {quiz.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Botão para criar um novo quiz */}
            <Link to="/criar">
                <button className="create-quiz-button">
                    Criar Novo Quiz
                </button>
            </Link>
        </div>
    );
};

export default QuizList;