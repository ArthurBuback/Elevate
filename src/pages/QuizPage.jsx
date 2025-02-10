import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import "./QuizPage.css";

const QuizPage = () => {
    const { quizId } = useParams();
    const [searchParams] = useSearchParams();
    const playerName = searchParams.get('player');
    const location = useLocation();
    const salaId = new URLSearchParams(location.search).get('sala');
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [sala, setSala] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!salaId) return;

        const salaRef = doc(firestore, "salas", salaId);
        const unsubscribe = onSnapshot(salaRef, (doc) => {
            if (doc.exists()) {
                const salaData = doc.data();
                setSala(salaData);
                setCurrentQuestion(salaData.currentQuestion || 0);
                setSelectedAnswer(null); // Reset selected answer when moving to the next question
                const currentPlayer = salaData.players?.find(p => p.name === playerName);
                setIsAdmin(currentPlayer?.isAdmin || false);
            }
        });

        return () => unsubscribe();
    }, [salaId, playerName]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quizRef = doc(firestore, "quizzes", quizId);
                const quizSnap = await getDoc(quizRef);
                
                if (quizSnap.exists()) {
                    setQuiz(quizSnap.data());
                } else {
                    setError("Quiz não encontrado");
                }
            } catch (error) {
                console.error("Erro ao carregar o quiz:", error);
                setError("Erro ao carregar o quiz");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const handleNextQuestion = async () => {
        if (!isAdmin || !salaId || !quiz) return;
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion >= quiz.questions.length) return;
        
        try {
            const salaRef = doc(firestore, "salas", salaId);
            await updateDoc(salaRef, {
                currentQuestion: nextQuestion
            });
            setSelectedAnswer(null); // Reset answer selection for the next question
        } catch (error) {
            console.error("Erro ao avançar para a próxima questão:", error);
        }
    };

    const handleFinishQuiz = () => {
        navigate(`/resultado/${score}/${quiz.questions.length}`);
    };

    if (loading) return <div>Carregando quiz...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return <div className="error">Nenhuma pergunta encontrada.</div>;
    }

    const currentQuestionData = quiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;

    return (
        <div className="quiz-page">
            <div className="quiz-header">
                <h1>{quiz.title}</h1>
                <p>Questão {currentQuestion + 1} de {quiz.questions.length}</p>
                <p>Jogador: {playerName}</p>
            </div>

            <div className="question-container">
                <h2>{currentQuestionData.text}</h2>
                <div className="answers-list">
                    {currentQuestionData.options.map((option, index) => (
                        <button
                            key={index}
                            className={`answer-button ${selectedAnswer === index ? 'selected' : ''}`}
                            onClick={() => setSelectedAnswer(index)}
                            disabled={selectedAnswer !== null}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>

            {isAdmin && !isLastQuestion && (
                <button className="next-question-button" onClick={handleNextQuestion}>
                    Próxima Questão
                </button>
            )}

            {isLastQuestion && (
                <button className="finish-quiz-button" onClick={handleFinishQuiz}>
                    Finalizar Quiz
                </button>
            )}
        </div>
    );
};

export default QuizPage;
