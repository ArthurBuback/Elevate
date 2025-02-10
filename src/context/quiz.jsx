import { createContext, useReducer } from "react";
import questions from '../data/question'

const STAGES = ["Start", "Playing", "End"]

/* Quando se usa o "usereducer", pode-se ter um estado inicial (o que acontece quando o cara entra na aplciação) */

const initialState = {
    gameStage: STAGES [0],
    questions,
    currentQuestion: 0,
    score: 0,
    answerSelected: false,
}

const quizReducer = (state, action) => {

    switch(action.type) {
        case "CHANGE_STATE":{
            return {
                ...state,       /*Usamos stageOperator para mandar-mos a informação durante a mudança de STAGES (salvando o estado anterior*/
                gameStage: STAGES[1],
            };
        }

        case "REORDER_QUESTIONS":{
            const reorderedQuestions = questions.sort(() => {
                return Math.random() - 0.5;
            });

            return {
                ...state,
                questions: reorderedQuestions
            };
        }

        case "CHANGE_QUESTION":{
            const nextQuestion = state.currentQuestion + 1;
            let endGame = false

            if(!questions[nextQuestion]){
                endGame = true;
            }

            return{
                ...state,
                currentQuestion: nextQuestion,
                gameStage: endGame ? STAGES[2]: state.gameStage,
                answerSelected: false,
            }
        }

        case "NEW_GAME":{
            return initialState;
        }

        case "CHECK_ANSWER":{
            if(state.answerSelected) return state;

            const answer = action.payload.answer;
            const option = action.payload.option;
            let correctAnswer = 0;

            if(answer === option) correctAnswer = 1;

            return{
                ...state,
                score: state.score + correctAnswer,
                answerSelected: option,
            }
        }

        default:
            return state;
    }
}

export const QuizContext = createContext();

/*QuizContext é um contexto que a gente quer prover, e através dessa aplicação a baixo é onde esse contexto é habilitado*/

export const QuizProvider = ({ children }) => { /*children são componentes dentro de componentes*/
    const value = useReducer(quizReducer, initialState);

    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
