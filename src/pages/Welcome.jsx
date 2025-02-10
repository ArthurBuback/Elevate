import { useContext } from "react";
import { QuizContext } from "../context/quiz";

import Quiz from "../img/quiz.svg";

import "./Welcome.css"; 
import { Link } from "react-router-dom";

const Welcome = () => {
  const [quizState, dispatch] = useContext(QuizContext);


  return (
    <div id="welcome">
        <h2>Seja bem-vindo</h2>
        <p>Clique no botão abaixo para começar:</p>
        <Link to="/join-room">
          <button>
            Jogar
          </button>
        </Link>
        <Link to="/quizzes">
          <button>
            Criar Sala
          </button>
        </Link>
        <img src={Quiz} alt="Inicio do Quiz"/>
    </div>
  )
}

export default Welcome