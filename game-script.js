const API_BASE_URL = "https://mathplay-api.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    loadUserData(token);
    loadRankings();
    setupDashboardEvents();
});

async function loadUserData(token) {
    try {
        const res = await fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            document.getElementById('welcome-username').innerText = data.username;
            document.getElementById('display-best-score').innerText = data.best_score;
            
            // Frase de motivação aleatória
            const phrases = ["Foque no processo!", "A matemática é linda!", "Bata seu recorde!"];
            document.getElementById('motivation-phrase').innerText = phrases[Math.floor(Math.random() * phrases.length)];
        } else {
            logout();
        }
    } catch (err) { console.error("Erro ao carregar perfil:", err); }
}

async function loadRankings() {
    try {
        const res = await fetch(`${API_BASE_URL}/leaderboard`);
        const data = await res.json();
        
        const renderList = (list, elementId) => {
            const el = document.getElementById(elementId);
            if (data[list].length > 0) {
                el.innerHTML = data[list].map((p, i) => 
                    `<li><span>${i+1}º ${p.username}</span> <b>${p.total} pts</b></li>`).join('');
            } else {
                el.innerHTML = "<li>Sem recordes ainda</li>";
            }
        };

        renderList('arithmetic', 'list-arithmetic');
        renderList('algebra', 'list-algebra');
    } catch (err) { console.error("Erro no ranking:", err); }
}

function setupDashboardEvents() {
    document.getElementById('start-game-button').onclick = () => {
        localStorage.setItem('game_difficulty', document.getElementById('difficulty-select').value);
        localStorage.setItem('game_modality', document.getElementById('modality-select').value);
        window.location.href = 'match.html';
    };

    document.getElementById('logout-button').onclick = logout;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}