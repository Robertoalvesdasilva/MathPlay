const API_BASE_URL = "https://mathplay-api.onrender.com";

// Alternar entre formulários
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

showRegister.onclick = () => { loginForm.classList.add('hidden'); registerForm.classList.remove('hidden'); };
showLogin.onclick = () => { registerForm.classList.add('hidden'); loginForm.classList.remove('hidden'); };

// --- LÓGICA DE LOGIN ---
document.getElementById('login-button').onclick = async () => {
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
            // 1. Salva o token e o nome no navegador
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('username', data.username);
            
            alert("Matematika+ carregado com sucesso!");

            // 2. REDIRECIONA PARA O DASHBOARD (A etapa que faltava!)
            window.location.href = "game.html"; 
        } else {
            alert("Erro: " + data.message);
        }
    } catch (err) {
        alert("Erro ao conectar com o servidor.");
    }
};

// --- LÓGICA DE CADASTRO ---
document.getElementById('register-button').onclick = async () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
        alert("As senhas não coincidem!");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Conta criada! Agora faça o login.");
            showLogin.click(); // Volta para a tela de login
        } else {
            alert("Erro: " + data.message);
        }
    } catch (err) {
        alert("Erro ao cadastrar.");
    }
};