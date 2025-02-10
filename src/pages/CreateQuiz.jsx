import { useState } from "react";
import "./CreateQuiz.css";
import { Link } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Ajuste o caminho conforme necessário

// Hook personalizado para gerenciar o estado do quiz
const useQuizState = () => {
    const [quiz, setQuiz] = useState({
        title: "",
        questions: [],
    });

    const addQuestionToQuiz = (newQuestion) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            questions: [...prevQuiz.questions, newQuestion],
        }));
    };

    const removeQuestionFromQuiz = (index) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            questions: prevQuiz.questions.filter((_, i) => i !== index),
        }));
    };

    const updateQuizTitle = (title) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            title,
        }));
    };

    return { quiz, addQuestionToQuiz, removeQuestionFromQuiz, updateQuizTitle };
};

// Hook personalizado para gerenciar o estado de uma pergunta
const useQuestionState = () => {
    const [question, setQuestion] = useState({
        text: "",
        options: [],
        correctAnswer: "",
    });

    const addOptionToQuestion = (newOption) => {
        setQuestion((prevQuestion) => ({
            ...prevQuestion,
            options: [...prevQuestion.options, newOption],
        }));
    };

    const removeOptionFromQuestion = (index) => {
        setQuestion((prevQuestion) => ({
            ...prevQuestion,
            options: prevQuestion.options.filter((_, i) => i !== index),
        }));
    };

    const updateQuestionText = (text) => {
        setQuestion((prevQuestion) => ({
            ...prevQuestion,
            text,
        }));
    };

    const resetQuestion = () => {
        setQuestion({
            text: "",
            options: [],
            correctAnswer: "",
        });
    };

    // Função para marcar uma opção como correta e desmarcar as outras
    const markOptionAsCorrect = (index) => {
        setQuestion((prevQuestion) => {
            const updatedOptions = prevQuestion.options.map((option, i) => ({
                ...option,
                isCorrect: i === index, // Marca apenas a opção selecionada como correta
            }));

            return {
                ...prevQuestion,
                options: updatedOptions,
                correctAnswer: updatedOptions[index].text, // Atualiza a resposta correta
            };
        });
    };

    return {
        question,
        addOptionToQuestion,
        removeOptionFromQuestion,
        updateQuestionText,
        resetQuestion,
        markOptionAsCorrect,
    };
};

const CreateQuiz = () => {
    const { quiz, addQuestionToQuiz, removeQuestionFromQuiz, updateQuizTitle } = useQuizState();
    const {
        question,
        addOptionToQuestion,
        removeOptionFromQuestion,
        updateQuestionText,
        resetQuestion,
        markOptionAsCorrect,
    } = useQuestionState();

    const [currentOption, setCurrentOption] = useState({
        text: "",
        isCorrect: false,
    });

    // Adiciona uma nova opção à pergunta atual
    const handleAddOption = () => {
        if (currentOption.text.trim() === "") {
            alert("A opção não pode estar vazia.");
            return;
        }

        // Adiciona a opção à pergunta
        addOptionToQuestion(currentOption);
        setCurrentOption({ text: "", isCorrect: false }); // Reseta o estado da opção
    };

    // Adiciona a pergunta atual ao quiz
    const handleAddQuestion = () => {
        if (question.text.trim() === "") {
            alert("A pergunta não pode estar vazia.");
            return;
        }

        if (question.options.length < 2) {
            alert("Adicione pelo menos duas opções.");
            return;
        }

        const hasCorrectAnswer = question.options.some((option) => option.isCorrect);
        if (!hasCorrectAnswer) {
            alert("Marque uma opção como correta.");
            return;
        }

        const correctAnswer = question.options.find((option) => option.isCorrect).text;
        const newQuestion = {
            text: question.text,
            options: question.options,
            correctAnswer,
        };

        addQuestionToQuiz(newQuestion);
        resetQuestion(); // Reseta o estado da pergunta
    };

    // Submete o quiz para o Firebase Firestore
    const handleSubmitQuiz = async () => {
        if (quiz.title.trim() === "") {
            alert("Adicione um título ao quiz.");
            return;
        }

        if (quiz.questions.length === 0) {
            alert("Adicione pelo menos uma pergunta ao quiz.");
            return;
        }

        try {
            // Adiciona o quiz ao Firestore
            const docRef = await addDoc(collection(firestore, "quizzes"), {
                title: quiz.title,
                questions: quiz.questions,
                createdAt: new Date(),
            });

            alert("Quiz salvo com sucesso! ID: " + docRef.id);
        } catch (error) {
            console.error("Erro ao salvar quiz: ", error);
            alert("Erro ao salvar quiz.");
        }
    };

    return (
        <div id="CreateQuiz">
            <h1 id="cq">Criar Quiz</h1>

            {/* Título do Quiz */}
            <div className="input-group">
                <label htmlFor="quiz-title">Título do Quiz:</label>
                <input
                    id="quiz-title"
                    type="text"
                    placeholder="Digite o título do quiz"
                    value={quiz.title}
                    onChange={(e) => updateQuizTitle(e.target.value)}
                />
            </div>

            {/* Lista de Perguntas Adicionadas */}
            <div id="previous-questions">
                <h3>Perguntas Adicionadas:</h3>
                {quiz.questions.map((q, index) => (
                    <div key={index} className="question-card">
                        <button className="remove-button" onClick={() => removeQuestionFromQuiz(index)}>
                            Remover
                        </button>
                        <h4>Pergunta {index + 1}: {q.text}</h4>
                        <ul>
                            {q.options.map((opt, i) => (
                                <li key={i}>
                                    {opt.text} {opt.isCorrect && "(Correta)"}
                                </li>
                            ))}
                        </ul>
                        <p>Resposta Correta: {q.correctAnswer}</p>
                    </div>
                ))}
            </div>

            {/* Adicionar Nova Pergunta */}
            <div className="input-group">
                <label htmlFor="question-text">Nova Pergunta:</label>
                <input
                    id="question-text"
                    type="text"
                    placeholder="Digite a pergunta"
                    value={question.text}
                    onChange={(e) => updateQuestionText(e.target.value)}
                />
            </div>

            {/* Adicionar Opções à Pergunta */}
            <div className="input-group">
                <label htmlFor="option-text">Nova Opção:</label>
                <input
                    id="option-text"
                    type="text"
                    placeholder="Digite a opção"
                    value={currentOption.text}
                    onChange={(e) => setCurrentOption({ ...currentOption, text: e.target.value })}
                />
                <button onClick={handleAddOption}>Adicionar Opção</button>
            </div>

            {/* Lista de Opções da Pergunta Atual */}
            <div id="current-options">
                <h4>Opções Adicionadas:</h4>
                <ul>
                    {question.options.map((opt, index) => (
                        <li key={index}>
                            {opt.text} {opt.isCorrect && "(Correta)"}
                            <button className="remove-button" onClick={() => removeOptionFromQuestion(index)}>
                                Remover
                            </button>
                            <button
                                className="mark-correct-button"
                                onClick={() => markOptionAsCorrect(index)}
                            >
                                {opt.isCorrect ? "Desmarcar como Correta" : "Marcar como Correta"}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Botão para Adicionar a Pergunta ao Quiz */}
            <button onClick={handleAddQuestion}>Adicionar Pergunta</button>

            {/* Botão para Submeter o Quiz */}
            <Link to="/">
                <button onClick={handleSubmitQuiz}>Salvar Quiz</button>
            </Link>
        </div>
    );
};

export default CreateQuiz;