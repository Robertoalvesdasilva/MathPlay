const API_BASE_URL = "https://mathplay-api.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    loadUserData(token);
    loadRankings();
    
    // Botão de Início
    document.getElementById('start-game-button').onclick = () => {
        localStorage.setItem('game_difficulty', document.getElementById('difficulty-select').value);
        localStorage.setItem('game_modality', document.getElementById('modality-select').value);
        window.location.href = 'play.html';
    };

    // Botão de Sair
    document.getElementById('logout-button').onclick = () => {
        localStorage.clear();
        window.location.href = 'index.html';
    };
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
        }
    } catch (err) { console.error(err); }
}

async function loadRankings() {
    try {
        const res = await fetch(`${API_BASE_URL}/leaderboard`);
        const data = await res.json();
        const render = (list, id) => {
            const el = document.getElementById(id);
            el.innerHTML = data[list].map((p, i) => `<li><span>${i+1}º ${p.username}</span> <b>${p.total}</b></li>`).join('') || "<li>Vazio</li>";
        };
        render('arithmetic', 'list-arithmetic');
        render('algebra', 'list-algebra');
    } catch (err) { console.error(err); }
}