const API_BASE_URL = 'https://mathplay-api.onrender.com';

// Variáveis de Estado do Jogo
let currentUserId = null, currentUsername = null, token = null;
let currentDifficulty = 'easy', currentModality = 'arithmetic';
let score = 0, currentQuestion = { text: '', answer: null };
let questionIndex = 0; 
const TOTAL_QUESTIONS = 10;
let lives = 3; 
let totalTimeSec = 180; // 3 minutos de jogo
let totalTimerId = null;

// --- Funções de Auxílio ---

function getQueryParams() {
    const p = {};
    const s = window.location.search.substring(1);
    if (!s) return p;
    s.split('&').forEach(x => {
        const [k, v] = x.split('=');
        p[k] = decodeURIComponent(v || '');
    });
    return p;
}

// Atualiza o HUD com ícones e cores
function updateLivesDisplay() {
    const livesSpan = document.getElementById('game-lives');
    // Adiciona o coração com a classe de cor vermelha definida no CSS
    livesSpan.innerHTML = `Vidas: <span class="heart-red">${"❤".repeat(lives)}</span>`;
}

// --- Lógica de Geração de Questões ---

function generateArithmeticQuestion(difficulty) {
    let a, b, operator;
    const operators = ['+', '-', '*'];
    operator = operators[Math.floor(Math.random() * operators.length)];

    if (difficulty === 'easy') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === 'medium') {
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
    } else {
        a = Math.floor(Math.random() * 100) + 10;
        b = Math.floor(Math.random() * 100) + 10;
    }

    const questionText = `${a} ${operator} ${b}`;
    const correctAnswer = eval(questionText); 
    return { text: questionText + " = ?", answer: correctAnswer };
}

function generateAlgebraQuestion() {
    let x = Math.floor(Math.random() * 10) + 1; 
    let a = Math.floor(Math.random() * 5) + 2;
    let b = Math.floor(Math.random() * 10) + 1;
    let c = a * x + b;

    return { 
        text: `Encontre X: ${a}x + ${b} = ${c}`, 
        answer: x 
    };
}

function newQuestion() {
    if (questionIndex >= TOTAL_QUESTIONS || lives <= 0) {
        endGame();
        return;
    }

    const input = document.getElementById('answer-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    
    document.getElementById('feedback').innerText = '';

    if (currentModality === 'arithmetic') {
        currentQuestion = generateArithmeticQuestion(currentDifficulty);
    } else {
        currentQuestion = generateAlgebraQuestion();
    }

    document.getElementById('question').innerText = currentQuestion.text;
    questionIndex++;
    
    // Atualiza o marcador de progresso colorido
    document.getElementById('game-progress').innerText = `📝 Questão: ${questionIndex}/${TOTAL_QUESTIONS}`;
}

// --- Lógica do Jogo ---

function checkAnswer() {
    const inputField = document.getElementById('answer-input');
    const userAnswer = parseInt(inputField.value);
    const feedback = document.getElementById('feedback');

    if (isNaN(userAnswer)) return; 

    if (userAnswer === currentQuestion.answer) {
        score += (currentDifficulty === 'hard' ? 30 : currentDifficulty === 'medium' ? 20 : 10);
        feedback.innerText = "CORRETO! 🌟";
        feedback.style.color = "#00ce8c"; // Verde sucesso
    } else {
        lives--;
        feedback.innerText = `ERROU! Resposta: ${currentQuestion.answer}`;
        feedback.style.color = "#ff4757"; // Vermelho erro
        updateLivesDisplay();
    }

    document.getElementById('game-score').innerText = `⭐ Pontos: ${score}`;
    
    if (lives <= 0) {
        setTimeout(() => endGame(), 1000);
    } else {
        setTimeout(() => newQuestion(), 1200);
    }
}

async function endGame() {
    clearInterval(totalTimerId);
    const token = localStorage.getItem('mathplay_token');
    
    const payload = {
        score: score,
        difficulty: currentDifficulty,
        modality: currentModality
    };

    try {
        await fetch(`${API_BASE_URL}/submit_score`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        alert(`Fim de Jogo! Pontuação: ${score}`);
    } catch (err) {
        console.error("Erro ao salvar:", err);
    }
    
    window.location.href = 'game.html';
}

// --- Inicialização e Botões de Navegação ---

document.addEventListener('DOMContentLoaded', () => {
    currentUsername = localStorage.getItem('mathplay_username') || 'Fulano';
    token = localStorage.getItem('mathplay_token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const params = getQueryParams();
    currentDifficulty = params.difficulty || 'easy';
    currentModality = params.modality || 'arithmetic';

    // Preenche os marcadores coloridos com os textos personalizados
    document.getElementById('player-name').innerText = `👤 Jogador: ${currentUsername}`;
    document.getElementById('game-difficulty').innerText = `🎯 Dificuldade: ${currentDifficulty.toUpperCase()}`;
    document.getElementById('game-modality').innerText = `🧩 Modalidade: ${currentModality.toUpperCase()}`;
    document.getElementById('game-score').innerText = `⭐ Pontuação: 0`;
    
    updateLivesDisplay();

    // Eventos
    document.getElementById('submit-answer-button').onclick = checkAnswer;

    // Botão Voltar (Menu)
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.onclick = () => {
            if(confirm("Voltar para a seleção? Seu progresso atual será perdido.")) {
                window.location.href = 'game.html';
            }
        };
    }

    // Botão Sair (Logout)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => {
            if(confirm("Deseja encerrar sua sessão e sair?")) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        };
    }

    // Timer Global
    totalTimerId = setInterval(() => {
        totalTimeSec--;
        const mins = Math.floor(totalTimeSec / 60);
        const secs = totalTimeSec % 60;
        const timerDisplay = document.getElementById('game-timer');
        if (timerDisplay) {
            timerDisplay.innerText = `⏱️ Tempo: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        
        if (totalTimeSec <= 0) endGame();
    }, 1000);

    newQuestion();
});