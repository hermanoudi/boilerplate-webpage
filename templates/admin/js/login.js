// LL Magazine Admin - Login Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
        // Verify token is still valid
        fetch('../api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'verify' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Token valid, redirect to dashboard
                window.location.href = 'index.html';
            }
        })
        .catch(() => {
            // Token invalid, continue with login
        });
    }

    const loginForm = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Disable button and show loading
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        errorMessage.style.display = 'none';

        try {
            const response = await fetch('../api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Save token to localStorage
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.user));

                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                // Show error message
                showError(data.error || 'Erro ao fazer login. Verifique suas credenciais.');
            }
        } catch (error) {
            showError('Erro ao conectar com o servidor. Tente novamente.');
            console.error('Login error:', error);
        } finally {
            // Re-enable button
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
