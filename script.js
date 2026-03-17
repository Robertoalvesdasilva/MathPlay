// Substitua o localhost pelo link que o Render te deu
const API_BASE_URL = 'https://mathplay-api.onrender.com';

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('mathplay_token', data.access_token); // Nome corrigido
            localStorage.setItem('mathplay_user_id', data.user_id);
            localStorage.setItem('mathplay_username', data.username);
            window.location.href = 'game.html';
        } else { alert("Erro: " + data.message); }
    } catch (err) { alert("Servidor offline!"); }
}