// Antes estava assim:
// const API_BASE_URL = 'http://127.0.0.1:5000';

// Deve ficar assim (Substitua pelo SEU link do Render):
const API_BASE_URL = 'https://mathplay-api.onrender.com';

window.onload = function() {
    // 1. Pega o nome que salvamos no login
    const nomeSalvo = localStorage.getItem('mathplay_username');
    
    // 2. Procura o lugar no HTML (o <span> com id welcome-username)
    const campoNome = document.getElementById('welcome-username');

    // 3. Se encontrar o campo e o nome, ele escreve!
    if (campoNome && nomeSalvo) {
        campoNome.innerText = nomeSalvo;
    } else if (campoNome) {
        campoNome.innerText = "Jogador"; // Caso não ache o nome, não fica vazio
    }

    // 2. Sistema de Frases de Motivação
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
        // Escolhe uma frase aleatória da lista
        const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
        campoFrase.innerText = fraseAleatoria;
    }
    
};


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