const API_BASE_URL = 'https://mathplay-api.onrender.com';

let score = 0, lives = 3, questionIndex = 0;
let currentQuestion = { text: '', answer: null };
const TOTAL_QUESTIONS = 10;
let totalTimeSec = 180;
let timerId = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = 'index.html'; return; }

    // HUD inicial
    document.getElementById('player-name').innerText = `👤 ${localStorage.getItem('username')}`;
    document.getElementById('game-difficulty').innerText = `🎯 ${localStorage.getItem('game_difficulty').toUpperCase()}`;
    document.getElementById('game-modality').innerText = `🧩 ${localStorage.getItem('game_modality').toUpperCase()}`;

    // Controles
    document.getElementById('submit-answer-button').onclick = checkAnswer;
    document.getElementById('answer-input').onkeyup = (e) => { if(e.key === 'Enter') checkAnswer(); };
    document.getElementById('btn-back').onclick = () => { if(confirm("Sair?")) window.location.href='game.html'; };

    startTimer();
    newQuestion();
});

function startTimer() {
    timerId = setInterval(() => {
        totalTimeSec--;
        let mins = Math.floor(totalTimeSec / 60);
        let secs = totalTimeSec % 60;
        document.getElementById('game-timer').innerText = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (totalTimeSec <= 0) endGame("Tempo esgotado!");
    }, 1000);
}

function newQuestion() {
    if (questionIndex >= TOTAL_QUESTIONS || lives <= 0) { endGame("Fim da partida!"); return; }
    
    const input = document.getElementById('answer-input');
    input.value = ''; input.focus();
    document.getElementById('feedback').innerText = '';

    const diff = localStorage.getItem('game_difficulty');
    const mod = localStorage.getItem('game_modality');

    if (mod === 'arithmetic') {
        let a = Math.floor(Math.random() * (diff === 'hard' ? 100 : 20)) + 1;
        let b = Math.floor(Math.random() * 20) + 1;
        let op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
        currentQuestion = { text: `${a} ${op} ${b} = ?`, answer: eval(`${a}${op}${b}`) };
    } else {
        let x = Math.floor(Math.random() * 10) + 1;
        let a = Math.floor(Math.random() * 5) + 2;
        currentQuestion = { text: `Resolva X: ${a}x = ${a * x}`, answer: x };
    }

    document.getElementById('question').innerText = currentQuestion.text;
    questionIndex++;
    document.getElementById('game-progress').innerText = `📝 Questão: ${questionIndex}/${TOTAL_QUESTIONS}`;
}

function checkAnswer() {
    const userAns = parseInt(document.getElementById('answer-input').value);
    const feedback = document.getElementById('feedback');
    if (isNaN(userAns)) return;

    if (userAns === currentQuestion.answer) {
        score += (localStorage.getItem('game_difficulty') === 'hard' ? 30 : 10);
        feedback.innerText = "Boa! ✨"; feedback.style.color = "#00ce8c";
    } else {
        lives--;
        feedback.innerText = "Errou! ❌"; feedback.style.color = "#ff4757";
        document.getElementById('game-lives').innerHTML = `Vidas: <span class="heart-red">${"❤".repeat(lives)}</span>`;
    }

    document.getElementById('game-score').innerText = `⭐ Pontos: ${score}`;
    setTimeout(newQuestion, 1000);
}

async function endGame(msg) {
    clearInterval(timerId);
    alert(`${msg}\nScore: ${score}`);
    try {
        await fetch(`${API_BASE_URL}/submit_score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
            body: JSON.stringify({ score, difficulty: localStorage.getItem('game_difficulty'), modality: localStorage.getItem('game_modality') })
        });
    } catch (e) { console.error(e); }
    window.location.href = 'game.html';
}