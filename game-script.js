const API_BASE_URL = "https://mathplay-api.onrender.com";

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se o usuário está logado
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Carrega as informações da tela
    loadUserData(token);
    loadRankings();
    setupDashboardEvents();
});

// --- BUSCA DADOS DO USUÁRIO (NOME E RECORDE) ---
async function loadUserData(token) {
    try {
        const res = await fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            // Atualiza o nome e o melhor score na tela
            document.getElementById('welcome-username').innerText = data.username;
            document.getElementById('display-best-score').innerText = data.best_score;
            
            // Frase de motivação aleatória
            const phrases = [
                "Foque no processo!", 
                "A matemática é linda!", 
                "Bata seu recorde hoje!",
                "Você está evoluindo! 🚀"
            ];
            document.getElementById('motivation-phrase').innerText = phrases[Math.floor(Math.random() * phrases.length)];
        } else {
            // Se o token estiver vencido ou errado, desloga
            logout();
        }
    } catch (err) { 
        console.error("Erro ao carregar perfil:", err); 
    }
}

// --- BUSCA OS RANKINGS GLOBAIS ---
async function loadRankings() {
    try {
        const res = await fetch(`${API_BASE_URL}/leaderboard`);
        const data = await res.json();
        
        const renderList = (list, elementId) => {
            const el = document.getElementById(elementId);
            if (data[list] && data[list].length > 0) {
                el.innerHTML = data[list].map((p, i) => 
                    `<li><span>${i+1}º ${p.username}</span> <b>${p.total} pts</b></li>`
                ).join('');
            } else {
                el.innerHTML = "<li>Sem recordes ainda</li>";
            }
        };

        renderList('arithmetic', 'list-arithmetic');
        renderList('algebra', 'list-algebra');
    } catch (err) { 
        console.error("Erro no ranking:", err); 
    }
}

// --- CONFIGURA OS BOTÕES (CLIQUE) ---
function setupDashboardEvents() {
    const startBtn = document.getElementById('start-game-button');
    
    if (startBtn) {
        startBtn.onclick = () => {
            // Pega os valores selecionados nos <select>
            const difficulty = document.getElementById('difficulty-select').value;
            const modality = document.getElementById('modality-select').value;

            // SALVA NA MEMÓRIA para o play.html usar
            localStorage.setItem('game_difficulty', difficulty);
            localStorage.setItem('game_modality', modality);
            
            // CHAMA A TELA DO JOGO (Ajustado para play.html)
            window.location.href = 'play.html'; 
        };
    }

    // Botão de Sair
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }
}

// --- FUNÇÃO DE LOGOUT ---
function logout() {
    localStorage.clear(); // Apaga token, nome e recorde
    window.location.href = 'index.html';
}