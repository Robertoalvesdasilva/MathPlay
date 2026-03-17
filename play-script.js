// Antes estava assim:
// const API_BASE_URL = 'http://127.0.0.1:5000';

// Deve ficar assim (Substitua pelo SEU link do Render):
const API_BASE_URL = 'https://mathplay-api.onrender.com';

// Variáveis de Estado do Jogo
let currentUserId = null, currentUsername = null, token = null;
let currentDifficulty = 'easy', currentModality = 'arithmetic';
let score = 0, currentQuestion = { text: '', answer: null };
let questionIndex = 0; 
const TOTAL_QUESTIONS = 10;
let lives = 3; 
let totalTimeSec = 180; // 3 minutos de jogo
let perQuestionTimeSec = 20; 
let totalTimerId = null, roundTimerId = null, roundRemaining = perQuestionTimeSec;

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

function showMessageModal(title, message) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('message-modal-overlay').classList.remove('hidden');
}

function hideMessageModal() {
    document.getElementById('message-modal-overlay').classList.add('hidden');
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

function generateAlgebraQuestion(difficulty) {
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
    input.value = '';
    input.focus();
    document.getElementById('feedback').innerText = '';

    if (currentModality === 'arithmetic') {
        currentQuestion = generateArithmeticQuestion(currentDifficulty);
    } else {
        currentQuestion = generateAlgebraQuestion(currentDifficulty);
    }

    document.getElementById('question').innerText = currentQuestion.text;
    questionIndex++;
    document.getElementById('game-progress').innerText = `Questão: ${questionIndex}/${TOTAL_QUESTIONS}`;
    
    // Reset do timer da questão
    roundRemaining = perQuestionTimeSec;
}

// --- Lógica do Jogo ---

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer-input').value);
    const feedback = document.getElementById('feedback');

    if (userAnswer === currentQuestion.answer) {
        score += (currentDifficulty === 'hard' ? 30 : currentDifficulty === 'medium' ? 20 : 10);
        feedback.innerText = "Correto! 🌟";
        feedback.style.color = "green";
    } else {
        lives--;
        feedback.innerText = `Errado! A resposta era ${currentQuestion.answer}`;
        feedback.style.color = "red";
        updateLivesDisplay();
    }

    document.getElementById('game-score').innerText = `Pontuação: ${score}`;
    
    if (lives <= 0) {
        setTimeout(() => endGame(), 1000);
    } else {
        setTimeout(() => newQuestion(), 1000);
    }
}

function updateLivesDisplay() {
    const livesSpan = document.getElementById('game-lives');
    livesSpan.innerText = "Vidas: " + "❤".repeat(lives);
}

async function endGame() {
    clearInterval(totalTimerId);
    const token = localStorage.getItem('mathplay_token');
    
    const payload = {
        user_id: currentUserId,
        username: currentUsername,
        score: score,
        difficulty: currentDifficulty,
        modality: currentModality
    };

    try {
        const res = await fetch(`${API_BASE_URL}/submit_score`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(`Fim de Jogo! Pontuação enviada: ${score}`);
        } else {
            alert(`Fim de Jogo! Pontuação: ${score} (Erro ao salvar no servidor)`);
        }
    } catch (err) {
        console.error("Erro ao salvar:", err);
    }
    
    window.location.href = 'game.html';
}

// --- Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
    currentUserId = localStorage.getItem('mathplay_user_id');
    currentUsername = localStorage.getItem('mathplay_username');
    token = localStorage.getItem('mathplay_token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const params = getQueryParams();
    currentDifficulty = params.difficulty || 'easy';
    currentModality = params.modality || 'arithmetic';

    document.getElementById('player-name').innerText = `Jogador: ${currentUsername}`;
    document.getElementById('game-difficulty').innerText = `Dificuldade: ${currentDifficulty}`;
    document.getElementById('game-modality').innerText = `Modalidade: ${currentModality}`;

    document.getElementById('submit-answer-button').addEventListener('click', checkAnswer);
    document.getElementById('modal-close-button').addEventListener('click', hideMessageModal);
    document.getElementById('back-to-selection-button').addEventListener('click', () => window.location.href = 'game.html');

    // Timer Global
    totalTimerId = setInterval(() => {
        totalTimeSec--;
        const mins = Math.floor(totalTimeSec / 60);
        const secs = totalTimeSec % 60;
        document.getElementById('game-timer').innerText = `Tempo: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        if (totalTimeSec <= 0) endGame();
    }, 1000);

    newQuestion();
});