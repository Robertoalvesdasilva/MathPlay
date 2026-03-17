// Substitua o localhost pelo link que o Render te deu
const API_BASE_URL = 'https://mathplay-api.onrender.com';

// Função que será executada quando o botão for clicado
function iniciarJogo() {
    console.log("Botão clicado! Preparando o jogo...");

    const dificuldade = document.getElementById('difficulty-select').value;
    const modalidade = document.getElementById('modality-select').value;

    // Constrói a URL para a página de jogo com os parâmetros
    const urlDestino = `play.html?difficulty=${dificuldade}&modality=${modalidade}`;
    
    console.log("Redirecionando para:", urlDestino);
    window.location.href = urlDestino;
}

// Carregar o Ranking do Servidor
async function carregarRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        const dados = await response.json();
        const listaUI = document.getElementById('leaderboard-list');
        
        if (dados.length === 0) {
            listaUI.innerHTML = "<li>Nenhum recorde ainda!</li>";
            return;
        }

        listaUI.innerHTML = dados.map((item, index) => `
            <li>
                <strong>${index + 1}º</strong> ${item.username} - ${item.score} pts
            </li>
        `).join('');
    } catch (erro) {
        console.error("Erro ao carregar ranking:", erro);
        document.getElementById('leaderboard-list').innerHTML = "<li>Servidor Offline</li>";
    }
}

// Configurações iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('mathplay_token');
    const username = localStorage.getItem('mathplay_username');

    // 1. Verificação de segurança (Login)
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Preencher dados do jogador na tela
    document.getElementById('welcome-username').innerText = username || 'Jogador';
    
    // 3. Ativar o clique do botão "Começar Jogo"
    const btnComecar = document.getElementById('start-game-button');
    if (btnComecar) {
        btnComecar.addEventListener('click', iniciarJogo);
    }

    // 4. Ativar o botão de Sair
    const btnSair = document.getElementById('logout-button');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 5. Carregar o ranking
    carregarRanking();
});