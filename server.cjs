const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000; // Porta do servidor

app.use(cors()); // Permite requisições do frontend
app.use(bodyParser.json()); // Habilita JSON no corpo das requisições

// Função para garantir que a pasta existe
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

// Rota para salvar o quiz como um arquivo JSON
app.post("/save-quiz", (req, res) => {
    const quizData = req.body;

    if (!quizData.title || quizData.questions.length === 0) {
        return res.status(400).json({ error: "Título e perguntas são obrigatórios" });
    }

    const fileName = quizData.title.replace(/\s+/g, "_") + ".json";
    const filePath = path.join(__dirname, "src", "data", "quiz", fileName);

    // Garantir que a pasta existe
    ensureDirectoryExistence(filePath);

    fs.writeFile(filePath, JSON.stringify(quizData, null, 2), (err) => {
        if (err) {
            console.error("Erro ao salvar o arquivo:", err);
            return res.status(500).json({ error: "Erro ao salvar o quiz" });
        }
        res.json({ message: "Quiz salvo com sucesso!", filePath });
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});