import React from "react";
import { useParams } from "react-router-dom";
import "./Resultado.css"; // Estilos opcionais

const Resultado = () => {
    const { corretas, total } = useParams(); // Obtém o número de respostas corretas e o total de perguntas da URL

    return (
        <div id="Resultado">
            <h1>Resultado do Quiz</h1>
            <p>Você acertou {corretas} de {total} perguntas.</p>
        </div>
    );
};

export default Resultado;