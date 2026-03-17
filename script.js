const API_BASE_URL = 'https://mathplay-api.onrender.com';

// Isso vai avisar logo de cara se o arquivo carregou
console.log("Script MathPlay carregado!");

// Aguarda o HTML carregar totalmente antes de procurar os botões
window.onload = function() {
    console.log("Página pronta!");

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register-link');
    const showLogin = document.getElementById('show-login-link');

    // Trocar para formulário de Registro
    showRegister.onclick = function(e) {
        e.preventDefault();
        console.log("Mostrando registro...");
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    };

    // Trocar para formulário de Login
    showLogin.onclick = function(e) {
        e.preventDefault();
        console.log("Mostrando login...");
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    };

    // Botão de Login
    document.getElementById('login-button').onclick = async function() {
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;

        if (!user || !pass) {
            alert("Preencha usuário e senha!");
            return;
        }

        alert("Tentando entrar... Aguarde o servidor acordar!");

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('mathplay_token', data.access_token);
                localStorage.setItem('mathplay_username', data.username);
                localStorage.setItem('mathplay_user_id', data.user_id);
                window.location.href = 'game.html';
            } else {
                alert("Erro: " + (data.message || "Usuário ou senha inválidos"));
            }
        } catch (err) {
            console.error(err);
            alert("Servidor fora do ar ou acordando. Tente novamente em 30 segundos.");
        }
    };
};