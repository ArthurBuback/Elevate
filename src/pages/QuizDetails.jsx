import React, { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { firestore } from "../firebase"; // Ajuste o caminho conforme necessário
import { useParams, useNavigate } from "react-router-dom";
import "./QuizDetails.css"; // Estilos opcionais

const QuizDetails = () => {
    const { id } = useParams(); // Obtém o ID do quiz da URL
    const [quiz, setQuiz] = useState(null); // Estado para armazenar os detalhes do quiz
    const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
    const [error, setError] = useState(null); // Estado para armazenar mensagens de erro
    const [salaId, setSalaId] = useState(null); // Estado para armazenar o ID da sala criada
    const navigate = useNavigate(); // Hook para navegação programática

    // Função para buscar os detalhes do quiz no Firestore
    const fetchQuizDetails = async () => {
        try {
            const docRef = doc(firestore, "quizzes", id); // Referência ao documento do quiz
            const docSnap = await getDoc(docRef); // Busca o documento

            if (docSnap.exists()) {
                setQuiz(docSnap.data()); // Atualiza o estado com os dados do quiz
            } else {
                setError("Quiz não encontrado."); // Define uma mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes do quiz: ", error);
            setError("Erro ao carregar o quiz. Tente novamente mais tarde."); // Define uma mensagem de erro
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    };

    // Função para criar uma sala
    const criarSala = async () => {
        try {
            const salaRef = await addDoc(collection(firestore, "salas"), {
                quizId: id, // Associa o ID do quiz à sala
                participantes: [], // Lista de participantes (inicialmente vazia)
                createdAt: new Date(), // Data de criação da sala
            });
            setSalaId(salaRef.id); // Armazena o ID da sala criada
            alert(`Sala criada com sucesso! ID da sala: ${salaRef.id}`);
        } catch (error) {
            console.error("Erro ao criar sala: ", error);
            setError("Erro ao criar sala. Tente novamente mais tarde.");
        }
    };

    // Busca os detalhes do quiz quando o componente é montado
    useEffect(() => {
        fetchQuizDetails();
    }, [id]);

    // Exibe uma mensagem de carregamento enquanto os dados estão sendo buscados
    if (loading) {
        return <div>Carregando detalhes do quiz...</div>;
    }

    // Exibe uma mensagem de erro se o quiz não for encontrado ou ocorrer um erro
    if (error) {
        return <div>{error}</div>;
    }

    // Exibe os detalhes do quiz e um botão para criar uma sala
    return (
        <div id="QuizDetails">
            <h1>{quiz.title}</h1>
            <p>Clique no botão abaixo para criar uma sala e compartilhar o ID com outras pessoas:</p>
            <button onClick={criarSala} disabled={salaId !== null}>
                {salaId ? `Sala Criada (ID: ${salaId})` : "Criar Sala"}
            </button>

            {salaId && (
                <div>
                    <p>Compartilhe o ID da sala com outras pessoas: <strong>{salaId}</strong></p>
                    <button onClick={() => navigate(`/sala/${salaId}`)}>
                        Entrar na Sala
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizDetails;