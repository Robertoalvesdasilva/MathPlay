const API_BASE_URL = 'https://mathplay-api.onrender.com';

window.onload = function() {
    console.log("Matematika+ carregado com sucesso!");

    // Seleção dos elementos do seu HTML
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Links para trocar de tela
    const linkParaRegistrar = document.getElementById('show-register');
    const linkParaLogar = document.getElementById('show-login');

    // --- TROCAR TELAS ---
    if (linkParaRegistrar) {
        linkParaRegistrar.onclick = (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        };
    }

    if (linkParaLogar) {
        linkParaLogar.onclick = (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        };
    }

    // --- LÓGICA DE CADASTRO ---
    const btnCadastrar = document.getElementById('register-button');
    if (btnCadastrar) {
        btnCadastrar.onclick = async function() {
            const user = document.getElementById('register-username').value;
            const pass = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;

            if (!user || !pass || !confirm) {
                alert("Por favor, preencha todos os campos de cadastro!");
                return;
            }

            if (pass !== confirm) {
                alert("As senhas não coincidem!");
                return;
            }

            try {
                console.log("Enviando cadastro para o servidor...");
                const res = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });
                
                const data = await res.json();

                if (res.ok) {
                    alert("Conta criada! Agora faça login.");
                    location.reload(); // Volta para a tela inicial (login)
                } else {
                    alert("Erro ao cadastrar: " + (data.message || "Tente outro nome de usuário."));
                }
            } catch (err) {
                alert("O servidor está 'acordando'. Espere 30 segundos e tente cadastrar novamente.");
            }
        };
    }

    // --- LÓGICA DE LOGIN ---
    const btnEntrar = document.getElementById('login-button');
    if (btnEntrar) {
        btnEntrar.onclick = async function() {
            const user = document.getElementById('login-username').value;
            const pass = document.getElementById('login-password').value;

            if (!user || !pass) {
                alert("Preencha usuário e senha!");
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
                    localStorage.setItem('mathplay_username', user);                    
                    window.location.href = 'game.html'; 
                } else {
                    alert("Usuário ou senha incorretos.");
                }
            } catch (err) {
                alert("Erro ao conectar. Tente novamente em breve.");
            }
        };
    }
};