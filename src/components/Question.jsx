import { useContext } from 'react';
import { QuizContext } from '../context/quiz';

import Option from './Option';

import './Question.css';

const Question = () => {
  const [quizState, dispatch] = useContext(QuizContext);
  const currentQuestion = quizState.questions[quizState.currentQuestion]
    /* Esse é o objeto pergunta*/

  const onSelectOption = (option) => {
    dispatch({
      type: "CHECK_ANSWER",
      payload: {answer: currentQuestion.answer, option},       /*Payload envia dados*/
    });
  };

  return (
    <div id="question">
        <p>
            Pergunta {quizState.currentQuestion + 1} de {quizState.questions.length}
        </p>
        <h2>{currentQuestion.question}</h2>
        <div id="options-container">
            {currentQuestion.options.map((option) => (
              <Option
              option={option}
              key={option}
              answer={currentQuestion.answer}
              selectOption={() => onSelectOption(option )}
              />
            ))}
        </div>
        {quizState.answerSelected && (
          <button onClick={() => dispatch({type: "CHANGE_QUESTION"})}>
            Continuar
          </button>
        )}
    </div>
  )
}

export default Question;