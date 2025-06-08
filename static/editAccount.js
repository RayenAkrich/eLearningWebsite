// JS pour la page d'édition de compte
// Validation et soumission AJAX

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editAccountForm');
    const messageDiv = document.getElementById('editAccountMessage');

    // Afficher/masquer le mot de passe
        const passwordToggleNew = document.getElementById('password-toggle-new');
        const passwordInputNew = document.getElementById('new_mdp');
        passwordToggleNew.addEventListener('click', function() {
            const type = passwordInputNew.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputNew.setAttribute('type', type);        
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
        const passwordToggleOld = document.getElementById('password-toggle-old');
        const passwordInputOld = document.getElementById('old_mdp');
        passwordToggleOld.addEventListener('click', function() {
            const type = passwordInputOld.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputOld.setAttribute('type', type);
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
        messageDiv.style.color = '';
        const nom = form.nom.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const old_mdp = form.old_mdp.value;
        const new_mdp = form.new_mdp.value;

        // Validation email
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Format d\'email invalide.';
            return;
        }

        // Phone: doit contenir exactement 8 chiffres
        if (!/^\d{8}$/.test(phone)) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Le numéro de téléphone doit contenir exactement 8 chiffres.';
            return;
        }

        // Envoi AJAX
        try {
            const res = await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, email, phone, old_mdp, new_mdp })
            });
            const data = await res.json();
            if (data.success) {
                messageDiv.style.display = 'block';
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Modifications enregistrées !';
            } else {
                messageDiv.style.display = 'block';
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.message;
            }
        } catch (err) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Erreur de connexion au serveur.';
        }
    });
});
