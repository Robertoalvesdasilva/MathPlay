// Link do seu servidor no Render
const API_BASE_URL = 'https://mathplay-api.onrender.com';

// --- 1. FUNÇÕES DE BUSCA DE DADOS ---

// Busca a Melhor Pontuação e Nome Real do Servidor
async function carregarDadosDoUsuario() {
    const token = localStorage.getItem('mathplay_token');
    const displayScore = document.getElementById('display-best-score');
    const displayUser = document.getElementById('welcome-username');

    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
            // Atualiza a pontuação na tela (se vier nulo, coloca 0)
            if (displayScore) displayScore.innerText = data.best_score || 0;
            // Garante que o nome exibido seja o do banco de dados
            if (displayUser) displayUser.innerText = data.username || "Jogador";
        }
    } catch (err) {
        console.error("Erro ao buscar dados do perfil:", err);
    }
}

// Carrega o Top 10 Global
async function carregarRanking() {
    const listaUI = document.getElementById('leaderboard-list');
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        const dados = await response.json();
        
        if (!listaUI) return;

        if (dados.length === 0) {
            listaUI.innerHTML = "<li>Nenhum recorde ainda! 🚀</li>";
            return;
        }

        listaUI.innerHTML = dados.map((item, index) => `
            <li>
                <strong>${index + 1}º</strong> ${item.username} - ${item.score} pts
            </li>
        `).join('');
    } catch (erro) {
        console.error("Erro ao carregar ranking:", erro);
        if (listaUI) listaUI.innerHTML = "<li>Servidor Offline</li>";
    }
}

// --- 2. FUNÇÕES DE INTERFACE ---

function exibirFraseMotivacional() {
    const frases = [
        "O topo do ranking espera por você! 🏆",
        "Cada acerto te deixa mais perto do 1º lugar!",
        "Mostre que você é o mestre dos números! 🧠",
        "O ranking global é o seu próximo desafio!",
        "Quem será o próximo número 1? Pode ser você! 🔥",
        "Desafie seus limites e suba no Top 10!",
        "Matematika+ é para os fortes. Vamos pra cima! 👍"
    ];
    const campoFrase = document.getElementById('motivation-phrase');
    if (campoFrase) {
        const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
        campoFrase.innerText = fraseAleatoria;
    }
}

function iniciarJogo() {
    const dificuldade = document.getElementById('difficulty-select').value;
    const modalidade = document.getElementById('modality-select').value;
    
    // Redireciona com os parâmetros de dificuldade
    window.location.href = `play.html?difficulty=${dificuldade}&modality=${modalidade}`;
}

// --- 3. INICIALIZAÇÃO (EVENT LISTENER ÚNICO) ---

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('mathplay_token');

    // Segurança: Se não tiver token, volta para o login
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Carregamento de Dados
    exibirFraseMotivacional();
    carregarDadosDoUsuario(); // Aqui carrega a Melhor Pontuação
    carregarRanking();

    // Configuração do Botão "Começar Jogo"
    const btnComecar = document.getElementById('start-game-button');
    if (btnComecar) {
        btnComecar.addEventListener('click', iniciarJogo);
    }

    // Configuração do Botão "Sair"
    const btnSair = document.getElementById('logout-button');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});