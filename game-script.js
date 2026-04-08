// Substitua pela URL do seu servidor no Render
const API_BASE_URL = "https://mathplay-api.onrender.com"; 

// --- INICIALIZAÇÃO AO CARREGAR A PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserData();
    loadLeaderboards();
    setupEventListeners();
});

// --- VERIFICAÇÃO DE LOGIN ---
function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html'; // Volta para o login se não tiver token
    }
}

// --- CARREGAR DADOS DO USUÁRIO (NOME E RECORDE) ---
async function loadUserData() {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('welcome-username').innerText = data.username;
            document.getElementById('display-best-score').innerText = data.best_score;
            setMotivationPhrase();
        } else {
            logout(); // Se o token estiver vencido, desloga
        }
    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
    }
}

// --- CARREGAR OS RANKINGS EM COLUNAS ---
async function loadLeaderboards() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        const data = await response.json();

        const arithList = document.getElementById('list-arithmetic');
        const algeList = document.getElementById('list-algebra');

        // Limpa e Preenche Aritmética
        if (arithList) {
            arithList.innerHTML = data.arithmetic.length > 0 
                ? data.arithmetic.map((p, i) => `<li><span>${i+1}º ${p.username}</span> <b>${p.total} pts</b></li>`).join('')
                : '<li>Ainda não há pontuações</li>';
        }

        // Limpa e Preenche Álgebra
        if (algeList) {
            algeList.innerHTML = data.algebra.length > 0 
                ? data.algebra.map((p, i) => `<li><span>${i+1}º ${p.username}</span> <b>${p.total} pts</b></li>`).join('')
                : '<li>Ainda não há pontuações</li>';
        }

    } catch (error) {
        console.error("Erro ao carregar rankings:", error);
    }
}

// --- CONFIGURAÇÃO DA PARTIDA ---
function setupEventListeners() {
    // Botão Iniciar Jogo
    const startBtn = document.getElementById('start-game-button');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const difficulty = document.getElementById('difficulty-select').value;
            const modality = document.getElementById('modality-select').value;
            
            // Salva as configurações para usar na tela de jogo
            localStorage.setItem('game_difficulty', difficulty);
            localStorage.setItem('game_modality', modality);
            
            // Redireciona para a tela onde o jogo acontece de fato
            window.location.href = 'match.html'; 
        });
    }

    // Botão Sair
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// --- FRASES DE MOTIVAÇÃO ---
function setMotivationPhrase() {
    const phrases = [
        "Matemática é o alfabeto com que Deus escreveu o universo. ✨",
        "Pronto para bater seu recorde hoje? 🚀",
        "O erro é o primeiro passo para o acerto! 💪",
        "Desafie sua mente e conquiste o ranking! 🏆"
    ];
    const phraseElement = document.getElementById('motivation-phrase');
    if (phraseElement) {
        phraseElement.innerText = phrases[Math.floor(Math.random() * phrases.length)];
    }
}

// --- LOGOUT ---
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}