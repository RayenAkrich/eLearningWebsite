// Gestion du formulaire de connexion et affichage du mot de passe

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const showPassword = document.getElementById('show-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Afficher/masquer le mot de passe
    showPassword.addEventListener('change', function () {
        passwordInput.type = this.checked ? 'text' : 'password';
        passwordInput.style.width='80%';
        passwordInput.style.padding='0.8rem';
        passwordInput.style.border = '1px solid #ccc';
        passwordInput.style.borderRadius = '5px';
        passwordInput.style.fontSize = '1rem';
    });

    // Gestion de la soumission du formulaire
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        errorMessage.textContent = '';

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        // Appel vers le backend Flask
        fetch('/template/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('DATA:', data); // DEBUG
                if (data.success) {
                    // Rediriger selon le rôle
                    if (data.role === 'admin') {
                        window.location.href = '/template/auth/admin/dashboard';
                    } else if (data.role === 'teacher') {
                        window.location.href = '/template/auth/teacher/dashboard';
                    } else if (data.role === 'student') {
                        window.location.href = '/template/auth/student/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    errorMessage.textContent = data.message || 'Identifiants invalides.';
                }
            })
            .catch(() => {
                errorMessage.textContent = 'Erreur serveur. Veuillez réessayer.';
            });
    });
});
