import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Criar from "./pages/CreateQuiz";
import QuizList from "./pages/QuizList";
import Sala from "./pages/Sala";
import QuizPage from "./pages/QuizPage";
import Resultado from "./pages/Resultado"; // Importe o novo componente
import Welcome from "./pages/Welcome";
import JoinRoom from "./pages/JoinRoom";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/join-room" element={<JoinRoom />} />
                <Route path="/criar" element={<Criar />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/sala/:id" element={<Sala />} />
                <Route path="/quiz/:quizId" element={<QuizPage />} />
                <Route path="/quiz/:quizId/question/:questionId" element={<QuizPage />} />
                <Route path="/resultado/:corretas/:total" element={<Resultado />} /> {/* Nova rota */}
            </Routes>
        </Router>
    );
};

export default App;