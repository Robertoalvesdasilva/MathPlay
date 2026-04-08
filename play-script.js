const API_BASE_URL = 'https://mathplay-api.onrender.com';

// --- VARIÁVEIS DE ESTADO DO JOGO ---
let currentUsername = null, token = null;
let currentDifficulty = 'easy', currentModality = 'arithmetic';
let score = 0, currentQuestion = { text: '', answer: null };
let questionIndex = 0; 
const TOTAL_QUESTIONS = 10;
let lives = 3; 
let totalTimeSec = 180; // 3 minutos
let totalTimerId = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pega os dados que o LOGIN e o DASHBOARD salvaram
    token = localStorage.getItem('access_token');
    currentUsername = localStorage.getItem('username') || 'Jogador';
    currentDifficulty = localStorage.getItem('game_difficulty') || 'easy';
    currentModality = localStorage.getItem('game_modality') || 'arithmetic';

    // 2. Verifica se o usuário está logado
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 3. Preenche o visual do jogo (HUD)
    document.getElementById('player-name').innerText = `👤 Jogador: ${currentUsername}`;
    document.getElementById('game-difficulty').innerText = `🎯 Dificuldade: ${currentDifficulty.toUpperCase()}`;
    document.getElementById('game-modality').innerText = `🧩 Modalidade: ${currentModality.toUpperCase()}`;
    document.getElementById('game-score').innerText = `⭐ Pontuação: 0`;
    
    updateLivesDisplay();
    setupControls();
    startTimer();
    newQuestion();
});

// --- FUNÇÕES DE SUPORTE ---

function setupControls() {
    // Botão enviar
    document.getElementById('submit-answer-button').onclick = checkAnswer;

    // Atalho: Tecla Enter para enviar
    document.getElementById('answer-input').onkeyup = (e) => {
        if (e.key === 'Enter') checkAnswer();
    };

    // Botão Voltar
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.onclick = () => {
            if(confirm("Voltar para o menu? Seu progresso será perdido.")) {
                window.location.href = 'game.html';
            }
        };
    }

    // Botão Sair
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => {
            if(confirm("Deseja sair da conta?")) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        };
    }
}

function startTimer() {
    totalTimerId = setInterval(() => {
        totalTimeSec--;
        const mins = Math.floor(totalTimeSec / 60);
        const secs = totalTimeSec % 60;
        const timerDisplay = document.getElementById('game-timer');
        if (timerDisplay) {
            timerDisplay.innerText = `⏱️ Tempo: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        if (totalTimeSec <= 0) endGame("O tempo acabou! ⏱️");
    }, 1000);
}

function updateLivesDisplay() {
    const livesSpan = document.getElementById('game-lives');
    livesSpan.innerHTML = `Vidas: <span class="heart-red">${"❤".repeat(lives)}</span>`;
}

// --- GERAÇÃO DE QUESTÕES ---

function newQuestion() {
    if (questionIndex >= TOTAL_QUESTIONS || lives <= 0) {
        endGame("Desafio concluído! 🏆");
        return;
    }

    const input = document.getElementById('answer-input');
    if (input) { input.value = ''; input.focus(); }
    document.getElementById('feedback').innerText = '';

    if (currentModality === 'arithmetic') {
        currentQuestion = generateArithmetic(currentDifficulty);
    } else {
        currentQuestion = generateAlgebra();
    }

    document.getElementById('question').innerText = currentQuestion.text;
    questionIndex++;
    document.getElementById('game-progress').innerText = `📝 Questão: ${questionIndex}/${TOTAL_QUESTIONS}`;
}

function generateArithmetic(difficulty) {
    let a, b, op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    let range = difficulty === 'hard' ? 100 : (difficulty === 'medium' ? 50 : 10);
    
    a = Math.floor(Math.random() * range) + 1;
    b = Math.floor(Math.random() * (range/2)) + 1;
    
    let text = `${a} ${op} ${b}`;
    return { text: text + " = ?", answer: eval(text) };
}

function generateAlgebra() {
    let x = Math.floor(Math.random() * 10) + 1; 
    let a = Math.floor(Math.random() * 5) + 2;
    let b = Math.floor(Math.random() * 10) + 1;
    let c = a * x + b;
    return { text: `Encontre X: ${a}x + ${b} = ${c}`, answer: x };
}

// --- VALIDAÇÃO ---

function checkAnswer() {
    const inputField = document.getElementById('answer-input');
    const userAnswer = parseInt(inputField.value);
    const feedback = document.getElementById('feedback');

    if (isNaN(userAnswer)) return; 

    if (userAnswer === currentQuestion.answer) {
        let points = currentDifficulty === 'hard' ? 30 : (currentDifficulty === 'medium' ? 20 : 10);
        score += points;
        feedback.innerText = "CORRETO! 🌟";
        feedback.style.color = "#00ce8c";
    } else {
        lives--;
        feedback.innerText = `ERROU! Resposta: ${currentQuestion.answer}`;
        feedback.style.color = "#ff4757";
        updateLivesDisplay();
    }

    document.getElementById('game-score').innerText = `⭐ Pontos: ${score}`;
    
    if (lives <= 0) {
        setTimeout(() => endGame("Game Over! Sem vidas. 🔥"), 1000);
    } else {
        setTimeout(() => newQuestion(), 1000);
    }
}

// --- SALVAR RESULTADO NO RENDER ---

async function endGame(msg) {
    clearInterval(totalTimerId);
    alert(`${msg}\nPontuação Final: ${score}`);

    try {
        await fetch(`${API_BASE_URL}/submit_score`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                score: score,
                difficulty: currentDifficulty,
                modality: currentModality
            })
        });
    } catch (err) {
        console.error("Erro ao salvar no servidor:", err);
    }
    
    window.location.href = 'game.html';
}