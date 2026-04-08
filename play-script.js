const API_BASE_URL = "https://mathplay-api.onrender.com";

// --- VARIÁVEIS DO JOGO ---
let score = 0;
let lives = 3;
let currentQuestion = 1;
const totalQuestions = 10;
let timeLeft = 180; // 3 minutos
let correctAnswer = 0;
let timerInterval;

// Dados recuperados do Dashboard
const difficulty = localStorage.getItem('game_difficulty') || 'easy';
const modality = localStorage.getItem('game_modality') || 'arithmetic';
const username = localStorage.getItem('username') || 'Jogador';

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Preenche o HUD (cabeçalho do jogo)
    document.getElementById('player-name').innerText = `👤 ${username}`;
    document.getElementById('game-difficulty').innerText = `🎯 ${difficulty.toUpperCase()}`;
    document.getElementById('game-modality').innerText = `🧩 ${modality.toUpperCase()}`;
    
    startTimer();
    generateQuestion();

    // Evento do botão enviar
    document.getElementById('submit-answer-button').onclick = checkAnswer;
    
    // Enviar com a tecla "Enter"
    document.getElementById('answer-input').onkeyup = (e) => {
        if (e.key === 'Enter') checkAnswer();
    };

    // Botões de navegação
    document.getElementById('btn-back').onclick = () => window.location.href = 'game.html';
    document.getElementById('btn-logout').onclick = () => {
        localStorage.clear();
        window.location.href = 'index.html';
    };
});

// --- LÓGICA DO CRONÔMETRO ---
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('game-timer').innerText = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) endGame("O tempo acabou! ⏰");
    }, 1000);
}

// --- GERADOR DE QUESTÕES ---
function generateQuestion() {
    let n1, n2;
    const input = document.getElementById('answer-input');
    input.value = '';
    input.focus();

    document.getElementById('game-progress').innerText = `📝 Questão: ${currentQuestion}/${totalQuestions}`;

    if (modality === 'arithmetic') {
        // Lógica de Aritmética
        n1 = Math.floor(Math.random() * (difficulty === 'hard' ? 100 : 20));
        n2 = Math.floor(Math.random() * (difficulty === 'hard' ? 50 : 20));
        const op = Math.random() > 0.5 ? '+' : '-';
        correctAnswer = op === '+' ? n1 + n2 : n1 - n2;
        document.getElementById('question').innerText = `${n1} ${op} ${n2} = ?`;
    } else {
        // Lógica de Álgebra (Ex: 2x = 10)
        let x = Math.floor(Math.random() * 10) + 1;
        let factor = Math.floor(Math.random() * 5) + 2;
        let result = x * factor;
        correctAnswer = x;
        document.getElementById('question').innerText = `${factor}x = ${result}`;
    }
}

// --- VERIFICAR RESPOSTA ---
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer-input').value);
    
    if (userAnswer === correctAnswer) {
        score += (difficulty === 'hard' ? 15 : 10);
        document.getElementById('game-score').innerText = `⭐ Pontos: ${score}`;
    } else {
        lives--;
        updateLivesUI();
        if (lives <= 0) return endGame("Suas vidas acabaram! 🔥");
    }

    if (currentQuestion >= totalQuestions) {
        endGame("Parabéns! Você concluiu o desafio! 🏆");
    } else {
        currentQuestion++;
        generateQuestion();
    }
}

// --- ATUALIZAR CORAÇÕES ---
function updateLivesUI() {
    const hearts = "❤".repeat(lives);
    document.getElementById('game-lives').innerHTML = ` Vidas: <span class="heart-red">${hearts}</span>`;
}

// --- FINALIZAR JOGO E SALVAR NO RENDER ---
async function endGame(message) {
    clearInterval(timerInterval);
    alert(`${message}\nPontuação Final: ${score}`);

    const token = localStorage.getItem('access_token');
    
    // Salva a pontuação no banco de dados do Render
    try {
        await fetch(`${API_BASE_URL}/submit_score`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                score: score,
                difficulty: difficulty,
                modality: modality
            })
        });
    } catch (err) {
        console.error("Erro ao salvar score:", err);
    }

    window.location.href = 'game.html';
}