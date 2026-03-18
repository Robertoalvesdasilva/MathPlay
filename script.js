const API_BASE_URL = 'https://mathplay-api.onrender.com';

window.onload = function() {
    console.log("Matematika+ pronto para rodar!");

    // IDs ajustados para o novo HTML
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const btnShowRegister = document.getElementById('show-register'); // Nome curto
    const btnShowLogin = document.getElementById('show-login');       // Nome curto

    // 1. Trocar telas (Garante que os botões existam antes de clicar)
    if (btnShowRegister) {
        btnShowRegister.onclick = function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        };
    }

    if (btnShowLogin) {
        btnShowLogin.onclick = function(e) {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        };
    }

    // 2. Botão de Login
    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
        loginBtn.onclick = async function() {
            const user = document.getElementById('login-username').value;
            const pass = document.getElementById('login-password').value;

            if (!user || !pass) {
                alert("Preencha todos os campos!");
                return;
            }

            console.log("Tentando login...");
            try {
                const res = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('mathplay_token', data.access_token);
                    window.location.href = 'game.html';
                } else {
                    alert("Erro: " + (data.message || "Dados incorretos"));
                }
            } catch (err) {
                alert("O servidor está acordando... Tente novamente em 30 segundos!");
            }
        };
    }
};