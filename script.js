const API_BASE_URL = 'https://mathplay-api.onrender.com';

// Aguarda o navegador carregar o HTML
window.onload = () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // --- ALTERNAR ENTRE TELAS ---
    
    // Ir para Registro
    document.getElementById('show-register').onclick = (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    };

    // Voltar para Login
    document.getElementById('show-login').onclick = (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    };

    // --- LÓGICA DE LOGIN ---
    
    document.getElementById('login-button').onclick = async () => {
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;

        if (!user || !pass) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('mathplay_token', data.access_token);
                window.location.href = 'game.html'; // Vai para o jogo
            } else {
                alert("Erro: " + data.message);
            }
        } catch (err) {
            alert("O servidor está acordando... Tente novamente em alguns segundos!");
        }
    };

    // --- LÓGICA DE REGISTRO ---

    document.getElementById('register-button').onclick = async () => {
        const user = document.getElementById('register-username').value;
        const pass = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (pass !== confirm) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Conta criada com sucesso! Agora faça login.");
                location.reload(); // Recarrega para voltar ao login
            } else {
                alert("Erro: " + data.message);
            }
        } catch (err) {
            alert("Erro ao conectar com o servidor.");
        }
    };
};